import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { z } from 'zod';
import * as admin from 'firebase-admin';
import { RankingEngine } from './src/services/financial/RankingEngine.ts';
import { PricingEngine } from './src/services/financial/PricingEngine.ts';
import { AdEngine, FraudEngine } from './src/services/financial/AdEngine.ts';
import { SimulationEngine } from './src/services/financial/SimulationEngine.ts';
import { GovernanceEngine } from './src/services/financial/GovernanceEngine.ts';

// Initialize Firebase Admin (using default credentials if possible)
try {
  admin.initializeApp();
} catch (e) {
  console.warn("Firebase Admin failed to initialize. Financial persistence will be mocked.");
}

const db = admin.firestore?.();

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });
  const PORT = 3000;

  app.use(express.json());

  // --- Real-time Socket Logic ---
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_room', (roomId) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room: ${roomId}`);
    });

    socket.on('send_message', async (data) => {
      const { roomId, message, senderId, senderName, type } = data;
      
      const messageData = {
        roomId,
        text: message,
        senderId,
        senderName,
        type: type || 'text',
        timestamp: new Date().toISOString(),
      };

      // Persist to Firestore if available
      if (db) {
        try {
          await db.collection('messages').add({
            ...messageData,
            serverTimestamp: admin.firestore.FieldValue.serverTimestamp()
          });
        } catch (e) {
          console.error("Failed to persist message:", e);
        }
      }

      // Broadcast to others in the room
      io.to(roomId).emit('receive_message', messageData);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  // --- Financial API Routes ---

  app.get("/api/financial/rank", async (req, res) => {
    try {
      const providersSnap = await db?.collection('financial_providers').get();
      const adsSnap = await db?.collection('ads_campaigns').where('active', '==', true).get();
      
      const providers = providersSnap?.docs.map(d => ({ id: d.id, ...d.data() })) || [];
      const ads = adsSnap?.docs.map(d => ({ id: d.id, ...d.data() })) || [];
      const adsMap = new Map(ads.map((a: any) => [a.providerId, a]));

      // Add mock if empty
      const list = providers.length > 0 ? providers : [
        { id: 'p1', name: 'Al-Amal Lab', qualityScore: 8.5, speedScore: 9, priceScore: 7, reliability: 0.95, plan: 'premium' },
        { id: 'p2', name: 'City Clinic', qualityScore: 7.2, speedScore: 6, priceScore: 8, reliability: 0.88, plan: 'basic' }
      ];

      const ranked = RankingEngine.antiDominanceControl(
        list.map((p: any) => {
          const ad = adsMap.get(p.id);
          const score = RankingEngine.calculateScore(p, ad?.bid || 0, ad?.fraudScore || 0);
          return { ...p, score };
        })
      );

      res.json(ranked);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch rankings' });
    }
  });

  app.post("/api/financial/transaction", async (req, res) => {
    const schema = z.object({
      providerId: z.string(),
      type: z.enum(['test_fee', 'subscription', 'ad_spend', 'credit']),
      amount: z.number(),
      testId: z.string().optional()
    });

    try {
      const data = schema.parse(req.body);
      if (db) {
        await db.collection('financial_transactions').add({
          ...data,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
      res.json({ status: 'success', data });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/ads/click", async (req, res) => {
    const { campaignId, providerId, userId, fingerprint } = req.body;
    const context = {
      ip: req.ip || '0.0.0.0',
      userAgent: req.headers['user-agent'] || 'unknown',
      fingerprint: fingerprint || 'anonymous',
      userId: userId,
      referrer: req.headers.referer
    };

    // Fetch campaign
    let campaign: any;
    if (db) {
       const doc = await db.collection('ads_campaigns').doc(campaignId).get();
       if (doc.exists) campaign = { id: doc.id, ...doc.data() };
    }
    
    // Mock for demo if no DB
    if (!campaign) {
      campaign = { id: campaignId, providerId, active: true, spentToday: 0, dailyLimit: 1000, fraudScore: 0 };
    }

    const report = FraudEngine.checkFraud(campaign, context);

    if (report.isFraud) {
      if (db) {
        await db.collection('fraud_logs').add({
          providerId,
          campaignId,
          reasons: report.reasons,
          score: report.score,
          severity: report.score > 80 ? 'critical' : 'high',
          context: { ip: context.ip, ua: context.userAgent },
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        if (report.penaltyRecommendation === 'deactivate') {
           await db.collection('ads_campaigns').doc(campaignId).update({
             active: false,
             deactivatedReason: `Fraud detected: ${report.reasons.join(', ')}`
           });
        }

        if (report.penaltyRecommendation === 'throttle') {
           const newScore = Math.min(100, (campaign.fraudScore || 0) + 20);
           await db.collection('ads_campaigns').doc(campaignId).update({
             fraudScore: newScore
           });
        }
      }
      return res.status(403).json({ 
        error: 'Fraudulent activity detected',
        reasons: report.reasons 
      });
    }

    res.json({ status: 'tracked', cost: AdEngine.calculateClickCost(campaign, 8) }); // assuming quality 8 for now
  });

  app.get("/api/financial/simulate", (req, res) => {
    const results = SimulationEngine.simulateMarket();
    res.json(results);
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", engine: process.env.ENABLE_FINANCIAL_ENGINE });
  });

  // --- Production/Development Handling ---

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
