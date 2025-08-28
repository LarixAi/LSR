import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DefectReports() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Defect Reports</h1>
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Defects</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Defect reporting functionality will be available here.</p>
        </CardContent>
      </Card>
    </div>
  );
}