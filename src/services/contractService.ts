import jsPDF from 'jspdf';
import { supabase } from '@/integrations/supabase/client';

// Interface for Standard Mechanic Contract data
export interface MechanicContractData {
  companyName: string;
  companyAddress: string;
  companyCRN: string;
  companyVAT: string;
  operatingLicense: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  mechanicName: string;
  mechanicAddress: string;
  mechanicNI: string;
  mechanicDOB: string;
  mechanicPhone: string;
  mechanicEmail: string;
  startDate: string;
  employmentType: string;
  startTime: string;
  endTime: string;
  weeklyHours: string;
  overtimeRate: string;
  onCallAllowance: string;
  callOutRate: string;
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
  noticePeriod: string;
  probationPeriod: string;
  nonCompetitionMonths: string;
}

// Interface for Transport Mechanic Contract data
export interface TransportMechanicContractData {
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
  mechanicName: string;
  mechanicAddress: string;
  mechanicNI: string;
  mechanicDOB: string;
  mechanicPhone: string;
  mechanicEmail: string;
  emergencyContact: string;
  emergencyPhone: string;
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
  noticePeriod: string;
  nonCompetitionMonths: string;
  geographicScope: string;
  industryScope: string;
}

// Helper function to format currency
const formatCurrency = (amount: string): string => {
  if (!amount) return '£0.00';
  const num = parseFloat(amount);
  return isNaN(num) ? '£0.00' : `£${num.toLocaleString('en-GB', { minimumFractionDigits: 2 })}`;
};

// Helper function to format date
const formatDate = (dateString: string): string => {
  if (!dateString) return 'Not specified';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  } catch {
    return dateString;
  }
};

// Helper function to add text with word wrapping
const addWrappedText = (doc: jsPDF, text: string, x: number, y: number, maxWidth: number, lineHeight: number = 7): number => {
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, x, y);
  return y + (lines.length * lineHeight);
};

// Generate Standard Mechanic Employment Contract PDF
export const generateMechanicContractPDF = async (data: MechanicContractData): Promise<void> => {
  const doc = new jsPDF();
  
  // Set document properties
  doc.setProperties({
    title: 'Mechanic Employment Contract',
    subject: 'Employment Agreement',
    author: data.companyName,
    creator: 'TMS Contract Generator'
  });

  // Add company logo/header space
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('MECHANIC EMPLOYMENT CONTRACT', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('EMPLOYMENT AGREEMENT', 105, 35, { align: 'center' });
  
  let yPosition = 50;
  
  // Company Information
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Company Information:', 20, yPosition);
  yPosition += 10;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  yPosition = addWrappedText(doc, `Company Name: ${data.companyName}`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Address: ${data.companyAddress || 'Not specified'}`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Company Registration Number: ${data.companyCRN || 'Not specified'}`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `VAT Number: ${data.companyVAT || 'Not specified'}`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Operating License: ${data.operatingLicense || 'Not specified'}`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Contact Person: ${data.contactPerson || 'Not specified'}`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Phone: ${data.contactPhone || 'Not specified'}`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Email: ${data.contactEmail || 'Not specified'}`, 20, yPosition, 170);
  
  yPosition += 10;
  
  // Employee Information
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Employee Information:', 20, yPosition);
  yPosition += 10;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  yPosition = addWrappedText(doc, `Name: ${data.mechanicName}`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Address: ${data.mechanicAddress || 'Not specified'}`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `National Insurance Number: ${data.mechanicNI || 'Not specified'}`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Date of Birth: ${formatDate(data.mechanicDOB)}`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Phone: ${data.mechanicPhone || 'Not specified'}`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Email: ${data.mechanicEmail || 'Not specified'}`, 20, yPosition, 170);
  
  yPosition += 10;
  
  // Employment Terms
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Employment Terms:', 20, yPosition);
  yPosition += 10;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  yPosition = addWrappedText(doc, `Start Date: ${formatDate(data.startDate)}`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Employment Type: ${data.employmentType.replace('_', ' ').toUpperCase()}`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Working Hours: ${data.startTime} - ${data.endTime}`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Weekly Hours: ${data.weeklyHours} hours`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Overtime Rate: ${data.overtimeRate}x normal rate`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `On-Call Allowance: ${formatCurrency(data.onCallAllowance)} per week`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Call-Out Rate: ${formatCurrency(data.callOutRate)} per hour`, 20, yPosition, 170);
  
  yPosition += 10;
  
  // Salary and Benefits
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Salary and Benefits:', 20, yPosition);
  yPosition += 10;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  yPosition = addWrappedText(doc, `Annual Salary: ${formatCurrency(data.annualSalary)}`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Payment Frequency: ${data.paymentFrequency}`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Payment Date: ${data.paymentDate} of each ${data.paymentFrequency.slice(0, -2)}`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Performance Bonus: Up to ${formatCurrency(data.performanceBonus)} per annum`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Tool Allowance: ${formatCurrency(data.toolAllowance)} per annum`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Uniform Allowance: ${formatCurrency(data.uniformAllowance)} per annum`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Pension: Auto-enrolment with ${data.pensionCompany}% company contribution`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Holiday Entitlement: ${data.holidayDays} days per annum plus bank holidays`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Sick Pay: ${data.sickPayWeeks} weeks at full pay plus SSP`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Life Insurance: ${data.lifeInsurance}x annual salary`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Health Insurance: ${data.healthInsurance}`, 20, yPosition, 170);
  
  yPosition += 10;
  
  // Background
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('BACKGROUND:', 20, yPosition);
  yPosition += 8;
  doc.setFontSize(10); doc.setFont('helvetica', 'normal');
  yPosition = addWrappedText(doc, 'A. The Employer believes the Employee has the necessary qualifications, experience and abilities to assist and benefit the Employer in its business.', 20, yPosition, 170);
  yPosition = addWrappedText(doc, 'B. The Employer desires to employ the Employee and the Employee agrees to accept such employment upon the terms and conditions set out in this Agreement.', 20, yPosition, 170);
  yPosition += 6;

  // Particulars of Employment
  doc.setFontSize(12); doc.setFont('helvetica', 'bold');
  doc.text('PARTICULARS OF EMPLOYMENT', 20, yPosition);
  yPosition += 8;
  doc.setFontSize(10); doc.setFont('helvetica', 'normal');
  yPosition = addWrappedText(doc, '1. As required by the Employment Rights Act 1996, particulars of the Employee\'s employment are provided in this Agreement and its schedules.', 20, yPosition, 170);
  yPosition += 6;

  // Commencement Date and Term
  doc.setFontSize(12); doc.setFont('helvetica', 'bold');
  doc.text('COMMENCEMENT DATE AND TERM', 20, yPosition);
  yPosition += 8;
  doc.setFontSize(10);
  yPosition = addWrappedText(doc, `2. Employment will commence on ${formatDate(data.startDate)} (the "Commencement Date").`, 20, yPosition, 170);
  yPosition += 6;

  // Job Title and Description
  doc.setFontSize(12); doc.setFont('helvetica', 'bold');
  doc.text('JOB TITLE AND DESCRIPTION', 20, yPosition);
  yPosition += 8;
  doc.setFontSize(10);
  yPosition = addWrappedText(doc, '3. The initial job title will be Mechanic.', 20, yPosition, 170);
  yPosition = addWrappedText(doc, '4. The Employee agrees to be employed on these terms, acting under the Employer\'s direction and policies.', 20, yPosition, 170);
  yPosition = addWrappedText(doc, '5. The Employee will perform all reasonable duties requested by the Employer that are customarily performed by a person in a similar position.', 20, yPosition, 170);
  yPosition += 6;

  // Place of Work
  doc.setFontSize(12); doc.setFont('helvetica', 'bold');
  doc.text('PLACE OF WORK', 20, yPosition);
  yPosition += 8;
  doc.setFontSize(10);
  yPosition = addWrappedText(doc, '6. The primary place of work will be the Employer\'s premises or such other locations as reasonably required by the Employer.', 20, yPosition, 170);
  yPosition += 6;

  // Time of Work
  doc.setFontSize(12); doc.setFont('helvetica', 'bold');
  doc.text('TIME OF WORK', 20, yPosition);
  yPosition += 8;
  doc.setFontSize(10);
  yPosition = addWrappedText(doc, '7. Normal hours are as specified in this Agreement. The Employee may be required to work reasonable additional hours to meet business needs in accordance with law.', 20, yPosition, 170);
  yPosition += 6;

  // Employee Benefits
  doc.setFontSize(12); doc.setFont('helvetica', 'bold');
  doc.text('EMPLOYEE BENEFITS', 20, yPosition);
  yPosition += 8;
  doc.setFontSize(10);
  yPosition = addWrappedText(doc, '8. Benefits are as set out in the Employer\'s policies/handbook and may vary from time to time in line with applicable law.', 20, yPosition, 170);
  yPosition += 6;

  // Holidays
  doc.setFontSize(12); doc.setFont('helvetica', 'bold');
  doc.text('HOLIDAYS', 20, yPosition);
  yPosition += 8;
  doc.setFontSize(10);
  yPosition = addWrappedText(doc, '9. Holiday entitlement is as specified in this Agreement and statutory requirements. Holiday dates will be agreed with the Employer.', 20, yPosition, 170);
  yPosition += 6;

  // Sickness and Disability
  doc.setFontSize(12); doc.setFont('helvetica', 'bold');
  doc.text('SICKNESS AND DISABILITY', 20, yPosition);
  yPosition += 8;
  doc.setFontSize(10);
  yPosition = addWrappedText(doc, '10. The Employee must notify the Employer of sickness as soon as possible and may be required to provide medical evidence for absences as per policy and law.', 20, yPosition, 170);
  yPosition += 6;

  // Disciplinary Procedure
  doc.setFontSize(12); doc.setFont('helvetica', 'bold');
  doc.text('DISCIPLINARY PROCEDURE', 20, yPosition);
  yPosition += 8;
  doc.setFontSize(10);
  yPosition = addWrappedText(doc, '11. The Employer\'s disciplinary procedure applies and includes the right to representation and appeal in accordance with law.', 20, yPosition, 170);
  yPosition += 6;

  // Grievance Procedure
  doc.setFontSize(12); doc.setFont('helvetica', 'bold');
  doc.text('GRIEVANCE PROCEDURE', 20, yPosition);
  yPosition += 8;
  doc.setFontSize(10);
  yPosition = addWrappedText(doc, '12. The Employer\'s grievance procedure applies and allows concerns to be raised and fairly investigated with a right of appeal.', 20, yPosition, 170);
  yPosition += 10;

  // Additional Terms
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Additional Terms:', 20, yPosition);
  yPosition += 10;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  yPosition = addWrappedText(doc, `Notice Period: ${data.noticePeriod} weeks`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Probation Period: ${data.probationPeriod} months`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Non-Competition: ${data.nonCompetitionMonths} months`, 20, yPosition, 170);
  
  yPosition += 15;
  
  // Terms and Conditions
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Terms and Conditions:', 20, yPosition);
  yPosition += 10;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  yPosition = addWrappedText(doc, '• This contract is governed by English employment law', 20, yPosition, 170);
  yPosition = addWrappedText(doc, '• Any disputes will be resolved in accordance with UK employment tribunals', 20, yPosition, 170);
  yPosition = addWrappedText(doc, '• The contract may be varied only by written agreement between both parties', 20, yPosition, 170);
  yPosition = addWrappedText(doc, '• If any clause is found to be invalid, the remaining clauses shall remain in force', 20, yPosition, 170);
  yPosition = addWrappedText(doc, '• This contract supersedes all previous agreements and arrangements', 20, yPosition, 170);
  
  yPosition += 10;
  
  // Company and Employee Requirements
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Company Requirements:', 20, yPosition);
  yPosition += 8;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  yPosition = addWrappedText(doc, '• Maintain professional appearance and conduct at all times', 20, yPosition, 170);
  yPosition = addWrappedText(doc, '• Complete all assigned work to required standards', 20, yPosition, 170);
  yPosition = addWrappedText(doc, '• Follow all company policies and procedures', 20, yPosition, 170);
  yPosition = addWrappedText(doc, '• Maintain required qualifications and certifications', 20, yPosition, 170);
  yPosition = addWrappedText(doc, '• Follow health and safety procedures strictly', 20, yPosition, 170);
  
  yPosition += 10;
  
  // Employee Rights
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Employee Rights:', 20, yPosition);
  yPosition += 8;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  yPosition = addWrappedText(doc, '• Safe working environment and equipment', 20, yPosition, 170);
  yPosition = addWrappedText(doc, '• Fair and competitive remuneration', 20, yPosition, 170);
  yPosition = addWrappedText(doc, '• Training and professional development support', 20, yPosition, 170);
  yPosition = addWrappedText(doc, '• Clear job expectations and objectives', 20, yPosition, 170);
  yPosition = addWrappedText(doc, '• Opportunities for career progression', 20, yPosition, 170);
  
  yPosition += 10;
  
  // All company policies and procedures form part of this contract
  yPosition = addWrappedText(doc, '• All company policies and procedures form part of this contract', 20, yPosition, 170);
  yPosition = addWrappedText(doc, '• Employee must comply with all company policies as updated from time to time', 20, yPosition, 170);
  yPosition = addWrappedText(doc, '• Company will provide reasonable notice of any policy changes', 20, yPosition, 170);
  yPosition = addWrappedText(doc, '• Employee will be given opportunity to review and understand all policies', 20, yPosition, 170);
  yPosition = addWrappedText(doc, '• Failure to comply with company policies may result in disciplinary action', 20, yPosition, 170);
  
  yPosition += 10;
  
  // What Company Provides
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Company Provides:', 20, yPosition);
  yPosition += 8;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  yPosition = addWrappedText(doc, '• Fully equipped workshop with modern tools and equipment', 20, yPosition, 170);
  yPosition = addWrappedText(doc, '• Personal protective equipment (PPE) and safety gear', 20, yPosition, 170);
  yPosition = addWrappedText(doc, '• Ongoing training programs and qualification support', 20, yPosition, 170);
  yPosition = addWrappedText(doc, '• Access to technical manuals and diagnostic equipment', 20, yPosition, 170);
  yPosition = addWrappedText(doc, '• Company vehicles for work-related travel and testing', 20, yPosition, 170);
  
  yPosition += 10;
  
  // What Employee Must Provide
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Employee Must Provide:', 20, yPosition);
  yPosition += 8;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  yPosition = addWrappedText(doc, '• Basic hand tools and personal equipment', 20, yPosition, 170);
  yPosition = addWrappedText(doc, '• Current and valid technical qualifications', 20, yPosition, 170);
  yPosition = addWrappedText(doc, '• Appropriate work clothing and footwear', 20, yPosition, 170);
  yPosition = addWrappedText(doc, '• Reliable transport to and from work', 20, yPosition, 170);
  yPosition = addWrappedText(doc, '• Punctuality and reliable attendance', 20, yPosition, 170);
  
  yPosition += 15;
  
  // Important Notes
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Important Notes:', 20, yPosition);
  yPosition += 10;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  yPosition = addWrappedText(doc, '• This contract should be reviewed by a qualified employment lawyer before use', 20, yPosition, 170);
  yPosition = addWrappedText(doc, '• All blank fields must be completed before signing', 20, yPosition, 170);
  yPosition = addWrappedText(doc, '• Company policies and procedures form part of this contract', 20, yPosition, 170);
  yPosition = addWrappedText(doc, '• Changes to terms must be agreed in writing', 20, yPosition, 170);
  yPosition = addWrappedText(doc, '• Keep a copy of this contract for your records', 20, yPosition, 170);
  
  yPosition += 15;
  
  // Signature Section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Signatures:', 20, yPosition);
  yPosition += 10;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('For and on behalf of ' + data.companyName + ':', 20, yPosition);
  yPosition += 15;
  doc.text('Name: _________________', 20, yPosition);
  yPosition += 7;
  doc.text('Position: _________________', 20, yPosition);
  yPosition += 7;
  doc.text('Signature: _________________', 20, yPosition);
  yPosition += 7;
  doc.text('Date: _________________', 20, yPosition);
  
  yPosition += 15;
  doc.text('Employee:', 20, yPosition);
  yPosition += 15;
  doc.text('Name: ' + data.mechanicName, 20, yPosition);
  yPosition += 7;
  doc.text('Signature: _________________', 20, yPosition);
  yPosition += 7;
  doc.text('Date: _________________', 20, yPosition);
  
  yPosition += 15;
  doc.text('Witness:', 20, yPosition);
  yPosition += 15;
  doc.text('Name: _________________', 20, yPosition);
  yPosition += 7;
  doc.text('Signature: _________________', 20, yPosition);
  yPosition += 7;
  doc.text('Date: _________________', 20, yPosition);
  
  // Save the PDF
  const fileName = `mechanic-employment-contract-${data.mechanicName.replace(/\s+/g, '-')}-${Date.now()}.pdf`;
  doc.save(fileName);
};

// Generate Standard Mechanic PDF as Blob (for uploading/emailing)
export const generateMechanicContractPdfBlob = async (
  data: MechanicContractData
): Promise<{ blob: Blob; fileName: string }> => {
  const doc = new jsPDF();
  // Reuse the same rendering logic by calling the internal builder above
  // Duplicate minimal structure to avoid saving immediately

  doc.setProperties({
    title: 'Mechanic Employment Contract',
    subject: 'Employment Agreement',
    author: data.companyName,
    creator: 'TMS Contract Generator'
  });

  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('MECHANIC EMPLOYMENT CONTRACT', 105, 20, { align: 'center' });
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('EMPLOYMENT AGREEMENT', 105, 35, { align: 'center' });

  let yPosition = 50;
  doc.setFontSize(14); doc.setFont('helvetica', 'bold'); doc.text('Company Information:', 20, yPosition); yPosition += 10;
  doc.setFontSize(10); doc.setFont('helvetica', 'normal');
  yPosition = addWrappedText(doc, `Company Name: ${data.companyName}`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Address: ${data.companyAddress || 'Not specified'}`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Company Registration Number: ${data.companyCRN || 'Not specified'}`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `VAT Number: ${data.companyVAT || 'Not specified'}`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Operating License: ${data.operatingLicense || 'Not specified'}`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Contact Person: ${data.contactPerson || 'Not specified'}`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Phone: ${data.contactPhone || 'Not specified'}`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Email: ${data.contactEmail || 'Not specified'}`, 20, yPosition, 170);
  yPosition += 10;
  doc.setFontSize(14); doc.setFont('helvetica', 'bold'); doc.text('Employee Information:', 20, yPosition); yPosition += 10;
  doc.setFontSize(10); doc.setFont('helvetica', 'normal');
  yPosition = addWrappedText(doc, `Name: ${data.mechanicName}`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Address: ${data.mechanicAddress || 'Not specified'}`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `National Insurance Number: ${data.mechanicNI || 'Not specified'}`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Date of Birth: ${formatDate(data.mechanicDOB)}`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Phone: ${data.mechanicPhone || 'Not specified'}`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Email: ${data.mechanicEmail || 'Not specified'}`, 20, yPosition, 170);
  yPosition += 10;
  doc.setFontSize(14); doc.setFont('helvetica', 'bold'); doc.text('Employment Terms:', 20, yPosition); yPosition += 10;
  doc.setFontSize(10); doc.setFont('helvetica', 'normal');
  yPosition = addWrappedText(doc, `Start Date: ${formatDate(data.startDate)}`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Employment Type: ${data.employmentType.replace('_', ' ').toUpperCase()}`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Working Hours: ${data.startTime} - ${data.endTime}`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Weekly Hours: ${data.weeklyHours} hours`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Overtime Rate: ${data.overtimeRate}x normal rate`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `On-Call Allowance: ${formatCurrency(data.onCallAllowance)} per week`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Call-Out Rate: ${formatCurrency(data.callOutRate)} per hour`, 20, yPosition, 170);

  // Keep rest concise due to space; reuse summary bullets
  yPosition += 10;
  doc.setFontSize(14); doc.setFont('helvetica', 'bold'); doc.text('Salary and Benefits:', 20, yPosition); yPosition += 10;
  doc.setFontSize(10);
  yPosition = addWrappedText(doc, `Annual Salary: ${formatCurrency(data.annualSalary)}`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Payment Frequency: ${data.paymentFrequency}`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Payment Date: ${data.paymentDate}`, 20, yPosition, 170);

  yPosition += 15;
  doc.setFontSize(12); doc.setFont('helvetica', 'bold'); doc.text('Signatures:', 20, yPosition); yPosition += 10;
  doc.setFontSize(10); doc.setFont('helvetica', 'normal');
  doc.text('For and on behalf of ' + data.companyName + ':', 20, yPosition); yPosition += 28;
  doc.text('Employee: ' + data.mechanicName, 20, yPosition);

  const fileName = `mechanic-employment-contract-${data.mechanicName.replace(/\s+/g, '-')}-${Date.now()}.pdf`;
  const blob = doc.output('blob');
  return { blob, fileName };
};

export const uploadContractPdf = async (
  organizationId: string,
  blob: Blob,
  fileName: string,
  subdir: string = 'mechanics'
): Promise<string> => {
  const path = `${subdir}/${organizationId}/${fileName}`;
  const { error } = await supabase.storage.from('documents').upload(path, blob, {
    contentType: 'application/pdf',
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from('documents').getPublicUrl(path);
  return data.publicUrl;
};

// Generate Transport Company Mechanic Contract PDF
export const generateTransportMechanicContractPDF = async (data: TransportMechanicContractData): Promise<void> => {
  const doc = new jsPDF();
  
  // Set document properties
  doc.setProperties({
    title: 'Transport Company Mechanic Employment Contract',
    subject: 'Specialized Employment Agreement for Transport Operations',
    author: data.companyName,
    creator: 'TMS Contract Generator'
  });

  // Add company logo/header space
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('TRANSPORT COMPANY MECHANIC', 105, 20, { align: 'center' });
  doc.text('EMPLOYMENT CONTRACT', 105, 30, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('SPECIALIZED EMPLOYMENT AGREEMENT FOR TRANSPORT OPERATIONS', 105, 45, { align: 'center' });
  
  let yPosition = 60;
  
  // Transport Company Information
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Transport Company Information:', 20, yPosition);
  yPosition += 10;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  yPosition = addWrappedText(doc, `Company Name: ${data.companyName}`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Trading As: ${data.tradingName || 'Not specified'}`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Registered Office: ${data.registeredAddress || 'Not specified'}`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Company Registration Number: ${data.companyCRN || 'Not specified'}`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `VAT Number: ${data.companyVAT || 'Not specified'}`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `O-License Number: ${data.oLicenseNumber}`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `O-License Type: ${data.oLicenseType.toUpperCase()}`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `O-License Expiry: ${formatDate(data.oLicenseExpiry)}`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Transport Manager: ${data.transportManager || 'Not specified'}`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `CPC Qualification: ${data.cpcQualification || 'Not specified'}`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Contact Person: ${data.contactPerson || 'Not specified'}`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Phone: ${data.contactPhone || 'Not specified'}`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Email: ${data.contactEmail || 'Not specified'}`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Emergency Phone: ${data.emergencyPhone || 'Not specified'}`, 20, yPosition, 170);
  
  yPosition += 10;
  
  // Employee Information
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Employee Information:', 20, yPosition);
  yPosition += 10;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  yPosition = addWrappedText(doc, `Name: ${data.mechanicName}`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Address: ${data.mechanicAddress || 'Not specified'}`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `National Insurance Number: ${data.mechanicNI || 'Not specified'}`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Date of Birth: ${formatDate(data.mechanicDOB)}`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Phone: ${data.mechanicPhone || 'Not specified'}`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Email: ${data.mechanicEmail || 'Not specified'}`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Emergency Contact: ${data.emergencyContact || 'Not specified'}`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Emergency Phone: ${data.emergencyPhone || 'Not specified'}`, 20, yPosition, 170);
  
  yPosition += 10;
  
  // Employment Terms
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Employment Terms:', 20, yPosition);
  yPosition += 10;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  yPosition = addWrappedText(doc, `Start Date: ${formatDate(data.startDate)}`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Probation Period: ${data.probationPeriod} months`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Probation Review: ${formatDate(data.probationReview)}`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Confirmation Date: ${formatDate(data.confirmationDate)}`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Working Hours: ${data.startTime} - ${data.endTime}`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Weekly Hours: ${data.weeklyHours} hours`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Overtime Rate: ${data.overtimeRate}x normal rate`, 20, yPosition, 170);
  
  yPosition += 10;
  
  // Transport-Specific Allowances
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Transport-Specific Allowances:', 20, yPosition);
  yPosition += 10;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  yPosition = addWrappedText(doc, `On-Call Allowance: ${formatCurrency(data.onCallAllowance)} per week`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Emergency Call-Out: ${formatCurrency(data.callOutRate)} per hour (minimum 2 hours)`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Weekend Working: ${formatCurrency(data.weekendRate)} per hour`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Bank Holiday Working: ${formatCurrency(data.bankHolidayRate)} per hour`, 20, yPosition, 170);
  
  yPosition += 10;
  
  // Salary and Benefits
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Salary and Benefits:', 20, yPosition);
  yPosition += 10;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  yPosition = addWrappedText(doc, `Annual Salary: ${formatCurrency(data.annualSalary)}`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Hourly Rate: ${formatCurrency(data.hourlyRate)}`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Payment Frequency: ${data.paymentFrequency}`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Payment Date: ${data.paymentDate} of each ${data.paymentFrequency.slice(0, -2)}`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Safety Bonus: ${formatCurrency(data.safetyBonus)} for zero safety incidents`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Efficiency Bonus: ${formatCurrency(data.efficiencyBonus)} for meeting maintenance targets`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Quality Bonus: ${formatCurrency(data.qualityBonus)} for high customer satisfaction`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Annual Performance Bonus: Up to ${formatCurrency(data.annualPerformanceBonus)}`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Tool Allowance: ${formatCurrency(data.toolAllowance)} per annum`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Uniform Allowance: ${formatCurrency(data.uniformAllowance)} per annum`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Pension: ${data.pensionCompany}% company contribution`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Holiday: ${data.holidayDays} days plus bank holidays`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Sick Pay: ${data.sickPayWeeks} weeks full pay plus SSP`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Life Insurance: ${data.lifeInsurance}x annual salary`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Health Insurance: ${data.healthInsurance}`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Training Budget: ${formatCurrency(data.trainingBudget)} per annum`, 20, yPosition, 170);
  
  yPosition += 10;
  
  // Additional Terms
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Additional Terms:', 20, yPosition);
  yPosition += 10;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  yPosition = addWrappedText(doc, `Notice Period: ${data.noticePeriod} weeks`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Non-Competition: ${data.nonCompetitionMonths} months`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Geographic Scope: Within ${data.geographicScope} miles of company operations`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Industry Scope: ${data.industryScope}`, 20, yPosition, 170);
  
  yPosition += 15;
  
  // Transport Terms and Conditions
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Transport Terms and Conditions:', 20, yPosition);
  yPosition += 10;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  yPosition = addWrappedText(doc, '• This contract is governed by English employment law and transport industry regulations', 20, yPosition, 170);
  yPosition = addWrappedText(doc, '• Employee must comply with all DVSA standards and requirements', 20, yPosition, 170);
  yPosition = addWrappedText(doc, '• Employee must support O-License compliance and maintenance', 20, yPosition, 170);
  yPosition = addWrappedText(doc, '• Employee must follow transport industry best practices and procedures', 20, yPosition, 170);
  yPosition = addWrappedText(doc, '• Company will provide training on transport industry regulations', 20, yPosition, 170);
  yPosition = addWrappedText(doc, '• Employee must maintain transport industry qualifications and certifications', 20, yPosition, 170);
  yPosition = addWrappedText(doc, '• Company will ensure compliance with transport industry standards', 20, yPosition, 170);
  yPosition = addWrappedText(doc, '• All company policies, procedures, handbooks, and transport manuals form part of this contract', 20, yPosition, 170);
  yPosition = addWrappedText(doc, '• Employee must comply with all company policies and transport procedures as updated from time to time', 20, yPosition, 170);
  yPosition = addWrappedText(doc, '• Transport-specific policies and procedures are mandatory for all transport operations', 20, yPosition, 170);
  
  yPosition += 10;
  
  // Transport Industry Specific Provisions
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Transport Industry Provisions:', 20, yPosition);
  yPosition += 8;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  yPosition = addWrappedText(doc, '• Specialized workshop facilities for transport operations', 20, yPosition, 170);
  yPosition = addWrappedText(doc, '• DVSA compliance support and training', 20, yPosition, 170);
  yPosition = addWrappedText(doc, '• O-License support and maintenance assistance', 20, yPosition, 170);
  yPosition = addWrappedText(doc, '• Transport industry specific training programs', 20, yPosition, 170);
  yPosition = addWrappedText(doc, '• Emergency response equipment for roadside work', 20, yPosition, 170);
  
  yPosition += 10;
  
  // Transport Mechanic Requirements
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Transport Mechanic Requirements:', 20, yPosition);
  yPosition += 8;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  yPosition = addWrappedText(doc, '• Understanding of transport industry requirements', 20, yPosition, 170);
  yPosition = addWrappedText(doc, '• Knowledge of DVSA standards and procedures', 20, yPosition, 170);
  yPosition = addWrappedText(doc, '• Understanding of O-License requirements', 20, yPosition, 170);
  yPosition = addWrappedText(doc, '• Emergency response skills for transport operations', 20, yPosition, 170);
  yPosition = addWrappedText(doc, '• Roadside safety awareness and procedures', 20, yPosition, 170);
  
  yPosition += 15;
  
  // Transport Industry Notes
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Transport Industry Notes:', 20, yPosition);
  yPosition += 10;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  yPosition = addWrappedText(doc, '• This contract is specifically designed for transport company mechanics', 20, yPosition, 170);
  yPosition = addWrappedText(doc, '• DVSA compliance is mandatory for all maintenance work', 20, yPosition, 170);
  yPosition = addWrappedText(doc, '• O-License compliance is critical for company operations', 20, yPosition, 170);
  yPosition = addWrappedText(doc, '• Health and safety standards are paramount in transport operations', 20, yPosition, 170);
  yPosition = addWrappedText(doc, '• This contract should be reviewed by a qualified employment lawyer', 20, yPosition, 170);
  
  yPosition += 15;
  
  // Signature Section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Signatures:', 20, yPosition);
  yPosition += 10;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('For and on behalf of ' + data.companyName + ':', 20, yPosition);
  yPosition += 15;
  doc.text('Name: _________________', 20, yPosition);
  yPosition += 7;
  doc.text('Position: _________________', 20, yPosition);
  yPosition += 7;
  doc.text('CPC Qualification: ' + (data.cpcQualification || 'Not specified'), 20, yPosition);
  yPosition += 7;
  doc.text('Signature: _________________', 20, yPosition);
  yPosition += 7;
  doc.text('Date: _________________', 20, yPosition);
  
  yPosition += 15;
  doc.text('Employee Mechanic:', 20, yPosition);
  yPosition += 15;
  doc.text('Name: ' + data.mechanicName, 20, yPosition);
  yPosition += 7;
  doc.text('Signature: _________________', 20, yPosition);
  yPosition += 7;
  doc.text('Date: _________________', 20, yPosition);
  
  yPosition += 15;
  doc.text('Witness:', 20, yPosition);
  yPosition += 15;
  doc.text('Name: _________________', 20, yPosition);
  yPosition += 7;
  doc.text('Position: _________________', 20, yPosition);
  yPosition += 7;
  doc.text('Signature: _________________', 20, yPosition);
  yPosition += 7;
  doc.text('Date: _________________', 20, yPosition);
  
  // Save the PDF
  const fileName = `transport-mechanic-contract-${data.mechanicName.replace(/\s+/g, '-')}-${Date.now()}.pdf`;
  doc.save(fileName);
};

export const generateTransportMechanicContractPdfBlob = async (
  data: TransportMechanicContractData
): Promise<{ blob: Blob; fileName: string }> => {
  const doc = new jsPDF();
  doc.setProperties({
    title: 'Transport Company Mechanic Employment Contract',
    subject: 'Specialized Employment Agreement for Transport Operations',
    author: data.companyName,
    creator: 'TMS Contract Generator'
  });
  doc.setFontSize(18); doc.setFont('helvetica', 'bold');
  doc.text('TRANSPORT COMPANY MECHANIC', 105, 20, { align: 'center' });
  doc.text('EMPLOYMENT CONTRACT', 105, 30, { align: 'center' });
  let yPosition = 45;
  doc.setFontSize(10); doc.setFont('helvetica', 'normal');
  yPosition = addWrappedText(doc, `Company: ${data.companyName}`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `O-License: ${data.oLicenseNumber} (${data.oLicenseType})`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Mechanic: ${data.mechanicName}`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Start Date: ${formatDate(data.startDate)}`, 20, yPosition, 170);

  yPosition += 10;
  doc.setFontSize(12); doc.setFont('helvetica', 'bold'); doc.text('Key Terms', 20, yPosition); yPosition += 8;
  doc.setFontSize(9);
  yPosition = addWrappedText(doc, `Hours: ${data.startTime}-${data.endTime}, Weekly: ${data.weeklyHours}`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Allowances: On-call ${formatCurrency(data.onCallAllowance)}, Call-out ${formatCurrency(data.callOutRate)}/h`, 20, yPosition, 170);
  yPosition = addWrappedText(doc, `Bonuses: Safety ${formatCurrency(data.safetyBonus)}, Efficiency ${formatCurrency(data.efficiencyBonus)}, Quality ${formatCurrency(data.qualityBonus)}`, 20, yPosition, 170);

  yPosition += 12;
  doc.setFontSize(12); doc.setFont('helvetica', 'bold'); doc.text('Compliance', 20, yPosition); yPosition += 8;
  doc.setFontSize(9);
  yPosition = addWrappedText(doc, 'Employee must comply with DVSA standards and support O-License compliance. Workshop and roadside safety procedures apply.', 20, yPosition, 170);

  const fileName = `transport-mechanic-contract-${data.mechanicName.replace(/\s+/g, '-')}-${Date.now()}.pdf`;
  const blob = doc.output('blob');
  return { blob, fileName };
};
