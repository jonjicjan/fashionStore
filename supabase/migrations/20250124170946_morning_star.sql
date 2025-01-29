/*
  # E-commerce Initial Schema

  1. New Tables
    - products
      - id (uuid, primary key)
      - name (text)
      - description (text)
      - price (integer, in cents)
      - image_url (text)
      - category (text)
      - stock (integer)
      - created_at (timestamp)
    - orders
      - id (uuid, primary key)
      - user_id (uuid, references auth.users)
      - status (text)
      - total (integer, in cents)
      - created_at (timestamp)
    - order_items
      - id (uuid, primary key)
      - order_id (uuid, references orders)
      - product_id (uuid, references products)
      - quantity (integer)
      - price_at_time (integer, in cents)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users and admin access
*/

-- Create products table
CREATE TABLE products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    price integer NOT NULL,
    image_url text,
    category text NOT NULL,
    stock integer NOT NULL DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users NOT NULL,
    status text NOT NULL DEFAULT 'pending',
    total integer NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Create order_items table
CREATE TABLE order_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid REFERENCES orders NOT NULL,
    product_id uuid REFERENCES products NOT NULL,
    quantity integer NOT NULL,
    price_at_time integer NOT NULL
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Policies for products
CREATE POLICY "Anyone can view products" ON products
    FOR SELECT USING (true);

CREATE POLICY "Only admins can insert products" ON products
    FOR INSERT TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can update products" ON products
    FOR UPDATE TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin');

-- Policies for orders
CREATE POLICY "Users can view their own orders" ON orders
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders" ON orders
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Policies for order_items
CREATE POLICY "Users can view their own order items" ON order_items
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = order_items.order_id
            AND orders.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create their own order items" ON order_items
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = order_items.order_id
            AND orders.user_id = auth.uid()
        )
    );