ALTER TABLE rush_delivery_config 
  ADD COLUMN IF NOT EXISTS rush_fee_same_day_small_medium numeric DEFAULT 95.00,
  ADD COLUMN IF NOT EXISTS rush_fee_same_day_large numeric DEFAULT 145.00,
  ADD COLUMN IF NOT EXISTS rush_fee_priority_next_day numeric DEFAULT 45.00;

UPDATE rush_delivery_config SET 
  rush_fee_same_day = 95.00,
  rush_fee_same_day_small_medium = 95.00,
  rush_fee_same_day_large = 145.00,
  rush_fee_priority = 45.00,
  rush_fee_priority_next_day = 45.00,
  rush_fee_after_hours = 195.00,
  rush_fee_next_day = 0.00;