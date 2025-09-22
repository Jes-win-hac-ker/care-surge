import { useState, useEffect, useCallback } from "react";
import { DepartmentQueue } from "@/components/DepartmentQueue";
import { PatientPredictionChart } from "@/components/PatientPredictionChart";
import { StaffRecommendations } from "@/components/StaffRecommendations";
import { SimulationControls } from "@/components/SimulationControls";
import { KPIMetrics } from "@/components/KPIMetrics";
import { useHospitalSimulation } from "@/hooks/useHospitalSimulation";
import heroBackground from "@/assets/hospital-hero-bg.jpg";

const Index = () => {
  const {
    departments,
    predictions,
    recommendations,
    kpis,
    isRunning,
    startSimulation,
    stopSimulation,
    resetSimulation,
  } = useHospitalSimulation();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Hero Background */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url(${heroBackground})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background/90" />
      
      {/* Main Content */}
      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold gradient-text mb-2">
                AI Hospital Resource Optimizer
              </h1>
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground text-lg">
                  Real-time patient flow prediction and resource allocation
                </p>
              </div>
            </div>
            <SimulationControls
              isRunning={isRunning}
              onStart={startSimulation}
              onStop={stopSimulation}
              onReset={resetSimulation}
            />
          </div>
        </header>

        {/* KPI Metrics */}
        <KPIMetrics metrics={kpis} className="mb-8" />

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Department Queues */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary glow-primary"></div>
              Department Queues
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {departments.map((dept) => (
                <DepartmentQueue
                  key={dept.id}
                  department={dept}
                />
              ))}
            </div>
          </div>

          {/* Staff Recommendations */}
          <div>
            <StaffRecommendations recommendations={recommendations} />
          </div>
        </div>

        {/* Patient Prediction Chart */}
        <div className="medical-card rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent glow-primary"></div>
            Patient Arrival Predictions
          </h2>
          <PatientPredictionChart data={predictions} />
        </div>
      </div>
    </div>
  );
};

export default Index;