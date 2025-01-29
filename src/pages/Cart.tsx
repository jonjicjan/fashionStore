import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

declare global {
  interface Window {
    Razorpay: any;
  }
}

// Format price in Indian Rupees
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price / 100);
};

// GST rate (12%)
const GST_RATE = 0.12;

export default function Cart() {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();
  const [loading, setLoading] = useState(false);

  // Calculate GST and final total
  const subtotal = total;
  const gstAmount = Math.round(subtotal * GST_RATE);
  const finalTotal = subtotal + gstAmount;

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.crossOrigin = 'anonymous';
      document.body.appendChild(script);
      script.onload = () => {
        console.log('Razorpay script loaded successfully');
        resolve(true);
      };
      script.onerror = () => {
        console.error('Failed to load Razorpay script');
        resolve(false);
      };
    });
  };

  const handleCheckout = async () => {
    try {
      setLoading(true);

      // Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please login to continue');
        navigate('/login');
        return;
      }

      // Check if user has added address
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('address, city, state, pincode')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        toast.error('Error fetching profile. Please try again.');
        return;
      }

      if (!profile?.address || !profile?.city || !profile?.state || !profile?.pincode) {
        toast.error('Please add delivery address in your account');
        navigate('/account');
        return;
      }

      // Load Razorpay
      const res = await loadRazorpay();
      if (!res) {
        toast.error('Razorpay failed to load. Please try again.');
        return;
      }

      // Create order in database first
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total: finalTotal, // Use final total including GST
          status: 'pending',
        })
        .select()
        .single();

      if (orderError) {
        console.error('Error creating order:', orderError);
        toast.error('Error creating order. Please try again.');
        return;
      }

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price_at_time: item.price,
        size: item.size,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Error creating order items:', itemsError);
        toast.error('Error creating order items. Please try again.');
        return;
      }

      // Initialize Razorpay
      const options = {
        key: 'rzp_test_E2X1gvxQkn0nXg',
        amount: finalTotal, // Amount in paise (already in the correct format)
        currency: 'INR',
        name: 'FashionStore',
        description: 'Purchase from FashionStore',
        order_id: order.id,
        handler: async function (response: any) {
          try {
            // Update order status
            const { error: updateError } = await supabase
              .from('orders')
              .update({
                status: 'processing',
                payment_id: response.razorpay_payment_id,
              })
              .eq('id', order.id);

            if (updateError) {
              console.error('Error updating order:', updateError);
              toast.error('Error updating order. Please contact support.');
              return;
            }

            // Clear cart and redirect
            clearCart();
            toast.success('Order placed successfully!');
            navigate('/account?tab=orders');
          } catch (error) {
            console.error('Error during payment completion:', error);
            toast.error('Payment failed. Please try again.');
          }
        },
        prefill: {
          email: user.email,
        },
        theme: {
          color: '#000000',
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Error during checkout:', error);
      toast.error('Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
        <Link
          to="/shop"
          className="inline-block bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 border-b border-gray-200 py-4 items-center"
            >
              <img
                src={item.image_url}
                alt={item.name}
                className="w-24 h-24 object-cover rounded-md"
              />
              
              <div className="flex-grow">
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-gray-600">{formatPrice(item.price)}</p>
                {item.size && (
                  <p className="text-sm text-gray-500">Size: {item.size}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="text-right min-w-[100px]">
                <p className="font-semibold">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>

              <button
                onClick={() => removeItem(item.id)}
                className="p-2 text-gray-500 hover:text-red-500"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (12%)</span>
                <span>{formatPrice(gstAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Free</span>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex justify-between font-bold">
                <span>Total (Inc. GST)</span>
                <span>{formatPrice(finalTotal)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 mb-4 disabled:bg-gray-400"
            >
              {loading ? 'Processing...' : 'Proceed to Checkout'}
            </button>

            <button
              onClick={clearCart}
              className="w-full text-gray-600 hover:text-gray-800"
            >
              Clear Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}