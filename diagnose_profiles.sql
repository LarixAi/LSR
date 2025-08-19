-- Diagnostic script to check profiles and auth users
-- Run this in Supabase SQL Editor to see what's in the database

-- Check all profiles
SELECT 'PROFILES' as table_name, id, email, first_name, last_name, role, created_at
FROM public.profiles
ORDER BY created_at DESC;

-- Check for any profiles with test driver email
SELECT 'TEST DRIVER PROFILES' as table_name, id, email, first_name, last_name, role, created_at
FROM public.profiles
WHERE email ILIKE '%testdriver%'
ORDER BY created_at DESC;

-- Check for orphaned profiles (profiles without corresponding auth users)
SELECT 'ORPHANED PROFILES' as table_name, p.id, p.email, p.first_name, p.last_name, p.role
FROM public.profiles p
LEFT JOIN auth.users u ON p.id = u.id
WHERE u.id IS NULL;

-- Check for orphaned auth users (auth users without corresponding profiles)
SELECT 'ORPHANED AUTH USERS' as table_name, u.id, u.email, u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- Check for the specific problematic ID
SELECT 'SPECIFIC ID CHECK' as table_name, 
       CASE 
         WHEN EXISTS(SELECT 1 FROM public.profiles WHERE id = 'a356131a-c5d0-4084-8648-49a3158ee9b9') 
         THEN 'EXISTS IN PROFILES' 
         ELSE 'NOT IN PROFILES' 
       END as profile_status,
       CASE 
         WHEN EXISTS(SELECT 1 FROM auth.users WHERE id = 'a356131a-c5d0-4084-8648-49a3158ee9b9') 
         THEN 'EXISTS IN AUTH USERS' 
         ELSE 'NOT IN AUTH USERS' 
       END as auth_status;

