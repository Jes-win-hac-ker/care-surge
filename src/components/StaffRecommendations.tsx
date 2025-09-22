import { UserPlus, UserMinus, Bed, Clock, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Recommendation } from "@/types/hospital";
import { cn } from "@/lib/utils";

interface StaffRecommendationsProps {
  recommendations: Recommendation[];
}

export const StaffRecommendations = ({ recommendations }: StaffRecommendationsProps) => {
  const getActionIcon = (type: string) => {
    switch (type) {
      case "add_staff":
        return <UserPlus className="w-4 h-4" />;
      case "remove_staff":
        return <UserMinus className="w-4 h-4" />;
      case "reallocate_beds":
        return <Bed className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-medical-emergency/20 text-medical-emergency border-medical-emergency/30";
      case "medium":
        return "bg-medical-warning/20 text-medical-warning border-medical-warning/30";
      case "low":
        return "bg-medical-stable/20 text-medical-stable border-medical-stable/30";
      default:
        return "bg-primary/20 text-primary border-primary/30";
    }
  };

  const getImpactColor = (impact: number) => {
    if (impact >= 20) return "text-medical-stable";
    if (impact >= 10) return "text-medical-warning";
    return "text-medical-emergency";
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-accent glow-primary"></div>
        AI Recommendations
      </h2>
      
      <div className="space-y-4">
        {recommendations.length === 0 ? (
          <Card className="medical-card p-6 text-center">
            <p className="text-muted-foreground">
              All departments are optimally staffed
            </p>
          </Card>
        ) : (
          recommendations.map((rec) => (
            <Card key={rec.id} className="medical-card p-4 hover:scale-[1.02] transition-transform">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "p-2 rounded-full",
                      rec.priority === "high" ? "bg-medical-emergency/20" :
                      rec.priority === "medium" ? "bg-medical-warning/20" :
                      "bg-medical-stable/20"
                    )}>
                      {getActionIcon(rec.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold">{rec.department}</h3>
                      <p className="text-sm text-muted-foreground">{rec.description}</p>
                    </div>
                  </div>
                  <Badge className={cn("px-2 py-1", getPriorityColor(rec.priority))}>
                    {rec.priority.toUpperCase()}
                  </Badge>
                </div>

                {/* Impact Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Wait Time Reduction</p>
                    <p className={cn("text-lg font-bold", getImpactColor(rec.impact.waitTimeReduction))}>
                      -{rec.impact.waitTimeReduction}%
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Resource Efficiency</p>
                    <p className={cn("text-lg font-bold", getImpactColor(rec.impact.efficiency))}>
                      +{rec.impact.efficiency}%
                    </p>
                  </div>
                </div>

                {/* Action Details */}
                {rec.details && (
                  <div className="bg-muted/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Action:</span>
                      <span className="font-medium">{rec.details.from}</span>
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                      <span className="font-medium text-primary">{rec.details.to}</span>
                    </div>
                    {rec.details.resources && (
                      <div className="mt-2 text-sm">
                        <span className="text-muted-foreground">Resources: </span>
                        <span className="font-medium">{rec.details.resources}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Confidence */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">AI Confidence:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-muted/30 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full bg-primary"
                        style={{ width: `${rec.confidence}%` }}
                      />
                    </div>
                    <span className="font-medium">{rec.confidence}%</span>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};