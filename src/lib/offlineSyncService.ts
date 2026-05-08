import { useState, useEffect } from 'react';
import { db, SyncAction } from './offlineDb';
import { toast } from 'sonner';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

export const OfflineSyncService = {
  async queueAction(action: Omit<SyncAction, 'timestamp'>) {
    await db.syncQueue.add({
      ...action,
      timestamp: Date.now()
    });
    
    if (!navigator.onLine) {
      toast.info('Changes saved offline. Will sync when online.');
    }
  },

  async sync() {
    if (!navigator.onLine) return;

    const pendingActions = await db.syncQueue.toArray();
    if (pendingActions.length === 0) return;

    toast.promise(this.processSync(pendingActions), {
      loading: 'Syncing offline changes...',
      success: 'Synchronization complete',
      error: 'Sync failed. Will retry later.'
    });
  },

  async processSync(actions: SyncAction[]) {
    for (const action of actions) {
      try {
        // Here we would call the actual API/Firebase services
        console.log(`Syncing ${action.type} on ${action.collection}:`, action.data);
        
        // Simulating API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // If successful, remove from queue
        if (action.id) {
          await db.syncQueue.delete(action.id);
        }
      } catch (error) {
        console.error('Failed to sync action:', action);
        // We don't delete if it failed, so it stays in queue
        throw error;
      }
    }
  }
};
