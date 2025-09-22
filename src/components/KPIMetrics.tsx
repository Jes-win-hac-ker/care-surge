import { TrendingUp, TrendingDown, Clock, Users, Bed, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { KPIData } from "@/types/hospital";

interface KPIMetricsProps {
  metrics: KPIData;
  className?: string;
}

export const KPIMetrics = ({ metrics, className }: KPIMetricsProps) => {
  const kpiItems = [
    {
      title: "Total Patients",
      value: metrics.totalPatients,
      change: metrics.patientChange,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/20",
    },
    {
      title: "Avg Wait Time",
      value: `${metrics.avgWaitTime}m`,
      change: metrics.waitTimeChange,
      icon: Clock,
      color: "text-medical-warning",
      bgColor: "bg-medical-warning/20",
      inverse: true, // Lower is better
    },
    {
      title: "Bed Utilization",
      value: `${metrics.bedUtilization}%`,
      change: metrics.utilizationChange,
      icon: Bed,
      color: "text-accent",
      bgColor: "bg-accent/20",
    },
    {
      title: "System Efficiency",
      value: `${metrics.efficiency}%`,
      change: metrics.efficiencyChange,
      icon: Zap,
      color: "text-medical-stable",
      bgColor: "bg-medical-stable/20",
    },
  ];

  const getTrendIcon = (change: number, inverse = false) => {
    const isPositive = inverse ? change < 0 : change > 0;
    return isPositive ? 
      <TrendingUp className="w-4 h-4 text-medical-stable" /> : 
      <TrendingDown className="w-4 h-4 text-medical-emergency" />;
  };

  const getTrendColor = (change: number, inverse = false) => {
    if (change === 0) return "text-muted-foreground";
    const isPositive = inverse ? change < 0 : change > 0;
    return isPositive ? "text-medical-stable" : "text-medical-emergency";
  };

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      {kpiItems.map((item, index) => (
        <Card key={index} className="medical-card p-6 hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <div className={cn("p-3 rounded-full", item.bgColor)}>
              <item.icon className={cn("w-6 h-6", item.color)} />
            </div>
            <div className="flex items-center gap-1">
              {getTrendIcon(item.change, item.inverse)}
              <span className={cn("text-sm font-medium", getTrendColor(item.change, item.inverse))}>
                {item.change > 0 ? '+' : ''}{item.change}%
              </span>
            </div>
          </div>
          
          <div>
            <p className="text-2xl font-bold counter-glow mb-1">
              {item.value}
            </p>
            <p className="text-sm text-muted-foreground">
              {item.title}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
};