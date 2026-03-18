-- Migration 004: Re-add email_preferences column after user_profiles table recreation
-- Migration 003 recreated the user_profiles table without the email_preferences column
-- This migration adds it back

ALTER TABLE user_profiles ADD COLUMN email_preferences TEXT DEFAULT '{"marketing_emails": true}';
