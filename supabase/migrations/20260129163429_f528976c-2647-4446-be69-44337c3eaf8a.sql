-- Fix: Update properties status constraint to include 'reserved'
-- This allows the Dashboard to toggle between 'active' and 'reserved' statuses

ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_status_check;
ALTER TABLE properties ADD CONSTRAINT properties_status_check 
  CHECK (status IN ('active', 'pending', 'expired', 'reserved'));