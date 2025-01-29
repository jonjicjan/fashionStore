/*
  # Add Demo Products

  1. Changes
    - Insert demo products into the products table with realistic clothing items
    - Each product has:
      - Name
      - Description
      - Price (in cents)
      - Image URL (from Unsplash)
      - Category
      - Stock quantity
*/

INSERT INTO products (name, description, price, image_url, category, stock) VALUES
  (
    'Classic White T-Shirt',
    'Essential crew neck t-shirt made from premium cotton. Perfect for everyday wear.',
    2999,
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab',
    'men',
    100
  ),
  (
    'Slim Fit Denim Jeans',
    'Modern slim fit jeans in dark wash denim. Features comfortable stretch fabric.',
    7999,
    'https://images.unsplash.com/photo-1542272604-787c3835535d',
    'men',
    50
  ),
  (
    'Floral Summer Dress',
    'Light and breezy floral print dress, perfect for warm summer days.',
    5999,
    'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1',
    'women',
    75
  ),
  (
    'Leather Crossbody Bag',
    'Elegant leather crossbody bag with adjustable strap and multiple compartments.',
    12999,
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa',
    'accessories',
    30
  ),
  (
    'Wool Blend Sweater',
    'Cozy wool blend sweater in a classic fit. Perfect for layering in cold weather.',
    8999,
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27',
    'women',
    60
  ),
  (
    'Classic Leather Belt',
    'Genuine leather belt with classic silver buckle. A timeless accessory.',
    3999,
    'https://images.unsplash.com/photo-1553531384-cc64ac80f931',
    'accessories',
    80
  ),
  (
    'Oxford Button-Down Shirt',
    'Classic oxford cotton shirt in light blue. Perfect for business or casual wear.',
    6999,
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c',
    'men',
    45
  ),
  (
    'Silk Scarf',
    'Luxurious silk scarf with geometric pattern. Adds elegance to any outfit.',
    4999,
    'https://images.unsplash.com/photo-1601924921557-45e6dea0a157',
    'accessories',
    40
  ),
  (
    'High-Waist Yoga Pants',
    'Comfortable high-waist yoga pants with moisture-wicking fabric.',
    5499,
    'https://images.unsplash.com/photo-1548663512-4a773e7e13ff',
    'women',
    90
  ),
  (
    'Denim Jacket',
    'Classic denim jacket with a modern fit. A wardrobe essential.',
    8999,
    'https://images.unsplash.com/photo-1551537482-f2075a1d41f2',
    'men',
    35
  );