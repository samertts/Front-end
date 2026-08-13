import { auth, db } from '../firebase';
import { doc, setDoc, updateDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { createIdempotencyKey } from '../types/gulaIntegration';

export type SyncAction = {
  id: string;
  type: 'UPDATE_PROFILE' | 'LOG_ACTIVITY' | 'UPDATE_TASK' | 'BULK_UPDATE_TASKS';
  payload: any;
  timestamp: number;
  idempotencyKey: string;
};

const SYNC_QUEUE_KEY = 'gula_sync_queue';

export const SyncService = {
  getQueue(): SyncAction[] {
    const stored = localStorage.getItem(SYNC_QUEUE_KEY);
    if (!stored) return [];
    try {
      const parsed = JSON.parse(stored) as Array<Partial<SyncAction>>;
      return parsed.map((item) => {
        if (item.idempotencyKey) return item as SyncAction;
        const entityId = String(item.payload?.taskId ?? item.payload?.uid ?? item.payload?.id ?? item.type ?? 'legacy');
        const version = Number.isInteger(item.payload?.version) && (item.payload?.version as number) > 0
          ? (item.payload?.version as number)
          : Number(item.timestamp ?? Date.now());
        return {
          ...(item as SyncAction),
          id: item.id ?? `${Date.now()}-legacy`,
          timestamp: Number(item.timestamp ?? Date.now()),
          idempotencyKey: createIdempotencyKey(entityId, 'workforce.assignment.changed', version),
        };
      });
    } catch {
      console.error('[SyncService] Corrupt queue rejected; preserving no mutable clinical state locally.');
      return [];
    }
  },

  saveQueue(queue: SyncAction[]): void {
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  },

  enqueue(type: SyncAction['type'], payload: any): string {
    const queue = this.getQueue();
    const entityId = String(payload?.taskId ?? payload?.uid ?? payload?.id ?? type);
    const version = Number.isInteger(payload?.version) && payload.version > 0 ? payload.version : Date.now();
    const idempotencyKey = createIdempotencyKey(entityId, 'workforce.assignment.changed', version);
    const action: SyncAction = {
      id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      type,
      payload,
      timestamp: Date.now(),
      idempotencyKey,
    };
    if (!queue.some((item) => item.idempotencyKey === idempotencyKey)) {
      queue.push(action);
      this.saveQueue(queue);
    }
    console.log(`[SyncService] Action enqueued (offline): ${type}`);
    return idempotencyKey;
  },

  async submitToGula(action: SyncAction): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('Authenticated user is required for GULA sync');
    const idToken = await user.getIdToken();
    const response = await fetch('/api/gula/sync', {
      method: 'POST',
      headers: { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        actionId: action.id,
        actionType: action.type,
        payload: action.payload,
        timestamp: action.timestamp,
        idempotencyKey: action.idempotencyKey,
      }),
    });
    if (!response.ok) throw new Error(`GULA sync rejected action (${response.status})`);
  },

  async processQueue(): Promise<void> {
    if (!navigator.onLine) return;
    
    const queue = this.getQueue();
    if (queue.length === 0) return;

    console.log(`[SyncService] Online. Processing ${queue.length} pending actions...`);
    
    const remaining: SyncAction[] = [];
    const sortedQueue = [...queue].sort((a, b) => a.timestamp - b.timestamp);

    for (const action of sortedQueue) {
      try {
        if (!action.idempotencyKey) {
          throw new Error(`Action ${action.id} has no idempotency key`);
        }
        await this.submitToGula(action);
        switch (action.type) {
          case 'UPDATE_PROFILE':
            await updateDoc(doc(db, 'users', action.payload.uid), {
              ...action.payload,
              updatedAt: serverTimestamp()
            });
            break;
          case 'LOG_ACTIVITY':
            // Assuming an activity_logs collection
            const logRef = doc(db, 'activity_logs', action.id);
            await setDoc(logRef, {
              ...action.payload,
              timestamp: serverTimestamp()
            });
            break;
          case 'UPDATE_TASK':
            await updateDoc(doc(db, 'tasks', action.payload.taskId), {
              ...action.payload.updates,
              updatedAt: serverTimestamp()
            });
            break;
          case 'BULK_UPDATE_TASKS':
            const batch = writeBatch(db);
            action.payload.taskIds.forEach((id: string) => {
              batch.update(doc(db, 'tasks', id), {
                ...action.payload.updates,
                updatedAt: serverTimestamp()
              });
            });
            await batch.commit();
            break;
        }
      } catch (error) {
        console.error(`[SyncService] Failed to process action ${action.id}:`, error);
        remaining.push(action);
      }
    }

    this.saveQueue(remaining);
    if (remaining.length === 0) {
      console.log('[SyncService] Sync complete.');
    }
  }
};

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => SyncService.processQueue());
}
