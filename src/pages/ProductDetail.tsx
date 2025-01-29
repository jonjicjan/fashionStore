import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import { Minus, Plus, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  product_images: string[];
  category: string;
  stock: number;
  sizes: string[];
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addItem } = useCart();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  async function fetchProduct() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Product not found');

      // Ensure product_images is an array
      const productData = {
        ...data,
        product_images: data.product_images || [data.image_url],
        sizes: data.sizes || ['S', 'M', 'L', 'XL']
      };

      setProduct(productData);
      setSelectedSize(productData.sizes[0]);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product');
      navigate('/shop');
    } finally {
      setLoading(false);
    }
  }

  const handleAddToCart = () => {
    if (product) {
      if (!selectedSize) {
        toast.error('Please select a size');
        return;
      }

      if (quantity > product.stock) {
        toast.error('Not enough stock available');
        return;
      }

      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity,
        image_url: product.product_images[0],
        size: selectedSize,
      });

      toast.success('Added to cart');
    }
  };

  const nextImage = () => {
    if (product?.product_images?.length) {
      setCurrentImageIndex((prev) => 
        prev === product.product_images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (product?.product_images?.length) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? product.product_images.length - 1 : prev - 1
      );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Product not found</h2>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative">
          <div className="aspect-square overflow-hidden rounded-lg">
            <img
              src={product.product_images[currentImageIndex]}
              alt={`${product.name} - View ${currentImageIndex + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.src = 'https://via.placeholder.com/400x400?text=Image+Not+Found';
              }}
            />
          </div>
          
          {product.product_images.length > 1 && (
            <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4">
              <button
                onClick={prevImage}
                className="p-2 rounded-full bg-white/80 hover:bg-white shadow-md"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={nextImage}
                className="p-2 rounded-full bg-white/80 hover:bg-white shadow-md"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
          )}

          {product.product_images.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto">
              {product.product_images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-20 h-20 rounded-md overflow-hidden flex-shrink-0 ${
                    currentImageIndex === index ? 'ring-2 ring-black' : ''
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} - Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.src = 'https://via.placeholder.com/400x400?text=Image+Not+Found';
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-gray-600 mb-6">{product.description}</p>
          
          <div className="mb-6">
            <span className="text-2xl font-bold">
              ₹{(product.price / 100).toFixed(2)}
            </span>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Size
            </label>
            <div className="flex gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 border rounded-md ${
                    selectedSize === size
                      ? 'border-black bg-black text-white'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity
            </label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <Minus className="h-5 w-5" />
              </button>
              <span className="text-xl font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 disabled:bg-gray-400"
          >
            <ShoppingCart className="h-5 w-5" />
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}