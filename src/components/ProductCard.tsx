import React, { useState } from 'react';
import { Product } from '../types';
import { formatPrice } from '../utils';
import { motion } from 'motion/react';
import { Plus, Eye, Star } from 'lucide-react';
import { ProductModal } from './ProductModal';
import { useCartStore } from '../store';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
  key?: string | number;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const addItem = useCartStore(state => state.addItem);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Default to first size and color for quick add
    addItem(product, product.sizes[0], product.colors?.[0] || '');
    toast.success(`Added ${product.name} to cart`);
  };

  return (
    <>
      <motion.div 
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -8 }}
        className="group cursor-pointer bg-white rounded-3xl p-3 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)]"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="relative aspect-[3/4] overflow-hidden bg-zinc-100 rounded-2xl mb-4">
          <img 
            src={product.images[0]} 
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
          
          {/* Overlay Actions */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center p-6 gap-3">
            <motion.button 
              initial={{ y: 20, opacity: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={{ 
                y: isModalOpen ? 20 : 0, 
                opacity: 1 
              }}
              onClick={handleQuickAdd}
              className="w-full bg-white text-zinc-900 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-zinc-50 transition-colors shadow-xl"
            >
              <Plus className="w-4 h-4" />
              Quick Add
            </motion.button>
            
            <motion.button 
              initial={{ y: 20, opacity: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={{ 
                y: isModalOpen ? 20 : 0, 
                opacity: 1 
              }}
              className="w-full bg-zinc-900/90 backdrop-blur-md text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors shadow-xl"
              onClick={(e) => {
                e.stopPropagation();
                setIsModalOpen(true);
              }}
            >
              <Eye className="w-4 h-4" />
              View Details
            </motion.button>
          </div>

          {product.trending && (
            <div className="absolute top-4 left-4 overflow-hidden rounded-lg">
              <motion.span 
                initial={{ x: -50 }}
                animate={{ x: 0 }}
                className="bg-white/90 backdrop-blur-md text-zinc-900 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 block shadow-sm"
              >
                Trending
              </motion.span>
            </div>
          )}

          {product.averageRating && product.averageRating > 0 && (
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-[10px] font-bold text-zinc-900">{product.averageRating}</span>
            </div>
          )}
        </div>

        <div className="px-2 pb-2 space-y-1.5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">{product.category}</p>
              <h3 className="text-sm font-semibold text-zinc-900 tracking-tight group-hover:text-zinc-600 transition-colors">{product.name}</h3>
            </div>
          </div>
          <p className="text-base font-bold text-zinc-900">{formatPrice(product.price)}</p>
        </div>
      </motion.div>

      <ProductModal 
        product={product} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}
