import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function InfringementManagement() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Infringement Management</h1>
      <Card>
        <CardHeader>
          <CardTitle>Traffic Infringements</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Infringement tracking and management functionality coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}