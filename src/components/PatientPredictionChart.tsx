import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { PredictionData } from "@/types/hospital";

interface PatientPredictionChartProps {
  data: PredictionData[];
}

export const PatientPredictionChart = ({ data }: PatientPredictionChartProps) => {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const time = formatTime(label);
      return (
        <div className="medical-card p-4 border border-primary/30">
          <p className="text-sm text-muted-foreground mb-2">{time}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <span className="text-sm" style={{ color: entry.color }}>
                {entry.dataKey === 'actual' ? 'Actual' : 
                 entry.dataKey === 'predicted' ? 'Predicted' : 
                 entry.name}:
              </span>
              <span className="font-semibold" style={{ color: entry.color }}>
                {entry.value} patients
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="timestamp"
            tickFormatter={formatTime}
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ color: 'hsl(var(--foreground))' }}
          />
          <Line
            type="monotone"
            dataKey="actual"
            stroke="hsl(var(--primary))"
            strokeWidth={3}
            dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
            name="Actual Arrivals"
          />
          <Line
            type="monotone"
            dataKey="predicted"
            stroke="hsl(var(--accent))"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ fill: 'hsl(var(--accent))', strokeWidth: 2, r: 3 }}
            name="AI Prediction"
          />
          <Line
            type="monotone"
            dataKey="emergency"
            stroke="hsl(var(--medical-emergency))"
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--medical-emergency))', strokeWidth: 2, r: 3 }}
            name="Emergency"
          />
          <Line
            type="monotone"
            dataKey="opd"
            stroke="hsl(var(--medical-stable))"
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--medical-stable))', strokeWidth: 2, r: 3 }}
            name="OPD"
          />
          <Line
            type="monotone"
            dataKey="diagnostics"
            stroke="hsl(var(--medical-warning))"
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--medical-warning))', strokeWidth: 2, r: 3 }}
            name="Diagnostics"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};