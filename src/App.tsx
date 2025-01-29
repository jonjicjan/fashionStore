import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Account from './pages/Account';
import AdminDashboard from './pages/AdminDashboard';
import { CartProvider } from './context/CartContext';
import { supabase } from './lib/supabase';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = React.useState(true);
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
  }, []);

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <Router>
      <CartProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/login" element={<Login />} />
              <Route
                path="/account"
                element={
                  <PrivateRoute>
                    <Account />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <PrivateRoute>
                    <AdminDashboard />
                  </PrivateRoute>
                }
              />
            </Routes>
          </main>
          <Toaster position="bottom-right" />
        </div>
      </CartProvider>
    </Router>
  );
}

export default App;