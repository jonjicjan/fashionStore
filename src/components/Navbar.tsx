import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, User, LogIn } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';

export default function Navbar() {
  const { items } = useCart();
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold">FashionStore</Link>
          
          <div className="flex items-center space-x-4">
            <Link to="/shop" className="text-gray-700 hover:text-gray-900">
              Shop
            </Link>
            
            {user ? (
              <>
                <Link to="/account" className="text-gray-700 hover:text-gray-900">
                  <User className="h-6 w-6" />
                </Link>
                {user.user_metadata?.role === 'admin' && (
                  <Link to="/admin" className="text-gray-700 hover:text-gray-900">
                    Admin
                  </Link>
                )}
              </>
            ) : (
              <Link to="/login" className="text-gray-700 hover:text-gray-900">
                <LogIn className="h-6 w-6" />
              </Link>
            )}
            
            <Link to="/cart" className="text-gray-700 hover:text-gray-900 relative">
              <ShoppingBag className="h-6 w-6" />
              {items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {items.length}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}