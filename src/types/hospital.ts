export interface Department {
  id: string;
  name: string;
  currentQueue: number;
  avgWaitTime: number;
  trend: number; // Percentage change
  status: "stable" | "warning" | "critical";
  utilization: number; // Percentage
  capacity: number;
  staff: number;
}

export interface PredictionData {
  timestamp: number;
  actual: number;
  predicted: number;
  emergency: number;
  opd: number;
  diagnostics: number;
}

export interface Recommendation {
  id: string;
  type: "add_staff" | "remove_staff" | "reallocate_beds" | "schedule_change";
  department: string;
  priority: "low" | "medium" | "high";
  description: string;
  confidence: number; // Percentage
  impact: {
    waitTimeReduction: number; // Percentage
    efficiency: number; // Percentage
  };
  details?: {
    from: string;
    to: string;
    resources?: string;
  };
}

export interface KPIData {
  totalPatients: number;
  avgWaitTime: number;
  bedUtilization: number;
  efficiency: number;
  patientChange: number; // Percentage change
  waitTimeChange: number; // Percentage change
  utilizationChange: number; // Percentage change
  efficiencyChange: number; // Percentage change
}

export interface PatientArrival {
  id: string;
  timestamp: number;
  department: string;
  priority: "low" | "medium" | "high" | "critical";
  estimatedDuration: number; // minutes
}