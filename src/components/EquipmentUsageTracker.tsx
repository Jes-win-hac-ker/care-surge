import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Equipment } from "@/types/hospital";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Calendar, Clock, AlertTriangle, Activity, CheckCircle2, AlertCircle } from "lucide-react";

interface EquipmentUsageTrackerProps {
  equipment: Equipment[];
  className?: string;
}

export function EquipmentUsageTracker({ equipment, className = "" }: EquipmentUsageTrackerProps) {
  const [selectedType, setSelectedType] = useState<string>("all");
  
  // Filter equipment by type
  const filteredEquipment = selectedType === "all" 
    ? equipment 
    : equipment.filter(item => item.type === selectedType);
  
  // Sort by usage (highest first) and then by maintenance conflicts
  const sortedEquipment = [...filteredEquipment].sort((a, b) => {
    // First prioritize equipment with maintenance conflicts
    const aHasConflict = a.projectedDemand.some(d => d.maintenanceConflict);
    const bHasConflict = b.projectedDemand.some(d => d.maintenanceConflict);
    
    if (aHasConflict && !bHasConflict) return -1;
    if (!aHasConflict && bHasConflict) return 1;
    
    // Then sort by current usage
    return b.currentUsage - a.currentUsage;
  });

  // Calculate maintenance conflicts
  const getMaintenanceConflicts = (equip: Equipment): number => {
    return equip.projectedDemand.filter(d => d.maintenanceConflict).length;
  };
  
  // Format maintenance time
  const formatMaintenanceTime = (date: Date | undefined): string => {
    if (!date) return "Not scheduled";
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Get status badge for equipment
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Available</Badge>;
      case "in-use":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">In Use</Badge>;
      case "maintenance":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Maintenance</Badge>;
      case "reserved":
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 hover:bg-purple-100">Reserved</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Get demand status for the next few hours
  const getDemandForecast = (equip: Equipment): React.ReactNode => {
    const now = new Date();
    const currentHour = now.getHours();
    const nextHours = [];
    
    // Get the next 6 hours demand
    for (let i = 0; i < 6; i++) {
      const hourToCheck = (currentHour + i) % 24;
      const hourDemand = equip.projectedDemand.find(d => d.hour === hourToCheck);
      
      if (hourDemand) {
        nextHours.push({
          hour: hourToCheck,
          demand: hourDemand.demand,
          conflict: hourDemand.maintenanceConflict
        });
      }
    }
    
    return (
      <div className="flex space-x-1 mt-1">
        {nextHours.map((hour, index) => {
          let bgColor = "bg-green-100";
          if (hour.demand >= 90) bgColor = "bg-red-100";
          else if (hour.demand >= 75) bgColor = "bg-orange-100";
          else if (hour.demand >= 60) bgColor = "bg-yellow-100";
          
          return (
            <div key={index} className="text-center">
              <div className={`text-xs ${hour.conflict ? "text-red-500 font-bold" : ""}`}>
                {hour.hour}:00
              </div>
              <div 
                className={`w-6 h-8 ${bgColor} rounded-sm flex items-center justify-center text-xs font-medium ${hour.conflict ? "border-2 border-red-500" : ""}`}
              >
                {hour.demand}%
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Count maintenance conflicts
  const maintenanceConflicts = equipment.reduce((count, equip) => 
    count + (equip.projectedDemand.some(d => d.maintenanceConflict) ? 1 : 0), 0);
  
  // Count high-usage equipment (>80%)
  const highUsageCount = equipment.filter(equip => equip.currentUsage > 80).length;

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Equipment Usage Tracker</h3>
          <Tabs defaultValue="all" value={selectedType} onValueChange={setSelectedType}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="diagnostic">Diagnostic</TabsTrigger>
              <TabsTrigger value="surgical">Surgical</TabsTrigger>
              <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {/* Stats overview */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-yellow-100 text-yellow-800 p-3 rounded-md text-center">
            <div className="flex justify-center">
              <Clock className="h-5 w-5 mr-1" />
              <div className="font-medium">Scheduled</div>
            </div>
            <div className="text-lg font-bold">{equipment.filter(e => e.maintenanceScheduled).length}</div>
          </div>
          <div className="bg-red-100 text-red-800 p-3 rounded-md text-center">
            <div className="flex justify-center">
              <AlertTriangle className="h-5 w-5 mr-1" />
              <div className="font-medium">Conflicts</div>
            </div>
            <div className="text-lg font-bold">{maintenanceConflicts}</div>
          </div>
          <div className="bg-blue-100 text-blue-800 p-3 rounded-md text-center">
            <div className="flex justify-center">
              <Activity className="h-5 w-5 mr-1" />
              <div className="font-medium">High Usage</div>
            </div>
            <div className="text-lg font-bold">{highUsageCount}</div>
          </div>
        </div>
        
        {/* Maintenance conflicts alert */}
        {maintenanceConflicts > 0 && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Maintenance Conflicts Detected</AlertTitle>
            <AlertDescription>
              {maintenanceConflicts} equipment items have scheduled maintenance during high-demand periods.
              Review and reschedule maintenance to avoid service disruptions.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Equipment list */}
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {sortedEquipment.map(equip => {
              const hasMaintenanceConflict = getMaintenanceConflicts(equip) > 0;
              
              return (
                <div 
                  key={equip.id} 
                  className={`border p-3 rounded-md ${hasMaintenanceConflict ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium flex items-center">
                        {equip.name}
                        {hasMaintenanceConflict && (
                          <AlertCircle className="h-4 w-4 text-red-500 ml-2" />
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {equip.department} • Type: {equip.type}
                      </div>
                    </div>
                    <div>{getStatusBadge(equip.status)}</div>
                  </div>
                  
                  <div className="mt-2">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span>Current Usage</span>
                      <span className={
                        equip.currentUsage > 90 ? "text-red-600 font-bold" : 
                        equip.currentUsage > 75 ? "text-orange-600 font-medium" :
                        "text-gray-600"
                      }>
                        {equip.currentUsage}%
                      </span>
                    </div>
                    <Progress 
                      value={equip.currentUsage} 
                      className={
                        equip.currentUsage > 90 ? "bg-red-100" : 
                        equip.currentUsage > 75 ? "bg-orange-100" : 
                        equip.currentUsage > 60 ? "bg-yellow-100" : 
                        "bg-green-100"
                      }
                    />
                  </div>
                  
                  {/* Maintenance info */}
                  {equip.maintenanceScheduled && (
                    <div className="mt-2 flex items-center text-xs">
                      <Calendar className="h-3 w-3 mr-1 text-yellow-600" />
                      <span className="text-yellow-600 font-medium">
                        Maintenance: {formatMaintenanceTime(equip.maintenanceScheduled)}
                      </span>
                    </div>
                  )}
                  
                  {/* Demand forecast */}
                  <div className="mt-1">
                    <div className="text-xs font-medium">Usage Forecast (next 6 hours)</div>
                    {getDemandForecast(equip)}
                  </div>
                  
                  {/* Conflict warning */}
                  {hasMaintenanceConflict && (
                    <div className="mt-2 bg-red-100 text-red-800 p-2 rounded text-xs">
                      <div className="font-bold">⚠️ Conflict Alert</div>
                      <div>Maintenance scheduled during high-demand period ({getMaintenanceConflicts(equip)} hour conflicts)</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}