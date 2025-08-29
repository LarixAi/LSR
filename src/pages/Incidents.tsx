import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Incidents() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Incidents</h1>
      <Card>
        <CardHeader>
          <CardTitle>Incident Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Incident reporting and management functionality coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}