import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function FleetReports() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Fleet Reports</h1>
      <Card>
        <CardHeader>
          <CardTitle>Fleet Analytics & Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Fleet reporting and analytics functionality coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}