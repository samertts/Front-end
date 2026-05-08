import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { z } from 'zod';
import * as admin from 'firebase-admin';
import { RankingEngine } from './src/services/financial/RankingEngine';
import { PricingEngine } from './src/services/financial/PricingEngine';
import { AdEngine, FraudEngine } from './src/services/financial/AdEngine';
import { SimulationEngine } from './src/services/financial/SimulationEngine';
import { GovernanceEngine } from './src/services/financial/GovernanceEngine';

// Initialize Firebase Admin (using default credentials if possible)
try {
  admin.initializeApp();
} catch (e) {
  console.warn("Firebase Admin failed to initialize. Financial persistence will be mocked.");
}

const db = admin.firestore?.();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- Financial API Routes ---

  app.get("/api/financial/rank", async (req, res) => {
    // Logic to fetch providers and rank them
    try {
      const providersSnap = await db?.collection('financial_providers').get();
      const providers = providersSnap?.docs.map(d => ({ id: d.id, ...d.data() })) || [];
      
      // Add mock if empty
      const list = providers.length > 0 ? providers : [
        { id: 'p1', name: 'Al-Amal Lab', qualityScore: 8.5, speedScore: 9, priceScore: 7, reliability: 0.95, plan: 'premium' },
        { id: 'p2', name: 'City Clinic', qualityScore: 7.2, speedScore: 6, priceScore: 8, reliability: 0.88, plan: 'basic' }
      ];

      const ranked = RankingEngine.antiDominanceControl(
        list.map((p: any) => ({ ...p, score: RankingEngine.calculateScore(p) }))
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
    const { campaignId, providerId } = req.body;
    const ip = req.ip || '0.0.0.0';

    if (FraudEngine.detectClickFraud(ip, campaignId)) {
      if (db) {
        await db.collection('fraud_logs').add({
          providerId,
          reason: 'Click Velocity Abuse',
          severity: 'high',
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
      return res.status(403).json({ error: 'Fraud detected' });
    }

    res.json({ status: 'tracked' });
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
