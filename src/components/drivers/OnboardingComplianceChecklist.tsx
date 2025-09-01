import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

type Jurisdiction = 'US' | 'UK' | 'EU' | 'CA' | 'AU';

export interface OnboardingComplianceState {
  jurisdiction: Jurisdiction;
  contract_issued: boolean;
  right_to_work_verified: boolean;
  payroll_registered: boolean;
  tax_forms_collected: boolean; // W-4/TD1/TFN etc.
  new_hire_reported: boolean; // e.g., US state new-hire registry
  workers_comp_coverage: boolean;
  safety_induction_done: boolean;
  eeo_policy_ack: boolean; // anti-discrimination/harassment policy acknowledgement
  privacy_notice_ack: boolean; // GDPR/UK GDPR privacy notice provided
  required_posters_displayed: boolean; // or equivalent information provided
  benefits_enrolled_required: boolean; // enrolled in mandated benefits if applicable
  pension_auto_enrolment?: boolean; // UK
  super_choice_provided?: boolean; // AU
}

interface Props {
  value: OnboardingComplianceState;
  onChange: (updates: Partial<OnboardingComplianceState>) => void;
}

const CheckboxRow: React.FC<{ id: keyof OnboardingComplianceState; label: string; value: boolean; onToggle: (checked: boolean) => void; }>
 = ({ id, label, value, onToggle }) => (
  <div className="flex items-center space-x-2">
    <input
      type="checkbox"
      id={String(id)}
      checked={!!value}
      onChange={(e) => onToggle(e.target.checked)}
      className="rounded"
    />
    <Label htmlFor={String(id)}>{label}</Label>
  </div>
);

export const OnboardingComplianceChecklist: React.FC<Props> = ({ value, onChange }) => {
  const showUK = value.jurisdiction === 'UK';
  const showAU = value.jurisdiction === 'AU';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Employment Legal Compliance
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Checklist derived from EMPLOYING_STAFF_REQUIREMENTS.md. Select the hiring jurisdiction and confirm required steps.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="jurisdiction">Hiring Jurisdiction</Label>
          <select
            id="jurisdiction"
            value={value.jurisdiction}
            onChange={(e) => onChange({ jurisdiction: e.target.value as Jurisdiction })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="US">United States</option>
            <option value="UK">United Kingdom</option>
            <option value="EU">European Union</option>
            <option value="CA">Canada</option>
            <option value="AU">Australia</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CheckboxRow id={'contract_issued'} label={'Employment contract/terms issued'} value={value.contract_issued} onToggle={(v)=>onChange({contract_issued:v})} />
          <CheckboxRow id={'right_to_work_verified'} label={'Right to work verified'} value={value.right_to_work_verified} onToggle={(v)=>onChange({right_to_work_verified:v})} />
          <CheckboxRow id={'payroll_registered'} label={'Employer payroll registered'} value={value.payroll_registered} onToggle={(v)=>onChange({payroll_registered:v})} />
          <CheckboxRow id={'tax_forms_collected'} label={'Tax/payroll forms collected (W-4/TD1/TFN)'} value={value.tax_forms_collected} onToggle={(v)=>onChange({tax_forms_collected:v})} />
          <CheckboxRow id={'new_hire_reported'} label={'New hire reported (where required)'} value={value.new_hire_reported} onToggle={(v)=>onChange({new_hire_reported:v})} />
          <CheckboxRow id={'workers_comp_coverage'} label={'Workers’ compensation coverage in place'} value={value.workers_comp_coverage} onToggle={(v)=>onChange({workers_comp_coverage:v})} />
          <CheckboxRow id={'safety_induction_done'} label={'Health & safety induction completed'} value={value.safety_induction_done} onToggle={(v)=>onChange({safety_induction_done:v})} />
          <CheckboxRow id={'eeo_policy_ack'} label={'Anti-discrimination/harassment policy acknowledged'} value={value.eeo_policy_ack} onToggle={(v)=>onChange({eeo_policy_ack:v})} />
          <CheckboxRow id={'privacy_notice_ack'} label={'Privacy notice provided (GDPR/UK GDPR as applicable)'} value={value.privacy_notice_ack} onToggle={(v)=>onChange({privacy_notice_ack:v})} />
          <CheckboxRow id={'required_posters_displayed'} label={'Required notices/posters available to staff'} value={value.required_posters_displayed} onToggle={(v)=>onChange({required_posters_displayed:v})} />
          <CheckboxRow id={'benefits_enrolled_required'} label={'Enrolled in legally required benefits'} value={value.benefits_enrolled_required} onToggle={(v)=>onChange({benefits_enrolled_required:v})} />

          {showUK && (
            <CheckboxRow id={'pension_auto_enrolment'} label={'Auto‑enrolment pension duty assessed'} value={!!value.pension_auto_enrolment} onToggle={(v)=>onChange({pension_auto_enrolment:v})} />
          )}
          {showAU && (
            <CheckboxRow id={'super_choice_provided'} label={'Superannuation choice form provided'} value={!!value.super_choice_provided} onToggle={(v)=>onChange({super_choice_provided:v})} />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OnboardingComplianceChecklist;



