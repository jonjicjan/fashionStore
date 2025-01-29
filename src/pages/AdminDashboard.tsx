import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Pencil, Trash2, Plus, X, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  stock: number;
}

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  image_url: string;
  category: string;
  stock: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    image_url: '',
    category: 'men',
    stock: '',
  });
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);

  useEffect(() => {
    checkUser();
    fetchProducts();
  }, []);

  async function checkUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.user_metadata?.role !== 'admin') {
        toast.error('Unauthorized access');
        navigate('/');
        return;
      }
    } catch (error) {
      console.error('Error checking user:', error);
      navigate('/');
    }
  }

  async function fetchProducts() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      image_url: '',
      category: 'men',
      stock: '',
    });
    setEditingProduct(null);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: (product.price / 100).toString(),
      image_url: product.image_url,
      category: product.category,
      stock: product.stock.toString(),
    });
    setIsModalOpen(true);
  };

  const validateForm = () => {
    if (!formData.name.trim()) return 'Product name is required';
    if (!formData.description.trim()) return 'Description is required';
    if (!formData.price || isNaN(parseFloat(formData.price))) return 'Valid price is required';
    if (!formData.image_url.trim() || !formData.image_url.startsWith('http')) return 'Valid image URL is required';
    if (!formData.stock || isNaN(parseInt(formData.stock))) return 'Valid stock quantity is required';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const error = validateForm();
    if (error) {
      toast.error(error);
      return;
    }

    try {
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Math.round(parseFloat(formData.price) * 100),
        image_url: formData.image_url.trim(),
        category: formData.category,
        stock: parseInt(formData.stock),
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);
        if (error) throw error;
        toast.success('Product updated successfully');
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData]);
        if (error) throw error;
        toast.success('Product added successfully');
      }

      setIsModalOpen(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (deleteConfirmation !== id) {
      setDeleteConfirmation(id);
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setProducts(products.filter(product => product.id !== id));
      toast.success('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    } finally {
      setDeleteConfirmation(null);
    }
  };

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
        <div>
          <h1 className="text-3xl font-bold">Product Management</h1>
          <p className="text-gray-600 mt-2">Manage your store's product inventory</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add Product
        </button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">No products found</h3>
          <p className="text-gray-600">Start by adding your first product</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          className="h-12 w-12 rounded-lg object-cover"
                          src={product.image_url}
                          alt={product.name}
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500 line-clamp-1">
                            {product.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 capitalize">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${(product.price / 100).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm ${product.stock < 10 ? 'text-red-600' : 'text-gray-500'}`}>
                        {product.stock} units
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="text-indigo-600 hover:text-indigo-900 transition-colors"
                          title="Edit product"
                        >
                          <Pencil className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className={`transition-colors ${
                            deleteConfirmation === product.id
                              ? 'text-red-600 hover:text-red-700'
                              : 'text-gray-400 hover:text-gray-500'
                          }`}
                          title={deleteConfirmation === product.id ? 'Click again to confirm' : 'Delete product'}
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Enter product name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent"
                  >
                    <option value="men">Men</option>
                    <option value="women">Women</option>
                    <option value="accessories">Accessories</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Enter product description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="0"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL
                  </label>
                  <input
                    type="url"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="px-6 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}