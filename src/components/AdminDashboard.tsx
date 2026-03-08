import React, { useState, useEffect } from 'react';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  Timestamp 
} from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { Product, Order, Coupon, Category, OrderStatus } from '../types';
import { CATEGORIES, SIZES, COLORS } from '../constants';
import { formatPrice, cn } from '../utils';
import { 
  Plus, 
  Package, 
  ShoppingBag, 
  Tag, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  Loader2, 
  LogOut, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';

interface AdminDashboardProps {
  user: any;
}

export function AdminDashboard({ user }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'coupons'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Forms
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: 0,
    category: 'T-Shirt' as Category,
    subCategory: '',
    images: [''] as string[],
    sizes: [] as string[],
    colors: [] as string[],
    stock: 10,
    trending: false
  });

  const [showCouponForm, setShowCouponForm] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'flat',
    value: 0,
    active: true
  });

  const isAdmin = user?.email === "mdshihabkhandokar786@gmail.com";

  useEffect(() => {
    if (!isAdmin) return;

    const unsubProducts = onSnapshot(query(collection(db, 'products'), orderBy('createdAt', 'desc')), (s) => {
      setProducts(s.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'products');
    });
    const unsubOrders = onSnapshot(query(collection(db, 'orders'), orderBy('createdAt', 'desc')), (s) => {
      setOrders(s.docs.map(d => ({ id: d.id, ...d.data() } as Order)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'orders');
    });
    const unsubCoupons = onSnapshot(collection(db, 'coupons'), (s) => {
      setCoupons(s.docs.map(d => ({ id: d.id, ...d.data() } as Coupon)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'coupons');
    });

    return () => {
      unsubProducts();
      unsubOrders();
      unsubCoupons();
    };
  }, [isAdmin]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      toast.success('Logged in successfully');
    } catch (error) {
      toast.error('Failed to login');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    toast.success('Logged out');
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const path = 'products';
    try {
      const data = {
        ...productForm,
        createdAt: editingProduct ? editingProduct.createdAt : Timestamp.now()
      };

      if (editingProduct) {
        await updateDoc(doc(db, path, editingProduct.id), data);
        toast.success('Product updated');
      } else {
        await addDoc(collection(db, path), data);
        toast.success('Product added');
      }
      setShowProductForm(false);
      setEditingProduct(null);
      setProductForm({
        name: '',
        description: '',
        price: 0,
        category: 'T-Shirt',
        subCategory: '',
        images: [''],
        sizes: ['M'],
        stock: 10,
        trending: false
      });
    } catch (error) {
      handleFirestoreError(error, editingProduct ? OperationType.UPDATE : OperationType.CREATE, path);
      toast.error('Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    const path = `products/${id}`;
    try {
      await deleteDoc(doc(db, 'products', id));
      toast.success('Product deleted');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
      toast.error('Failed to delete product');
    }
  };

  const handleUpdateOrderStatus = async (id: string, status: OrderStatus) => {
    const path = `orders/${id}`;
    try {
      await updateDoc(doc(db, 'orders', id), { status });
      toast.success(`Order marked as ${status}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
      toast.error('Failed to update status');
    }
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const path = 'coupons';
    try {
      await addDoc(collection(db, path), {
        ...couponForm,
        code: couponForm.code.toUpperCase()
      });
      toast.success('Coupon created');
      setShowCouponForm(false);
      setCouponForm({ code: '', type: 'percentage', value: 0, active: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
      toast.error('Failed to create coupon');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    const path = `coupons/${id}`;
    try {
      await deleteDoc(doc(db, 'coupons', id));
      toast.success('Coupon deleted');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
      toast.error('Failed to delete coupon');
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-6">
        <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center">
          <Package className="w-8 h-8 text-zinc-300" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-medium tracking-tight">Admin Access</h2>
          <p className="text-zinc-500">Please login with an authorized account to manage the store.</p>
        </div>
        <button 
          onClick={handleLogin}
          className="bg-zinc-900 text-white px-8 py-3 rounded-full font-medium hover:bg-zinc-800 transition-all"
        >
          Login with Google
        </button>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-32 space-y-4">
        <h2 className="text-2xl font-medium text-red-600">Access Denied</h2>
        <p className="text-zinc-500">You do not have administrative privileges.</p>
        <button onClick={handleLogout} className="text-sm font-medium underline">Logout</button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-medium tracking-tight">Admin Dashboard</h1>
          <p className="text-zinc-500 text-sm">Manage your products, orders, and coupons.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={async () => {
              if (!confirm('Seed sample data?')) return;
              const sampleProducts = [
                {
                  name: "Premium Cotton T-Shirt",
                  price: 1200,
                  category: "T-Shirt",
                  subCategory: "Half Sleeve",
                  images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800"],
                  sizes: ["S", "M", "L", "XL"],
                  colors: ["Black", "White", "Navy"],
                  stock: 50,
                  trending: true,
                  createdAt: Timestamp.now(),
                  description: "A premium cotton t-shirt with a minimalist design."
                },
                {
                  name: "Slim Fit Panjabi",
                  price: 3500,
                  category: "Panjabi",
                  subCategory: "Slim Fit",
                  images: ["https://images.unsplash.com/photo-1597933534024-164966688133?auto=format&fit=crop&q=80&w=800"],
                  sizes: ["M", "L", "XL", "XXL"],
                  colors: ["White", "Beige"],
                  stock: 20,
                  trending: true,
                  createdAt: Timestamp.now(),
                  description: "Elegant slim-fit panjabi for traditional occasions."
                },
                {
                  name: "Classic Polo Shirt",
                  price: 1800,
                  category: "Polo Shirt",
                  subCategory: "Premium",
                  images: ["https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&q=80&w=800"],
                  sizes: ["S", "M", "L", "XL"],
                  colors: ["Navy", "Royal Blue", "Grey"],
                  stock: 30,
                  trending: false,
                  createdAt: Timestamp.now(),
                  description: "Timeless polo shirt for a smart-casual look."
                },
                {
                  name: "Denim Jeans",
                  price: 2500,
                  category: "Pants",
                  subCategory: "Denim",
                  images: ["https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=800"],
                  sizes: ["30", "32", "34", "36"],
                  colors: ["Navy", "Black"],
                  stock: 25,
                  trending: true,
                  createdAt: Timestamp.now(),
                  description: "Durable and stylish denim jeans for everyday wear."
                }
              ];
              for (const p of sampleProducts) {
                await addDoc(collection(db, 'products'), p);
              }
              toast.success('Sample data seeded!');
            }}
            className="text-xs font-medium text-zinc-400 hover:text-zinc-900 transition-colors"
          >
            Seed Sample Data
          </button>
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium">{user.displayName}</p>
            <p className="text-xs text-zinc-400">{user.email}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-500 hover:text-red-600"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex border-b border-zinc-100">
        {[
          { id: 'products', label: 'Products', icon: Package },
          { id: 'orders', label: 'Orders', icon: ShoppingBag },
          { id: 'coupons', label: 'Coupons', icon: Tag },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-all",
              activeTab === tab.id 
                ? "border-zinc-900 text-zinc-900" 
                : "border-transparent text-zinc-400 hover:text-zinc-600"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-medium">Product Inventory ({products.length})</h2>
              <button 
                onClick={() => {
                  setEditingProduct(null);
                  setProductForm({
                    name: '',
                    description: '',
                    price: 0,
                    category: 'T-Shirt',
                    subCategory: '',
                    images: [''],
                    sizes: [],
                    colors: [],
                    stock: 10,
                    trending: false
                  });
                  setShowProductForm(true);
                }}
                className="bg-zinc-900 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-zinc-800 transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </button>
            </div>

            {showProductForm && (
              <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm" onClick={() => setShowProductForm(false)} />
                <div className="relative w-full max-w-2xl bg-white rounded-3xl p-8 max-h-[90vh] overflow-y-auto shadow-2xl">
                  <h3 className="text-2xl font-medium mb-6">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                  <form onSubmit={handleSaveProduct} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Product Name</label>
                        <input 
                          required
                          type="text" 
                          value={productForm.name}
                          onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                          className="w-full px-4 py-2 bg-zinc-50 border-none rounded-xl focus:ring-2 focus:ring-zinc-900"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Price (BDT)</label>
                        <input 
                          required
                          type="number" 
                          value={productForm.price}
                          onChange={(e) => setProductForm({...productForm, price: Number(e.target.value)})}
                          className="w-full px-4 py-2 bg-zinc-50 border-none rounded-xl focus:ring-2 focus:ring-zinc-900"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Category</label>
                        <select 
                          value={productForm.category}
                          onChange={(e) => setProductForm({...productForm, category: e.target.value as Category})}
                          className="w-full px-4 py-2 bg-zinc-50 border-none rounded-xl focus:ring-2 focus:ring-zinc-900"
                        >
                          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Description</label>
                        <textarea 
                          rows={3}
                          value={productForm.description}
                          onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                          className="w-full px-4 py-2 bg-zinc-50 border-none rounded-xl focus:ring-2 focus:ring-zinc-900 resize-none"
                        />
                      </div>
                      <div className="col-span-2 space-y-2">
                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Image URLs</label>
                        {productForm.images.map((url, index) => (
                          <div key={index} className="flex gap-2">
                            <input 
                              required
                              type="url" 
                              value={url}
                              onChange={(e) => {
                                const newImages = [...productForm.images];
                                newImages[index] = e.target.value;
                                setProductForm({...productForm, images: newImages});
                              }}
                              className="flex-1 px-4 py-2 bg-zinc-50 border-none rounded-xl focus:ring-2 focus:ring-zinc-900"
                              placeholder="https://images.unsplash.com/..."
                            />
                            {productForm.images.length > 1 && (
                              <button 
                                type="button"
                                onClick={() => {
                                  const newImages = productForm.images.filter((_, i) => i !== index);
                                  setProductForm({...productForm, images: newImages});
                                }}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                        <button 
                          type="button"
                          onClick={() => setProductForm({...productForm, images: [...productForm.images, '']})}
                          className="text-xs font-medium text-zinc-500 hover:text-zinc-900 flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          Add another image
                        </button>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Available Sizes</label>
                        <div className="flex flex-wrap gap-2">
                          {SIZES.map(size => (
                            <button
                              key={size}
                              type="button"
                              onClick={() => {
                                const newSizes = productForm.sizes.includes(size)
                                  ? productForm.sizes.filter(s => s !== size)
                                  : [...productForm.sizes, size];
                                setProductForm({...productForm, sizes: newSizes});
                              }}
                              className={cn(
                                "px-3 py-1 rounded-lg text-xs font-medium border transition-all",
                                productForm.sizes.includes(size)
                                  ? "bg-zinc-900 text-white border-zinc-900"
                                  : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300"
                              )}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Available Colors</label>
                        <div className="flex flex-wrap gap-2">
                          {COLORS.map(color => (
                            <button
                              key={color.name}
                              type="button"
                              onClick={() => {
                                const newColors = productForm.colors.includes(color.name)
                                  ? productForm.colors.filter(c => c !== color.name)
                                  : [...productForm.colors, color.name];
                                setProductForm({...productForm, colors: newColors});
                              }}
                              className={cn(
                                "flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-medium border transition-all",
                                productForm.colors.includes(color.name)
                                  ? "bg-zinc-900 text-white border-zinc-900"
                                  : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300"
                              )}
                            >
                              <div 
                                className="w-3 h-3 rounded-full border border-zinc-200" 
                                style={{ backgroundColor: color.hex }} 
                              />
                              {color.name}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Stock</label>
                        <input 
                          required
                          type="number" 
                          value={productForm.stock}
                          onChange={(e) => setProductForm({...productForm, stock: Number(e.target.value)})}
                          className="w-full px-4 py-2 bg-zinc-50 border-none rounded-xl focus:ring-2 focus:ring-zinc-900"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={productForm.trending}
                          onChange={(e) => setProductForm({...productForm, trending: e.target.checked})}
                          className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                        />
                        <label className="text-sm font-medium">Trending Product</label>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6">
                      <button 
                        type="button"
                        onClick={() => setShowProductForm(false)}
                        className="px-6 py-2 text-sm font-medium text-zinc-500 hover:text-zinc-900"
                      >
                        Cancel
                      </button>
                      <button 
                        disabled={loading}
                        type="submit"
                        className="bg-zinc-900 text-white px-8 py-2 rounded-full text-sm font-medium hover:bg-zinc-800 transition-all flex items-center gap-2"
                      >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        Save Product
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="bg-white border border-zinc-100 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 text-zinc-500 uppercase text-[10px] font-bold tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Stock</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={p.images[0]} className="w-10 h-10 rounded-lg object-cover" referrerPolicy="no-referrer" />
                          <span className="font-medium">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-zinc-500">{p.category}</td>
                      <td className="px-6 py-4 font-medium">{formatPrice(p.price)}</td>
                      <td className="px-6 py-4 text-zinc-500">{p.stock}</td>
                      <td className="px-6 py-4">
                        {p.trending && (
                          <span className="bg-zinc-900 text-white text-[10px] font-bold px-2 py-1 rounded uppercase">Trending</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => {
                              setEditingProduct(p);
                              setProductForm({
                                name: p.name,
                                description: p.description || '',
                                price: p.price,
                                category: p.category,
                                subCategory: p.subCategory || '',
                                images: p.images,
                                sizes: p.sizes,
                                colors: p.colors || [],
                                stock: p.stock,
                                trending: p.trending
                              });
                              setShowProductForm(true);
                            }}
                            className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-900 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
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

        {activeTab === 'orders' && (
          <div className="space-y-6">
            <h2 className="text-xl font-medium">Recent Orders ({orders.length})</h2>
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="bg-white border border-zinc-100 rounded-2xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="space-y-4 flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center font-bold text-zinc-400">
                            {order.customerName.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-medium">{order.customerName}</h3>
                            <p className="text-xs text-zinc-400">Order ID: {order.id?.slice(-8).toUpperCase()}</p>
                          </div>
                        </div>
                        <div className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          order.status === 'Pending' && "bg-amber-100 text-amber-700",
                          order.status === 'Shipped' && "bg-blue-100 text-blue-700",
                          order.status === 'Delivered' && "bg-emerald-100 text-emerald-700",
                          order.status === 'Cancelled' && "bg-red-100 text-red-700",
                        )}>
                          {order.status}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Contact</p>
                          <p>{order.phone}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Address</p>
                          <p className="line-clamp-1">{order.address}</p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-zinc-50">
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Items</p>
                        <div className="flex flex-wrap gap-2">
                          {order.items.map((item, i) => (
                            <span key={i} className="bg-zinc-50 px-3 py-1 rounded-lg text-xs font-medium">
                              {item.quantity}x {item.name} ({item.size}{item.color ? `, ${item.color}` : ''})
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="md:w-64 md:border-l md:border-zinc-100 md:pl-6 flex flex-col justify-between">
                      <div>
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Total Amount</p>
                        <p className="text-2xl font-semibold">{formatPrice(order.finalAmount)}</p>
                        {order.discountAmount > 0 && (
                          <p className="text-xs text-emerald-600">Discount: -{formatPrice(order.discountAmount)}</p>
                        )}
                      </div>

                      <div className="pt-6 space-y-2">
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Update Status</p>
                        <div className="flex flex-wrap gap-2">
                          {(['Pending', 'Shipped', 'Delivered', 'Cancelled'] as OrderStatus[]).map(s => (
                            <button
                              key={s}
                              onClick={() => handleUpdateOrderStatus(order.id!, s)}
                              className={cn(
                                "px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all",
                                order.status === s 
                                  ? "bg-zinc-900 text-white" 
                                  : "bg-zinc-100 text-zinc-400 hover:bg-zinc-200"
                              )}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'coupons' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-medium">Discount Coupons ({coupons.length})</h2>
              <button 
                onClick={() => setShowCouponForm(true)}
                className="bg-zinc-900 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-zinc-800 transition-all"
              >
                <Plus className="w-4 h-4" />
                Create Coupon
              </button>
            </div>

            {showCouponForm && (
              <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm" onClick={() => setShowCouponForm(false)} />
                <div className="relative w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl">
                  <h3 className="text-2xl font-medium mb-6">New Coupon</h3>
                  <form onSubmit={handleSaveCoupon} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Coupon Code</label>
                      <input 
                        required
                        type="text" 
                        value={couponForm.code}
                        onChange={(e) => setCouponForm({...couponForm, code: e.target.value})}
                        className="w-full px-4 py-2 bg-zinc-50 border-none rounded-xl focus:ring-2 focus:ring-zinc-900 uppercase"
                        placeholder="SUMMER20"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Type</label>
                        <select 
                          value={couponForm.type}
                          onChange={(e) => setCouponForm({...couponForm, type: e.target.value as any})}
                          className="w-full px-4 py-2 bg-zinc-50 border-none rounded-xl focus:ring-2 focus:ring-zinc-900"
                        >
                          <option value="percentage">Percentage (%)</option>
                          <option value="flat">Flat Amount</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Value</label>
                        <input 
                          required
                          type="number" 
                          value={couponForm.value}
                          onChange={(e) => setCouponForm({...couponForm, value: Number(e.target.value)})}
                          className="w-full px-4 py-2 bg-zinc-50 border-none rounded-xl focus:ring-2 focus:ring-zinc-900"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6">
                      <button 
                        type="button"
                        onClick={() => setShowCouponForm(false)}
                        className="px-6 py-2 text-sm font-medium text-zinc-500 hover:text-zinc-900"
                      >
                        Cancel
                      </button>
                      <button 
                        disabled={loading}
                        type="submit"
                        className="bg-zinc-900 text-white px-8 py-2 rounded-full text-sm font-medium hover:bg-zinc-800 transition-all flex items-center gap-2"
                      >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        Create
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {coupons.map(coupon => (
                <div key={coupon.id} className="bg-white border border-zinc-100 rounded-2xl p-6 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold tracking-wider text-zinc-900">{coupon.code}</h3>
                    <p className="text-sm text-zinc-500">
                      {coupon.type === 'percentage' ? `${coupon.value}% Off` : `${formatPrice(coupon.value)} Off`}
                    </p>
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-widest",
                      coupon.active ? "text-emerald-600" : "text-red-500"
                    )}>
                      {coupon.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleDeleteCoupon(coupon.id)}
                    className="p-2 hover:bg-zinc-50 rounded-lg text-zinc-300 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
