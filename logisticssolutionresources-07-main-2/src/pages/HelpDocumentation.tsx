import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HelpDocumentation() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Help & Documentation</h1>
      <Card>
        <CardHeader>
          <CardTitle>System Documentation</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Help articles and documentation coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}