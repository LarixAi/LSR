import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RealTimeTracking() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Real Time Tracking</h1>
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Real-time tracking functionality will be available here.</p>
        </CardContent>
      </Card>
    </div>
  );
}