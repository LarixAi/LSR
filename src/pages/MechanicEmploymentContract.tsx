import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  Download, 
  ArrowLeft,
  Building2,
  User,
  Calendar,
  Clock,
  PoundSterling,
  Shield,
  Wrench,
  Car,
  Users,
  Settings
} from 'lucide-react';
import DefaultViewPageLayout from '@/components/layout/DefaultViewPageLayout';
import { generateMechanicContractPDF, generateMechanicContractPdfBlob, uploadContractPdf } from '@/services/contractService';
import AdvancedEmailService from '@/services/advancedEmailService';
import { useAuth } from '@/contexts/AuthContext';

interface ContractFormData {
  // Company Information
  companyName: string;
  companyAddress: string;
  companyCRN: string;
  companyVAT: string;
  operatingLicense: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  
  // Employee Information
  mechanicName: string;
  mechanicAddress: string;
  mechanicNI: string;
  mechanicDOB: string;
  mechanicPhone: string;
  mechanicEmail: string;
  
  // Employment Terms
  startDate: string;
  employmentType: string;
  startTime: string;
  endTime: string;
  weeklyHours: string;
  overtimeRate: string;
  onCallAllowance: string;
  callOutRate: string;
  
  // Salary and Benefits
  annualSalary: string;
  paymentFrequency: string;
  paymentDate: string;
  performanceBonus: string;
  toolAllowance: string;
  uniformAllowance: string;
  pensionCompany: string;
  holidayDays: string;
  sickPayWeeks: string;
  lifeInsurance: string;
  healthInsurance: string;
  
  // Additional Terms
  noticePeriod: string;
  probationPeriod: string;
  nonCompetitionMonths: string;
}

const MechanicEmploymentContract = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEmailing, setIsEmailing] = useState(false);
  
  const [formData, setFormData] = useState<ContractFormData>({
    companyName: '',
    companyAddress: '',
    companyCRN: '',
    companyVAT: '',
    operatingLicense: '',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    mechanicName: '',
    mechanicAddress: '',
    mechanicNI: '',
    mechanicDOB: '',
    mechanicPhone: '',
    mechanicEmail: '',
    startDate: '',
    employmentType: 'full_time',
    startTime: '09:00',
    endTime: '17:00',
    weeklyHours: '40',
    overtimeRate: '1.5',
    onCallAllowance: '50',
    callOutRate: '25',
    annualSalary: '',
    paymentFrequency: 'monthly',
    paymentDate: '25',
    performanceBonus: '1000',
    toolAllowance: '500',
    uniformAllowance: '200',
    pensionCompany: '3',
    holidayDays: '25',
    sickPayWeeks: '4',
    lifeInsurance: '2',
    healthInsurance: 'Private health insurance provided',
    noticePeriod: '4',
    probationPeriod: '3',
    nonCompetitionMonths: '6'
  });

  const handleInputChange = (field: keyof ContractFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGeneratePDF = async () => {
    if (!formData.companyName || !formData.mechanicName) {
      alert('Please fill in company name and mechanic name');
      return;
    }

    setIsGenerating(true);
    try {
      await generateMechanicContractPDF(formData);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToDocuments = async () => {
    if (!formData.companyName || !formData.mechanicName) {
      alert('Please fill in company name and mechanic name');
      return;
    }
    if (!profile?.organization_id) {
      alert('Missing organization. Please select or join an organization.');
      return;
    }
    setIsSaving(true);
    try {
      const { blob, fileName } = await generateMechanicContractPdfBlob(formData);
      await uploadContractPdf(profile.organization_id, blob, fileName, 'mechanics');
      alert('Contract saved to Documents.');
    } catch (error) {
      console.error('Error saving PDF:', error);
      alert('Error saving PDF. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAndEmail = async () => {
    if (!formData.companyName || !formData.mechanicName || !formData.mechanicEmail) {
      alert('Please fill company name, mechanic name and email');
      return;
    }
    if (!profile?.organization_id) {
      alert('Missing organization. Please select or join an organization.');
      return;
    }
    setIsEmailing(true);
    try {
      const { blob, fileName } = await generateMechanicContractPdfBlob(formData);
      await uploadContractPdf(profile.organization_id, blob, fileName, 'mechanics');
      const arrayBuffer = await blob.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      const emailHtml = `
        <p>Dear ${formData.mechanicName},</p>
        <p>Please find attached your employment contract.</p>
        <p>Regards,<br/>${formData.companyName}</p>
      `;
      const result = await AdvancedEmailService.sendEmail({
        from: undefined as any,
        to: [formData.mechanicEmail],
        subject: 'Mechanic Employment Contract',
        html: emailHtml,
        attachments: [{ filename: fileName, content: base64 }],
      });
      if (!result.success) throw new Error(result.error || 'Email failed');
      alert('Contract saved and emailed successfully.');
    } catch (error) {
      console.error('Error saving/emailing PDF:', error);
      alert('Error emailing PDF. Please try again.');
    } finally {
      setIsEmailing(false);
    }
  };

  const navigationItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'company-information', label: 'Company Information' },
    { id: 'employee-information', label: 'Employee Information' },
    { id: 'employment-terms', label: 'Employment Terms' },
    { id: 'salary-benefits', label: 'Salary & Benefits' },
    { id: 'additional-terms', label: 'Additional Terms' },
    { id: 'terms-conditions', label: 'Terms & Conditions' },
    { id: 'generate-pdf', label: 'Generate PDF' },
  ];

  return (
    <DefaultViewPageLayout
      title="Standard Mechanic Employment Contract"
      description="Generate a comprehensive employment contract for mechanics"
      navigationItems={navigationItems}
      backUrl="/mechanics"
      backLabel="Back to Mechanics"
    >
      <div className="space-y-6">
        {/* Overview */}
        <Card id="overview">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-700 space-y-2">
              <p>This form produces a legally-sound UK mechanic employment contract PDF with:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Clear appointment, duties, hours and pay structure</li>
                <li>Health & Safety, Data Protection (GDPR), Confidentiality and IP</li>
                <li>Grievance, Disciplinary, Termination and Post‑Employment obligations</li>
                <li>Company and Employee responsibilities, Working Conditions, Development</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Company Information */}
        <Card id="company-information">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="w-5 h-5" />
              <span>Company Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  placeholder="Enter company name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="companyAddress">Company Address</Label>
                <Input
                  id="companyAddress"
                  value={formData.companyAddress}
                  onChange={(e) => handleInputChange('companyAddress', e.target.value)}
                  placeholder="Enter company address"
                />
              </div>
              <div>
                <Label htmlFor="companyCRN">Company Registration Number</Label>
                <Input
                  id="companyCRN"
                  value={formData.companyCRN}
                  onChange={(e) => handleInputChange('companyCRN', e.target.value)}
                  placeholder="Enter CRN"
                />
              </div>
              <div>
                <Label htmlFor="companyVAT">VAT Number</Label>
                <Input
                  id="companyVAT"
                  value={formData.companyVAT}
                  onChange={(e) => handleInputChange('companyVAT', e.target.value)}
                  placeholder="Enter VAT number"
                />
              </div>
              <div>
                <Label htmlFor="operatingLicense">Operating License</Label>
                <Input
                  id="operatingLicense"
                  value={formData.operatingLicense}
                  onChange={(e) => handleInputChange('operatingLicense', e.target.value)}
                  placeholder="Enter operating license number"
                />
              </div>
              <div>
                <Label htmlFor="contactPerson">Contact Person</Label>
                <Input
                  id="contactPerson"
                  value={formData.contactPerson}
                  onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                  placeholder="Enter contact person name"
                />
              </div>
              <div>
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  value={formData.contactPhone}
                  onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                  placeholder="Enter contact phone"
                />
              </div>
              <div>
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  placeholder="Enter contact email"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employee Information */}
        <Card id="employee-information">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Employee Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="mechanicName">Mechanic Full Name *</Label>
                <Input
                  id="mechanicName"
                  value={formData.mechanicName}
                  onChange={(e) => handleInputChange('mechanicName', e.target.value)}
                  placeholder="Enter mechanic full name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="mechanicAddress">Mechanic Address</Label>
                <Input
                  id="mechanicAddress"
                  value={formData.mechanicAddress}
                  onChange={(e) => handleInputChange('mechanicAddress', e.target.value)}
                  placeholder="Enter mechanic address"
                />
              </div>
              <div>
                <Label htmlFor="mechanicNI">National Insurance Number</Label>
                <Input
                  id="mechanicNI"
                  value={formData.mechanicNI}
                  onChange={(e) => handleInputChange('mechanicNI', e.target.value)}
                  placeholder="Enter NI number"
                />
              </div>
              <div>
                <Label htmlFor="mechanicDOB">Date of Birth</Label>
                <Input
                  id="mechanicDOB"
                  type="date"
                  value={formData.mechanicDOB}
                  onChange={(e) => handleInputChange('mechanicDOB', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="mechanicPhone">Contact Phone</Label>
                <Input
                  id="mechanicPhone"
                  value={formData.mechanicPhone}
                  onChange={(e) => handleInputChange('mechanicPhone', e.target.value)}
                  placeholder="Enter mechanic phone"
                />
              </div>
              <div>
                <Label htmlFor="mechanicEmail">Contact Email</Label>
                <Input
                  id="mechanicEmail"
                  type="email"
                  value={formData.mechanicEmail}
                  onChange={(e) => handleInputChange('mechanicEmail', e.target.value)}
                  placeholder="Enter mechanic email"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employment Terms */}
        <Card id="employment-terms">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Employment Terms</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="employmentType">Employment Type</Label>
                <Select 
                  value={formData.employmentType}
                  onValueChange={(value) => handleInputChange('employmentType', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full_time">Full Time</SelectItem>
                    <SelectItem value="part_time">Part Time</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleInputChange('startTime', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleInputChange('endTime', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="weeklyHours">Weekly Hours</Label>
                <Input
                  id="weeklyHours"
                  type="number"
                  value={formData.weeklyHours}
                  onChange={(e) => handleInputChange('weeklyHours', e.target.value)}
                  placeholder="40"
                />
              </div>
              <div>
                <Label htmlFor="overtimeRate">Overtime Rate Multiplier</Label>
                <Input
                  id="overtimeRate"
                  type="number"
                  step="0.1"
                  value={formData.overtimeRate}
                  onChange={(e) => handleInputChange('overtimeRate', e.target.value)}
                  placeholder="1.5"
                />
              </div>
              <div>
                <Label htmlFor="onCallAllowance">On-Call Allowance (£/week)</Label>
                <Input
                  id="onCallAllowance"
                  type="number"
                  value={formData.onCallAllowance}
                  onChange={(e) => handleInputChange('onCallAllowance', e.target.value)}
                  placeholder="50"
                />
              </div>
              <div>
                <Label htmlFor="callOutRate">Call-Out Rate (£/hour)</Label>
                <Input
                  id="callOutRate"
                  type="number"
                  value={formData.callOutRate}
                  onChange={(e) => handleInputChange('callOutRate', e.target.value)}
                  placeholder="25"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Salary and Benefits */}
        <Card id="salary-benefits">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PoundSterling className="w-5 h-5" />
              <span>Salary and Benefits</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="annualSalary">Annual Salary (£)</Label>
                <Input
                  id="annualSalary"
                  type="number"
                  value={formData.annualSalary}
                  onChange={(e) => handleInputChange('annualSalary', e.target.value)}
                  placeholder="Enter annual salary"
                />
              </div>
              <div>
                <Label htmlFor="paymentFrequency">Payment Frequency</Label>
                <Select 
                  value={formData.paymentFrequency}
                  onValueChange={(value) => handleInputChange('paymentFrequency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="fortnightly">Fortnightly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="paymentDate">Payment Date</Label>
                <Input
                  id="paymentDate"
                  type="number"
                  min="1"
                  max="31"
                  value={formData.paymentDate}
                  onChange={(e) => handleInputChange('paymentDate', e.target.value)}
                  placeholder="25"
                />
              </div>
              <div>
                <Label htmlFor="performanceBonus">Performance Bonus (£)</Label>
                <Input
                  id="performanceBonus"
                  type="number"
                  value={formData.performanceBonus}
                  onChange={(e) => handleInputChange('performanceBonus', e.target.value)}
                  placeholder="1000"
                />
              </div>
              <div>
                <Label htmlFor="toolAllowance">Tool Allowance (£/year)</Label>
                <Input
                  id="toolAllowance"
                  type="number"
                  value={formData.toolAllowance}
                  onChange={(e) => handleInputChange('toolAllowance', e.target.value)}
                  placeholder="500"
                />
              </div>
              <div>
                <Label htmlFor="uniformAllowance">Uniform Allowance (£/year)</Label>
                <Input
                  id="uniformAllowance"
                  type="number"
                  value={formData.uniformAllowance}
                  onChange={(e) => handleInputChange('uniformAllowance', e.target.value)}
                  placeholder="200"
                />
              </div>
              <div>
                <Label htmlFor="pensionCompany">Company Pension Contribution (%)</Label>
                <Input
                  id="pensionCompany"
                  type="number"
                  min="0"
                  max="20"
                  value={formData.pensionCompany}
                  onChange={(e) => handleInputChange('pensionCompany', e.target.value)}
                  placeholder="3"
                />
              </div>
              <div>
                <Label htmlFor="holidayDays">Holiday Days (per year)</Label>
                <Input
                  id="holidayDays"
                  type="number"
                  min="20"
                  max="40"
                  value={formData.holidayDays}
                  onChange={(e) => handleInputChange('holidayDays', e.target.value)}
                  placeholder="25"
                />
              </div>
              <div>
                <Label htmlFor="sickPayWeeks">Sick Pay Weeks (full pay)</Label>
                <Input
                  id="sickPayWeeks"
                  type="number"
                  min="0"
                  max="26"
                  value={formData.sickPayWeeks}
                  onChange={(e) => handleInputChange('sickPayWeeks', e.target.value)}
                  placeholder="4"
                />
              </div>
              <div>
                <Label htmlFor="lifeInsurance">Life Insurance (× salary)</Label>
                <Input
                  id="lifeInsurance"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.lifeInsurance}
                  onChange={(e) => handleInputChange('lifeInsurance', e.target.value)}
                  placeholder="2"
                />
              </div>
              <div>
                <Label htmlFor="healthInsurance">Health Insurance Details</Label>
                <Input
                  id="healthInsurance"
                  value={formData.healthInsurance}
                  onChange={(e) => handleInputChange('healthInsurance', e.target.value)}
                  placeholder="Private health insurance provided"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Terms */}
        <Card id="additional-terms">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Additional Terms</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="noticePeriod">Notice Period (weeks)</Label>
                <Input
                  id="noticePeriod"
                  type="number"
                  min="1"
                  max="12"
                  value={formData.noticePeriod}
                  onChange={(e) => handleInputChange('noticePeriod', e.target.value)}
                  placeholder="4"
                />
              </div>
              <div>
                <Label htmlFor="probationPeriod">Probation Period (months)</Label>
                <Input
                  id="probationPeriod"
                  type="number"
                  min="1"
                  max="12"
                  value={formData.probationPeriod}
                  onChange={(e) => handleInputChange('probationPeriod', e.target.value)}
                  placeholder="3"
                />
              </div>
              <div>
                <Label htmlFor="nonCompetitionMonths">Non-Competition (months)</Label>
                <Input
                  id="nonCompetitionMonths"
                  type="number"
                  min="0"
                  max="24"
                  value={formData.nonCompetitionMonths}
                  onChange={(e) => handleInputChange('nonCompetitionMonths', e.target.value)}
                  placeholder="6"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Terms & Conditions (summary) */}
        <Card id="terms-conditions">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Terms & Conditions (Summary)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <ul className="list-disc pl-6 space-y-1">
                <li>Governing law: England & Wales; disputes via tribunal where applicable</li>
                <li>Policies: Company policies form part of the contract</li>
                <li>Working Time: WTR compliant; rest breaks and maximum hours</li>
                <li>Health & Safety: PPE, workshop procedures, reporting duties</li>
                <li>GDPR: lawful processing, employee rights, security measures</li>
              </ul>
              <ul className="list-disc pl-6 space-y-1">
                <li>Conduct & Performance: professional standards and review</li>
                <li>Grievance & Disciplinary: fair process and appeal rights</li>
                <li>Termination: notice, summary dismissal for gross misconduct</li>
                <li>Post‑Employment: confidentiality and reasonable restrictions</li>
                <li>Mutual Duties: cooperation, quality, safety and compliance</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Generate PDF Button */}
        <Card id="generate-pdf">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Button
                onClick={handleGeneratePDF}
                disabled={isGenerating || !formData.companyName || !formData.mechanicName}
                size="lg"
                className="px-8 py-3"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 mr-2" />
                    Generate PDF
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleSaveToDocuments}
                disabled={isSaving || !formData.companyName || !formData.mechanicName}
              >
                {isSaving ? 'Saving…' : 'Save to Documents'}
              </Button>
              <Button
                variant="outline"
                onClick={handleSaveAndEmail}
                disabled={isEmailing || !formData.companyName || !formData.mechanicName || !formData.mechanicEmail}
              >
                {isEmailing ? 'Sending…' : 'Save & Email'}
              </Button>
            </div>
            <p className="text-sm text-gray-600 text-center mt-2">
              Fill in the required fields above to generate your contract
            </p>
          </CardContent>
        </Card>
      </div>
    </DefaultViewPageLayout>
  );
};

export default MechanicEmploymentContract;
