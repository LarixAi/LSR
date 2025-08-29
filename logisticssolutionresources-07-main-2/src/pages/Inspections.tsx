import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Inspections() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Inspections</h1>
      <Card>
        <CardHeader>
          <CardTitle>Inspection Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Vehicle inspection management functionality coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}