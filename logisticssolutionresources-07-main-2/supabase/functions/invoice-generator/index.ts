import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InvoiceRequest {
  customer_id?: string
  job_id?: string
  booking_id?: string
  amount: number
  tax_rate?: number
  due_days?: number
  items?: Array<{
    description: string
    quantity: number
    unit_price: number
    total: number
  }>
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { 
        autoRefreshToken: false, 
        persistSession: false 
      },
      global: {
        headers: { Authorization: req.headers.get('Authorization')! }
      }
    })

    // Get user from request
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return new Response('Unauthorized', { 
        status: 401, 
        headers: corsHeaders 
      })
    }

    // Get organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!profile?.organization_id) {
      return new Response('Organization not found', { 
        status: 400, 
        headers: corsHeaders 
      })
    }

    const invoiceData: InvoiceRequest = await req.json()

    // Generate invoice number
    const { data: invoiceNumber, error: numberError } = await supabase
      .rpc('generate_invoice_number')

    if (numberError) {
      console.error('Error generating invoice number:', numberError)
      return new Response('Failed to generate invoice number', { 
        status: 500, 
        headers: corsHeaders 
      })
    }

    // Calculate tax and total
    const taxRate = invoiceData.tax_rate || 0.20 // 20% default VAT
    const taxAmount = invoiceData.amount * taxRate
    const totalAmount = invoiceData.amount + taxAmount

    // Create due date
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + (invoiceData.due_days || 30))

    // Insert invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        invoice_number: invoiceNumber,
        customer_id: invoiceData.customer_id,
        organization_id: profile.organization_id,
        job_id: invoiceData.job_id,
        booking_id: invoiceData.booking_id,
        amount: invoiceData.amount,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        due_date: dueDate.toISOString().split('T')[0],
        status: 'draft'
      })
      .select()
      .single()

    if (invoiceError) {
      console.error('Error creating invoice:', invoiceError)
      return new Response('Failed to create invoice', { 
        status: 500, 
        headers: corsHeaders 
      })
    }

    // Create invoice items if provided
    if (invoiceData.items && invoiceData.items.length > 0) {
      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(
          invoiceData.items.map(item => ({
            invoice_id: invoice.id,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total: item.total
          }))
        )

      if (itemsError) {
        console.error('Error creating invoice items:', itemsError)
      }
    }

    // Log activity
    await supabase.rpc('log_user_activity', {
      p_user_id: user.id,
      p_action: 'invoice_created',
      p_resource_type: 'invoice',
      p_resource_id: invoice.id,
      p_metadata: { invoice_number: invoiceNumber, amount: totalAmount }
    })

    console.log(`Invoice ${invoiceNumber} created successfully`)

    return new Response(JSON.stringify({
      success: true,
      invoice: {
        id: invoice.id,
        invoice_number: invoiceNumber,
        amount: invoiceData.amount,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        due_date: dueDate.toISOString().split('T')[0],
        status: 'draft'
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Invoice generation error:', error)
    return new Response('Internal server error', { 
      status: 500, 
      headers: corsHeaders 
    })
  }
})