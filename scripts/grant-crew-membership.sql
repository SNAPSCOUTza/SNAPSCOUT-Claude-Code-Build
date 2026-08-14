-- Grant Crew Membership to user e97bbc1b-e93d-41eb-8b10-abe36724c549
-- This script inserts an active subscription with a 1-year validity

INSERT INTO user_subscriptions (
  id,
  user_id,
  plan_name,
  plan_code,
  status,
  amount,
  currency,
  start_date,
  current_period_start,
  current_period_end,
  next_payment_date,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'e97bbc1b-e93d-41eb-8b10-abe36724c549',
  'Crew Membership',
  'crew',
  'active',
  129.00,
  'ZAR',
  NOW(),
  NOW(),
  NOW() + INTERVAL '1 year',
  NOW() + INTERVAL '1 year',
  NOW(),
  NOW()
)
ON CONFLICT (user_id) 
DO UPDATE SET
  plan_name = 'Crew Membership',
  plan_code = 'crew',
  status = 'active',
  amount = 129.00,
  currency = 'ZAR',
  current_period_start = NOW(),
  current_period_end = NOW() + INTERVAL '1 year',
  next_payment_date = NOW() + INTERVAL '1 year',
  updated_at = NOW();
