import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Package, MapPin, History, LogOut, User } from 'lucide-react';
import toast from 'react-hot-toast';

interface UserProfile {
  full_name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

interface Order {
  id: string;
  created_at: string;
  status: string;
  total: number;
  items: {
    product_name: string;
    quantity: number;
    price_at_time: number;
  }[];
}

export default function Account() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile>({
    full_name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
    fetchProfile();
    fetchOrders();
  }, []);

  async function checkUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      setUser(user);
    } catch (error) {
      console.error('Error checking user:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }

  async function fetchProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      if (data) setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    }
  }

  async function fetchOrders() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          status,
          total,
          order_items (
            product_id,
            quantity,
            price_at_time,
            products (name)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedOrders = data.map(order => ({
        ...order,
        items: order.order_items.map(item => ({
          product_name: item.products.name,
          quantity: item.quantity,
          price_at_time: item.price_at_time,
        })),
      }));

      setOrders(formattedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    }
  }

  async function handleProfileUpdate(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...profile,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  }

  async function handleLogout() {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Account</h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-md ${
                  activeTab === 'profile' ? 'bg-black text-white' : 'hover:bg-gray-100'
                }`}
              >
                <User className="h-5 w-5" />
                Profile
              </button>
              <button
                onClick={() => setActiveTab('address')}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-md ${
                  activeTab === 'address' ? 'bg-black text-white' : 'hover:bg-gray-100'
                }`}
              >
                <MapPin className="h-5 w-5" />
                Address
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-md ${
                  activeTab === 'orders' ? 'bg-black text-white' : 'hover:bg-gray-100'
                }`}
              >
                <Package className="h-5 w-5" />
                Orders
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-3">
          <div className="bg-white rounded-lg shadow-sm p-6">
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profile.full_name}
                      onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800"
                >
                  Update Profile
                </button>
              </form>
            )}

            {activeTab === 'address' && (
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <h2 className="text-xl font-semibold mb-4">Delivery Address</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address
                    </label>
                    <textarea
                      value={profile.address}
                      onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        value={profile.city}
                        onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State
                      </label>
                      <input
                        type="text"
                        value={profile.state}
                        onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        PIN Code
                      </label>
                      <input
                        type="text"
                        value={profile.pincode}
                        onChange={(e) => setProfile({ ...profile, pincode: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800"
                >
                  Update Address
                </button>
              </form>
            )}

            {activeTab === 'orders' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Order History</h2>
                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <History className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">No orders found</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="text-sm text-gray-600">
                              Order #{order.id.slice(0, 8)}
                            </p>
                            <p className="text-sm text-gray-600">
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            order.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : order.status === 'processing'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>
                                {item.product_name} x {item.quantity}
                              </span>
                              <span>
                                ₹{(item.price_at_time * item.quantity / 100).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="border-t mt-4 pt-4">
                          <div className="flex justify-between font-medium">
                            <span>Total</span>
                            <span>₹{(order.total / 100).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}