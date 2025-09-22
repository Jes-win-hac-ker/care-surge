import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Ambulance, Department } from "@/types/hospital";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Check, Clock, AlertTriangle, Map, Truck, Activity } from "lucide-react";

interface AmbulanceOptimizerProps {
  ambulances: Ambulance[];
  departments: Department[];
  className?: string;
}

export function AmbulanceOptimizer({ ambulances, departments, className = "" }: AmbulanceOptimizerProps) {
  // Get emergency department load
  const emergencyDept = departments.find(dept => dept.id === "emergency");
  const erLoad = emergencyDept?.utilization || 0;
  const erTrend = emergencyDept?.trend || 0;
  
  // Filter available ambulances
  const availableAmbulances = ambulances.filter(amb => amb.status === "available");
  
  // Calculate dispatch recommendations
  const dispatchRecommendations = useMemo(() => {
    if (erLoad < 60) {
      // Low load - no urgent need for dispatches
      return [];
    }
    
    // Prioritize ambulances based on their type, equipment level, and distance
    return availableAmbulances
      .map(ambulance => {
        // Calculate priority score (higher is better)
        // Consider equipment level, crew size, and distance to hospital
        let priorityScore = ambulance.equipmentLevel * 5 + ambulance.crew * 10;
        
        // Deduct points for distance if location exists
        if (ambulance.location && ambulance.location.distanceToHospital) {
          priorityScore -= ambulance.location.distanceToHospital * 2;
        }
        
        // Adjust score based on ambulance type
        switch (ambulance.type) {
          case "critical":
            priorityScore += 50;
            break;
          case "advanced":
            priorityScore += 30;
            break;
          case "basic":
            priorityScore += 10;
            break;
        }
        
        // Calculate recommendation urgency
        let urgency: "high" | "medium" | "low" = "medium";
        if (erLoad >= 85 || erTrend >= 10) {
          urgency = "high";
        } else if (erLoad < 70 && erTrend < 0) {
          urgency = "low";
        }
        
        // Generate recommendation reason
        let reason = "Balanced distribution of resources";
        if (erLoad >= 85) {
          reason = "Critical ER load";
        } else if (erTrend >= 10) {
          reason = "Rapidly increasing patient load";
        } else if (erLoad >= 70) {
          reason = "High patient volume";
        }
        
        return {
          ambulance,
          priorityScore,
          urgency,
          reason
        };
      })
      .sort((a, b) => b.priorityScore - a.priorityScore)
      .slice(0, Math.min(3, Math.ceil(erLoad / 30))); // Recommend more ambulances for higher loads
  }, [availableAmbulances, erLoad, erTrend]);

  // Get status badge for ambulances
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Available</Badge>;
      case "dispatched":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Dispatched</Badge>;
      case "returning":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Returning</Badge>;
      case "maintenance":
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">Maintenance</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Format type name
  const formatTypeName = (type: string) => {
    switch (type) {
      case "basic": return "Basic";
      case "advanced": return "Advanced Life Support";
      case "critical": return "Critical Care";
      default: return type;
    }
  };
  
  // Get urgency color
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high": return "text-red-600";
      case "medium": return "text-amber-600";
      case "low": return "text-green-600";
      default: return "";
    }
  };

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Ambulance/Transport Optimization</h3>
        </div>
        
        {/* ER Status Card */}
        <div className={`p-3 rounded-md mb-4 flex justify-between items-center ${
          erLoad >= 85 ? 'bg-red-100 text-red-800' : 
          erLoad >= 70 ? 'bg-orange-100 text-orange-800' : 
          'bg-green-100 text-green-800'
        }`}>
          <div>
            <div className="font-medium">Emergency Department Status</div>
            <div className="text-sm">
              {erLoad}% Occupancy • {erTrend >= 0 ? "+" : ""}{erTrend}% Trend
            </div>
          </div>
          <div className="text-2xl font-bold">
            {erLoad >= 85 ? '🔴' : erLoad >= 70 ? '🟠' : '🟢'}
          </div>
        </div>
        
        {/* Dispatch Recommendations */}
        <div className="mb-4">
          <h4 className="font-semibold text-sm mb-2 flex items-center">
            <Activity className="h-4 w-4 mr-1" />
            Dispatch Recommendations
          </h4>
          
          {dispatchRecommendations.length === 0 ? (
            <div className="text-sm text-muted-foreground bg-muted/20 p-3 rounded-md">
              No dispatch recommendations at this time. ER load is within normal capacity.
            </div>
          ) : (
            <div className="space-y-2">
              {dispatchRecommendations.map(({ ambulance, urgency, reason }) => (
                <div key={ambulance.id} className="border p-3 rounded-md">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{ambulance.id}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatTypeName(ambulance.type)} • Crew: {ambulance.crew}
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Dispatch
                    </Button>
                  </div>
                  <div className="mt-2 text-xs">
                    <span className={`font-medium ${getUrgencyColor(urgency)}`}>
                      {urgency.toUpperCase()} PRIORITY
                    </span>
                    <span className="mx-2">•</span>
                    <span>{reason}</span>
                  </div>
                  {ambulance.location && (
                    <div className="mt-1 text-xs flex items-center text-muted-foreground">
                      <Map className="h-3 w-3 mr-1" />
                      <span>
                        {ambulance.location.district} • {ambulance.location.distanceToHospital} km away • 
                        {ambulance.location.estimatedArrivalTime} min ETA
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <Separator className="my-4" />
        
        {/* Ambulance Fleet Status */}
        <h4 className="font-semibold text-sm mb-2 flex items-center">
          <Truck className="h-4 w-4 mr-1" />
          Ambulance Fleet Status
        </h4>
        
        {/* Fleet summary */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="bg-green-100 text-green-800 p-2 rounded-md text-center">
            <div className="font-medium text-xs">Available</div>
            <div className="text-lg font-bold">{ambulances.filter(a => a.status === "available").length}</div>
          </div>
          <div className="bg-blue-100 text-blue-800 p-2 rounded-md text-center">
            <div className="font-medium text-xs">Dispatched</div>
            <div className="text-lg font-bold">{ambulances.filter(a => a.status === "dispatched").length}</div>
          </div>
          <div className="bg-yellow-100 text-yellow-800 p-2 rounded-md text-center">
            <div className="font-medium text-xs">Returning</div>
            <div className="text-lg font-bold">{ambulances.filter(a => a.status === "returning").length}</div>
          </div>
          <div className="bg-gray-100 text-gray-800 p-2 rounded-md text-center">
            <div className="font-medium text-xs">Maintenance</div>
            <div className="text-lg font-bold">{ambulances.filter(a => a.status === "maintenance").length}</div>
          </div>
        </div>
        
        {/* Ambulance list */}
        <ScrollArea className="h-[180px] pr-4">
          <div className="space-y-2">
            {ambulances.map(ambulance => (
              <div 
                key={ambulance.id} 
                className="border p-2 rounded-md flex justify-between items-center"
              >
                <div>
                  <div className="font-medium">{ambulance.id}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatTypeName(ambulance.type)} • Equipment Level: {ambulance.equipmentLevel}
                  </div>
                  
                  {(ambulance.status === "dispatched" || ambulance.status === "returning") && ambulance.estimatedReturnTime && (
                    <div className="text-xs flex items-center text-muted-foreground mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>ETA: {new Date(ambulance.estimatedReturnTime).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center">
                  {getStatusBadge(ambulance.status)}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}