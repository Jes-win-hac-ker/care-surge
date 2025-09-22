import { Activity, Users, Clock, TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Department } from "@/types/hospital";

interface DepartmentQueueProps {
  department: Department;
}

export const DepartmentQueue = ({ department }: DepartmentQueueProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical":
        return "medical-emergency";
      case "warning":
        return "medical-warning";
      case "stable":
        return "medical-stable";
      default:
        return "medical-primary";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "critical":
        return "status-critical";
      case "warning":
        return "status-warning";
      case "stable":
        return "status-stable";
      default:
        return "bg-card";
    }
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-medical-emergency" />;
    if (trend < 0) return <TrendingDown className="w-4 h-4 text-medical-stable" />;
    return <Activity className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <Card className={cn("medical-card p-6 border", getStatusBg(department.status))}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{department.name}</h3>
        <div className={cn("p-2 rounded-full", 
          department.status === "critical" ? "bg-medical-emergency/20" :
          department.status === "warning" ? "bg-medical-warning/20" :
          "bg-medical-primary/20"
        )}>
          <Users className={cn("w-5 h-5", getStatusColor(department.status))} />
        </div>
      </div>

      <div className="space-y-4">
        {/* Current Queue */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Current Queue</span>
          <span className={cn("text-2xl font-bold counter-glow", getStatusColor(department.status))}>
            {department.currentQueue}
          </span>
        </div>

        {/* Average Wait Time */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Avg Wait
          </span>
          <span className="text-lg font-semibold">
            {department.avgWaitTime}m
          </span>
        </div>

        {/* Trend */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Trend</span>
          <div className="flex items-center gap-1">
            {getTrendIcon(department.trend)}
            <span className="text-sm">
              {department.trend > 0 ? '+' : ''}{department.trend}%
            </span>
          </div>
        </div>

        {/* Capacity Utilization */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Capacity</span>
            <span>{Math.round(department.utilization)}%</span>
          </div>
          <div className="w-full bg-muted/30 rounded-full h-2">
            <div
              className={cn(
                "h-2 rounded-full transition-all duration-500",
                department.utilization > 80 ? "bg-medical-emergency" :
                department.utilization > 60 ? "bg-medical-warning" :
                "bg-medical-stable"
              )}
              style={{ width: `${Math.min(department.utilization, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};