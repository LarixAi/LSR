import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SupportTicket() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Support Tickets</h1>
      <Card>
        <CardHeader>
          <CardTitle>Support Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Support ticket management functionality will be available here.</p>
        </CardContent>
      </Card>
    </div>
  );
}