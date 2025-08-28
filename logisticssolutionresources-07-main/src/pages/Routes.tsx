import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Routes() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Routes</h1>
      <Card>
        <CardHeader>
          <CardTitle>Route Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Route management functionality will be available here.</p>
        </CardContent>
      </Card>
    </div>
  );
}