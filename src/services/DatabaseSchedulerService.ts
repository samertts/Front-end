import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { DatabaseIntegrityService } from './DatabaseIntegrityService';
import { toast } from 'sonner';

export interface SchedulerHistoryEntry {
  id: string;
  timestamp: string;
  dbId: string;
  dbName: string;
  fileName: string;
  status: string;
  ok: boolean;
  errors: string[];
  message: string;
  alertTriggered: boolean;
}

export type SchedulerListener = (entries: SchedulerHistoryEntry[]) => void;

class DatabaseSchedulerClass {
  private intervalId: any = null;
  private intervalSeconds: number = 20; // default 20 seconds
  private active: boolean = false;
  private history: SchedulerHistoryEntry[] = [];
  private listeners: Set<SchedulerListener> = new Set();
  private lastAlertTimestamp: Record<string, number> = {};

  constructor() {
    // Attempt to load configuration or history if desired, or start default
    this.history = [];
  }

  public isRunning(): boolean {
    return this.active;
  }

  public getInterval(): number {
    return this.intervalSeconds;
  }

  public getHistory(): SchedulerHistoryEntry[] {
    return [...this.history];
  }

  public clearHistory(): void {
    this.history = [];
    this.notifyListeners();
  }

  public registerListener(listener: SchedulerListener): void {
    this.listeners.add(listener);
    // Immediately call listener with current history
    listener([...this.history]);
  }

  public unregisterListener(listener: SchedulerListener): void {
    this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    const list = [...this.history];
    this.listeners.forEach(listener => {
      try {
        listener(list);
      } catch (err) {
        console.error('Error notifying scheduler listener:', err);
      }
    });
  }

  public start(intervalSeconds: number = 20): void {
    if (this.active) {
      this.stop();
    }
    
    this.intervalSeconds = intervalSeconds;
    this.active = true;
    
    console.log(`[DatabaseSchedulerService] Started background integrity checks every ${intervalSeconds}s.`);
    
    // Run an initial check immediately asynchronously so it doesn't block
    setTimeout(() => this.runScheduledCheck(), 100);

    this.intervalId = setInterval(() => {
      this.runScheduledCheck();
    }, intervalSeconds * 1000);
  }

  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.active = false;
    console.log('[DatabaseSchedulerService] Stopped background check service.');
  }

  /**
   * Runs an integrity check across all monitored databases
   */
  public async runScheduledCheck(): Promise<void> {
    const dbs = DatabaseIntegrityService.getAllDatabases();
    console.log(`[DatabaseSchedulerService] Running scheduled background checks for ${dbs.length} databases.`);

    for (const dbInfo of dbs) {
      try {
        // Execute integrity diagnostics check on current state
        const result = await DatabaseIntegrityService.executeIntegrityCheck(dbInfo.id);
        const liveDb = DatabaseIntegrityService.getDatabaseState(dbInfo.id);
        
        let alertTriggered = false;

        // An integrity failure is defined as ok !== true
        if (!result.ok) {
          // De-duplicate alerts so we don't spam Firestore every 10-20 seconds for the same unchanged error.
          // We can throttle alerts for the same database to say once every 1 minute if state remains corrupt.
          const now = Date.now();
          const lastAlert = this.lastAlertTimestamp[dbInfo.id] || 0;
          const currentStatus = liveDb.status;

          // If it has been more than 45 seconds, or if status has changed / newly failed
          if (now - lastAlert > 45000) {
            alertTriggered = true;
            this.lastAlertTimestamp[dbInfo.id] = now;
            await this.triggerHighPriorityAlert(liveDb.id, liveDb.name, liveDb.fileName, result.errors, result.message);
          }
        } else {
          // If healed successfully, clear last alert timestamp for this DB
          delete this.lastAlertTimestamp[dbInfo.id];
        }

        const newEntry: SchedulerHistoryEntry = {
          id: `${Date.now()}-${dbInfo.id}-${Math.floor(Math.random() * 10000)}`,
          timestamp: new Date().toLocaleTimeString(),
          dbId: dbInfo.id,
          dbName: dbInfo.name,
          fileName: dbInfo.fileName,
          status: liveDb.status,
          ok: result.ok,
          errors: result.errors,
          message: result.message,
          alertTriggered
        };

        this.history.unshift(newEntry);
        // Prune history to keep last 30 entries
        if (this.history.length > 30) {
          this.history = this.history.slice(0, 30);
        }

      } catch (err) {
        console.error(`[DatabaseSchedulerService] Scheduled check failed for ${dbInfo.id}:`, err);
      }
    }

    this.notifyListeners();
  }

  /**
   * Helper to write a high priority system alert into Firestore and trigger a Toast notification
   */
  private async triggerHighPriorityAlert(
    dbId: string, 
    dbName: string, 
    fileName: string, 
    errors: string[],
    originalMessage: string
  ): Promise<void> {
    console.warn(`[DatabaseSchedulerService] INTEGRITY FAILURE ALERT on ${dbName}! Triggering high priority alerts...`);

    // 1. Trigger local toast error instantly to grab real-time developer attention
    toast.error(`⚠️ CRITICAL DB CONSISTENCY BREAKDOWN: ${dbName}`, {
      description: `Integrity checks failed on file '${fileName}': ${errors[0] || originalMessage}`,
      duration: 10000 // Display for 10 seconds
    });

    // 2. Persist high priority system alert inside our decentralized consensus event ledger (Firestore collection)
    try {
      const user = auth.currentUser;
      const eventRef = await addDoc(collection(db, 'events'), {
        type: 'critical_alert',
        recipientId: 'all',
        senderId: user?.uid || 'system_background_check',
        wing: 'system',
        title: `🔴 COMPROMISED CONSENSUS: ${dbName.toUpperCase()}`,
        message: `Sovereign integrity check failure on file '${fileName}'. Errors identified: [${errors.join(' | ')}]`,
        read: false,
        priority: 'stat', // High-priority status format
        createdAt: serverTimestamp(),
        payload: {
          dbId,
          dbName,
          fileName,
          errors,
          checkedAt: new Date().toISOString()
        }
      });
      console.log(`[DatabaseSchedulerService] Consensary audit event successfully logged: ${eventRef.id}`);
    } catch (err) {
      console.error('[DatabaseSchedulerService] Failed to emit alert event to Firestore:', err);
    }
  }
}

export const DatabaseSchedulerService = new DatabaseSchedulerClass();
