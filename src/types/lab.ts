import { OrderStatus, Priority } from './domain';

export type LabTestCategory = 'hematology' | 'biochemistry' | 'immunology' | 'molecular' | 'microbiology' | 'toxicology';

export interface LabTestDefinition {
  id: string;
  code: string;
  name: string;
  shortName: string;
  category: LabTestCategory;
  processingTimeMin: number;
  cost: number;
  price: number;
  reagentsRequired: {
    reagentId: string;
    amountPerTest: number;
  }[];
  referenceRanges: {
    gender: 'M' | 'F' | 'Both';
    ageMin?: number;
    ageMax?: number;
    min: number;
    max: number;
    unit: string;
  }[];
  specimenType: string;
  containerType: string;
  automated: boolean;
  active: boolean;
}

export interface LabAnalyzer {
  id: string;
  name: string;
  model: string;
  serialNumber: string;
  status: 'online' | 'idle' | 'busy' | 'maintenance' | 'error';
  currentLoad: number; // 0-100
  capacityPerTransaction: number;
  supportedTests: string[]; // List of test codes
  activeJobs: string[]; // List of sample IDs
  maintenanceDue: string;
  lastCalibration: string;
}

export interface AutomatedJob {
  id: string;
  sampleId: string;
  analyzerId: string;
  priority: Priority;
  status: 'queued' | 'loading' | 'analyzing' | 'verifying' | 'completed' | 'failed';
  startedAt: string;
  estimatedCompletion: string;
}

export interface LabAutomationState {
  analyzers: LabAnalyzer[];
  pendingJobs: AutomatedJob[];
  systemLoad: number;
  alerts: {
    id: string;
    type: 'critical_result' | 'analyzer_error' | 'reagent_warning';
    message: string;
    timestamp: string;
  }[];
}
