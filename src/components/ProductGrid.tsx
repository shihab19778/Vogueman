import React, { useState, useRef, useEffect } from 'react';
import { Product, Category } from '../types';
import { ProductCard } from './ProductCard';
import { CATEGORIES } from '../constants';
import { cn } from '../utils';
import { Search, SlidersHorizontal, X, ArrowUpDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'name-asc';

interface ProductGridProps {
  products: Product[];
  showFilters?: boolean;
}

export function ProductGrid({ products, showFilters = false }: ProductGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const suggestions = products
    .filter(p => 
      searchQuery.length >= 2 && 
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice(0, 5);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredProducts = products
    .filter(p => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      return 0; // 'featured' or default
    });

  return (
    <div className="space-y-8">
      {showFilters && (
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar w-full md:w-auto">
            <button
              onClick={() => setSelectedCategory('All')}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                selectedCategory === 'All' 
                  ? "bg-zinc-900 text-white" 
                  : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
              )}
            >
              All
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                  selectedCategory === cat 
                    ? "bg-zinc-900 text-white" 
                    : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-64" ref={searchRef}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                className="w-full pl-10 pr-10 py-2 bg-zinc-100 border-none rounded-full text-sm focus:ring-2 focus:ring-zinc-900 transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setShowSuggestions(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-200 rounded-full transition-colors"
                >
                  <X className="w-3 h-3 text-zinc-400" />
                </button>
              )}

              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-zinc-100 overflow-hidden z-50"
                  >
                    <div className="p-2">
                      <p className="px-3 py-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                        Suggestions
                      </p>
                      {suggestions.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => {
                            setSearchQuery(product.name);
                            setShowSuggestions(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 hover:bg-zinc-50 rounded-xl transition-colors text-left group"
                        >
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-100 flex-shrink-0">
                            <img 
                              src={product.images[0]} 
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-zinc-900 truncate">{product.name}</p>
                            <p className="text-xs text-zinc-500 truncate">{product.category}</p>
                          </div>
                          <div className="text-xs font-semibold text-zinc-900">
                            ৳{product.price.toLocaleString()}
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative">
              <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full md:w-48 pl-10 pr-4 py-2 bg-zinc-100 border-none rounded-full text-sm focus:ring-2 focus:ring-zinc-900 transition-all appearance-none cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-8 md:gap-y-16">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <p className="text-zinc-500">No products found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
