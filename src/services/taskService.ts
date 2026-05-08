import { db, OfflineTask } from '../lib/offlineDb';
import { OfflineSyncService } from '../lib/offlineSyncService';

export const TaskService = {
  async getAllTasks() {
    return await db.tasks.toArray();
  },

  async createTask(task: Omit<OfflineTask, 'id' | 'lastCached' | 'createdAt' | 'updatedAt'>) {
    const id = Math.random().toString(36).substr(2, 9);
    const now = new Date().toISOString();
    const newTask: OfflineTask = {
      ...task,
      id,
      createdAt: now,
      updatedAt: now,
      lastCached: Date.now()
    };

    await db.tasks.add(newTask);
    await OfflineSyncService.queueAction({
      type: 'create',
      collection: 'tasks',
      data: newTask
    });

    return newTask;
  },

  async updateTaskStatus(id: string, status: OfflineTask['status']) {
    const task = await db.tasks.get(id);
    if (!task) throw new Error('Task not found');

    const updated = { 
      ...task, 
      status, 
      updatedAt: new Date().toISOString(),
      lastCached: Date.now() 
    };

    await db.tasks.update(id, updated);
    await OfflineSyncService.queueAction({
      type: 'update',
      collection: 'tasks',
      data: updated
    });

    return updated;
  },

  async seedTasks(tasks: OfflineTask[]) {
    await db.tasks.bulkPut(tasks);
  }
};
