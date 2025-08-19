import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function VehicleDetails() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Vehicle Details</h1>
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Vehicle details will be available here.</p>
        </CardContent>
      </Card>
    </div>
  );
}