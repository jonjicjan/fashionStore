import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import { ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  product_images: string[];
  image_url: string;
  category: string;
  stock: number;
}

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { addItem } = useCart();

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  async function fetchProducts() {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('products')
        .select('*');
      
      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory.toLowerCase());
      }

      const { data, error } = await query;
      
      if (error) throw error;
      if (!data) throw new Error('No data received');

      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products. Please try again.');
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }

  const getProductImage = (product: Product) => {
    if (product.product_images && product.product_images.length > 0) {
      return product.product_images[0];
    }
    return product.image_url || 'https://via.placeholder.com/400x400?text=No+Image';
  };

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image_url: getProductImage(product),
    });
    toast.success('Added to cart');
  };

  const categories = ['all', 'men', 'women', 'accessories'];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] px-4">
        <p className="text-red-600 text-center mb-4">{error}</p>
        <button 
          onClick={fetchProducts}
          className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">Shop</h1>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full capitalize whitespace-nowrap ${
                selectedCategory === category
                  ? 'bg-black text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No products found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <Link to={`/product/${product.id}`} className="block aspect-square overflow-hidden">
                <img
                  src={getProductImage(product)}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.src = 'https://via.placeholder.com/400x400?text=Image+Not+Found';
                  }}
                />
              </Link>
              <div className="p-4">
                <Link to={`/product/${product.id}`}>
                  <h2 className="text-lg font-semibold mb-2 hover:text-gray-700">
                    {product.name}
                  </h2>
                </Link>
                <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">
                    ₹{(product.price / 100).toFixed(2)}
                  </span>
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                      product.stock === 0
                        ? 'bg-gray-200 cursor-not-allowed'
                        : 'bg-black text-white hover:bg-gray-800'
                    }`}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}