import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InvoiceEmailRequest {
  invoiceId: string;
  recipientEmail: string;
  recipientName?: string;
  subject?: string;
  message?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { invoiceId, recipientEmail, recipientName, subject, message }: InvoiceEmailRequest = await req.json();

    console.log("Sending invoice email for:", invoiceId);

    // Fetch invoice details
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();

    if (invoiceError || !invoice) {
      console.error("Invoice not found:", invoiceError);
      return new Response(
        JSON.stringify({ error: "Invoice not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Generate PDF content (simple HTML for now, can be enhanced with proper PDF generation)
    const invoiceHTML = generateInvoiceHTML(invoice);
    
    const defaultSubject = `Invoice ${invoice.invoice_number} from Your Transport Company`;
    const defaultMessage = `
Dear ${recipientName || 'Valued Customer'},

Please find attached your invoice ${invoice.invoice_number}.

Invoice Details:
- Invoice Number: ${invoice.invoice_number}
- Amount: £${invoice.total_amount.toFixed(2)}
- Due Date: ${invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('en-GB') : 'Upon receipt'}

If you have any questions about this invoice, please don't hesitate to contact us.

Best regards,
Your Transport Team
    `;

    const emailResponse = await resend.emails.send({
      from: "Transport Company <invoices@resend.dev>", // Update with your verified domain
      to: [recipientEmail],
      subject: subject || defaultSubject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Invoice ${invoice.invoice_number}</h2>
          <div style="white-space: pre-line; color: #666; line-height: 1.6;">
            ${message || defaultMessage}
          </div>
          
          <div style="margin-top: 30px; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
            <h3 style="margin-top: 0; color: #333;">Invoice Summary</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Invoice Number:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${invoice.invoice_number}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Issue Date:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${new Date(invoice.issued_date).toLocaleDateString('en-GB')}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Due Date:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('en-GB') : 'Upon receipt'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Subtotal (excl. VAT):</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">£${invoice.amount.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>VAT (20%):</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">£${(invoice.tax_amount || invoice.amount * 0.2).toFixed(2)}</td>
              </tr>
              <tr style="font-weight: bold; font-size: 1.1em;">
                <td style="padding: 12px 0; border-top: 2px solid #333;"><strong>Total (incl. VAT):</strong></td>
                <td style="padding: 12px 0; border-top: 2px solid #333;">£${invoice.total_amount.toFixed(2)}</td>
              </tr>
            </table>
          </div>
          
          <div style="margin-top: 30px; padding: 15px; background-color: #e8f4fd; border-left: 4px solid #2563eb; border-radius: 4px;">
            <p style="margin: 0; color: #1e40af;">
              <strong>Payment Instructions:</strong><br>
              Please make payment by the due date. If you have any questions about this invoice, please contact us immediately.
            </p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `invoice-${invoice.invoice_number}.html`,
          content: Buffer.from(invoiceHTML).toString('base64'),
          type: 'text/html',
        },
      ],
    });

    console.log("Email sent successfully:", emailResponse);

    // Update invoice status to indicate it was sent
    await supabase
      .from('invoices')
      .update({ 
        status: 'sent',
        updated_at: new Date().toISOString()
      })
      .eq('id', invoiceId);

    return new Response(JSON.stringify({ 
      success: true, 
      emailResponse,
      message: "Invoice email sent successfully"
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-invoice-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

function generateInvoiceHTML(invoice: any): string {
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
}

serve(handler);