import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function WorkOrders() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Work Orders</h1>
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Work order management functionality will be available here.</p>
        </CardContent>
      </Card>
    </div>
  );
}