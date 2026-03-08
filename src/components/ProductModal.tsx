import React, { useState, useEffect } from 'react';
import { Product, Review } from '../types';
import { formatPrice } from '../utils';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, ChevronLeft, ChevronRight, Ruler, Star, MessageSquare } from 'lucide-react';
import { useCartStore } from '../store';
import { SIZES, COLORS } from '../constants';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { ReviewForm } from './ReviewForm';
import toast from 'react-hot-toast';

interface ProductModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || '');
  const [currentImage, setCurrentImage] = useState(0);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [isZoomed, setIsZoomed] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');
  const addItem = useCartStore(state => state.addItem);

  useEffect(() => {
    if (!isOpen) return;

    const q = query(
      collection(db, 'reviews'),
      where('productId', '==', product.id),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedReviews = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Review));
      setReviews(fetchedReviews);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'reviews');
    });

    return () => unsubscribe();
  }, [isOpen, product.id]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }
    if (product.colors?.length > 0 && !selectedColor) {
      toast.error('Please select a color');
      return;
    }
    addItem(product, selectedSize, selectedColor);
    toast.success(`Added ${product.name} to cart`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-5xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
        >
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 z-10 p-2 bg-white/80 backdrop-blur-md rounded-full hover:bg-white transition-colors shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Image Gallery */}
          <div 
            className="w-full md:w-1/2 relative bg-zinc-100 aspect-[4/5] md:aspect-auto md:h-auto overflow-hidden cursor-zoom-in group"
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
          >
            <img 
              src={product.images[currentImage]} 
              alt={product.name}
              className="w-full h-full object-contain transition-transform duration-200 ease-out"
              style={{
                transform: isZoomed ? 'scale(2.5)' : 'scale(1)',
                transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`
              }}
              referrerPolicy="no-referrer"
            />
            {product.images.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                {product.images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImage(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      currentImage === idx ? "bg-zinc-900 w-6" : "bg-zinc-400"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold tracking-widest uppercase text-zinc-400">
                  {product.category}
                </span>
                {product.averageRating && (
                  <div className="flex items-center gap-1 bg-zinc-100 px-2 py-0.5 rounded-full">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-[10px] font-bold">{product.averageRating}</span>
                    <span className="text-[10px] text-zinc-400">({product.reviewCount})</span>
                  </div>
                )}
              </div>
              <h2 className="text-3xl font-medium tracking-tight mb-2">{product.name}</h2>
              <p className="text-2xl font-semibold text-zinc-900">{formatPrice(product.price)}</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-8 border-b border-zinc-100 mb-8">
              <button 
                onClick={() => setActiveTab('details')}
                className={`pb-4 text-sm font-medium transition-all relative ${
                  activeTab === 'details' ? 'text-zinc-900' : 'text-zinc-400'
                }`}
              >
                Details
                {activeTab === 'details' && (
                  <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900" />
                )}
              </button>
              <button 
                onClick={() => setActiveTab('reviews')}
                className={`pb-4 text-sm font-medium transition-all relative flex items-center gap-2 ${
                  activeTab === 'reviews' ? 'text-zinc-900' : 'text-zinc-400'
                }`}
              >
                Reviews ({reviews.length})
                {activeTab === 'reviews' && (
                  <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900" />
                )}
              </button>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'details' ? (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                >
                  <div className="mb-8">
                    <p className="text-zinc-600 leading-relaxed">
                      {product.description || "Premium quality apparel designed for comfort and style. Made from high-grade materials to ensure durability and a perfect fit."}
                    </p>
                  </div>

                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-bold uppercase tracking-wider">Select Size</h4>
                      <button className="text-xs font-medium text-zinc-500 flex items-center gap-1 hover:text-zinc-900">
                        <Ruler className="w-3 h-3" />
                        Size Guide
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {product.sizes.map(size => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`w-12 h-12 rounded-xl border-2 font-medium transition-all flex items-center justify-center ${
                            selectedSize === size 
                              ? "border-zinc-900 bg-zinc-900 text-white" 
                              : "border-zinc-100 hover:border-zinc-200 text-zinc-500"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {product.colors && product.colors.length > 0 && (
                    <div className="mb-8">
                      <h4 className="text-sm font-bold uppercase tracking-wider mb-4">Select Color</h4>
                      <div className="flex flex-wrap gap-3">
                        {product.colors.map(colorName => {
                          const colorInfo = COLORS.find(c => c.name === colorName);
                          return (
                            <button
                              key={colorName}
                              onClick={() => setSelectedColor(colorName)}
                              className={`group relative flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all ${
                                selectedColor === colorName
                                  ? "border-zinc-900 bg-zinc-900 text-white"
                                  : "border-zinc-100 hover:border-zinc-200 text-zinc-500"
                              }`}
                            >
                              <div 
                                className="w-4 h-4 rounded-full border border-white/20" 
                                style={{ backgroundColor: colorInfo?.hex || '#ccc' }} 
                              />
                              <span className="text-sm font-medium">{colorName}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <button 
                    onClick={handleAddToCart}
                    className="w-full bg-zinc-900 text-white py-4 rounded-2xl font-medium flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all active:scale-[0.98]"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    Add to Cart
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="reviews"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-8"
                >
                  <ReviewForm product={product} />

                  <div className="space-y-6">
                    {reviews.length > 0 ? (
                      reviews.map((review) => (
                        <div key={review.id} className="border-b border-zinc-100 pb-6 last:border-0">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-sm">{review.userName}</h5>
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star 
                                  key={s} 
                                  className={`w-3 h-3 ${s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-zinc-200'}`} 
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-zinc-600 text-sm leading-relaxed">{review.comment}</p>
                          <p className="text-[10px] text-zinc-400 mt-2 uppercase tracking-widest">
                            {review.createdAt?.toDate ? review.createdAt.toDate().toLocaleDateString() : 'Just now'}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
                        <MessageSquare className="w-8 h-8 text-zinc-300 mx-auto mb-3" />
                        <p className="text-zinc-500 text-sm">No reviews yet. Be the first to review!</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-8 pt-8 border-t border-zinc-100 grid grid-cols-2 gap-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              <div>
                <p className="mb-1">Fabric</p>
                <p className="text-zinc-900">100% Premium Cotton</p>
              </div>
              <div>
                <p className="mb-1">Shipping</p>
                <p className="text-zinc-900">COD Available</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

