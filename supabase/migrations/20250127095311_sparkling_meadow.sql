/*
  # Add product images and sizes

  1. Changes
    - Add product_images array column to products table
    - Add sizes array column to products table
    - Update existing products with multiple images and sizes
*/

-- Add new columns
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS product_images text[] DEFAULT ARRAY[]::text[],
ADD COLUMN IF NOT EXISTS sizes text[] DEFAULT ARRAY[]::text[];

-- Update existing products with multiple images
UPDATE products SET 
product_images = ARRAY[
  image_url,
  'https://images.unsplash.com/photo-1516826957135-700dedea698c',
  'https://images.unsplash.com/photo-1483985988355-763728e1935b',
  'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93'
];

-- Update sizes based on category
UPDATE products SET
sizes = CASE 
  WHEN category = 'accessories' THEN ARRAY['One Size']
  ELSE ARRAY['XS', 'S', 'M', 'L', 'XL']
END;