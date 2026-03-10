export interface Customer {
  id: string;
  company_name: string | null;
  contact_name: string | null;
  customer_type: string | null;
  billing_email: string | null;
  billing_phone: string | null;
  billing_address: string | null;
  phone: string | null;
  notes: string | null;
  is_active: boolean;
  activation_status: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  status: string;
  amount_due: number | null;
  created_at: string;
  scheduled_delivery_date: string | null;
  scheduled_pickup_date: string | null;
}

export interface Invoice {
  id: string;
  order_id: string;
  invoice_number: string | null;
  amount_due: number;
  amount_paid: number;
  balance_due: number;
  payment_status: string;
  due_date: string | null;
  issue_date: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  order_id: string;
  payment_type: string;
  amount: number;
  status: string;
  card_last_four: string | null;
  card_type: string | null;
  created_at: string;
}

export interface Quote {
  id: string;
  customer_name: string | null;
  customer_email: string | null;
  status: string;
  subtotal: number | null;
  created_at: string;
  zip_code: string | null;
  material_type: string | null;
}

export interface CustomerContact {
  id: string;
  customer_id: string;
  contact_name: string;
  contact_role: string;
  phone: string | null;
  email: string | null;
  preferred_method: string;
  is_primary: boolean;
  notes: string | null;
  created_at: string;
}

export interface CustomerSite {
  id: string;
  customer_id: string;
  site_name: string;
  address: string;
  city: string | null;
  state: string | null;
  zip: string | null;
  gate_code: string | null;
  placement_instructions: string | null;
  permit_notes: string | null;
  site_notes: string | null;
  is_primary: boolean;
  created_at: string;
}

export interface Customer360Data {
  customer: Customer;
  orders: Order[];
  invoices: Invoice[];
  payments: Payment[];
  quotes: Quote[];
  contacts: CustomerContact[];
  sites: CustomerSite[];
}
