// Inventory reservation service for automatic dumpster allocation
// Handles reserve, release, and availability checks

import { supabase } from "@/integrations/supabase/client";

export interface InventoryItem {
  id: string;
  yard_id: string;
  size_id: string;
  available_count: number;
  reserved_count: number;
  in_use_count: number;
  maintenance_count: number;
  low_stock_threshold: number;
  yards?: { name: string } | null;
  dumpster_sizes?: { label: string; size_value: number } | null;
}

export interface ReservationResult {
  success: boolean;
  inventoryId?: string;
  error?: string;
  lowStock?: boolean;
  availableCount?: number;
}

/**
 * Check inventory availability for a given yard and size
 */
export async function checkInventoryAvailability(
  yardId: string,
  sizeId: string
): Promise<{ available: boolean; inventory: InventoryItem | null; lowStock: boolean }> {
  const { data, error } = await supabase
    .from("inventory")
    .select(`
      *,
      yards (name),
      dumpster_sizes (label, size_value)
    `)
    .eq("yard_id", yardId)
    .eq("size_id", sizeId)
    .single();

  if (error || !data) {
    return { available: false, inventory: null, lowStock: false };
  }

  const inventory = data as unknown as InventoryItem;
  const available = inventory.available_count > 0;
  const lowStock = inventory.available_count <= inventory.low_stock_threshold;

  return { available, inventory, lowStock };
}

/**
 * Reserve a dumpster for an order
 * Decrements available_count, increments reserved_count
 */
export async function reserveInventory(
  orderId: string,
  yardId: string,
  sizeId: string
): Promise<ReservationResult> {
  // Check availability first
  const { available, inventory, lowStock } = await checkInventoryAvailability(yardId, sizeId);

  if (!inventory) {
    return {
      success: false,
      error: `No inventory record found for this yard/size combination`,
    };
  }

  if (!available) {
    return {
      success: false,
      error: `No available inventory at ${inventory.yards?.name || "selected yard"} for ${inventory.dumpster_sizes?.label || "selected size"}`,
      availableCount: 0,
    };
  }

  // Reserve: decrement available, increment reserved
  const { error: updateError } = await supabase
    .from("inventory")
    .update({
      available_count: inventory.available_count - 1,
      reserved_count: inventory.reserved_count + 1,
    })
    .eq("id", inventory.id);

  if (updateError) {
    return { success: false, error: `Failed to update inventory: ${updateError.message}` };
  }

  // Link inventory to order
  const { error: orderError } = await supabase
    .from("orders")
    .update({ inventory_id: inventory.id })
    .eq("id", orderId);

  if (orderError) {
    // Rollback inventory change
    await supabase
      .from("inventory")
      .update({
        available_count: inventory.available_count,
        reserved_count: inventory.reserved_count,
      })
      .eq("id", inventory.id);
    return { success: false, error: `Failed to link inventory to order: ${orderError.message}` };
  }

  // Log movement
  await supabase.from("inventory_movements").insert({
    inventory_id: inventory.id,
    order_id: orderId,
    movement_type: "reserve",
    quantity: 1,
    notes: "Auto-reserved on schedule confirmation",
  });

  return {
    success: true,
    inventoryId: inventory.id,
    lowStock: lowStock || inventory.available_count - 1 <= inventory.low_stock_threshold,
    availableCount: inventory.available_count - 1,
  };
}

/**
 * Deploy inventory (reserved → in_use) when order is delivered
 */
export async function deployInventory(
  orderId: string,
  inventoryId: string
): Promise<{ success: boolean; error?: string }> {
  // Get current inventory state
  const { data: inventory, error: fetchError } = await supabase
    .from("inventory")
    .select("*")
    .eq("id", inventoryId)
    .single();

  if (fetchError || !inventory) {
    return { success: false, error: "Inventory not found" };
  }

  if (inventory.reserved_count < 1) {
    return { success: false, error: "No reserved inventory to deploy" };
  }

  // Deploy: decrement reserved, increment in_use
  const { error: updateError } = await supabase
    .from("inventory")
    .update({
      reserved_count: inventory.reserved_count - 1,
      in_use_count: inventory.in_use_count + 1,
    })
    .eq("id", inventoryId);

  if (updateError) {
    return { success: false, error: `Failed to deploy inventory: ${updateError.message}` };
  }

  // Log movement
  await supabase.from("inventory_movements").insert({
    inventory_id: inventoryId,
    order_id: orderId,
    movement_type: "deploy",
    quantity: 1,
    notes: "Deployed on delivery",
  });

  return { success: true };
}

/**
 * Release inventory (in_use → available) when order is picked up or completed
 */
export async function releaseInventory(
  orderId: string,
  inventoryId: string
): Promise<{ success: boolean; error?: string }> {
  // Get current inventory state
  const { data: inventory, error: fetchError } = await supabase
    .from("inventory")
    .select("*")
    .eq("id", inventoryId)
    .single();

  if (fetchError || !inventory) {
    return { success: false, error: "Inventory not found" };
  }

  if (inventory.in_use_count < 1) {
    return { success: false, error: "No in-use inventory to release" };
  }

  // Release: decrement in_use, increment available
  const { error: updateError } = await supabase
    .from("inventory")
    .update({
      in_use_count: inventory.in_use_count - 1,
      available_count: inventory.available_count + 1,
    })
    .eq("id", inventoryId);

  if (updateError) {
    return { success: false, error: `Failed to release inventory: ${updateError.message}` };
  }

  // Log movement
  await supabase.from("inventory_movements").insert({
    inventory_id: inventoryId,
    order_id: orderId,
    movement_type: "return",
    quantity: 1,
    notes: "Released on pickup/completion",
  });

  return { success: true };
}

/**
 * Cancel reservation (reserved → available) if order is cancelled before delivery
 */
export async function cancelReservation(
  orderId: string,
  inventoryId: string
): Promise<{ success: boolean; error?: string }> {
  // Get current inventory state
  const { data: inventory, error: fetchError } = await supabase
    .from("inventory")
    .select("*")
    .eq("id", inventoryId)
    .single();

  if (fetchError || !inventory) {
    return { success: false, error: "Inventory not found" };
  }

  if (inventory.reserved_count < 1) {
    return { success: false, error: "No reserved inventory to cancel" };
  }

  // Cancel: decrement reserved, increment available
  const { error: updateError } = await supabase
    .from("inventory")
    .update({
      reserved_count: inventory.reserved_count - 1,
      available_count: inventory.available_count + 1,
    })
    .eq("id", inventoryId);

  if (updateError) {
    return { success: false, error: `Failed to cancel reservation: ${updateError.message}` };
  }

  // Clear inventory link from order
  await supabase
    .from("orders")
    .update({ inventory_id: null })
    .eq("id", orderId);

  // Log movement
  await supabase.from("inventory_movements").insert({
    inventory_id: inventoryId,
    order_id: orderId,
    movement_type: "release",
    quantity: 1,
    notes: "Reservation cancelled",
  });

  return { success: true };
}

/**
 * Get low stock alerts for dashboard
 */
export async function getLowStockAlerts(): Promise<InventoryItem[]> {
  const { data, error } = await supabase
    .from("inventory")
    .select(`
      *,
      yards (name),
      dumpster_sizes (label, size_value)
    `)
    .lte("available_count", 2); // Use 2 as a base threshold, or reference low_stock_threshold

  if (error) {
    console.error("Error fetching low stock alerts:", error);
    return [];
  }

  // Filter to items where available_count <= low_stock_threshold
  return (data as unknown as InventoryItem[]).filter(
    (item) => item.available_count <= item.low_stock_threshold
  );
}
