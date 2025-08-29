-- Remove all mock data from the backend while preserving table structures

-- Remove all mock/sample vehicle data
DELETE FROM vehicles;

-- Remove all mock job assignments first (due to foreign key constraints)
DELETE FROM job_assignments;

-- Remove all mock jobs
DELETE FROM jobs;

-- Remove all mock routes and related data
DELETE FROM route_assignments;
DELETE FROM route_stops;
DELETE FROM route_students;
DELETE FROM routes;

-- Remove all mock driver assignments
DELETE FROM driver_assignments;

-- Remove all mock customer and booking data
DELETE FROM customer_bookings;
DELETE FROM customer_profiles;
DELETE FROM customers;
DELETE FROM bookings;

-- Remove all mock compliance and vehicle related data
DELETE FROM compliance_violations;
DELETE FROM compliance_alerts;
DELETE FROM vehicle_inspections;
DELETE FROM inspection_questions;
DELETE FROM vehicle_checks;
DELETE FROM vehicle_documents;
DELETE FROM fuel_records;
DELETE FROM fuel_transactions;
DELETE FROM maintenance_schedules;

-- Remove all mock driver and user related data (except keep role_permissions)
DELETE FROM driver_licenses;
DELETE FROM driver_locations;
DELETE FROM driver_settings;
DELETE FROM driver_compliance_scores;
DELETE FROM driver_points_history;
DELETE FROM driver_risk_scores;

-- Remove all mock child and student data
DELETE FROM child_tracking;
DELETE FROM child_profiles;
DELETE FROM student_pickups;
DELETE FROM students;
DELETE FROM daily_attendance;

-- Remove all mock notification and messaging data
DELETE FROM notifications;
DELETE FROM enhanced_notifications;
DELETE FROM parent_notifications;
DELETE FROM messages;
DELETE FROM email_logs;

-- Remove all mock document data
DELETE FROM documents;
DELETE FROM document_folders;
DELETE FROM document_approvals;

-- Remove all mock mechanic and maintenance data
DELETE FROM mechanics;

-- Remove all mock tachograph data
DELETE FROM tachograph_issues;
DELETE FROM tachograph_records;

-- Remove all mock profile data (test users)
DELETE FROM profiles;

-- Remove all mock organization data
DELETE FROM organizations;

-- Remove all audit and log data (as it's related to mock operations)
DELETE FROM audit_logs;
DELETE FROM security_audit_logs;
DELETE FROM compliance_audit_logs;

-- Remove all mock AI and background task data
DELETE FROM ai_context;
DELETE FROM ai_insights;
DELETE FROM ai_tasks;
DELETE FROM background_tasks;

-- Remove all session and auth related data from mock users
DELETE FROM user_sessions;
DELETE FROM password_reset_tokens;
DELETE FROM auth_audit_log;

-- Remove all app settings related to mock data
DELETE FROM app_settings;

-- Remove all mock time tracking data
DELETE FROM time_entries;
DELETE FROM time_off_requests;

-- Remove all mock geofence and location data
DELETE FROM geofences;
DELETE FROM vehicle_locations;

-- Remove all mock invoice and payment data
DELETE FROM invoices;
DELETE FROM payments;

-- Remove all mock DBS check data
DELETE FROM dbs_status_history;
DELETE FROM dbs_documents;
DELETE FROM dbs_checks;

-- Remove all mock onboarding data
DELETE FROM driver_onboarding_submissions;
DELETE FROM driver_onboardings;
DELETE FROM onboarding_forms;

-- Remove all mock daily metrics
DELETE FROM daily_performance_metrics;

-- Reset auto-increment sequences where applicable
-- Note: Most tables use UUID primary keys, but some might use serial

-- Keep essential reference data like:
-- - role_permissions (system configuration)
-- - license_categories (reference data)
-- - Any other system/configuration tables

VACUUM ANALYZE;