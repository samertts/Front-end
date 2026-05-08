import Dexie, { Table } from 'dexie';

export interface OfflinePatient {
  id: string;
  name: string;
  age: number;
  gender: string;
  bloodType: string;
  status: string;
  lastVisit: string;
  nationalId: string;
  phone: string;
  email: string;
  insuranceProvider: string;
  insuranceId: string;
  allergies: string[];
  medications: string[];
  vitals: {
    temp: number;
    bp: string;
    pulse: number;
    spo2: number;
  };
  clinicalSummary?: string;
  lastCached: number;
}

export interface OfflineTask {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  type?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  lastCached: number;
}

export interface SyncAction {
  id?: number;
  type: 'create' | 'update' | 'delete';
  collection: 'patients' | 'tasks';
  data: any;
  timestamp: number;
}

export class GulaOfflineDB extends Dexie {
  patients!: Table<OfflinePatient>;
  tasks!: Table<OfflineTask>;
  syncQueue!: Table<SyncAction>;

  constructor() {
    super('GulaOfflineDB');
    this.version(1).stores({
      patients: 'id, name, nationalId',
      tasks: 'id, title, status, priority, dueDate',
      syncQueue: '++id, type, collection, timestamp'
    });
  }
}

export const db = new GulaOfflineDB();
