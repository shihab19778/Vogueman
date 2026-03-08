import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { useCartStore } from '../store';
import { formatPrice } from '../utils';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export function CartDrawer({ isOpen, onClose, onCheckout }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, subtotal, totalItems } = useCartStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-zinc-900/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 z-[110] w-full max-w-md bg-white shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5" />
                <h2 className="text-lg font-medium">Your Cart ({totalItems()})</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-zinc-50 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8 text-zinc-300" />
                  </div>
                  <div>
                    <p className="font-medium text-zinc-900">Your cart is empty</p>
                    <p className="text-sm text-zinc-500">Add some premium items to get started.</p>
                  </div>
                  <button 
                    onClick={onClose}
                    className="text-sm font-bold uppercase tracking-widest text-zinc-900 hover:underline"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="flex gap-4">
                    <div className="w-20 h-24 bg-zinc-100 rounded-xl overflow-hidden flex-shrink-0">
                      <img 
                        src={item.images[0]} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="text-sm font-medium text-zinc-900">{item.name}</h3>
                          <button 
                            onClick={() => removeItem(item.id, item.selectedSize, item.selectedColor)}
                            className="text-zinc-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex gap-2 mt-1">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Size: {item.selectedSize}</p>
                          {item.selectedColor && (
                            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Color: {item.selectedColor}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3 bg-zinc-50 rounded-lg px-2 py-1">
                          <button 
                            onClick={() => updateQuantity(item.id, item.selectedSize, item.selectedColor, item.quantity - 1)}
                            className="p-1 hover:bg-white rounded-md transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.selectedSize, item.selectedColor, item.quantity + 1)}
                            className="p-1 hover:bg-white rounded-md transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-sm font-semibold">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 border-t border-zinc-100 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline text-sm">
                    <span className="text-zinc-500">Subtotal</span>
                    <span className="font-medium">{formatPrice(subtotal())}</span>
                  </div>
                  <div className="flex justify-between items-baseline text-sm">
                    <span className="text-zinc-500">Delivery Charge</span>
                    <span className="font-medium">{formatPrice(99)}</span>
                  </div>
                  <div className="flex justify-between items-baseline pt-2 border-t border-zinc-50">
                    <span className="text-zinc-900 font-medium">Total</span>
                    <span className="text-xl font-semibold">{formatPrice(subtotal() + 99)}</span>
                  </div>
                </div>
                <p className="text-xs text-zinc-400">Taxes calculated at checkout.</p>
                <button 
                  onClick={onCheckout}
                  className="w-full bg-zinc-900 text-white py-4 rounded-2xl font-medium flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all"
                >
                  Checkout
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
