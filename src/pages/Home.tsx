import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Truck, Shield, Clock } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <div className="h-[600px] relative">
        <img
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8"
          alt="Fashion Store Hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-5xl font-bold mb-4">Welcome to FashionStore</h1>
            <p className="text-xl mb-8">Discover the latest trends in fashion</p>
            <Link
              to="/shop"
              className="inline-flex items-center bg-white text-black px-6 py-3 rounded-md hover:bg-gray-100 transition-colors"
            >
              Shop Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

     {/* Featured Categories */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Featured Categories </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link to="/shop?category=men" className="group relative h-96 overflow-hidden rounded-lg">
            <img
              src="https://images.unsplash.com/photo-1516826957135-700dedea698c?q=80&w=1974"
              alt="Men's Fashion"
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <h3 className="text-white text-2xl font-bold">Men's Fashion</h3>
            </div>
          </Link>
          <Link to="/shop?category=women" className="group relative h-96 overflow-hidden rounded-lg">
            <img
              src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070"
              alt="Women's Fashion"
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <h3 className="text-white text-2xl font-bold">Women's Fashion</h3>
            </div>
          </Link>
          <Link to="/shop?category=accessories" className="group relative h-96 overflow-hidden rounded-lg">
            <img
              src="https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?q=80&w=1965"
              alt="Accessories"
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <h3 className="text-white text-2xl font-bold">Accessories</h3>
            </div>
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col items-center text-center">
            <ShoppingBag className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Wide Selection</h3>
            <p className="text-gray-600">Discover thousands of trendy items</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <Truck className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Fast Delivery</h3>
            <p className="text-gray-600">Get your order in 2-3 business days</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <Shield className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Secure Shopping</h3>
            <p className="text-gray-600">100% secure payment</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <Clock className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">24/7 Support</h3>
            <p className="text-gray-600">Dedicated support anytime</p>
          </div>
        </div>
      </div>
    </div>
  );
}
