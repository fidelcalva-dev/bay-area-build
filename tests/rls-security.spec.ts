import { test, expect } from '../playwright-fixture';
import { createClient } from '@supabase/supabase-js';

// Test Supabase RLS policies
// These tests verify that security policies are correctly enforced

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://tvcwzohfycwfaqjyruow.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2Y3d6b2hmeWN3ZmFxanlydW93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwODY0MDcsImV4cCI6MjA4MzY2MjQwN30.nOC0zXQJAFgifiCtyfbJejiIlq5etf32EZm7Ma6sVfE';

test.describe('RLS Security - Quotes Table', () => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  test('Public can create a quote (INSERT allowed)', async () => {
    const testQuote = {
      zip_code: '90210',
      material_type: 'general',
      subtotal: 450,
      estimated_min: 400,
      estimated_max: 500,
      rental_days: 7,
      status: 'pending'
    };

    const { data, error } = await supabase
      .from('quotes')
      .insert(testQuote)
      .select()
      .single();

    // INSERT should succeed
    expect(error).toBeNull();
    expect(data).not.toBeNull();
    expect(data?.zip_code).toBe('90210');

    // Clean up - this should fail for public (DELETE not allowed)
    const { error: deleteError } = await supabase
      .from('quotes')
      .delete()
      .eq('id', data?.id);
    
    // DELETE should be denied for public
    expect(deleteError).not.toBeNull();
  });

  test('Public cannot read other quotes (SELECT restricted)', async () => {
    // Without setting app.current_phone or being authenticated,
    // public should not be able to read quotes
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .limit(10);

    // SELECT should return empty or error due to RLS
    // Policy requires phone/email match or staff role
    expect(data?.length || 0).toBe(0);
  });

  test('Public cannot update quotes (UPDATE restricted)', async () => {
    // First create a quote
    const { data: created } = await supabase
      .from('quotes')
      .insert({
        zip_code: '90211',
        material_type: 'general',
        subtotal: 300,
        estimated_min: 250,
        estimated_max: 350,
        rental_days: 7,
        status: 'pending'
      })
      .select()
      .single();

    // Try to update - should fail
    const { error: updateError } = await supabase
      .from('quotes')
      .update({ status: 'cancelled' })
      .eq('id', created?.id);

    // UPDATE should be denied for public
    expect(updateError).not.toBeNull();
  });

  test('Public cannot delete quotes (DELETE restricted)', async () => {
    // First create a quote
    const { data: created } = await supabase
      .from('quotes')
      .insert({
        zip_code: '90212',
        material_type: 'general',
        subtotal: 350,
        estimated_min: 300,
        estimated_max: 400,
        rental_days: 7,
        status: 'pending'
      })
      .select()
      .single();

    // Try to delete - should fail
    const { error: deleteError } = await supabase
      .from('quotes')
      .delete()
      .eq('id', created?.id);

    // DELETE should be denied for public
    expect(deleteError).not.toBeNull();
  });
});

test.describe('RLS Security - Orders Table', () => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  test('Public cannot read orders', async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .limit(10);

    // Should return empty due to RLS
    expect(data?.length || 0).toBe(0);
  });

  test('Public cannot create orders', async () => {
    const { error } = await supabase
      .from('orders')
      .insert({
        status: 'pending'
      });

    // Should be denied
    expect(error).not.toBeNull();
  });
});

test.describe('RLS Security - Service Receipts Table', () => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  test('Public cannot read receipts', async () => {
    const { data } = await supabase
      .from('service_receipts')
      .select('*')
      .limit(10);

    // Should return empty due to RLS
    expect(data?.length || 0).toBe(0);
  });

  test('Public cannot create receipts', async () => {
    const { error } = await supabase
      .from('service_receipts')
      .insert({
        quote_id: '00000000-0000-0000-0000-000000000000',
        total_tons: 2.5
      });

    // Should be denied - staff only
    expect(error).not.toBeNull();
  });
});

test.describe('RLS Security - Inventory Table', () => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  test('Public can read inventory (intentional)', async () => {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .limit(10);

    // Public SELECT is allowed for showing availability
    expect(error).toBeNull();
  });

  test('Public cannot modify inventory', async () => {
    // Get an inventory record first
    const { data: existing } = await supabase
      .from('inventory')
      .select('id')
      .limit(1)
      .single();

    if (existing) {
      const { error } = await supabase
        .from('inventory')
        .update({ available_count: 999 })
        .eq('id', existing.id);

      // Should be denied
      expect(error).not.toBeNull();
    }
  });
});

test.describe('RLS Security - Documents Table', () => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  test('Public cannot read documents', async () => {
    const { data } = await supabase
      .from('documents')
      .select('*')
      .limit(10);

    // Should return empty due to RLS
    expect(data?.length || 0).toBe(0);
  });
});
