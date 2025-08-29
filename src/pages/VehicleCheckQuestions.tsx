import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function VehicleCheckQuestions() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Vehicle Check Questions</h1>
      <Card>
        <CardHeader>
          <CardTitle>Daily Check Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Vehicle check questionnaire management coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}