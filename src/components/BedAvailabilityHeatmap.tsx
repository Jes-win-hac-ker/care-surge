import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Department } from "@/types/hospital";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BedAvailabilityHeatmapProps {
  departments: Department[];
  className?: string;
}

export function BedAvailabilityHeatmap({ departments, className = "" }: BedAvailabilityHeatmapProps) {
  const [selectedFloor, setSelectedFloor] = useState(1);
  
  // Get unique floors from departments
  const availableFloors = [...new Set(departments
    .filter(dept => dept.location?.floor !== undefined)
    .map(dept => dept.location!.floor))].sort();

  // Filter departments by selected floor
  const departmentsOnFloor = departments.filter(
    dept => dept.location?.floor === selectedFloor && dept.beds
  );

  // Calculate the canvas dimensions based on department positions
  const canvasWidth = 200;
  const canvasHeight = 150;
  
  // Function to get color based on occupancy rate
  const getOccupancyColor = (occupied: number, total: number): string => {
    const rate = (occupied / total) * 100;
    if (rate >= 90) return 'bg-red-500';
    if (rate >= 75) return 'bg-orange-500';
    if (rate >= 60) return 'bg-yellow-500';
    if (rate >= 40) return 'bg-green-500';
    return 'bg-blue-500';
  };

  // Function to get text color based on background color
  const getTextColor = (occupied: number, total: number): string => {
    const rate = (occupied / total) * 100;
    if (rate >= 60) return 'text-white';
    return 'text-gray-900';
  };

  // Function to get bed status icon
  const getBedStatusIcon = (occupied: number, total: number): string => {
    const rate = (occupied / total) * 100;
    if (rate >= 90) return '🔴';
    if (rate >= 75) return '🟠';
    if (rate >= 60) return '🟡';
    return '🟢';
  };

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Bed Availability Heatmap</h3>
          <Select
            value={selectedFloor.toString()}
            onValueChange={(value) => setSelectedFloor(parseInt(value))}
          >
            <SelectTrigger className="w-28">
              <SelectValue placeholder="Select floor" />
            </SelectTrigger>
            <SelectContent>
              {availableFloors.map((floor) => (
                <SelectItem key={floor} value={floor.toString()}>
                  Floor {floor}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="relative bg-muted/20 border rounded-lg h-[350px] w-full overflow-hidden">
          {/* Floor plan grid */}
          <div className="absolute inset-0 grid grid-cols-20 grid-rows-15 opacity-10">
            {Array.from({ length: 20 * 15 }).map((_, i) => (
              <div key={i} className="border border-gray-300"></div>
            ))}
          </div>
          
          {/* Department areas */}
          {departmentsOnFloor.map((dept) => {
            if (!dept.location || !dept.beds) return null;
            
            const { x, y, width, height } = dept.location;
            const { occupied, total } = dept.beds;
            
            // Scale coordinates to fit the canvas
            const scaleX = canvasWidth / 150;
            const scaleY = canvasHeight / 100;
            
            const positionStyle = {
              left: `${x * scaleX}%`,
              top: `${y * scaleY}%`,
              width: `${width * scaleX}%`,
              height: `${height * scaleY}%`,
            };
            
            const occupancyColor = getOccupancyColor(occupied, total);
            const textColor = getTextColor(occupied, total);
            
            return (
              <div
                key={dept.id}
                className={`absolute ${occupancyColor} rounded-md p-2 flex flex-col justify-between transition-all duration-300 shadow-md border border-white/20 backdrop-blur-sm`}
                style={positionStyle}
              >
                <div className={`font-semibold ${textColor} text-xs sm:text-sm truncate`}>
                  {dept.name}
                </div>
                <div className={`${textColor} text-xs`}>
                  {occupied}/{total} beds
                </div>
                <div className="text-xs font-bold">
                  {Math.round((occupied / total) * 100)}% full
                </div>
              </div>
            );
          })}
          
          {/* Legend */}
          <div className="absolute bottom-2 right-2 bg-white/80 p-2 rounded-md shadow-md text-xs space-y-1 backdrop-blur-sm">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>90-100% (Critical)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span>75-89% (High)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>60-74% (Medium)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>40-59% (Normal)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>&lt;40% (Low)</span>
            </div>
          </div>
        </div>
        
        {/* Detailed bed info */}
        <div className="mt-4 space-y-2 max-h-[200px] overflow-y-auto">
          <h4 className="font-semibold text-sm">Detailed Bed Status</h4>
          {departmentsOnFloor.map((dept) => {
            if (!dept.beds) return null;
            
            return (
              <div key={dept.id} className="border-l-4 border-primary/50 pl-3 py-1">
                <div className="font-medium text-sm">{dept.name}</div>
                <div className="text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 mt-1">
                  {dept.beds.sections.map((section) => (
                    <div key={section.id} className="flex items-center">
                      <span>{getBedStatusIcon(section.occupied, section.total)}</span>
                      <span className="ml-1">
                        {section.name}: {section.occupied}/{section.total}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Projected occupancy */}
        <div className="mt-4">
          <h4 className="font-semibold text-sm">Projected Occupancy (Next 4 hours)</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
            {departmentsOnFloor.map((dept) => {
              if (!dept.beds) return null;
              
              const projectedOccupancy = dept.beds.projectedOccupancy;
              let statusColor = 'bg-blue-100 text-blue-800';
              
              if (projectedOccupancy >= 90) {
                statusColor = 'bg-red-100 text-red-800';
              } else if (projectedOccupancy >= 75) {
                statusColor = 'bg-orange-100 text-orange-800';
              } else if (projectedOccupancy >= 60) {
                statusColor = 'bg-yellow-100 text-yellow-800';
              } else if (projectedOccupancy >= 40) {
                statusColor = 'bg-green-100 text-green-800';
              }
              
              return (
                <div
                  key={dept.id}
                  className={`${statusColor} rounded-md p-2 text-xs`}
                >
                  <div className="font-medium truncate">{dept.name}</div>
                  <div className="text-sm font-bold">{projectedOccupancy}%</div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}