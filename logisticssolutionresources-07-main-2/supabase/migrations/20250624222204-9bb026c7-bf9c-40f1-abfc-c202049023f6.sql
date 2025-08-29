
-- Add bidding-related columns to the jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS is_bidding_enabled BOOLEAN DEFAULT false;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS max_bid_amount DECIMAL(10,2);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS bidding_deadline TIMESTAMP WITH TIME ZONE;

-- Create job_bids table for storing driver bids
CREATE TABLE IF NOT EXISTS job_bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  driver_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  bid_amount DECIMAL(10,2) NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(job_id, driver_id)
);

-- Enable RLS on job_bids table
ALTER TABLE job_bids ENABLE ROW LEVEL SECURITY;

-- Create policies for job_bids
CREATE POLICY "Drivers can view bids for jobs they can see" 
  ON job_bids 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE id = job_bids.job_id 
      AND (driver_id = auth.uid() OR is_bidding_enabled = true)
    )
  );

CREATE POLICY "Drivers can create their own bids" 
  ON job_bids 
  FOR INSERT 
  WITH CHECK (driver_id = auth.uid());

CREATE POLICY "Drivers can update their own pending bids" 
  ON job_bids 
  FOR UPDATE 
  USING (driver_id = auth.uid() AND status = 'pending');

CREATE POLICY "Admins and council can manage all bids" 
  ON job_bids 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'council')
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_job_bids_job_id ON job_bids(job_id);
CREATE INDEX IF NOT EXISTS idx_job_bids_driver_id ON job_bids(driver_id);
CREATE INDEX IF NOT EXISTS idx_job_bids_status ON job_bids(status);
CREATE INDEX IF NOT EXISTS idx_jobs_bidding ON jobs(is_bidding_enabled, bidding_deadline) WHERE is_bidding_enabled = true;
