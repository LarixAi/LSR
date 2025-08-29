
import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface IssuesReportingSectionProps {
  issuesReported: string[];
  onIssueToggle: (issue: string, checked: boolean) => void;
}

const commonIssues = [
  'Unusual noises',
  'Warning lights',
  'Fluid leaks',
  'Tire wear',
  'Brake issues',
  'Electrical problems',
  'Interior damage',
  'Exterior damage',
];

const IssuesReportingSection: React.FC<IssuesReportingSectionProps> = ({
  issuesReported,
  onIssueToggle
}) => {
  return (
    <div>
      <Label>Issues Reported (if any)</Label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
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
  );
};

export default IssuesReportingSection;
