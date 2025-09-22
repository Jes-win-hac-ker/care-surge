import { useState, useEffect, useCallback, useRef } from "react";
import { 
  Department, 
  PredictionData, 
  Recommendation, 
  KPIData, 
  PatientArrival, 
  Equipment,
  Ambulance,
  BedData,
  BedSection,
  FloorLocation,
  EquipmentDemand,
  GeoLocation
} from "@/types/hospital";

export const useHospitalSimulation = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [predictions, setPredictions] = useState<PredictionData[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [kpis, setKpis] = useState<KPIData>({
    totalPatients: 0,
    avgWaitTime: 0,
    bedUtilization: 0,
    efficiency: 0,
    patientChange: 0,
    waitTimeChange: 0,
    utilizationChange: 0,
    efficiencyChange: 0,
  });

  const intervalRef = useRef<NodeJS.Timeout>();
  const predictionIntervalRef = useRef<NodeJS.Timeout>();
  const startTimeRef = useRef<number>(Date.now());

  // Initialize departments with bed data
  const initializeDepartments = useCallback(() => {
    const initialDepartments: Department[] = [
      {
        id: "emergency",
        name: "Emergency",
        currentQueue: Math.floor(Math.random() * 15) + 5,
        avgWaitTime: Math.floor(Math.random() * 30) + 15,
        trend: Math.floor(Math.random() * 20) - 10,
        status: "warning",
        utilization: Math.floor(Math.random() * 40) + 60,
        capacity: 50,
        staff: 8,
        beds: {
          total: 30,
          occupied: 24,
          reserved: 3,
          maintenance: 1,
          projectedOccupancy: 85,
          sections: [
            { id: "er-a", name: "ER Zone A", total: 10, occupied: 9, status: "high" },
            { id: "er-b", name: "ER Zone B", total: 10, occupied: 8, status: "high" },
            { id: "er-c", name: "ER Zone C", total: 10, occupied: 7, status: "medium" },
          ]
        },
        location: {
          floor: 1,
          x: 10,
          y: 10,
          width: 40,
          height: 30
        }
      },
      {
        id: "opd",
        name: "OPD",
        currentQueue: Math.floor(Math.random() * 25) + 10,
        avgWaitTime: Math.floor(Math.random() * 60) + 30,
        trend: Math.floor(Math.random() * 20) - 10,
        status: "stable",
        utilization: Math.floor(Math.random() * 30) + 50,
        capacity: 100,
        staff: 12,
        beds: {
          total: 50,
          occupied: 30,
          reserved: 5,
          maintenance: 2,
          projectedOccupancy: 70,
          sections: [
            { id: "opd-a", name: "General Medicine", total: 15, occupied: 10, status: "medium" },
            { id: "opd-b", name: "Surgery", total: 15, occupied: 12, status: "high" },
            { id: "opd-c", name: "Pediatrics", total: 20, occupied: 8, status: "low" },
          ]
        },
        location: {
          floor: 2,
          x: 60,
          y: 10,
          width: 50,
          height: 40
        }
      },
      {
        id: "diagnostics",
        name: "Diagnostics",
        currentQueue: Math.floor(Math.random() * 20) + 8,
        avgWaitTime: Math.floor(Math.random() * 45) + 20,
        trend: Math.floor(Math.random() * 20) - 10,
        status: "stable",
        utilization: Math.floor(Math.random() * 35) + 45,
        capacity: 75,
        staff: 6,
        beds: {
          total: 20,
          occupied: 11,
          reserved: 2,
          maintenance: 1,
          projectedOccupancy: 65,
          sections: [
            { id: "diag-a", name: "Imaging", total: 10, occupied: 6, status: "medium" },
            { id: "diag-b", name: "Lab Beds", total: 10, occupied: 5, status: "medium" },
          ]
        },
        location: {
          floor: 1,
          x: 100,
          y: 50,
          width: 35,
          height: 25
        }
      },
      {
        id: "icu",
        name: "ICU",
        currentQueue: Math.floor(Math.random() * 5) + 2,
        avgWaitTime: Math.floor(Math.random() * 15) + 10,
        trend: Math.floor(Math.random() * 20) - 10,
        status: "critical",
        utilization: Math.floor(Math.random() * 20) + 75,
        capacity: 25,
        staff: 15,
        beds: {
          total: 15,
          occupied: 13,
          reserved: 1,
          maintenance: 0,
          projectedOccupancy: 95,
          sections: [
            { id: "icu-a", name: "General ICU", total: 8, occupied: 7, status: "high" },
            { id: "icu-b", name: "Cardiac ICU", total: 7, occupied: 6, status: "high" },
          ]
        },
        location: {
          floor: 3,
          x: 40,
          y: 30,
          width: 30,
          height: 30
        }
      },
    ];

    // Update status based on utilization
    initialDepartments.forEach(dept => {
      if (dept.utilization > 85) dept.status = "critical";
      else if (dept.utilization > 70) dept.status = "warning";
      else dept.status = "stable";
    });

    setDepartments(initialDepartments);
    return initialDepartments;
  }, []);

  // Initialize predictions with historical and future data
  const initializePredictions = useCallback(() => {
    const now = Date.now();
    const predictions: PredictionData[] = [];
    
    // Generate 24 data points (past 12 hours + future 12 hours)
    for (let i = -12; i <= 12; i++) {
      const timestamp = now + (i * 60 * 60 * 1000); // Hourly intervals
      const baseValue = 20 + Math.sin((i + 12) * 0.3) * 10; // Sine wave pattern
      const noise = (Math.random() - 0.5) * 8;
      
      const actual = i <= 0 ? Math.max(0, Math.floor(baseValue + noise)) : 0;
      const predicted = Math.max(0, Math.floor(baseValue + (Math.random() - 0.5) * 4));
      
      predictions.push({
        timestamp,
        actual,
        predicted,
        emergency: Math.floor(predicted * 0.3),
        opd: Math.floor(predicted * 0.5),
        diagnostics: Math.floor(predicted * 0.2),
      });
    }
    
    setPredictions(predictions);
    return predictions;
  }, []);

  // Generate AI recommendations based on current state
  const generateRecommendations = useCallback((depts: Department[]) => {
    const recs: Recommendation[] = [];
    
    depts.forEach(dept => {
      if (dept.utilization > 85) {
        recs.push({
          id: `${dept.id}-staff`,
          type: "add_staff",
          department: dept.name,
          priority: dept.utilization > 95 ? "high" : "medium",
          description: `Add ${Math.ceil((dept.utilization - 80) / 10)} staff members to reduce queue`,
          confidence: 85 + Math.floor(Math.random() * 15),
          impact: {
            waitTimeReduction: Math.floor(dept.utilization / 5),
            efficiency: Math.floor(dept.utilization / 4),
          },
          details: {
            from: "Available pool",
            to: dept.name,
            resources: `${Math.ceil((dept.utilization - 80) / 10)} nurses, 1 doctor`,
          },
        });
      }

      if (dept.utilization < 50 && dept.staff > 4) {
        recs.push({
          id: `${dept.id}-reduce`,
          type: "remove_staff",
          department: dept.name,
          priority: "low",
          description: "Reallocate excess staff to high-demand departments",
          confidence: 70 + Math.floor(Math.random() * 20),
          impact: {
            waitTimeReduction: Math.floor(Math.random() * 5),
            efficiency: Math.floor(Math.random() * 15) + 10,
          },
          details: {
            from: dept.name,
            to: "Emergency/OPD",
            resources: "1-2 staff members",
          },
        });
      }
    });

    // Sort by priority and impact
    recs.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    setRecommendations(recs.slice(0, 5)); // Show top 5 recommendations
  }, []);

  // Update KPIs based on current state
  const updateKPIs = useCallback((depts: Department[]) => {
    const totalPatients = depts.reduce((sum, dept) => sum + dept.currentQueue, 0);
    const avgWaitTime = Math.floor(
      depts.reduce((sum, dept) => sum + (dept.avgWaitTime * dept.currentQueue), 0) / totalPatients
    );
    const avgUtilization = Math.floor(
      depts.reduce((sum, dept) => sum + dept.utilization, 0) / depts.length
    );
    
    // Calculate efficiency based on utilization and wait times
    const efficiency = Math.max(0, Math.min(100, 
      100 - (avgWaitTime * 0.5) - Math.abs(avgUtilization - 75)
    ));

    setKpis(prev => ({
      totalPatients,
      avgWaitTime,
      bedUtilization: avgUtilization,
      efficiency: Math.floor(efficiency),
      patientChange: Math.floor((totalPatients - prev.totalPatients) / Math.max(prev.totalPatients, 1) * 100),
      waitTimeChange: Math.floor((avgWaitTime - prev.avgWaitTime) / Math.max(prev.avgWaitTime, 1) * 100),
      utilizationChange: Math.floor((avgUtilization - prev.bedUtilization) / Math.max(prev.bedUtilization, 1) * 100),
      efficiencyChange: Math.floor((efficiency - prev.efficiency) / Math.max(prev.efficiency, 1) * 100),
    }));
  }, []);

  // Simulate patient arrivals and departures
  const simulatePatientFlow = useCallback(() => {
    setDepartments(prev => {
      const updated = prev.map(dept => {
        // Simulate arrivals (random)
        const arrivals = Math.random() < 0.3 ? Math.floor(Math.random() * 3) + 1 : 0;
        
        // Simulate departures (based on staff efficiency)
        const processingRate = Math.min(dept.currentQueue, 
          Math.floor(dept.staff * (0.5 + Math.random() * 0.5))
        );
        
        const newQueue = Math.max(0, dept.currentQueue + arrivals - processingRate);
        const newUtilization = Math.min(100, (newQueue / dept.capacity) * 100);
        
        // Update wait time based on queue and staff
        const newWaitTime = Math.max(5, 
          Math.floor((newQueue / dept.staff) * 8 + Math.random() * 10)
        );
        
        // Update status
        let status: "stable" | "warning" | "critical" = "stable";
        if (newUtilization > 85) status = "critical";
        else if (newUtilization > 70) status = "warning";
        
        // Update trend
        const trend = ((newQueue - dept.currentQueue) / Math.max(dept.currentQueue, 1)) * 100;
        
        return {
          ...dept,
          currentQueue: newQueue,
          avgWaitTime: newWaitTime,
          utilization: newUtilization,
          status,
          trend: Math.floor(trend),
        };
      });
      
      updateKPIs(updated);
      generateRecommendations(updated);
      
      return updated;
    });
  }, [updateKPIs, generateRecommendations]);

  // Mock prediction function to replace ML API
  const getMockPatientPrediction = useCallback((hour: number, day: number, currentPatients: number, isWeekend: boolean): number => {
    // Simple mock algorithm based on time patterns
    const baseLoad = isWeekend ? 40 : 60;
    const hourFactor = hour >= 8 && hour <= 18 ? 1.5 : 0.7; // Higher during day hours
    const dayFactor = day === 1 ? 1.2 : day === 5 ? 1.3 : 1.0; // Higher on Monday and Friday
    const randomVariation = 0.8 + Math.random() * 0.4; // ±20% random variation
    
    return Math.floor(baseLoad * hourFactor * dayFactor * randomVariation);
  }, []);

  // Update predictions with new data points using mock predictions
  const updatePredictions = useCallback(async () => {
    try {
      const now = Date.now();
      const currentHour = new Date().getHours();
      const currentDay = new Date().getDay(); // 0 = Sunday, 6 = Saturday
      const isWeekend = currentDay === 0 || currentDay === 6;
      const totalPatients = departments.reduce((sum, dept) => sum + dept.currentQueue, 0);
      
      // Get mock prediction
      const predicted = getMockPatientPrediction(
        currentHour, 
        currentDay, 
        totalPatients,
        isWeekend
      );
      
      setPredictions(prev => {
        const newData = [...prev];
        
        // Add new prediction point
        const lastPoint = newData[newData.length - 1];
        const nextTimestamp = lastPoint.timestamp + (60 * 60 * 1000);
        
        newData.push({
          timestamp: nextTimestamp,
          actual: 0, // Will be filled when time passes
          predicted,
          emergency: Math.floor(predicted * 0.3),
          opd: Math.floor(predicted * 0.5),
          diagnostics: Math.floor(predicted * 0.2),
        });
        
        // Remove old data points (keep last 24 hours)
        return newData.slice(-24);
      });
    } catch (error) {
      console.error("Error updating predictions:", error);
      // Fallback to random prediction if API fails
      setPredictions(prev => {
        const newData = [...prev];
        const lastPoint = newData[newData.length - 1];
        const nextTimestamp = lastPoint.timestamp + (60 * 60 * 1000);
        
        const baseValue = 20 + Math.sin(Date.now() * 0.0001) * 10;
        const predicted = Math.max(0, Math.floor(baseValue + (Math.random() - 0.5) * 6));
        
        newData.push({
          timestamp: nextTimestamp,
          actual: 0,
          predicted,
          emergency: Math.floor(predicted * 0.3),
          opd: Math.floor(predicted * 0.5),
          diagnostics: Math.floor(predicted * 0.2),
        });
        
        return newData.slice(-24);
      });
    }
  }, [departments, getMockPatientPrediction]);

  // Start simulation
  const startSimulation = useCallback(() => {
    if (isRunning) return;
    
    setIsRunning(true);
    startTimeRef.current = Date.now();
    
    // Patient flow simulation (every 2 seconds)
    intervalRef.current = setInterval(simulatePatientFlow, 2000);
    
    // Prediction updates (every 10 seconds)
    predictionIntervalRef.current = setInterval(updatePredictions, 10000);
  }, [isRunning, simulatePatientFlow, updatePredictions]);

  // Stop simulation
  const stopSimulation = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (predictionIntervalRef.current) clearInterval(predictionIntervalRef.current);
  }, []);

  // Initialize equipment data
  const initializeEquipment = useCallback(() => {
    const now = new Date();
    const currentHour = now.getHours();
    
    const createDemandPattern = (peakHour: number): EquipmentDemand[] => {
      return Array.from({ length: 24 }, (_, i) => {
        // Distance from peak hour (cyclic)
        const hourDiff = Math.min(
          Math.abs(i - peakHour),
          Math.abs(i - peakHour + 24),
          Math.abs(i - peakHour - 24)
        );
        
        // Demand decreases as we move away from peak hour
        const baseDemand = Math.max(5, 100 - (hourDiff * 10));
        const randomFactor = 0.8 + (Math.random() * 0.4);
        const maintenanceScheduled = Math.random() < 0.05; // 5% chance of maintenance conflict
        
        return {
          hour: i,
          demand: Math.floor(baseDemand * randomFactor),
          maintenanceConflict: maintenanceScheduled
        };
      });
    };
    
    const initialEquipment: Equipment[] = [
      {
        id: "mri-1",
        name: "MRI Scanner #1",
        type: "diagnostic",
        department: "diagnostics",
        status: "in-use",
        currentUsage: 85,
        maintenanceScheduled: new Date(now.getTime() + 1000 * 60 * 60 * 3), // 3 hours from now
        projectedDemand: createDemandPattern(14), // Peak at 2 PM
        location: { floor: 1, x: 110, y: 60, width: 10, height: 10 }
      },
      {
        id: "ct-1",
        name: "CT Scanner #1",
        type: "diagnostic",
        department: "diagnostics",
        status: "available",
        currentUsage: 45,
        projectedDemand: createDemandPattern(16), // Peak at 4 PM
        location: { floor: 1, x: 95, y: 60, width: 10, height: 10 }
      },
      {
        id: "xray-1",
        name: "X-Ray Machine #1",
        type: "diagnostic",
        department: "emergency",
        status: "available",
        currentUsage: 60,
        projectedDemand: createDemandPattern(10), // Peak at 10 AM
        location: { floor: 1, x: 20, y: 20, width: 5, height: 5 }
      },
      {
        id: "ot-1",
        name: "Operating Theater #1",
        type: "surgical",
        department: "opd",
        status: "in-use",
        currentUsage: 90,
        maintenanceScheduled: new Date(now.getTime() + 1000 * 60 * 60 * 6), // 6 hours from now
        projectedDemand: createDemandPattern(12), // Peak at 12 PM
        location: { floor: 2, x: 70, y: 20, width: 15, height: 15 }
      },
      {
        id: "ot-2",
        name: "Operating Theater #2",
        type: "surgical",
        department: "opd",
        status: "maintenance",
        currentUsage: 0,
        maintenanceScheduled: now, // Currently in maintenance
        projectedDemand: createDemandPattern(13), // Peak at 1 PM
        location: { floor: 2, x: 90, y: 20, width: 15, height: 15 }
      },
      {
        id: "vent-1",
        name: "Ventilator #1",
        type: "monitoring",
        department: "icu",
        status: "in-use",
        currentUsage: 100,
        projectedDemand: createDemandPattern(18), // Peak at 6 PM
        location: { floor: 3, x: 45, y: 35, width: 5, height: 5 }
      }
    ];
    
    setEquipments(initialEquipment);
    return initialEquipment;
  }, []);

  // Initialize ambulance data
  const initializeAmbulances = useCallback(() => {
    const now = Date.now();
    
    const initialAmbulances: Ambulance[] = [
      {
        id: "amb-101",
        status: "available",
        type: "basic",
        location: {
          lat: 40.7128,
          lng: -74.006,
          district: "Downtown",
          distanceToHospital: 2.4,
          estimatedArrivalTime: 8
        },
        crew: 2,
        equipmentLevel: 2
      },
      {
        id: "amb-102",
        status: "dispatched",
        type: "advanced",
        location: {
          lat: 40.7168,
          lng: -74.016,
          district: "Midtown",
          distanceToHospital: 5.8,
          estimatedArrivalTime: 15
        },
        estimatedReturnTime: now + 1000 * 60 * 15, // 15 minutes from now
        crew: 3,
        equipmentLevel: 4
      },
      {
        id: "amb-103",
        status: "available",
        type: "critical",
        location: {
          lat: 40.7098,
          lng: -74.016,
          district: "Medical District",
          distanceToHospital: 1.2,
          estimatedArrivalTime: 4
        },
        crew: 4,
        equipmentLevel: 5
      },
      {
        id: "amb-104",
        status: "maintenance",
        type: "advanced",
        crew: 0,
        equipmentLevel: 4
      },
      {
        id: "amb-105",
        status: "returning",
        type: "basic",
        location: {
          lat: 40.7228,
          lng: -74.026,
          district: "Uptown",
          distanceToHospital: 8.1,
          estimatedArrivalTime: 22
        },
        estimatedReturnTime: now + 1000 * 60 * 22, // 22 minutes from now
        crew: 2,
        equipmentLevel: 3
      }
    ];
    
    setAmbulances(initialAmbulances);
    return initialAmbulances;
  }, []);

  // Update bed availability status
  const updateBedStatus = useCallback(() => {
    if (!isRunning) return;
    
    setDepartments(prevDepts => {
      return prevDepts.map(dept => {
        if (!dept.beds) return dept;
        
        // Simulate bed occupancy changes
        const occupancyChange = Math.random() < 0.7 ? 0 : (Math.random() < 0.6 ? 1 : -1);
        const newOccupied = Math.max(0, Math.min(dept.beds.total - dept.beds.maintenance, dept.beds.occupied + occupancyChange));
        
        // Update projected occupancy based on patient predictions
        const projectedChange = Math.floor(Math.random() * 10) - 3; // -3 to +6
        const newProjected = Math.max(50, Math.min(100, dept.beds.projectedOccupancy + projectedChange));
        
        // Update sections
        const updatedSections = dept.beds.sections.map(section => {
          // 20% chance of changing a section's occupancy
          if (Math.random() < 0.2) {
            const sectionChange = Math.random() < 0.6 ? 1 : -1;
            const newSectionOccupied = Math.max(0, Math.min(section.total, section.occupied + sectionChange));
            
            // Update section status
            let status: "low" | "medium" | "high" | "full" = "low";
            const occupancyRate = (newSectionOccupied / section.total) * 100;
            if (occupancyRate >= 95) status = "full";
            else if (occupancyRate >= 75) status = "high";
            else if (occupancyRate >= 50) status = "medium";
            
            return { ...section, occupied: newSectionOccupied, status };
          }
          return section;
        });
        
        return {
          ...dept,
          beds: {
            ...dept.beds,
            occupied: newOccupied,
            projectedOccupancy: newProjected,
            sections: updatedSections
          }
        };
      });
    });
  }, [isRunning]);

  // Update equipment usage and demand
  const updateEquipmentStatus = useCallback(() => {
    if (!isRunning) return;
    
    const now = new Date();
    const currentHour = now.getHours();
    
    setEquipments(prevEquipments => {
      return prevEquipments.map(equipment => {
        // Get current hour's projected demand
        const hourDemand = equipment.projectedDemand.find(d => d.hour === currentHour)?.demand || 50;
        
        // Add some randomness to current usage
        const usageChange = (Math.random() < 0.7) ? 0 : (Math.random() < 0.6 ? 5 : -5);
        const baseUsage = equipment.status === "maintenance" ? 0 : hourDemand;
        const newUsage = Math.max(0, Math.min(100, baseUsage + usageChange));
        
        // 1% chance of equipment going into maintenance if not already
        const goesToMaintenance = equipment.status !== "maintenance" && Math.random() < 0.01;
        
        // 10% chance of equipment coming out of maintenance
        const comesOutOfMaintenance = equipment.status === "maintenance" && Math.random() < 0.1;
        
        let newStatus = equipment.status;
        if (goesToMaintenance) {
          newStatus = "maintenance";
        } else if (comesOutOfMaintenance) {
          newStatus = newUsage > 0 ? "in-use" : "available";
        } else if (equipment.status !== "maintenance") {
          newStatus = newUsage > 0 ? "in-use" : "available";
        }
        
        return {
          ...equipment,
          currentUsage: newStatus === "maintenance" ? 0 : newUsage,
          status: newStatus
        };
      });
    });
  }, [isRunning]);

  // Update ambulance locations and status
  const updateAmbulanceStatus = useCallback(() => {
    if (!isRunning) return;
    
    const now = Date.now();
    
    setAmbulances(prevAmbulances => {
      return prevAmbulances.map(ambulance => {
        // Handle returns for dispatched or returning ambulances
        if ((ambulance.status === "dispatched" || ambulance.status === "returning") && 
            ambulance.estimatedReturnTime && ambulance.estimatedReturnTime < now) {
          return {
            ...ambulance,
            status: "available",
            estimatedReturnTime: undefined,
            location: ambulance.location ? {
              ...ambulance.location,
              distanceToHospital: 0,
              estimatedArrivalTime: 0
            } : undefined
          };
        }
        
        // Handle random dispatch of available ambulances (5% chance)
        if (ambulance.status === "available" && Math.random() < 0.05) {
          const distance = 2 + Math.random() * 10; // 2-12 km
          const timePerKm = 1.5 + Math.random() * 1; // 1.5-2.5 minutes per km
          const estimatedTime = Math.ceil(distance * timePerKm);
          
          return {
            ...ambulance,
            status: "dispatched",
            estimatedReturnTime: now + 1000 * 60 * (estimatedTime * 2), // Round trip time
            location: {
              lat: 40.7 + (Math.random() * 0.05),
              lng: -74 + (Math.random() * 0.05),
              district: ["Downtown", "Uptown", "Midtown", "West Side", "East Side"][Math.floor(Math.random() * 5)],
              distanceToHospital: distance,
              estimatedArrivalTime: estimatedTime
            }
          };
        }
        
        // Handle ambulance in maintenance coming back (10% chance)
        if (ambulance.status === "maintenance" && Math.random() < 0.1) {
          return {
            ...ambulance,
            status: "available",
            location: {
              lat: 40.7128,
              lng: -74.006,
              district: "Hospital Base",
              distanceToHospital: 0,
              estimatedArrivalTime: 0
            }
          };
        }
        
        // Update location of moving ambulances
        if ((ambulance.status === "dispatched" || ambulance.status === "returning") && ambulance.location) {
          const progressRate = ambulance.status === "returning" ? 2 : 1; // Return faster than dispatch
          const newDistance = Math.max(0, ambulance.location.distanceToHospital - (0.2 * progressRate));
          const newTime = Math.ceil(newDistance * (1.5 + Math.random()));
          
          return {
            ...ambulance,
            location: {
              ...ambulance.location,
              distanceToHospital: newDistance,
              estimatedArrivalTime: newTime
            }
          };
        }
        
        return ambulance;
      });
    });
  }, [isRunning]);

  // Reset simulation
  const resetSimulation = useCallback(() => {
    stopSimulation();
    const newDepts = initializeDepartments();
    initializePredictions();
    initializeEquipment();
    initializeAmbulances();
    updateKPIs(newDepts);
    generateRecommendations(newDepts);
    startTimeRef.current = Date.now();
  }, [stopSimulation, initializeDepartments, initializePredictions, initializeEquipment, initializeAmbulances, updateKPIs, generateRecommendations]);

  // Initialize on mount
  useEffect(() => {
    const initialDepts = initializeDepartments();
    initializePredictions();
    initializeEquipment();
    initializeAmbulances();
    updateKPIs(initialDepts);
    generateRecommendations(initialDepts);
  }, [initializeDepartments, initializePredictions, initializeEquipment, initializeAmbulances, updateKPIs, generateRecommendations]);

  // Update resource statuses at different intervals
  useEffect(() => {
    if (!isRunning) return;
    
    const bedInterval = setInterval(updateBedStatus, 3000);
    const equipmentInterval = setInterval(updateEquipmentStatus, 5000);
    const ambulanceInterval = setInterval(updateAmbulanceStatus, 4000);
    
    return () => {
      clearInterval(bedInterval);
      clearInterval(equipmentInterval);
      clearInterval(ambulanceInterval);
    };
  }, [isRunning, updateBedStatus, updateEquipmentStatus, updateAmbulanceStatus]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (predictionIntervalRef.current) clearInterval(predictionIntervalRef.current);
    };
  }, []);

  return {
    departments,
    predictions,
    recommendations,
    kpis,
    equipments,
    ambulances,
    isRunning,
    startSimulation,
    stopSimulation,
    resetSimulation,
  };
};
