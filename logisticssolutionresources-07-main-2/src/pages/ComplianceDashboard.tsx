import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ComplianceDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Compliance Dashboard</h1>
      <Card>
        <CardHeader>
          <CardTitle>Compliance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Compliance monitoring and reporting functionality coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}