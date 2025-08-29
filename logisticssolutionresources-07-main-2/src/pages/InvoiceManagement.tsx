import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function InvoiceManagement() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Invoice Management</h1>
      <Card>
        <CardHeader>
          <CardTitle>Invoicing & Billing</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Invoice management functionality coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}