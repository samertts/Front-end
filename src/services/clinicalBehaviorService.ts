import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';

export interface ClinicalBehavior {
  doctorId: string;
  avgTestsPerCase: number;
  deviationScore: number;
}

export const ClinicalBehaviorService = {
  async getByDoctorId(doctorId: string): Promise<ClinicalBehavior | null> {
    const docRef = doc(db, 'clinical_behaviors', doctorId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as ClinicalBehavior;
    }
    return null;
  },

  async updateBehavior(doctorId: string, data: Partial<ClinicalBehavior>) {
    const docRef = doc(db, 'clinical_behaviors', doctorId);
    const snap = await getDoc(docRef);
    
    if (snap.exists()) {
      await updateDoc(docRef, data);
    } else {
      await setDoc(docRef, {
        doctorId,
        avgTestsPerCase: data.avgTestsPerCase || 0,
        deviationScore: data.deviationScore || 0,
        ...data
      });
    }
  }
};
