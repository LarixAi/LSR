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
  Settings,
  Truck,
  AlertTriangle
} from 'lucide-react';
import DefaultViewPageLayout from '@/components/layout/DefaultViewPageLayout';
import { generateTransportMechanicContractPDF, generateTransportMechanicContractPdfBlob, uploadContractPdf } from '@/services/contractService';
import AdvancedEmailService from '@/services/advancedEmailService';
import { useAuth } from '@/contexts/AuthContext';

interface TransportContractFormData {
  // Transport Company Information
  companyName: string;
  tradingName: string;
  registeredAddress: string;
  companyCRN: string;
  companyVAT: string;
  oLicenseNumber: string;
  oLicenseType: string;
  oLicenseExpiry: string;
  transportManager: string;
  cpcQualification: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  emergencyPhone: string;
  
  // Employee Information
  mechanicName: string;
  mechanicAddress: string;
  mechanicNI: string;
  mechanicDOB: string;
  mechanicPhone: string;
  mechanicEmail: string;
  emergencyContact: string;
  emergencyPhone: string;
  
  // Employment Terms
  startDate: string;
  probationPeriod: string;
  probationReview: string;
  confirmationDate: string;
  startTime: string;
  endTime: string;
  weeklyHours: string;
  overtimeRate: string;
  onCallAllowance: string;
  callOutRate: string;
  weekendRate: string;
  bankHolidayRate: string;
  
  // Salary and Benefits
  annualSalary: string;
  hourlyRate: string;
  paymentFrequency: string;
  paymentDate: string;
  safetyBonus: string;
  efficiencyBonus: string;
  qualityBonus: string;
  annualPerformanceBonus: string;
  toolAllowance: string;
  uniformAllowance: string;
  pensionCompany: string;
  holidayDays: string;
  sickPayWeeks: string;
  lifeInsurance: string;
  healthInsurance: string;
  trainingBudget: string;
  
  // Transport Specific
  noticePeriod: string;
  nonCompetitionMonths: string;
  geographicScope: string;
  industryScope: string;
}

const TransportMechanicContract = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEmailing, setIsEmailing] = useState(false);
  
  const [formData, setFormData] = useState<TransportContractFormData>({
    companyName: '',
    tradingName: '',
    registeredAddress: '',
    companyCRN: '',
    companyVAT: '',
    oLicenseNumber: '',
    oLicenseType: 'standard',
    oLicenseExpiry: '',
    transportManager: '',
    cpcQualification: '',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    emergencyPhone: '',
    mechanicName: '',
    mechanicAddress: '',
    mechanicNI: '',
    mechanicDOB: '',
    mechanicPhone: '',
    mechanicEmail: '',
    emergencyContact: '',
    emergencyPhone: '',
    startDate: '',
    probationPeriod: '3',
    probationReview: '',
    confirmationDate: '',
    startTime: '09:00',
    endTime: '17:00',
    weeklyHours: '40',
    overtimeRate: '1.5',
    onCallAllowance: '75',
    callOutRate: '35',
    weekendRate: '25',
    bankHolidayRate: '35',
    annualSalary: '',
    hourlyRate: '',
    paymentFrequency: 'monthly',
    paymentDate: '25',
    safetyBonus: '500',
    efficiencyBonus: '300',
    qualityBonus: '200',
    annualPerformanceBonus: '2000',
    toolAllowance: '750',
    uniformAllowance: '300',
    pensionCompany: '3',
    holidayDays: '25',
    sickPayWeeks: '4',
    lifeInsurance: '2',
    healthInsurance: 'Private health insurance provided',
    trainingBudget: '1000',
    noticePeriod: '4',
    nonCompetitionMonths: '6',
    geographicScope: '50',
    industryScope: 'Transport and maintenance industry'
  });

  const handleInputChange = (field: keyof TransportContractFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGeneratePDF = async () => {
    if (!formData.companyName || !formData.mechanicName) {
      alert('Please fill in company name and mechanic name');
      return;
    }

    setIsGenerating(true);
    try {
      await generateTransportMechanicContractPDF(formData);
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
      const { blob, fileName } = await generateTransportMechanicContractPdfBlob(formData);
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
      const { blob, fileName } = await generateTransportMechanicContractPdfBlob(formData);
      await uploadContractPdf(profile.organization_id, blob, fileName, 'mechanics');
      const arrayBuffer = await blob.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      const emailHtml = `
        <p>Dear ${formData.mechanicName},</p>
        <p>Please find attached your transport mechanic employment contract.</p>
        <p>Regards,<br/>${formData.companyName}</p>
      `;
      const result = await AdvancedEmailService.sendEmail({
        from: undefined as any,
        to: [formData.mechanicEmail],
        subject: 'Transport Mechanic Employment Contract',
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
    { id: 'company', label: 'Transport Company' },
    { id: 'employee', label: 'Employee' },
    { id: 'terms', label: 'Employment Terms' },
    { id: 'allowances', label: 'Allowances' },
    { id: 'salary', label: 'Salary & Benefits' },
    { id: 'additional', label: 'Additional Terms' },
    { id: 'terms-conditions', label: 'T&Cs (Transport)' },
    { id: 'generate', label: 'Generate PDF' },
  ];

  return (
    <DefaultViewPageLayout
      title="Transport Company Mechanic Contract"
      description="Generate a specialized employment contract for transport company mechanics"
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
              <p>This form produces a transport‑specific mechanic employment contract PDF including DVSA and O‑License obligations.</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Transport Company details and O‑License metadata</li>
                <li>Transport‑specific duties, safety, roadside procedures</li>
                <li>Allowances (on‑call, call‑out, weekend, bank holiday)</li>
                <li>Compliance: DVSA, O‑License, transport policies</li>
              </ul>
            </div>
          </CardContent>
        </Card>
        {/* Transport Company Information */}
        <Card id="company">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Truck className="w-5 h-5" />
              <span>Transport Company Information</span>
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
                <Label htmlFor="tradingName">Trading As</Label>
                <Input
                  id="tradingName"
                  value={formData.tradingName}
                  onChange={(e) => handleInputChange('tradingName', e.target.value)}
                  placeholder="Enter trading name"
                />
              </div>
              <div>
                <Label htmlFor="registeredAddress">Registered Office</Label>
                <Input
                  id="registeredAddress"
                  value={formData.registeredAddress}
                  onChange={(e) => handleInputChange('registeredAddress', e.target.value)}
                  placeholder="Enter registered address"
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
                <Label htmlFor="oLicenseNumber">O-License Number *</Label>
                <Input
                  id="oLicenseNumber"
                  value={formData.oLicenseNumber}
                  onChange={(e) => handleInputChange('oLicenseNumber', e.target.value)}
                  placeholder="Enter O-License number"
                  required
                />
              </div>
              <div>
                <Label htmlFor="oLicenseType">O-License Type</Label>
                <Select 
                  value={formData.oLicenseType}
                  onValueChange={(value) => handleInputChange('oLicenseType', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="restricted">Restricted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="oLicenseExpiry">O-License Expiry Date</Label>
                <Input
                  id="oLicenseExpiry"
                  type="date"
                  value={formData.oLicenseExpiry}
                  onChange={(e) => handleInputChange('oLicenseExpiry', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="transportManager">Transport Manager</Label>
                <Input
                  id="transportManager"
                  value={formData.transportManager}
                  onChange={(e) => handleInputChange('transportManager', e.target.value)}
                  placeholder="Enter transport manager name"
                />
              </div>
              <div>
                <Label htmlFor="cpcQualification">CPC Qualification Number</Label>
                <Input
                  id="cpcQualification"
                  value={formData.cpcQualification}
                  onChange={(e) => handleInputChange('cpcQualification', e.target.value)}
                  placeholder="Enter CPC number"
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
              <div>
                <Label htmlFor="emergencyPhone">Emergency Phone</Label>
                <Input
                  id="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                  placeholder="Enter emergency phone"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employee Information */}
        <Card id="employee">
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
              <div>
                <Label htmlFor="emergencyContact">Emergency Contact Name</Label>
                <Input
                  id="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                  placeholder="Enter emergency contact name"
                />
              </div>
              <div>
                <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
                <Input
                  id="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                  placeholder="Enter emergency contact phone"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employment Terms */}
        <Card id="terms">
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
                <Label htmlFor="probationReview">Probation Review Date</Label>
                <Input
                  id="probationReview"
                  type="date"
                  value={formData.probationReview}
                  onChange={(e) => handleInputChange('probationReview', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="confirmationDate">Confirmation Date</Label>
                <Input
                  id="confirmationDate"
                  type="date"
                  value={formData.confirmationDate}
                  onChange={(e) => handleInputChange('confirmationDate', e.target.value)}
                />
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
            </div>
          </CardContent>
        </Card>

        {/* Transport-Specific Allowances */}
        <Card id="allowances">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Transport-Specific Allowances</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="onCallAllowance">On-Call Allowance (£/week)</Label>
                <Input
                  id="onCallAllowance"
                  type="number"
                  value={formData.onCallAllowance}
                  onChange={(e) => handleInputChange('onCallAllowance', e.target.value)}
                  placeholder="75"
                />
              </div>
              <div>
                <Label htmlFor="callOutRate">Emergency Call-Out (£/hour)</Label>
                <Input
                  id="callOutRate"
                  type="number"
                  value={formData.callOutRate}
                  onChange={(e) => handleInputChange('callOutRate', e.target.value)}
                  placeholder="35"
                />
              </div>
              <div>
                <Label htmlFor="weekendRate">Weekend Working (£/hour)</Label>
                <Input
                  id="weekendRate"
                  type="number"
                  value={formData.weekendRate}
                  onChange={(e) => handleInputChange('weekendRate', e.target.value)}
                  placeholder="25"
                />
              </div>
              <div>
                <Label htmlFor="bankHolidayRate">Bank Holiday Working (£/hour)</Label>
                <Input
                  id="bankHolidayRate"
                  type="number"
                  value={formData.bankHolidayRate}
                  onChange={(e) => handleInputChange('bankHolidayRate', e.target.value)}
                  placeholder="35"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Salary and Benefits */}
        <Card id="salary">
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
                <Label htmlFor="hourlyRate">Hourly Rate (£)</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  step="0.01"
                  value={formData.hourlyRate}
                  onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                  placeholder="Enter hourly rate"
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
                <Label htmlFor="safetyBonus">Safety Bonus (£)</Label>
                <Input
                  id="safetyBonus"
                  type="number"
                  value={formData.safetyBonus}
                  onChange={(e) => handleInputChange('safetyBonus', e.target.value)}
                  placeholder="500"
                />
              </div>
              <div>
                <Label htmlFor="efficiencyBonus">Efficiency Bonus (£)</Label>
                <Input
                  id="efficiencyBonus"
                  type="number"
                  value={formData.efficiencyBonus}
                  onChange={(e) => handleInputChange('efficiencyBonus', e.target.value)}
                  placeholder="300"
                />
              </div>
              <div>
                <Label htmlFor="qualityBonus">Quality Bonus (£)</Label>
                <Input
                  id="qualityBonus"
                  type="number"
                  value={formData.qualityBonus}
                  onChange={(e) => handleInputChange('qualityBonus', e.target.value)}
                  placeholder="200"
                />
              </div>
              <div>
                <Label htmlFor="annualPerformanceBonus">Annual Performance Bonus (£)</Label>
                <Input
                  id="annualPerformanceBonus"
                  type="number"
                  value={formData.annualPerformanceBonus}
                  onChange={(e) => handleInputChange('annualPerformanceBonus', e.target.value)}
                  placeholder="2000"
                />
              </div>
              <div>
                <Label htmlFor="toolAllowance">Tool Allowance (£/year)</Label>
                <Input
                  id="toolAllowance"
                  type="number"
                  value={formData.toolAllowance}
                  onChange={(e) => handleInputChange('toolAllowance', e.target.value)}
                  placeholder="750"
                />
              </div>
              <div>
                <Label htmlFor="uniformAllowance">Uniform Allowance (£/year)</Label>
                <Input
                  id="uniformAllowance"
                  type="number"
                  value={formData.uniformAllowance}
                  onChange={(e) => handleInputChange('uniformAllowance', e.target.value)}
                  placeholder="300"
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
              <div>
                <Label htmlFor="trainingBudget">Training Budget (£/year)</Label>
                <Input
                  id="trainingBudget"
                  type="number"
                  value={formData.trainingBudget}
                  onChange={(e) => handleInputChange('trainingBudget', e.target.value)}
                  placeholder="1000"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Terms */}
        <Card id="additional">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Additional Terms</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div>
                <Label htmlFor="geographicScope">Geographic Scope (miles)</Label>
                <Input
                  id="geographicScope"
                  type="number"
                  min="0"
                  max="200"
                  value={formData.geographicScope}
                  onChange={(e) => handleInputChange('geographicScope', e.target.value)}
                  placeholder="50"
                />
              </div>
              <div>
                <Label htmlFor="industryScope">Industry Scope</Label>
                <Input
                  id="industryScope"
                  value={formData.industryScope}
                  onChange={(e) => handleInputChange('industryScope', e.target.value)}
                  placeholder="Transport and maintenance industry"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transport Terms & Conditions (summary) */}
        <Card id="terms-conditions">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Transport Terms & Conditions (Summary)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <ul className="list-disc pl-6 space-y-1">
                <li>Governing law & tribunal rights; variations in writing</li>
                <li>DVSA/O‑License obligations and transport policies</li>
                <li>Working Time & rest periods for transport operations</li>
                <li>Roadside & workshop safety; PPE and incident reporting</li>
                <li>GDPR: lawful processing, employee rights, security</li>
              </ul>
              <ul className="list-disc pl-6 space-y-1">
                <li>Conduct & Performance; documentation standards</li>
                <li>Grievance, Disciplinary and appeal process</li>
                <li>Termination: notice and gross misconduct examples</li>
                <li>Post‑Employment: confidentiality, reasonable restrictions</li>
                <li>Mutual Duties: quality, safety, compliance, cooperation</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Generate PDF Button */}
        <Card id="generate">
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
              Fill in the required fields above to generate your transport contract
            </p>
          </CardContent>
        </Card>
      </div>
    </DefaultViewPageLayout>
  );
};

export default TransportMechanicContract;
