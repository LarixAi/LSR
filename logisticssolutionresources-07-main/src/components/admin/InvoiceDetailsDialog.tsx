import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency } from '@/utils/currencyFormatter';
import { Download, Mail, FileText, Send, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Invoice {
  id: string;
  invoice_number: string;
  customer_id: string | null;
  job_id: string | null;
  booking_id: string | null;
  amount: number;
  tax_amount: number | null;
  total_amount: number;
  status: string;
  due_date: string | null;
  issued_date: string;
  paid_date: string | null;
  payment_method: string | null;
  notes: string | null;
  created_at: string;
}

interface InvoiceDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice | null;
}

export const InvoiceDetailsDialog: React.FC<InvoiceDetailsDialogProps> = ({
  open,
  onOpenChange,
  invoice,
}) => {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailForm, setEmailForm] = useState({
    recipientEmail: '',
    recipientName: '',
    subject: '',
    message: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  if (!invoice) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'sent':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleDownload = () => {
    // Generate and download invoice as HTML
    const invoiceHTML = generateInvoiceHTML(invoice);
    const blob = new Blob([invoiceHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${invoice.invoice_number}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSendEmail = async () => {
    if (!emailForm.recipientEmail) {
      toast({
        title: "Error",
        description: "Please enter a recipient email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-invoice-email', {
        body: {
          invoiceId: invoice.id,
          recipientEmail: emailForm.recipientEmail,
          recipientName: emailForm.recipientName,
          subject: emailForm.subject,
          message: emailForm.message,
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Invoice email sent successfully!",
      });

      setShowEmailForm(false);
      setEmailForm({ recipientEmail: '', recipientName: '', subject: '', message: '' });
    } catch (error: any) {
      console.error('Error sending email:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send invoice email",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateInvoiceHTML = (invoice: Invoice): string => {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice ${invoice.invoice_number}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
        .header { text-align: center; margin-bottom: 40px; }
        .company-name { font-size: 24px; font-weight: bold; color: #2563eb; }
        .invoice-title { font-size: 32px; margin: 20px 0; }
        .invoice-details { margin: 30px 0; }
        .invoice-table { width: 100%; border-collapse: collapse; margin: 30px 0; }
        .invoice-table th, .invoice-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        .invoice-table th { background-color: #f8f9fa; font-weight: bold; }
        .total-row { font-weight: bold; font-size: 1.1em; border-top: 2px solid #333; }
        .payment-info { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-name">Your Transport Company</div>
        <div class="invoice-title">INVOICE</div>
    </div>
    
    <div class="invoice-details">
        <table style="width: 100%;">
            <tr>
                <td style="width: 50%;">
                    <strong>Invoice Number:</strong> ${invoice.invoice_number}<br>
                    <strong>Issue Date:</strong> ${new Date(invoice.issued_date).toLocaleDateString('en-GB')}<br>
                    <strong>Due Date:</strong> ${invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('en-GB') : 'Upon receipt'}<br>
                    <strong>Status:</strong> ${invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                </td>
                <td style="width: 50%; text-align: right;">
                    <strong>Bill To:</strong><br>
                    Customer<br>
                    [Customer Address]
                </td>
            </tr>
        </table>
    </div>

    <table class="invoice-table">
        <thead>
            <tr>
                <th>Description</th>
                <th>Amount</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Transport Services</td>
                <td>£${invoice.amount.toFixed(2)}</td>
            </tr>
        </tbody>
        <tfoot>
            <tr>
                <td><strong>Subtotal (excl. VAT):</strong></td>
                <td><strong>£${invoice.amount.toFixed(2)}</strong></td>
            </tr>
            <tr>
                <td><strong>VAT (20%):</strong></td>
                <td><strong>£${(invoice.tax_amount || invoice.amount * 0.2).toFixed(2)}</strong></td>
            </tr>
            <tr class="total-row">
                <td><strong>Total (incl. VAT):</strong></td>
                <td><strong>£${invoice.total_amount.toFixed(2)}</strong></td>
            </tr>
        </tfoot>
    </table>

    <div class="payment-info">
        <h3>Payment Information</h3>
        <p>Please make payment by the due date shown above.</p>
        <p>If you have any questions about this invoice, please contact us.</p>
        ${invoice.notes ? `<p><strong>Notes:</strong> ${invoice.notes}</p>` : ''}
    </div>
</body>
</html>
    `;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Invoice Details - {invoice.invoice_number}</span>
            <Badge className={getStatusColor(invoice.status)}>
              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download HTML
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowEmailForm(!showEmailForm)}
              disabled={isLoading}
            >
              <Mail className="w-4 h-4 mr-2" />
              {showEmailForm ? 'Cancel Email' : 'Send Email'}
            </Button>
          </div>

          {/* Email Form */}
          {showEmailForm && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Send className="w-5 h-5 mr-2" />
                  Send Invoice via Email
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Recipient Email <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="email"
                      placeholder="customer@example.com"
                      value={emailForm.recipientEmail}
                      onChange={(e) => setEmailForm(prev => ({ ...prev, recipientEmail: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Recipient Name</label>
                    <Input
                      placeholder="Customer Name"
                      value={emailForm.recipientName}
                      onChange={(e) => setEmailForm(prev => ({ ...prev, recipientName: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Subject</label>
                  <Input
                    placeholder={`Invoice ${invoice.invoice_number} from Your Transport Company`}
                    value={emailForm.subject}
                    onChange={(e) => setEmailForm(prev => ({ ...prev, subject: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Custom Message</label>
                  <Textarea
                    placeholder="Add a personal message (optional)"
                    value={emailForm.message}
                    onChange={(e) => setEmailForm(prev => ({ ...prev, message: e.target.value }))}
                    rows={4}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowEmailForm(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSendEmail} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Invoice
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Invoice Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Invoice Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Invoice Number</label>
                    <p className="text-lg font-semibold">{invoice.invoice_number}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Issue Date</label>
                    <p>{new Date(invoice.issued_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Due Date</label>
                    <p>{invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'Not set'}</p>
                  </div>
                  {invoice.paid_date && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Paid Date</label>
                      <p className="text-green-600 font-medium">
                        {new Date(invoice.paid_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <div className="mt-1">
                      <Badge className={getStatusColor(invoice.status)}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  {invoice.payment_method && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Payment Method</label>
                      <p className="capitalize">{invoice.payment_method}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-600">Created</label>
                    <p>{new Date(invoice.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {invoice.notes && (
                <div className="mt-6">
                  <label className="text-sm font-medium text-gray-600">Notes</label>
                  <p className="mt-1 p-3 bg-gray-50 rounded-md text-sm">{invoice.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Linked Records */}
          {(invoice.customer_id || invoice.job_id || invoice.booking_id) && (
            <Card>
              <CardHeader>
                <CardTitle>Linked Records</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {invoice.customer_id && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Customer ID</label>
                      <p className="font-mono text-sm">{invoice.customer_id}</p>
                    </div>
                  )}
                  {invoice.job_id && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Job ID</label>
                      <p className="font-mono text-sm">{invoice.job_id}</p>
                    </div>
                  )}
                  {invoice.booking_id && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Booking ID</label>
                      <p className="font-mono text-sm">{invoice.booking_id}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Financial Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal (excl. VAT):</span>
                  <span>{formatCurrency(invoice.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">VAT (20%):</span>
                  <span>{formatCurrency(invoice.tax_amount || invoice.amount * 0.2)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total (incl. VAT):</span>
                    <span>{formatCurrency(invoice.total_amount)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};