/*
  # Authentication and Authorization Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, matches auth.users)
      - `username` (text, unique)
      - `full_name` (text)
      - `avatar_url` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `access_levels`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `description` (text)
      - `created_at` (timestamp)
    
    - `user_access_levels`
      - `profile_id` (uuid, references profiles)
      - `access_level_id` (uuid, references access_levels)
      - `granted_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Add policies for admin access
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create access_levels table
CREATE TABLE IF NOT EXISTS access_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create user_access_levels junction table
CREATE TABLE IF NOT EXISTS user_access_levels (
  profile_id uuid REFERENCES profiles ON DELETE CASCADE,
  access_level_id uuid REFERENCES access_levels ON DELETE CASCADE,
  granted_at timestamptz DEFAULT now(),
  PRIMARY KEY (profile_id, access_level_id)
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_access_levels ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Access levels policies
CREATE POLICY "Anyone can view access levels"
  ON access_levels
  FOR SELECT
  TO authenticated
  USING (true);

-- User access levels policies
CREATE POLICY "Users can view their own access levels"
  ON user_access_levels
  FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

-- Insert default access levels
INSERT INTO access_levels (name, description) VALUES
  ('social', 'Access to social features and community'),
  ('trading', 'Access to trading platform and execution'),
  ('market_view', 'Access to market analysis and data'),
  ('pnl_view', 'Access to PnL and portfolio tracking'),
  ('kol_calls', 'Access to KOL calls and signals');