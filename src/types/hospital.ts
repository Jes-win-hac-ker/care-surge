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
  // Add beds and floor plan data
  beds?: BedData;
  location?: FloorLocation;
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

// Bed data for heatmap visualization
export interface BedData {
  total: number;
  occupied: number;
  reserved: number;
  maintenance: number;
  projectedOccupancy: number; // Percentage for next 4 hours
  sections: BedSection[];
}

export interface BedSection {
  id: string;
  name: string;
  total: number;
  occupied: number;
  status: "low" | "medium" | "high" | "full";
}

// Floor plan location data
export interface FloorLocation {
  floor: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

// Equipment tracking data
export interface Equipment {
  id: string;
  name: string;
  type: "diagnostic" | "surgical" | "monitoring" | "transport";
  department: string;
  status: "available" | "in-use" | "maintenance" | "reserved";
  currentUsage: number; // Percentage
  maintenanceScheduled?: Date;
  projectedDemand: EquipmentDemand[];
  location?: FloorLocation;
}

export interface EquipmentDemand {
  hour: number; // 0-23
  demand: number; // Percentage
  maintenanceConflict: boolean;
}

// Ambulance optimization data
export interface Ambulance {
  id: string;
  status: "available" | "dispatched" | "returning" | "maintenance";
  type: "basic" | "advanced" | "critical";
  location?: GeoLocation;
  estimatedReturnTime?: number; // timestamp
  crew: number;
  equipmentLevel: number; // 1-5
}

export interface GeoLocation {
  lat: number;
  lng: number;
  address?: string;
  district?: string;
  distanceToHospital?: number; // km
  estimatedArrivalTime?: number; // minutes
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