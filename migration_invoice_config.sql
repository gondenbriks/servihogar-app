-- Migration to add invoice configuration fields to business_profiles table

ALTER TABLE business_profiles 
ADD COLUMN IF NOT EXISTS invoice_terms TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS invoice_footer TEXT DEFAULT '';
