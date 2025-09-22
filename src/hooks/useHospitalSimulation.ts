import { useState, useEffect, useCallback, useRef } from "react";
import { Department, PredictionData, Recommendation, KPIData, PatientArrival } from "@/types/hospital";

export const useHospitalSimulation = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [predictions, setPredictions] = useState<PredictionData[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
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

  // Initialize departments
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

  // Update predictions with new data points
  const updatePredictions = useCallback(() => {
    setPredictions(prev => {
      const now = Date.now();
      const newData = [...prev];
      
      // Add new prediction point
      const lastPoint = newData[newData.length - 1];
      const nextTimestamp = lastPoint.timestamp + (60 * 60 * 1000);
      
      const baseValue = 20 + Math.sin(Date.now() * 0.0001) * 10;
      const predicted = Math.max(0, Math.floor(baseValue + (Math.random() - 0.5) * 6));
      
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
  }, []);

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

  // Reset simulation
  const resetSimulation = useCallback(() => {
    stopSimulation();
    const newDepts = initializeDepartments();
    initializePredictions();
    updateKPIs(newDepts);
    generateRecommendations(newDepts);
    startTimeRef.current = Date.now();
  }, [stopSimulation, initializeDepartments, initializePredictions, updateKPIs, generateRecommendations]);

  // Initialize on mount
  useEffect(() => {
    const initialDepts = initializeDepartments();
    initializePredictions();
    updateKPIs(initialDepts);
    generateRecommendations(initialDepts);
  }, [initializeDepartments, initializePredictions, updateKPIs, generateRecommendations]);

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
    isRunning,
    startSimulation,
    stopSimulation,
    resetSimulation,
  };
};
