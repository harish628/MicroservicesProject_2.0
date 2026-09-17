// src/app/core/models/models.ts
//
// What this file does:
// TypeScript interfaces — they describe the SHAPE of our data.
// Unlike Pydantic (Python) or Sequelize (Node), these are NOT runtime
// checks — TypeScript interfaces disappear after compilation. They exist
// purely to help the EDITOR and COMPILER catch mistakes before runtime.
//
// Feynman version:
// Think of an interface like a packing list before a trip.
// "A User must have: id, name, email, role." If you try to create a User
// missing the email, TypeScript stops you right in your editor —
// before you even run the code. It's a safety net made of text, not code.

export interface User {
  id:    number;
  name:  string;
  email: string;
  role:  'customer' | 'admin';
}

export interface Category {
  id:   number;
  name: string;
  description?: string;
}

export interface Product {
  id:          number;
  name:        string;
  description?: string;
  price:       number;
  image_url?:  string;
  stock:       number;
  is_active:   boolean;
  category_id?: number;
  category?:   Category;
  created_at:  string;
}

export interface ProductListResponse {
  products:    Product[];
  total:       number;
  page:        number;
  per_page:    number;
  total_pages: number;
}

export interface OrderItem {
  id:           number;
  product_id:   number;
  product_name: string;
  quantity:     number;
  unit_price:   number;
  subtotal:     number;
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';

export interface Order {
  id:               number;
  user_id:          number;
  status:           OrderStatus;
  total_amount:     number;
  delivery_address: string;
  items:            OrderItem[];
  created_at:       string;
}

export interface OrderListResponse {
  orders:      Order[];
  total:       number;
  page:        number;
  per_page:    number;
  total_pages: number;
}

export interface ServiceHealth {
  name:          string;
  status:        'UP' | 'DOWN';
  responseTime?: string;
  error?:        string;
}

export interface HealthAllResponse {
  gateway_status: string;
  services: Record<string, ServiceHealth>;
}
