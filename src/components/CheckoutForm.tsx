import React, { useState } from 'react';
import { useCartStore } from '../store';
import { formatPrice } from '../utils';
import { ArrowLeft, CheckCircle2, Loader2, Tag } from 'lucide-react';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { Order } from '../types';

import { divisions, districts, upazilas } from '../data/bangladeshData';

interface CheckoutFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

export function CheckoutForm({ onBack, onSuccess }: CheckoutFormProps) {
  const { items, subtotal, appliedCoupon, setCoupon, discountAmount, finalTotal, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [orderComplete, setOrderComplete] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    division: '',
    district: '',
    upazila: '',
    localAddress: '',
  });

  const fullAddress = `${formData.localAddress}, ${formData.upazila}, ${formData.district}, ${formData.division}`;

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setLoading(true);
    const path = 'coupons';
    try {
      const q = query(collection(db, path), where('code', '==', couponCode.toUpperCase()), where('active', '==', true));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        toast.error('Invalid or expired coupon code');
        setCoupon(null);
      } else {
        const couponData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as any;
        setCoupon(couponData);
        toast.success('Coupon applied successfully!');
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      toast.error('Error applying coupon');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    
    setLoading(true);
    const path = 'orders';
    try {
      const order: Order = {
        customerName: formData.fullName,
        phone: formData.phone,
        address: fullAddress,
        uid: auth.currentUser?.uid,
        items: items.map(item => ({
          productId: item.id,
          name: item.name,
          size: item.selectedSize,
          color: item.selectedColor,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: subtotal(),
        discountAmount: discountAmount(),
        finalAmount: finalTotal(),
        status: 'Pending',
        paymentMethod: 'COD',
        createdAt: Timestamp.now()
      };

      await addDoc(collection(db, path), order);
      setOrderComplete(true);
      clearCart();
      toast.success('Order placed successfully!');
      setTimeout(() => {
        onSuccess();
      }, 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="text-center py-20 space-y-6">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
        </div>
        <h2 className="text-3xl font-medium tracking-tight">Order Confirmed!</h2>
        <p className="text-zinc-500 max-w-md mx-auto">
          Thank you for shopping with VogueMen. Your order has been placed and will be delivered soon via Cash on Delivery.
        </p>
        <button 
          onClick={onSuccess}
          className="bg-zinc-900 text-white px-8 py-3 rounded-full font-medium hover:bg-zinc-800 transition-all"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div className="space-y-8">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Shop
        </button>

        <div>
          <h2 className="text-2xl font-medium tracking-tight mb-6">Delivery Details</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Full Name</label>
              <input 
                required
                type="text" 
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                className="w-full px-4 py-3 bg-zinc-50 border-none rounded-xl focus:ring-2 focus:ring-zinc-900 transition-all"
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Phone Number</label>
              <input 
                required
                type="tel" 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-3 bg-zinc-50 border-none rounded-xl focus:ring-2 focus:ring-zinc-900 transition-all"
                placeholder="01XXXXXXXXX"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Division (বিভাগ)</label>
              <select 
                required
                value={formData.division}
                onChange={(e) => setFormData({...formData, division: e.target.value, district: '', upazila: ''})}
                className="w-full px-4 py-3 bg-zinc-50 border-none rounded-xl focus:ring-2 focus:ring-zinc-900 transition-all"
              >
                <option value="">Select Division</option>
                {divisions.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">District (জেলা)</label>
                <select 
                  required
                  disabled={!formData.division}
                  value={formData.district}
                  onChange={(e) => setFormData({...formData, district: e.target.value, upazila: ''})}
                  className="w-full px-4 py-3 bg-zinc-50 border-none rounded-xl focus:ring-2 focus:ring-zinc-900 transition-all disabled:opacity-50"
                >
                  <option value="">Select District</option>
                  {formData.division && districts[formData.division]?.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Upazila (উপজেলা)</label>
                <select 
                  required
                  disabled={!formData.district}
                  value={formData.upazila}
                  onChange={(e) => setFormData({...formData, upazila: e.target.value})}
                  className="w-full px-4 py-3 bg-zinc-50 border-none rounded-xl focus:ring-2 focus:ring-zinc-900 transition-all disabled:opacity-50"
                >
                  <option value="">Select Upazila</option>
                  {formData.district && (upazilas[formData.district] || [formData.district + " Sadar"]).map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Local Address (গ্রাম/মহল্লা/বাড়ি নং)</label>
              <textarea 
                required
                rows={3}
                value={formData.localAddress}
                onChange={(e) => setFormData({...formData, localAddress: e.target.value})}
                className="w-full px-4 py-3 bg-zinc-50 border-none rounded-xl focus:ring-2 focus:ring-zinc-900 transition-all resize-none"
                placeholder="House no, Road no, Village, Area..."
              />
            </div>
            
            <div className="pt-4">
              <div className="bg-zinc-50 p-4 rounded-2xl mb-6">
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Payment Method</p>
                <div className="flex items-center gap-3 text-zinc-900 font-medium">
                  <div className="w-4 h-4 rounded-full border-4 border-zinc-900" />
                  Cash on Delivery (COD)
                </div>
              </div>

              <button 
                disabled={loading || items.length === 0}
                type="submit"
                className="w-full bg-zinc-900 text-white py-4 rounded-2xl font-medium flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Place Order'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="bg-zinc-50 p-8 rounded-3xl h-fit space-y-8">
        <h3 className="text-xl font-medium tracking-tight">Order Summary</h3>
        
        <div className="space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
          {items.map((item) => (
            <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="flex justify-between items-center text-sm">
              <div className="flex gap-3">
                <span className="text-zinc-400 font-medium">{item.quantity}x</span>
                <div>
                  <p className="font-medium text-zinc-900">{item.name}</p>
                  <div className="flex gap-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Size: {item.selectedSize}</p>
                    {item.selectedColor && (
                      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Color: {item.selectedColor}</p>
                    )}
                  </div>
                </div>
              </div>
              <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-zinc-200 space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input 
                type="text" 
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Coupon code"
                className="w-full pl-10 pr-4 py-2 bg-white border-none rounded-full text-sm focus:ring-2 focus:ring-zinc-900 transition-all"
              />
            </div>
            <button 
              onClick={handleApplyCoupon}
              disabled={loading || !couponCode}
              className="px-6 py-2 bg-zinc-900 text-white rounded-full text-sm font-medium hover:bg-zinc-800 transition-all disabled:opacity-50"
            >
              Apply
            </button>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-zinc-500">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal())}</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span className="flex items-center gap-1">
                  Discount ({appliedCoupon.code})
                  <button onClick={() => setCoupon(null)} className="text-[10px] underline">Remove</button>
                </span>
                <span>-{formatPrice(discountAmount())}</span>
              </div>
            )}
            <div className="flex justify-between text-zinc-500">
              <span>Shipping</span>
              <span>{formatPrice(99)}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold text-zinc-900 pt-2 border-t border-zinc-200">
              <span>Total</span>
              <span>{formatPrice(finalTotal())}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
