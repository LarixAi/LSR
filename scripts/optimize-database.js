#!/usr/bin/env node

/**
 * LSR Transport Database Optimization Script
 * Adds performance indexes and optimizes queries
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Performance optimization queries
const optimizationQueries = [
  // Organizations table indexes
  {
    name: 'Organizations - Name Index',
    query: 'CREATE INDEX IF NOT EXISTS idx_organizations_name ON organizations(name);'
  },
  {
    name: 'Organizations - Slug Index',
    query: 'CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);'
  },
  {
    name: 'Organizations - Active Status Index',
    query: 'CREATE INDEX IF NOT EXISTS idx_organizations_is_active ON organizations(is_active);'
  },

  // Profiles table indexes
  {
    name: 'Profiles - Email Index',
    query: 'CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);'
  },
  {
    name: 'Profiles - Organization Index',
    query: 'CREATE INDEX IF NOT EXISTS idx_profiles_organization_id ON profiles(organization_id);'
  },
  {
    name: 'Profiles - Role Index',
    query: 'CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);'
  },
  {
    name: 'Profiles - Active Status Index',
    query: 'CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON profiles(is_active);'
  },

  // Vehicles table indexes
  {
    name: 'Vehicles - Organization Index',
    query: 'CREATE INDEX IF NOT EXISTS idx_vehicles_organization_id ON vehicles(organization_id);'
  },
  {
    name: 'Vehicles - Status Index',
    query: 'CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);'
  },
  {
    name: 'Vehicles - License Plate Index',
    query: 'CREATE INDEX IF NOT EXISTS idx_vehicles_license_plate ON vehicles(license_plate);'
  },

  // Financial tables indexes
  {
    name: 'Invoices - Organization Index',
    query: 'CREATE INDEX IF NOT EXISTS idx_invoices_organization_id ON invoices(organization_id);'
  },
  {
    name: 'Invoices - Status Index',
    query: 'CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);'
  },
  {
    name: 'Invoices - Date Index',
    query: 'CREATE INDEX IF NOT EXISTS idx_invoices_invoice_date ON invoices(invoice_date);'
  },
  {
    name: 'Quotations - Organization Index',
    query: 'CREATE INDEX IF NOT EXISTS idx_quotations_organization_id ON quotations(organization_id);'
  },
  {
    name: 'Quotations - Status Index',
    query: 'CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);'
  },

  // Compliance tables indexes
  {
    name: 'Vehicle Inspections - Organization Index',
    query: 'CREATE INDEX IF NOT EXISTS idx_vehicle_inspections_organization_id ON vehicle_inspections(organization_id);'
  },
  {
    name: 'Vehicle Inspections - Vehicle Index',
    query: 'CREATE INDEX IF NOT EXISTS idx_vehicle_inspections_vehicle_id ON vehicle_inspections(vehicle_id);'
  },
  {
    name: 'Vehicle Inspections - Date Index',
    query: 'CREATE INDEX IF NOT EXISTS idx_vehicle_inspections_inspection_date ON vehicle_inspections(inspection_date);'
  },
  {
    name: 'Tachograph Records - Organization Index',
    query: 'CREATE INDEX IF NOT EXISTS idx_tachograph_records_organization_id ON tachograph_records(organization_id);'
  },
  {
    name: 'Tachograph Records - Driver Index',
    query: 'CREATE INDEX IF NOT EXISTS idx_tachograph_records_driver_id ON tachograph_records(driver_id);'
  },
  {
    name: 'Tachograph Records - Date Index',
    query: 'CREATE INDEX IF NOT EXISTS idx_tachograph_records_record_date ON tachograph_records(record_date);'
  },

  // Operations tables indexes
  {
    name: 'Work Orders - Organization Index',
    query: 'CREATE INDEX IF NOT EXISTS idx_work_orders_organization_id ON work_orders(organization_id);'
  },
  {
    name: 'Work Orders - Status Index',
    query: 'CREATE INDEX IF NOT EXISTS idx_work_orders_status ON work_orders(status);'
  },
  {
    name: 'Work Orders - Vehicle Index',
    query: 'CREATE INDEX IF NOT EXISTS idx_work_orders_vehicle_id ON work_orders(vehicle_id);'
  },
  {
    name: 'Defect Reports - Organization Index',
    query: 'CREATE INDEX IF NOT EXISTS idx_defect_reports_organization_id ON defect_reports(organization_id);'
  },
  {
    name: 'Defect Reports - Status Index',
    query: 'CREATE INDEX IF NOT EXISTS idx_defect_reports_status ON defect_reports(status);'
  },
  {
    name: 'Parts Inventory - Organization Index',
    query: 'CREATE INDEX IF NOT EXISTS idx_parts_inventory_organization_id ON parts_inventory(organization_id);'
  },
  {
    name: 'Parts Inventory - Category Index',
    query: 'CREATE INDEX IF NOT EXISTS idx_parts_inventory_category ON parts_inventory(category);'
  },

  // Customer tables indexes
  {
    name: 'Support Tickets - Organization Index',
    query: 'CREATE INDEX IF NOT EXISTS idx_support_tickets_organization_id ON support_tickets(organization_id);'
  },
  {
    name: 'Support Tickets - Status Index',
    query: 'CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);'
  },
  {
    name: 'Support Tickets - Priority Index',
    query: 'CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority);'
  },
  {
    name: 'Customer Bookings - Organization Index',
    query: 'CREATE INDEX IF NOT EXISTS idx_customer_bookings_organization_id ON customer_bookings(organization_id);'
  },
  {
    name: 'Customer Bookings - Status Index',
    query: 'CREATE INDEX IF NOT EXISTS idx_customer_bookings_status ON customer_bookings(status);'
  },
  {
    name: 'Customer Bookings - Date Index',
    query: 'CREATE INDEX IF NOT EXISTS idx_customer_bookings_booking_date ON customer_bookings(booking_date);'
  },

  // Advanced features indexes
  {
    name: 'Vehicle Check Templates - Organization Index',
    query: 'CREATE INDEX IF NOT EXISTS idx_vehicle_check_templates_organization_id ON vehicle_check_templates(organization_id);'
  },
  {
    name: 'Vehicle Check Templates - Category Index',
    query: 'CREATE INDEX IF NOT EXISTS idx_vehicle_check_templates_category ON vehicle_check_templates(category);'
  },
  {
    name: 'Vehicle Check Questions - Template Index',
    query: 'CREATE INDEX IF NOT EXISTS idx_vehicle_check_questions_template_id ON vehicle_check_questions(template_id);'
  },
  {
    name: 'Rail Replacement Services - Organization Index',
    query: 'CREATE INDEX IF NOT EXISTS idx_rail_replacement_services_organization_id ON rail_replacement_services(organization_id);'
  },
  {
    name: 'Rail Replacement Services - Status Index',
    query: 'CREATE INDEX IF NOT EXISTS idx_rail_replacement_services_status ON rail_replacement_services(status);'
  },

  // Composite indexes for common query patterns
  {
    name: 'Profiles - Organization and Role Composite Index',
    query: 'CREATE INDEX IF NOT EXISTS idx_profiles_org_role ON profiles(organization_id, role);'
  },
  {
    name: 'Vehicles - Organization and Status Composite Index',
    query: 'CREATE INDEX IF NOT EXISTS idx_vehicles_org_status ON vehicles(organization_id, status);'
  },
  {
    name: 'Invoices - Organization and Status Composite Index',
    query: 'CREATE INDEX IF NOT EXISTS idx_invoices_org_status ON invoices(organization_id, status);'
  },
  {
    name: 'Work Orders - Organization and Status Composite Index',
    query: 'CREATE INDEX IF NOT EXISTS idx_work_orders_org_status ON work_orders(organization_id, status);'
  },
  {
    name: 'Support Tickets - Organization and Status Composite Index',
    query: 'CREATE INDEX IF NOT EXISTS idx_support_tickets_org_status ON support_tickets(organization_id, status);'
  }
];

async function runOptimization() {
  console.log('🚀 Starting Database Optimization...\n');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const optimization of optimizationQueries) {
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: optimization.query });
      
      if (error) {
        console.log(`❌ ${optimization.name}: ${error.message}`);
        errorCount++;
      } else {
        console.log(`✅ ${optimization.name}`);
        successCount++;
      }
    } catch (error) {
      console.log(`❌ ${optimization.name}: ${error.message}`);
      errorCount++;
    }
  }
  
  console.log('\n📊 Optimization Summary:');
  console.log(`Successful: ${successCount}`);
  console.log(`Failed: ${errorCount}`);
  console.log(`Total: ${optimizationQueries.length}`);
  
  if (errorCount === 0) {
    console.log('\n🎉 Database optimization completed successfully!');
  } else {
    console.log('\n⚠️  Some optimizations failed. Check the errors above.');
  }
}

// Run optimization if this file is executed directly
if (require.main === module) {
  runOptimization().catch(error => {
    console.error('💥 Optimization failed:', error);
    process.exit(1);
  });
}

module.exports = {
  runOptimization,
  optimizationQueries
};
