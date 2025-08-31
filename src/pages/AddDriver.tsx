import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Home, Save, Loader2, User, Briefcase, Car, Heart, Shield, MapPin, CreditCard, AlertCircle, GraduationCap, FileText, DollarSign, Calendar, Phone, Clock, CheckCircle, XCircle, Eye, CalendarDays, Truck, Flame, HeartHandshake, FileCheck, ClipboardCheck } from 'lucide-react';

const AddDriver = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    hire_date: '',
    cdl_number: '',
    medical_card_expiry: '',
    date_of_birth: '',
    national_insurance_number: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: '',
    bank_account_name: '',
    bank_account_number: '',
    bank_sort_code: '',
    tax_code: '',
    employment_type: 'full_time',
    probation_period_months: 3,
    notice_period_days: 28,
    salary_amount: 0,
    salary_frequency: 'monthly',
    working_hours_per_week: 40,
    holiday_entitlement_days: 25,
    pension_scheme: false,
    health_insurance: false,
    vehicle_allowance: false,
    fuel_card: false,
    uniform_provided: false,
    training_budget: 0,
    performance_review_frequency: 'quarterly',
    disciplinary_procedure_acknowledged: false,
    health_and_safety_training: false,
    equal_opportunities_training: false,
    data_protection_training: false,
    references_provided: false,
    background_check_completed: false,
    right_to_work_verified: false,
    contract_signed: false,
    handbook_received: false,
    // Availability fields
    monday_available: false,
    monday_start_time: '09:00',
    monday_end_time: '17:00',
    monday_break_start: '12:00',
    monday_break_end: '13:00',
    tuesday_available: false,
    tuesday_start_time: '09:00',
    tuesday_end_time: '17:00',
    tuesday_break_start: '12:00',
    tuesday_break_end: '13:00',
    wednesday_available: false,
    wednesday_start_time: '09:00',
    wednesday_end_time: '17:00',
    wednesday_break_start: '12:00',
    wednesday_break_end: '13:00',
    thursday_available: false,
    thursday_start_time: '09:00',
    thursday_end_time: '17:00',
    thursday_break_start: '12:00',
    thursday_break_end: '13:00',
    friday_available: false,
    friday_start_time: '09:00',
    friday_end_time: '17:00',
    friday_break_start: '12:00',
    friday_break_end: '13:00',
    saturday_available: false,
    saturday_start_time: '09:00',
    saturday_end_time: '17:00',
    saturday_break_start: '12:00',
    saturday_break_end: '13:00',
    sunday_available: false,
    sunday_start_time: '09:00',
    sunday_end_time: '17:00',
    sunday_break_start: '12:00',
    sunday_break_end: '13:00',
    // Right to Work & Driver License Checklist
    right_to_work_document_type: '',
    right_to_work_document_number: '',
    right_to_work_document_expiry: '',
    right_to_work_verification_date: '',
    right_to_work_verified_by: '',
    driver_license_number: '',
    driver_license_type: '',
    driver_license_expiry: '',
    driver_license_verified: false,
    driver_license_verification_date: '',
    dqc_card_number: '',
    dqc_card_expiry: '',
    dqc_card_verified: false,
    dqc_card_verification_date: '',
    tacho_card_number: '',
    tacho_card_expiry: '',
    tacho_card_verified: false,
    tacho_card_verification_date: '',
    medical_card_number: '',
    medical_card_verified: false,
    medical_card_verification_date: '',
    cpc_card_number: '',
    cpc_card_expiry: '',
    cpc_card_verified: false,
    cpc_card_verification_date: '',
    digital_tachograph_card_number: '',
    digital_tachograph_card_expiry: '',
    digital_tachograph_card_verified: false,
    digital_tachograph_card_verification_date: '',
    adr_certificate_number: '',
    adr_certificate_expiry: '',
    adr_certificate_verified: false,
    adr_certificate_verification_date: '',
    dangerous_goods_training_expiry: '',
    dangerous_goods_training_verified: false,
    dangerous_goods_training_verification_date: '',
    first_aid_certificate_expiry: '',
    first_aid_certificate_verified: false,
    first_aid_certificate_verification_date: '',
    fire_safety_training_expiry: '',
    fire_safety_training_verified: false,
    fire_safety_training_verification_date: '',
    manual_handling_training_expiry: '',
    manual_handling_training_verified: false,
    manual_handling_training_verification_date: '',
    all_documents_verified: false,
    verification_notes: '',
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createDriverMutation = useMutation({
    mutationFn: async (driverData: any) => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('You must be logged in to create drivers.');
      }
      
      const { data, error } = await supabase.functions.invoke('create-driver', {
        body: {
          email: driverData.email,
          firstName: driverData.first_name,
          lastName: driverData.last_name,
          phone: driverData.phone || null,
          address: driverData.address || null,
          city: driverData.city || null,
          state: driverData.state || null,
          zipCode: driverData.zip_code || null,
          hireDate: driverData.hire_date || null,
          cdlNumber: driverData.cdl_number || null,
          medicalCardExpiry: driverData.medical_card_expiry || null,
          dateOfBirth: driverData.date_of_birth || null,
          nationalInsuranceNumber: driverData.national_insurance_number || null,
          emergencyContactName: driverData.emergency_contact_name || null,
          emergencyContactPhone: driverData.emergency_contact_phone || null,
          emergencyContactRelationship: driverData.emergency_contact_relationship || null,
          bankAccountName: driverData.bank_account_name || null,
          bankAccountNumber: driverData.bank_account_number || null,
          bankSortCode: driverData.bank_sort_code || null,
          taxCode: driverData.tax_code || null,
          employmentType: driverData.employment_type || null,
          probationPeriodMonths: driverData.probation_period_months || null,
          noticePeriodDays: driverData.notice_period_days || null,
          salaryAmount: driverData.salary_amount || null,
          salaryFrequency: driverData.salary_frequency || null,
          workingHoursPerWeek: driverData.working_hours_per_week || null,
          holidayEntitlementDays: driverData.holiday_entitlement_days || null,
          pensionScheme: driverData.pension_scheme || false,
          healthInsurance: driverData.health_insurance || false,
          vehicleAllowance: driverData.vehicle_allowance || false,
          fuelCard: driverData.fuel_card || false,
          uniformProvided: driverData.uniform_provided || false,
          trainingBudget: driverData.training_budget || null,
          performanceReviewFrequency: driverData.performance_review_frequency || null,
          disciplinaryProcedureAcknowledged: driverData.disciplinary_procedure_acknowledged || false,
          healthAndSafetyTraining: driverData.health_and_safety_training || false,
          equalOpportunitiesTraining: driverData.equal_opportunities_training || false,
          dataProtectionTraining: driverData.data_protection_training || false,
          referencesProvided: driverData.references_provided || false,
          backgroundCheckCompleted: driverData.background_check_completed || false,
          rightToWorkVerified: driverData.right_to_work_verified || false,
          contractSigned: driverData.contract_signed || false,
          handbookReceived: driverData.handbook_received || false,
          // Availability fields
          mondayAvailable: driverData.monday_available || false,
          mondayStartTime: driverData.monday_start_time || null,
          mondayEndTime: driverData.monday_end_time || null,
          mondayBreakStart: driverData.monday_break_start || null,
          mondayBreakEnd: driverData.monday_break_end || null,
          tuesdayAvailable: driverData.tuesday_available || false,
          tuesdayStartTime: driverData.tuesday_start_time || null,
          tuesdayEndTime: driverData.tuesday_end_time || null,
          tuesdayBreakStart: driverData.tuesday_break_start || null,
          tuesdayBreakEnd: driverData.tuesday_break_end || null,
          wednesdayAvailable: driverData.wednesday_available || false,
          wednesdayStartTime: driverData.wednesday_start_time || null,
          wednesdayEndTime: driverData.wednesday_end_time || null,
          wednesdayBreakStart: driverData.wednesday_break_start || null,
          wednesdayBreakEnd: driverData.wednesday_break_end || null,
          thursdayAvailable: driverData.thursday_available || false,
          thursdayStartTime: driverData.thursday_start_time || null,
          thursdayEndTime: driverData.thursday_end_time || null,
          thursdayBreakStart: driverData.thursday_break_start || null,
          thursdayBreakEnd: driverData.thursday_break_end || null,
          fridayAvailable: driverData.friday_available || false,
          fridayStartTime: driverData.friday_start_time || null,
          fridayEndTime: driverData.friday_end_time || null,
          fridayBreakStart: driverData.friday_break_start || null,
          fridayBreakEnd: driverData.friday_break_end || null,
          saturdayAvailable: driverData.saturday_available || false,
          saturdayStartTime: driverData.saturday_start_time || null,
          saturdayEndTime: driverData.saturday_end_time || null,
          saturdayBreakStart: driverData.saturday_break_start || null,
          saturdayBreakEnd: driverData.saturday_break_end || null,
          sundayAvailable: driverData.sunday_available || false,
          sundayStartTime: driverData.sunday_start_time || null,
          sundayEndTime: driverData.sunday_end_time || null,
          sundayBreakStart: driverData.sunday_break_start || null,
          sundayBreakEnd: driverData.sunday_break_end || null,
          // Right to Work & Driver License Checklist
          rightToWorkDocumentType: driverData.right_to_work_document_type || null,
          rightToWorkDocumentNumber: driverData.right_to_work_document_number || null,
          rightToWorkDocumentExpiry: driverData.right_to_work_document_expiry || null,
          rightToWorkVerificationDate: driverData.right_to_work_verification_date || null,
          rightToWorkVerifiedBy: driverData.right_to_work_verified_by || null,
          driverLicenseNumber: driverData.driver_license_number || null,
          driverLicenseType: driverData.driver_license_type || null,
          driverLicenseExpiry: driverData.driver_license_expiry || null,
          driverLicenseVerified: driverData.driver_license_verified || false,
          driverLicenseVerificationDate: driverData.driver_license_verification_date || null,
          dqcCardNumber: driverData.dqc_card_number || null,
          dqcCardExpiry: driverData.dqc_card_expiry || null,
          dqcCardVerified: driverData.dqc_card_verified || false,
          dqcCardVerificationDate: driverData.dqc_card_verification_date || null,
          tachoCardNumber: driverData.tacho_card_number || null,
          tachoCardExpiry: driverData.tacho_card_expiry || null,
          tachoCardVerified: driverData.tacho_card_verified || false,
          tachoCardVerificationDate: driverData.tacho_card_verification_date || null,
          medicalCardNumber: driverData.medical_card_number || null,
          medicalCardVerified: driverData.medical_card_verified || false,
          medicalCardVerificationDate: driverData.medical_card_verification_date || null,
          cpcCardNumber: driverData.cpc_card_number || null,
          cpcCardExpiry: driverData.cpc_card_expiry || null,
          cpcCardVerified: driverData.cpc_card_verified || false,
          cpcCardVerificationDate: driverData.cpc_card_verification_date || null,
          digitalTachographCardNumber: driverData.digital_tachograph_card_number || null,
          digitalTachographCardExpiry: driverData.digital_tachograph_card_expiry || null,
          digitalTachographCardVerified: driverData.digital_tachograph_card_verified || false,
          digitalTachographCardVerificationDate: driverData.digital_tachograph_card_verification_date || null,
          adrCertificateNumber: driverData.adr_certificate_number || null,
          adrCertificateExpiry: driverData.adr_certificate_expiry || null,
          adrCertificateVerified: driverData.adr_certificate_verified || false,
          adrCertificateVerificationDate: driverData.adr_certificate_verification_date || null,
          dangerousGoodsTrainingExpiry: driverData.dangerous_goods_training_expiry || null,
          dangerousGoodsTrainingVerified: driverData.dangerous_goods_training_verified || false,
          dangerousGoodsTrainingVerificationDate: driverData.dangerous_goods_training_verification_date || null,
          firstAidCertificateExpiry: driverData.first_aid_certificate_expiry || null,
          firstAidCertificateVerified: driverData.first_aid_certificate_verified || false,
          firstAidCertificateVerificationDate: driverData.first_aid_certificate_verification_date || null,
          fireSafetyTrainingExpiry: driverData.fire_safety_training_expiry || null,
          fireSafetyTrainingVerified: driverData.fire_safety_training_verified || false,
          fireSafetyTrainingVerificationDate: driverData.fire_safety_training_verification_date || null,
          manualHandlingTrainingExpiry: driverData.manual_handling_training_expiry || null,
          manualHandlingTrainingVerified: driverData.manual_handling_training_verified || false,
          manualHandlingTrainingVerificationDate: driverData.manual_handling_training_verification_date || null,
          allDocumentsVerified: driverData.all_documents_verified || false,
          verificationNotes: driverData.verification_notes || null,
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to create driver');
      }

      return data;
    },
    onSuccess: () => {
      toast({
        title: "Driver Created Successfully!",
        description: "The driver account has been created.",
      });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      navigate('/driver-management');
    },
    onError: (error: Error) => {
      toast({
        title: "Error Creating Driver",
        description: error.message || "Failed to create driver.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.first_name || !formData.last_name) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    await createDriverMutation.mutateAsync(formData);
  };

  const handleBack = () => {
    navigate('/driver-management');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Driver Management
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Add New Driver</h1>
                <p className="text-gray-600">Complete driver information and create new driver account</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Dashboard
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Quick Navigation */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('personal-info')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-xs"
              >
                Personal Info
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('availability')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-xs"
              >
                Availability
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('compliance-checklist')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-xs bg-blue-100 border-blue-300 text-blue-700 hover:bg-blue-200"
              >
                🎯 Compliance Checklist
              </Button>
            </div>
          </div>

          {/* Personal Information */}
          <Card id="personal-info">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
              <p className="text-sm text-gray-600">
                Provide the essential personal details for the new driver
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                    placeholder="e.g., John"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                    placeholder="e.g., Smith"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="e.g., john.smith@company.com"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="e.g., +44 7700 900000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData(prev => ({ ...prev, date_of_birth: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="national_insurance_number">National Insurance Number</Label>
                  <Input
                    id="national_insurance_number"
                    value={formData.national_insurance_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, national_insurance_number: e.target.value }))}
                    placeholder="AB123456C"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Address Information
              </CardTitle>
              <p className="text-sm text-gray-600">
                Driver's residential address for employment records
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="e.g., 123 Main Street"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="e.g., London"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="state">State/County</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    placeholder="e.g., Greater London"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="zip_code">Postal Code</Label>
                  <Input
                    id="zip_code"
                    value={formData.zip_code}
                    onChange={(e) => setFormData(prev => ({ ...prev, zip_code: e.target.value }))}
                    placeholder="e.g., SW1A 1AA"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Employment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Employment Details
              </CardTitle>
              <p className="text-sm text-gray-600">
                Configure employment terms, conditions, and working arrangements
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="hire_date">Hire Date</Label>
                  <Input
                    id="hire_date"
                    type="date"
                    value={formData.hire_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, hire_date: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="employment_type">Employment Type</Label>
                  <select
                    id="employment_type"
                    value={formData.employment_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, employment_type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="full_time">Full Time</option>
                    <option value="part_time">Part Time</option>
                    <option value="casual">Casual</option>
                    <option value="fixed_term">Fixed Term</option>
                    <option value="apprenticeship">Apprenticeship</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="probation_period_months">Probation Period (Months)</Label>
                  <Input
                    id="probation_period_months"
                    type="number"
                    value={formData.probation_period_months}
                    onChange={(e) => setFormData(prev => ({ ...prev, probation_period_months: parseInt(e.target.value) }))}
                    min="0"
                    max="12"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notice_period_days">Notice Period (Days)</Label>
                  <Input
                    id="notice_period_days"
                    type="number"
                    value={formData.notice_period_days}
                    onChange={(e) => setFormData(prev => ({ ...prev, notice_period_days: parseInt(e.target.value) }))}
                    min="0"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="working_hours_per_week">Working Hours per Week</Label>
                  <Input
                    id="working_hours_per_week"
                    type="number"
                    value={formData.working_hours_per_week}
                    onChange={(e) => setFormData(prev => ({ ...prev, working_hours_per_week: parseInt(e.target.value) }))}
                    min="0"
                    max="168"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="holiday_entitlement_days">Holiday Entitlement (Days)</Label>
                  <Input
                    id="holiday_entitlement_days"
                    type="number"
                    value={formData.holiday_entitlement_days}
                    onChange={(e) => setFormData(prev => ({ ...prev, holiday_entitlement_days: parseInt(e.target.value) }))}
                    min="0"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="performance_review_frequency">Performance Review Frequency</Label>
                  <select
                    id="performance_review_frequency"
                    value={formData.performance_review_frequency}
                    onChange={(e) => setFormData(prev => ({ ...prev, performance_review_frequency: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="biannually">Bi-annually</option>
                    <option value="annually">Annually</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Availability Schedule */}
          <Card id="availability">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Weekly Availability Schedule
              </CardTitle>
              <p className="text-sm text-gray-600">
                Set driver availability for each day of the week with start/end times and break periods
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Monday */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-4">
                  <input
                    type="checkbox"
                    id="monday_available"
                    checked={formData.monday_available}
                    onChange={(e) => setFormData(prev => ({ ...prev, monday_available: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="monday_available" className="font-semibold text-lg">Monday</Label>
                </div>
                
                {formData.monday_available && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 ml-6">
                    <div className="space-y-2">
                      <Label htmlFor="monday_start_time">Start Time</Label>
                      <Input
                        id="monday_start_time"
                        type="time"
                        value={formData.monday_start_time}
                        onChange={(e) => setFormData(prev => ({ ...prev, monday_start_time: e.target.value }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="monday_end_time">End Time</Label>
                      <Input
                        id="monday_end_time"
                        type="time"
                        value={formData.monday_end_time}
                        onChange={(e) => setFormData(prev => ({ ...prev, monday_end_time: e.target.value }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="monday_break_start">Break Start</Label>
                      <Input
                        id="monday_break_start"
                        type="time"
                        value={formData.monday_break_start}
                        onChange={(e) => setFormData(prev => ({ ...prev, monday_break_start: e.target.value }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="monday_break_end">Break End</Label>
                      <Input
                        id="monday_break_end"
                        type="time"
                        value={formData.monday_break_end}
                        onChange={(e) => setFormData(prev => ({ ...prev, monday_break_end: e.target.value }))}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Tuesday */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-4">
                  <input
                    type="checkbox"
                    id="tuesday_available"
                    checked={formData.tuesday_available}
                    onChange={(e) => setFormData(prev => ({ ...prev, tuesday_available: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="tuesday_available" className="font-semibold text-lg">Tuesday</Label>
                </div>
                
                {formData.tuesday_available && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 ml-6">
                    <div className="space-y-2">
                      <Label htmlFor="tuesday_start_time">Start Time</Label>
                      <Input
                        id="tuesday_start_time"
                        type="time"
                        value={formData.tuesday_start_time}
                        onChange={(e) => setFormData(prev => ({ ...prev, tuesday_start_time: e.target.value }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="tuesday_end_time">End Time</Label>
                      <Input
                        id="tuesday_end_time"
                        type="time"
                        value={formData.tuesday_end_time}
                        onChange={(e) => setFormData(prev => ({ ...prev, tuesday_end_time: e.target.value }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="tuesday_break_start">Break Start</Label>
                      <Input
                        id="tuesday_break_start"
                        type="time"
                        value={formData.tuesday_break_start}
                        onChange={(e) => setFormData(prev => ({ ...prev, tuesday_break_start: e.target.value }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="tuesday_break_end">Break End</Label>
                      <Input
                        id="tuesday_break_end"
                        type="time"
                        value={formData.tuesday_break_end}
                        onChange={(e) => setFormData(prev => ({ ...prev, tuesday_break_end: e.target.value }))}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Wednesday */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-4">
                  <input
                    type="checkbox"
                    id="wednesday_available"
                    checked={formData.wednesday_available}
                    onChange={(e) => setFormData(prev => ({ ...prev, wednesday_available: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="wednesday_available" className="font-semibold text-lg">Wednesday</Label>
                </div>
                
                {formData.wednesday_available && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 ml-6">
                    <div className="space-y-2">
                      <Label htmlFor="wednesday_start_time">Start Time</Label>
                      <Input
                        id="wednesday_start_time"
                        type="time"
                        value={formData.wednesday_start_time}
                        onChange={(e) => setFormData(prev => ({ ...prev, wednesday_start_time: e.target.value }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="wednesday_end_time">End Time</Label>
                      <Input
                        id="wednesday_end_time"
                        type="time"
                        value={formData.wednesday_end_time}
                        onChange={(e) => setFormData(prev => ({ ...prev, wednesday_end_time: e.target.value }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="wednesday_break_start">Break Start</Label>
                      <Input
                        id="wednesday_break_start"
                        type="time"
                        value={formData.wednesday_break_start}
                        onChange={(e) => setFormData(prev => ({ ...prev, wednesday_break_start: e.target.value }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="wednesday_break_end">Break End</Label>
                      <Input
                        id="wednesday_break_end"
                        type="time"
                        value={formData.wednesday_break_end}
                        onChange={(e) => setFormData(prev => ({ ...prev, wednesday_break_end: e.target.value }))}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Thursday */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-4">
                  <input
                    type="checkbox"
                    id="thursday_available"
                    checked={formData.thursday_available}
                    onChange={(e) => setFormData(prev => ({ ...prev, thursday_available: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="thursday_available" className="font-semibold text-lg">Thursday</Label>
                </div>
                
                {formData.thursday_available && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 ml-6">
                    <div className="space-y-2">
                      <Label htmlFor="thursday_start_time">Start Time</Label>
                      <Input
                        id="thursday_start_time"
                        type="time"
                        value={formData.thursday_start_time}
                        onChange={(e) => setFormData(prev => ({ ...prev, thursday_start_time: e.target.value }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="thursday_end_time">End Time</Label>
                      <Input
                        id="thursday_end_time"
                        type="time"
                        value={formData.thursday_end_time}
                        onChange={(e) => setFormData(prev => ({ ...prev, thursday_end_time: e.target.value }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="thursday_break_start">Break Start</Label>
                      <Input
                        id="thursday_break_start"
                        type="time"
                        value={formData.thursday_break_start}
                        onChange={(e) => setFormData(prev => ({ ...prev, thursday_break_start: e.target.value }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="thursday_break_end">Break End</Label>
                      <Input
                        id="thursday_break_end"
                        type="time"
                        value={formData.thursday_break_end}
                        onChange={(e) => setFormData(prev => ({ ...prev, thursday_break_end: e.target.value }))}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Friday */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-4">
                  <input
                    type="checkbox"
                    id="friday_available"
                    checked={formData.friday_available}
                    onChange={(e) => setFormData(prev => ({ ...prev, friday_available: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="friday_available" className="font-semibold text-lg">Friday</Label>
                </div>
                
                {formData.friday_available && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 ml-6">
                    <div className="space-y-2">
                      <Label htmlFor="friday_start_time">Start Time</Label>
                      <Input
                        id="friday_start_time"
                        type="time"
                        value={formData.friday_start_time}
                        onChange={(e) => setFormData(prev => ({ ...prev, friday_start_time: e.target.value }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="friday_end_time">End Time</Label>
                      <Input
                        id="friday_end_time"
                        type="time"
                        value={formData.friday_end_time}
                        onChange={(e) => setFormData(prev => ({ ...prev, friday_end_time: e.target.value }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="friday_break_start">Break Start</Label>
                      <Input
                        id="friday_break_start"
                        type="time"
                        value={formData.friday_break_start}
                        onChange={(e) => setFormData(prev => ({ ...prev, friday_break_start: e.target.value }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="friday_break_end">Break End</Label>
                      <Input
                        id="friday_break_end"
                        type="time"
                        value={formData.friday_break_end}
                        onChange={(e) => setFormData(prev => ({ ...prev, friday_break_end: e.target.value }))}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Saturday */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-4">
                  <input
                    type="checkbox"
                    id="saturday_available"
                    checked={formData.saturday_available}
                    onChange={(e) => setFormData(prev => ({ ...prev, saturday_available: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="saturday_available" className="font-semibold text-lg">Saturday</Label>
                </div>
                
                {formData.saturday_available && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 ml-6">
                    <div className="space-y-2">
                      <Label htmlFor="saturday_start_time">Start Time</Label>
                      <Input
                        id="saturday_start_time"
                        type="time"
                        value={formData.saturday_start_time}
                        onChange={(e) => setFormData(prev => ({ ...prev, saturday_start_time: e.target.value }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="saturday_end_time">End Time</Label>
                      <Input
                        id="saturday_end_time"
                        type="time"
                        value={formData.saturday_end_time}
                        onChange={(e) => setFormData(prev => ({ ...prev, saturday_end_time: e.target.value }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="saturday_break_start">Break Start</Label>
                      <Input
                        id="saturday_break_start"
                        type="time"
                        value={formData.saturday_break_start}
                        onChange={(e) => setFormData(prev => ({ ...prev, saturday_break_start: e.target.value }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="saturday_break_end">Break End</Label>
                      <Input
                        id="saturday_break_end"
                        type="time"
                        value={formData.saturday_break_end}
                        onChange={(e) => setFormData(prev => ({ ...prev, saturday_break_end: e.target.value }))}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Sunday */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-4">
                  <input
                    type="checkbox"
                    id="sunday_available"
                    checked={formData.sunday_available}
                    onChange={(e) => setFormData(prev => ({ ...prev, sunday_available: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="sunday_available" className="font-semibold text-lg">Sunday</Label>
                </div>
                
                {formData.sunday_available && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                    <div className="space-y-2">
                      <Label htmlFor="sunday_start_time">Start Time</Label>
                      <Input
                        id="sunday_start_time"
                        type="time"
                        value={formData.sunday_start_time}
                        onChange={(e) => setFormData(prev => ({ ...prev, sunday_start_time: e.target.value }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="sunday_end_time">End Time</Label>
                      <Input
                        id="sunday_end_time"
                        type="time"
                        value={formData.sunday_end_time}
                        onChange={(e) => setFormData(prev => ({ ...prev, sunday_end_time: e.target.value }))}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const defaultTimes = {
                      monday_available: true, tuesday_available: true, wednesday_available: true,
                      thursday_available: true, friday_available: true, saturday_available: false, sunday_available: false,
                      monday_start_time: '09:00', monday_end_time: '17:00', monday_break_start: '12:00', monday_break_end: '13:00',
                      tuesday_start_time: '09:00', tuesday_end_time: '17:00', tuesday_break_start: '12:00', tuesday_break_end: '13:00',
                      wednesday_start_time: '09:00', wednesday_end_time: '17:00', wednesday_break_start: '12:00', wednesday_break_end: '13:00',
                      thursday_start_time: '09:00', thursday_end_time: '17:00', thursday_break_start: '12:00', thursday_break_end: '13:00',
                      friday_start_time: '09:00', friday_end_time: '17:00', friday_break_start: '12:00', friday_break_end: '13:00',
                      saturday_start_time: '09:00', saturday_end_time: '17:00', saturday_break_start: '12:00', saturday_break_end: '13:00',
                      sunday_start_time: '09:00', sunday_end_time: '17:00', sunday_break_start: '12:00', sunday_break_end: '13:00',
                    };
                    setFormData(prev => ({ ...prev, ...defaultTimes }));
                  }}
                >
                  Set Standard Week (Mon-Fri, 9-5)
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const weekendTimes = {
                      monday_available: false, tuesday_available: false, wednesday_available: false,
                      thursday_available: false, friday_available: false, saturday_available: true, sunday_available: true,
                      saturday_start_time: '10:00', saturday_end_time: '18:00', saturday_break_start: '13:00', saturday_break_end: '14:00',
                      sunday_start_time: '10:00', sunday_end_time: '18:00', sunday_break_start: '13:00', sunday_break_end: '14:00',
                    };
                    setFormData(prev => ({ ...prev, ...weekendTimes }));
                  }}
                >
                  Set Weekend Only
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const allDays = {
                      monday_available: true, tuesday_available: true, wednesday_available: true,
                      thursday_available: true, friday_available: true, saturday_available: true, sunday_available: true,
                      monday_start_time: '08:00', monday_end_time: '16:00', monday_break_start: '12:00', monday_break_end: '13:00',
                      tuesday_start_time: '08:00', tuesday_end_time: '16:00', tuesday_break_start: '12:00', tuesday_break_end: '13:00',
                      wednesday_start_time: '08:00', wednesday_end_time: '16:00', wednesday_break_start: '12:00', wednesday_break_end: '13:00',
                      thursday_start_time: '08:00', thursday_end_time: '16:00', thursday_break_start: '12:00', thursday_break_end: '13:00',
                      friday_start_time: '08:00', friday_end_time: '16:00', friday_break_start: '12:00', friday_break_end: '13:00',
                      saturday_start_time: '08:00', saturday_end_time: '16:00', saturday_break_start: '12:00', saturday_break_end: '13:00',
                      sunday_start_time: '08:00', sunday_end_time: '16:00', sunday_break_start: '12:00', sunday_break_end: '13:00',
                    };
                    setFormData(prev => ({ ...prev, ...allDays }));
                  }}
                >
                  Set 7-Day Week (8-4)
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const resetTimes = {
                      monday_available: false, tuesday_available: false, wednesday_available: false,
                      thursday_available: false, friday_available: false, saturday_available: false, sunday_available: false,
                      monday_start_time: '09:00', monday_end_time: '17:00', monday_break_start: '12:00', monday_break_end: '13:00',
                      tuesday_start_time: '09:00', tuesday_end_time: '17:00', tuesday_break_start: '12:00', tuesday_break_end: '13:00',
                      wednesday_start_time: '09:00', wednesday_end_time: '17:00', wednesday_break_start: '12:00', wednesday_break_end: '13:00',
                      thursday_start_time: '09:00', thursday_end_time: '17:00', thursday_break_start: '12:00', thursday_break_end: '13:00',
                      friday_start_time: '09:00', friday_end_time: '17:00', friday_break_start: '12:00', friday_break_end: '13:00',
                      saturday_start_time: '09:00', saturday_end_time: '17:00', saturday_break_start: '12:00', saturday_break_end: '13:00',
                      sunday_start_time: '09:00', sunday_end_time: '17:00', sunday_break_start: '12:00', sunday_break_end: '13:00',
                    };
                    setFormData(prev => ({ ...prev, ...resetTimes }));
                  }}
                >
                  Clear All
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Compensation & Benefits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Compensation & Benefits
              </CardTitle>
              <p className="text-sm text-gray-600">
                Set salary, benefits, and financial arrangements
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="salary_amount">Salary Amount</Label>
                  <Input
                    id="salary_amount"
                    type="number"
                    value={formData.salary_amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, salary_amount: parseFloat(e.target.value) }))}
                    min="0"
                    step="0.01"
                    placeholder="e.g., 25000"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="salary_frequency">Salary Frequency</Label>
                  <select
                    id="salary_frequency"
                    value={formData.salary_frequency}
                    onChange={(e) => setFormData(prev => ({ ...prev, salary_frequency: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="annually">Annually</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="training_budget">Training Budget</Label>
                  <Input
                    id="training_budget"
                    type="number"
                    value={formData.training_budget}
                    onChange={(e) => setFormData(prev => ({ ...prev, training_budget: parseFloat(e.target.value) }))}
                    min="0"
                    step="0.01"
                    placeholder="e.g., 1000"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benefits Checklist */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Benefits & Perks
              </CardTitle>
              <p className="text-sm text-gray-600">
                Select the benefits and perks for this driver
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="pension_scheme"
                    checked={formData.pension_scheme}
                    onChange={(e) => setFormData(prev => ({ ...prev, pension_scheme: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="pension_scheme">Pension Scheme</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="health_insurance"
                    checked={formData.health_insurance}
                    onChange={(e) => setFormData(prev => ({ ...prev, health_insurance: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="health_insurance">Health Insurance</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="vehicle_allowance"
                    checked={formData.vehicle_allowance}
                    onChange={(e) => setFormData(prev => ({ ...prev, vehicle_allowance: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="vehicle_allowance">Vehicle Allowance</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="fuel_card"
                    checked={formData.fuel_card}
                    onChange={(e) => setFormData(prev => ({ ...prev, fuel_card: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="fuel_card">Fuel Card</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="uniform_provided"
                    checked={formData.uniform_provided}
                    onChange={(e) => setFormData(prev => ({ ...prev, uniform_provided: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="uniform_provided">Uniform Provided</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Driver Qualifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="w-5 h-5" />
                Driver Qualifications
              </CardTitle>
              <p className="text-sm text-gray-600">
                Driver-specific licenses, certifications, and qualifications
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="cdl_number">CDL Number</Label>
                  <Input
                    id="cdl_number"
                    value={formData.cdl_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, cdl_number: e.target.value }))}
                    placeholder="Commercial Driver License"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="medical_card_expiry">Medical Card Expiry</Label>
                  <Input
                    id="medical_card_expiry"
                    type="date"
                    value={formData.medical_card_expiry}
                    onChange={(e) => setFormData(prev => ({ ...prev, medical_card_expiry: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Emergency Contact
              </CardTitle>
              <p className="text-sm text-gray-600">
                Emergency contact information for safety and compliance
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
                  <Input
                    id="emergency_contact_name"
                    value={formData.emergency_contact_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, emergency_contact_name: e.target.value }))}
                    placeholder="e.g., Jane Smith"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="emergency_contact_phone">Emergency Contact Phone</Label>
                  <Input
                    id="emergency_contact_phone"
                    type="tel"
                    value={formData.emergency_contact_phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, emergency_contact_phone: e.target.value }))}
                    placeholder="e.g., +44 7700 900001"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="emergency_contact_relationship">Relationship</Label>
                <Input
                  id="emergency_contact_relationship"
                  value={formData.emergency_contact_relationship}
                  onChange={(e) => setFormData(prev => ({ ...prev, emergency_contact_relationship: e.target.value }))}
                  placeholder="e.g., Spouse, Parent, Friend"
                />
              </div>
            </CardContent>
          </Card>

          {/* Banking Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Banking Information
              </CardTitle>
              <p className="text-sm text-gray-600">
                Bank account details for salary payments
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="bank_account_name">Account Holder Name</Label>
                  <Input
                    id="bank_account_name"
                    value={formData.bank_account_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, bank_account_name: e.target.value }))}
                    placeholder="e.g., John Smith"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bank_account_number">Account Number</Label>
                  <Input
                    id="bank_account_number"
                    value={formData.bank_account_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, bank_account_number: e.target.value }))}
                    placeholder="e.g., 12345678"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="bank_sort_code">Sort Code</Label>
                  <Input
                    id="bank_sort_code"
                    value={formData.bank_sort_code}
                    onChange={(e) => setFormData(prev => ({ ...prev, bank_sort_code: e.target.value }))}
                    placeholder="e.g., 12-34-56"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tax_code">Tax Code</Label>
                  <Input
                    id="tax_code"
                    value={formData.tax_code}
                    onChange={(e) => setFormData(prev => ({ ...prev, tax_code: e.target.value }))}
                    placeholder="e.g., 1257L"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Training & Compliance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Training & Compliance
              </CardTitle>
              <p className="text-sm text-gray-600">
                Track required training and compliance acknowledgments
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="health_and_safety_training"
                    checked={formData.health_and_safety_training}
                    onChange={(e) => setFormData(prev => ({ ...prev, health_and_safety_training: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="health_and_safety_training">Health & Safety Training</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="equal_opportunities_training"
                    checked={formData.equal_opportunities_training}
                    onChange={(e) => setFormData(prev => ({ ...prev, equal_opportunities_training: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="equal_opportunities_training">Equal Opportunities Training</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="data_protection_training"
                    checked={formData.data_protection_training}
                    onChange={(e) => setFormData(prev => ({ ...prev, data_protection_training: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="data_protection_training">Data Protection Training</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="disciplinary_procedure_acknowledged"
                    checked={formData.disciplinary_procedure_acknowledged}
                    onChange={(e) => setFormData(prev => ({ ...prev, disciplinary_procedure_acknowledged: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="disciplinary_procedure_acknowledged">Disciplinary Procedure Acknowledged</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documentation & Verification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Documentation & Verification
              </CardTitle>
              <p className="text-sm text-gray-600">
                Track required documentation and verification status
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="references_provided"
                    checked={formData.references_provided}
                    onChange={(e) => setFormData(prev => ({ ...prev, references_provided: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="references_provided">References Provided</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="background_check_completed"
                    checked={formData.background_check_completed}
                    onChange={(e) => setFormData(prev => ({ ...prev, background_check_completed: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="background_check_completed">Background Check Completed</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="right_to_work_verified"
                    checked={formData.right_to_work_verified}
                    onChange={(e) => setFormData(prev => ({ ...prev, right_to_work_verified: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="right_to_work_verified">Right to Work Verified</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="contract_signed"
                    checked={formData.contract_signed}
                    onChange={(e) => setFormData(prev => ({ ...prev, contract_signed: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="contract_signed">Employment Contract Signed</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="handbook_received"
                    checked={formData.handbook_received}
                    onChange={(e) => setFormData(prev => ({ ...prev, handbook_received: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="handbook_received">Employee Handbook Received</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right to Work & Driver License Checklist */}
          <Card id="compliance-checklist" className="border-2 border-blue-500 bg-blue-50">
            <CardHeader className="bg-blue-100">
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <ClipboardCheck className="w-5 h-5" />
                Right to Work & Driver License Checklist
              </CardTitle>
              <p className="text-sm text-blue-600">
                Essential compliance documents and verification checks for commercial drivers
              </p>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Right to Work Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Right to Work Verification</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="right_to_work_document_type">Document Type</Label>
                    <select
                      id="right_to_work_document_type"
                      value={formData.right_to_work_document_type}
                      onChange={(e) => setFormData(prev => ({ ...prev, right_to_work_document_type: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Document Type</option>
                      <option value="passport">Passport</option>
                      <option value="national_id">National ID Card</option>
                      <option value="birth_certificate">Birth Certificate</option>
                      <option value="work_permit">Work Permit</option>
                      <option value="visa">Visa</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="right_to_work_document_number">Document Number</Label>
                    <Input
                      id="right_to_work_document_number"
                      value={formData.right_to_work_document_number}
                      onChange={(e) => setFormData(prev => ({ ...prev, right_to_work_document_number: e.target.value }))}
                      placeholder="e.g., 123456789"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="right_to_work_document_expiry">Document Expiry Date</Label>
                    <Input
                      id="right_to_work_document_expiry"
                      type="date"
                      value={formData.right_to_work_document_expiry}
                      onChange={(e) => setFormData(prev => ({ ...prev, right_to_work_document_expiry: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="right_to_work_verification_date">Verification Date</Label>
                    <Input
                      id="right_to_work_verification_date"
                      type="date"
                      value={formData.right_to_work_verification_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, right_to_work_verification_date: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="right_to_work_verified_by">Verified By</Label>
                    <Input
                      id="right_to_work_verified_by"
                      value={formData.right_to_work_verified_by}
                      onChange={(e) => setFormData(prev => ({ ...prev, right_to_work_verified_by: e.target.value }))}
                      placeholder="e.g., HR Manager Name"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="right_to_work_verified"
                      checked={formData.right_to_work_verified}
                      onChange={(e) => setFormData(prev => ({ ...prev, right_to_work_verified: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="right_to_work_verified">Right to Work Verified</Label>
                  </div>
                </div>
              </div>

              {/* Driver License Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Driver License & Qualifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="driver_license_number">Driver License Number</Label>
                    <Input
                      id="driver_license_number"
                      value={formData.driver_license_number}
                      onChange={(e) => setFormData(prev => ({ ...prev, driver_license_number: e.target.value }))}
                      placeholder="e.g., SMITH123456SM7J"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="driver_license_type">License Type</Label>
                    <select
                      id="driver_license_type"
                      value={formData.driver_license_type}
                      onChange={(e) => setFormData(prev => ({ ...prev, driver_license_type: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select License Type</option>
                      <option value="car">Car (Category B)</option>
                      <option value="light_van">Light Van (Category B1)</option>
                      <option value="medium_vehicle">Medium Vehicle (Category C1)</option>
                      <option value="large_vehicle">Large Vehicle (Category C)</option>
                      <option value="minibus">Minibus (Category D1)</option>
                      <option value="bus">Bus (Category D)</option>
                      <option value="motorcycle">Motorcycle (Category A)</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="driver_license_expiry">License Expiry Date</Label>
                    <Input
                      id="driver_license_expiry"
                      type="date"
                      value={formData.driver_license_expiry}
                      onChange={(e) => setFormData(prev => ({ ...prev, driver_license_expiry: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="driver_license_verification_date">Verification Date</Label>
                    <Input
                      id="driver_license_verification_date"
                      type="date"
                      value={formData.driver_license_verification_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, driver_license_verification_date: e.target.value }))}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="driver_license_verified"
                      checked={formData.driver_license_verified}
                      onChange={(e) => setFormData(prev => ({ ...prev, driver_license_verified: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="driver_license_verified">Driver License Verified</Label>
                  </div>
                </div>
              </div>

              {/* DQC Card Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Driver Qualification Card (DQC)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dqc_card_number">DQC Card Number</Label>
                    <Input
                      id="dqc_card_number"
                      value={formData.dqc_card_number}
                      onChange={(e) => setFormData(prev => ({ ...prev, dqc_card_number: e.target.value }))}
                      placeholder="e.g., DQC123456789"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dqc_card_expiry">DQC Card Expiry Date</Label>
                    <Input
                      id="dqc_card_expiry"
                      type="date"
                      value={formData.dqc_card_expiry}
                      onChange={(e) => setFormData(prev => ({ ...prev, dqc_card_expiry: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dqc_card_verification_date">Verification Date</Label>
                    <Input
                      id="dqc_card_verification_date"
                      type="date"
                      value={formData.dqc_card_verification_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, dqc_card_verification_date: e.target.value }))}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="dqc_card_verified"
                      checked={formData.dqc_card_verified}
                      onChange={(e) => setFormData(prev => ({ ...prev, dqc_card_verified: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="dqc_card_verified">DQC Card Verified</Label>
                  </div>
                </div>
              </div>

              {/* Tacho Card Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Digital Tachograph Card</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tacho_card_number">Tacho Card Number</Label>
                    <Input
                      id="tacho_card_number"
                      value={formData.tacho_card_number}
                      onChange={(e) => setFormData(prev => ({ ...prev, tacho_card_number: e.target.value }))}
                      placeholder="e.g., TACHO123456789"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tacho_card_expiry">Tacho Card Expiry Date</Label>
                    <Input
                      id="tacho_card_expiry"
                      type="date"
                      value={formData.tacho_card_expiry}
                      onChange={(e) => setFormData(prev => ({ ...prev, tacho_card_expiry: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tacho_card_verification_date">Verification Date</Label>
                    <Input
                      id="tacho_card_verification_date"
                      type="date"
                      value={formData.tacho_card_verification_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, tacho_card_verification_date: e.target.value }))}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="dqc_card_verified"
                      checked={formData.tacho_card_verified}
                      onChange={(e) => setFormData(prev => ({ ...prev, tacho_card_verified: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="dqc_card_verified">Tacho Card Verified</Label>
                    <Label htmlFor="tacho_card_verified">Tacho Card Verified</Label>
                  </div>
                </div>
              </div>

              {/* Additional Certificates Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Additional Certificates & Training</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="medical_card_number">Medical Card Number</Label>
                    <Input
                      id="medical_card_number"
                      value={formData.medical_card_number}
                      onChange={(e) => setFormData(prev => ({ ...prev, medical_card_number: e.target.value }))}
                      placeholder="e.g., MED123456789"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="medical_card_expiry">Medical Card Expiry Date</Label>
                    <Input
                      id="medical_card_expiry"
                      type="date"
                      value={formData.medical_card_expiry}
                      onChange={(e) => setFormData(prev => ({ ...prev, medical_card_expiry: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="medical_card_verification_date">Verification Date</Label>
                    <Input
                      id="medical_card_verification_date"
                      type="date"
                      value={formData.medical_card_verification_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, medical_card_verification_date: e.target.value }))}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="medical_card_verified"
                      checked={formData.medical_card_verified}
                      onChange={(e) => setFormData(prev => ({ ...prev, medical_card_verified: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="medical_card_verified">Medical Card Verified</Label>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cpc_card_number">CPC Card Number</Label>
                    <Input
                      id="cpc_card_number"
                      value={formData.cpc_card_number}
                      onChange={(e) => setFormData(prev => ({ ...prev, cpc_card_number: e.target.value }))}
                      placeholder="e.g., CPC123456789"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cpc_card_expiry">CPC Card Expiry Date</Label>
                    <Input
                      id="cpc_card_expiry"
                      type="date"
                      value={formData.cpc_card_expiry}
                      onChange={(e) => setFormData(prev => ({ ...prev, cpc_card_expiry: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cpc_card_verification_date">Verification Date</Label>
                    <Input
                      id="cpc_card_verification_date"
                      type="date"
                      value={formData.cpc_card_verification_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, cpc_card_verification_date: e.target.value }))}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="cpc_card_verified"
                      checked={formData.cpc_card_verified}
                      onChange={(e) => setFormData(prev => ({ ...prev, cpc_card_verified: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="cpc_card_verified">CPC Card Verified</Label>
                  </div>
                </div>
              </div>

              {/* Overall Verification Status */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Verification Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="all_documents_verified"
                      checked={formData.all_documents_verified}
                      onChange={(e) => setFormData(prev => ({ ...prev, all_documents_verified: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="all_documents_verified">All Documents Verified</Label>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="verification_notes">Verification Notes</Label>
                    <textarea
                      id="verification_notes"
                      value={formData.verification_notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, verification_notes: e.target.value }))}
                      placeholder="Add any notes about verification process, issues found, or special considerations..."
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Driver will be added to your driver management system</span>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  onClick={handleBack}
                  type="button"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createDriverMutation.isPending}>
                  {createDriverMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Driver...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Add Driver
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDriver;
