
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { commonIssues } from './constants';

interface IssuesReviewStepProps {
  issuesReported: string[];
  onIssueToggle: (issue: string, checked: boolean) => void;
  requiresMaintenance: boolean;
  setRequiresMaintenance: (value: boolean) => void;
  maintenancePriority: string;
  setMaintenancePriority: (value: string) => void;
  notes: string;
  setNotes: (value: string) => void;
  assignedVehicles: any[];
  selectedVehicle: string;
  mileage: string;
  fuelLevel: string;
}

const IssuesReviewStep: React.FC<IssuesReviewStepProps> = ({
  issuesReported,
  onIssueToggle,
  requiresMaintenance,
  setRequiresMaintenance,
  maintenancePriority,
  setMaintenancePriority,
  notes,
  setNotes,
  assignedVehicles,
  selectedVehicle,
  mileage,
  fuelLevel
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Issues and Final Review</h3>
      
      <div>
        <Label>Issues Identified (Check all that apply)</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
          {commonIssues.map((issue) => (
            <div key={issue} className="flex items-center space-x-2">
              <Checkbox
                id={issue}
                checked={issuesReported.includes(issue)}
                onCheckedChange={(checked) => onIssueToggle(issue, checked as boolean)}
              />
              <Label htmlFor={issue} className="text-sm cursor-pointer">
                {issue}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="maintenance"
          checked={requiresMaintenance}
          onCheckedChange={(checked) => setRequiresMaintenance(checked as boolean)}
        />
        <Label htmlFor="maintenance" className="cursor-pointer">
          This vehicle requires maintenance attention
        </Label>
      </div>

      {requiresMaintenance && (
        <div>
          <Label>Maintenance Priority Level</Label>
          <RadioGroup value={maintenancePriority} onValueChange={setMaintenancePriority}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="low" id="low" />
              <Label htmlFor="low" className="cursor-pointer">
                <Badge className="bg-green-100 text-green-800">Low - Can wait for scheduled maintenance</Badge>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="medium" id="medium" />
              <Label htmlFor="medium" className="cursor-pointer">
                <Badge className="bg-yellow-100 text-yellow-800">Medium - Schedule within a week</Badge>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="high" id="high" />
              <Label htmlFor="high" className="cursor-pointer">
                <Badge className="bg-orange-100 text-orange-800">High - Schedule ASAP</Badge>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="urgent" id="urgent" />
              <Label htmlFor="urgent" className="cursor-pointer">
                <Badge className="bg-red-100 text-red-800">Urgent - Do not use vehicle</Badge>
              </Label>
            </div>
          </RadioGroup>
        </div>
      )}

      <div>
        <Label htmlFor="notes">Additional Notes and Observations</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Describe any additional observations, unusual sounds, smells, or concerns not covered above..."
          rows={4}
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Inspection Summary</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <p><strong>Vehicle:</strong> {assignedVehicles.find(v => v.id === selectedVehicle)?.vehicle_number}</p>
          <p><strong>Mileage:</strong> {mileage} km</p>
          <p><strong>Fuel Level:</strong> {fuelLevel}%</p>
          <p><strong>Issues Reported:</strong> {issuesReported.length}</p>
          <p><strong>Requires Maintenance:</strong> {requiresMaintenance ? `Yes (${maintenancePriority} priority)` : 'No'}</p>
        </div>
      </div>
    </div>
  );
};

export default IssuesReviewStep;
