import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Licenses() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Licenses</h1>
      <Card>
        <CardHeader>
          <CardTitle>License Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Driver and vehicle license management coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}