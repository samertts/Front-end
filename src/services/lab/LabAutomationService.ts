import { LabAnalyzer, AutomatedJob, LabTestDefinition } from '../../types/lab';
import { Priority } from '../../types/domain';

export class LabAutomationService {
  private static mockAnalyzers: LabAnalyzer[] = [
    {
      id: 'AN-001',
      name: 'Cobas 8000',
      model: 'Roche Modular',
      serialNumber: 'R-7721-X',
      status: 'busy',
      currentLoad: 85,
      capacityPerTransaction: 12,
      supportedTests: ['CBC', 'CRP', 'GLU', 'LIP'],
      activeJobs: ['S-4421', 'S-4422'],
      maintenanceDue: '2026-06-15',
      lastCalibration: '2026-05-01'
    },
    {
      id: 'AN-002',
      name: 'Alinity i',
      model: 'Abbott',
      serialNumber: 'A-9912-B',
      status: 'idle',
      currentLoad: 0,
      capacityPerTransaction: 20,
      supportedTests: ['HIV', 'HEP', 'COVID-19', 'THY'],
      activeJobs: [],
      maintenanceDue: '2026-07-20',
      lastCalibration: '2026-04-28'
    },
    {
      id: 'AN-003',
      name: 'DxH 900',
      model: 'Beckman Coulter',
      serialNumber: 'B-5531-C',
      status: 'online',
      currentLoad: 25,
      capacityPerTransaction: 10,
      supportedTests: ['CBC', 'DIFF', 'RETIC'],
      activeJobs: ['S-4425'],
      maintenanceDue: '2026-05-25',
      lastCalibration: '2026-05-05'
    }
  ];

  static async getAnalyzers(): Promise<LabAnalyzer[]> {
    // In a real app, this would fetch from Firestore "analyzers" collection
    return this.mockAnalyzers;
  }

  static async getActiveJobs(): Promise<AutomatedJob[]> {
    return [
      {
        id: 'JOB-901',
        sampleId: 'S-4421',
        analyzerId: 'AN-001',
        priority: 'stat',
        status: 'analyzing',
        startedAt: new Date(Date.now() - 300000).toISOString(),
        estimatedCompletion: new Date(Date.now() + 600000).toISOString()
      },
      {
        id: 'JOB-902',
        sampleId: 'S-4422',
        analyzerId: 'AN-001',
        priority: 'routine',
        status: 'queued',
        startedAt: new Date(Date.now() - 60000).toISOString(),
        estimatedCompletion: new Date(Date.now() + 1200000).toISOString()
      }
    ];
  }

  static async routeSample(sampleId: string, testCodes: string[], priority: Priority): Promise<string> {
    const analyzers = await this.getAnalyzers();
    
    // Find suitable analyzer with lowest load
    const candidates = analyzers.filter(a => 
      a.status !== 'error' && 
      a.status !== 'maintenance' &&
      testCodes.every(code => a.supportedTests.includes(code))
    );

    if (candidates.length === 0) {
      throw new Error('No suitable analyzer found for these tests');
    }

    const selected = candidates.sort((a, b) => a.currentLoad - b.currentLoad)[0];
    
    console.log(`Routing sample ${sampleId} to analyzer ${selected.name}`);
    return selected.id;
  }

  static async getTestCatalog(): Promise<LabTestDefinition[]> {
    return [
      {
        id: 'T-001',
        code: 'CBC',
        name: 'Complete Blood Count',
        shortName: 'CBC',
        category: 'hematology',
        processingTimeMin: 15,
        cost: 5000,
        price: 15000,
        specimenType: 'Whole Blood',
        containerType: 'Lavender Top (EDTA)',
        automated: true,
        active: true,
        reagentsRequired: [{ reagentId: 'R-HEM-1', amountPerTest: 0.5 }],
        referenceRanges: [{ gender: 'Both', min: 4.5, max: 11.0, unit: 'x10^9/L' }]
      },
      {
        id: 'T-002',
        code: 'CRP',
        name: 'C-Reactive Protein',
        shortName: 'CRP',
        category: 'biochemistry',
        processingTimeMin: 30,
        cost: 3000,
        price: 12000,
        specimenType: 'Serum',
        containerType: 'Red Top',
        automated: true,
        active: true,
        reagentsRequired: [{ reagentId: 'R-BIO-CRP', amountPerTest: 0.2 }],
        referenceRanges: [{ gender: 'Both', min: 0, max: 5, unit: 'mg/L' }]
      }
    ];
  }
}
