import { Play, Pause, RotateCcw, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SimulationControlsProps {
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
}

export const SimulationControls = ({ 
  isRunning, 
  onStart, 
  onStop, 
  onReset 
}: SimulationControlsProps) => {
  return (
    <Card className="medical-card p-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Activity className={cn(
            "w-5 h-5 transition-colors",
            isRunning ? "text-medical-stable animate-pulse" : "text-muted-foreground"
          )} />
          <span className="text-sm font-medium">
            Simulation {isRunning ? "Running" : "Stopped"}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {!isRunning ? (
            <Button
              onClick={onStart}
              className="bg-medical-stable hover:bg-medical-stable/80 text-black font-semibold"
              size="sm"
            >
              <Play className="w-4 h-4 mr-1" />
              Start
            </Button>
          ) : (
            <Button
              onClick={onStop}
              variant="outline"
              className="border-medical-warning text-medical-warning hover:bg-medical-warning/10"
              size="sm"
            >
              <Pause className="w-4 h-4 mr-1" />
              Stop
            </Button>
          )}
          
          <Button
            onClick={onReset}
            variant="outline"
            className="border-primary/50 hover:bg-primary/10"
            size="sm"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>
        </div>
      </div>
    </Card>
  );
};