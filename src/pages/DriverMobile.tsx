import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DriverMobile() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Driver Mobile</h1>
      <Card>
        <CardHeader>
          <CardTitle>Mobile Driver Interface</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Mobile driver functionality will be available here.</p>
        </CardContent>
      </Card>
    </div>
  );
}