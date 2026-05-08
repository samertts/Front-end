import { db, OfflinePatient } from '../lib/offlineDb';
import { OfflineSyncService } from '../lib/offlineSyncService';
import { db as db_fire } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

// Mock data for initial stock
const MOCK_PATIENTS: OfflinePatient[] = [
  { 
    id: "P-9021", 
    name: "Ahmed Mansour", 
    age: 42, 
    gender: "Male",
    bloodType: "A+",
    status: "Active", 
    lastVisit: "2024-04-19",
    nationalId: "882-99-XC",
    phone: "+964 770 123 4567",
    email: "ahmed.m@example.com",
    insuranceProvider: "National Health",
    insuranceId: "NH-112233",
    allergies: ["Penicillin"],
    medications: ["Metformin"],
    vitals: { temp: 37.2, bp: "120/80", pulse: 72, spo2: 98 },
    lastCached: Date.now()
  },
  { 
    id: "P-8842", 
    name: "Sara Khalid", 
    age: 29, 
    gender: "Female",
    bloodType: "O-",
    status: "Stable", 
    lastVisit: "2024-04-18",
    nationalId: "441-22-BY",
    phone: "+964 750 987 6543",
    email: "sara.k@example.com",
    insuranceProvider: "Global Care",
    insuranceId: "GC-445566",
    allergies: [],
    medications: [],
    vitals: { temp: 36.8, bp: "115/75", pulse: 68, spo2: 99 },
    lastCached: Date.now()
  }
];

export const PatientService = {
  async getAllPatients() {
    // 1. Try to get from local DB
    const localPatients = await db.patients.toArray();
    
    if (localPatients.length === 0) {
      // 2. If empty, seeding with mock data (Simulating initial fetch from API)
      await db.patients.bulkAdd(MOCK_PATIENTS);
      return MOCK_PATIENTS;
    }
    
    return localPatients;
  },

  async getPatientById(id: string) {
    // 1. Try local first
    const localPatient = await db.patients.get(id);
    
    // 2. If online, try to refresh from network
    if (navigator.onLine) {
      try {
        const patientDoc = await getDoc(doc(db_fire, 'patients', id));
        if (patientDoc.exists()) {
          const data = patientDoc.data();
          const patient: OfflinePatient = {
             id: patientDoc.id,
             name: data.name || "Unknown",
             age: data.age || 0,
             gender: data.gender || "Unknown",
             bloodType: data.bloodType || "N/A",
             status: data.status || "Active",
             lastVisit: data.lastVisit || new Date().toISOString().split('T')[0],
             nationalId: data.nationalId || "N/A",
             phone: data.phone || "N/A",
             email: data.email || "N/A",
             insuranceProvider: data.insuranceProvider || "N/A",
             insuranceId: data.insuranceId || "N/A",
             allergies: data.allergies || [],
             medications: data.medications || [],
             vitals: data.vitals || { temp: 37, bp: "120/80", pulse: 72, spo2: 98 },
             clinicalSummary: data.clinicalSummary || "No history available.",
             lastCached: Date.now(),
          };
          await db.patients.put(patient);
          return patient;
        }
      } catch (err) {
        console.error("Network fetch failed for patient:", err);
      }
    }
    
    return localPatient || null;
  },

  async updatePatient(id: string, updates: Partial<OfflinePatient>) {
    const existing = await db.patients.get(id);
    if (!existing) throw new Error('Patient not found');

    const updated = { ...existing, ...updates, lastCached: Date.now() };
    
    // Update local DB immediately
    await db.patients.update(id, updated);

    // Queue for sync
    await OfflineSyncService.queueAction({
      type: 'update',
      collection: 'patients',
      data: updated
    });

    return updated;
  },

  async createPatient(patient: Omit<OfflinePatient, 'lastCached'>) {
    const newPatient = { ...patient, lastCached: Date.now() };
    
    // Add to local DB
    await db.patients.add(newPatient);

    // Queue for sync
    await OfflineSyncService.queueAction({
      type: 'create',
      collection: 'patients',
      data: newPatient
    });

    return newPatient;
  }
};
