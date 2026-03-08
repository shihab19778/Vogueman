import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProductGrid } from './components/ProductGrid';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutForm } from './components/CheckoutForm';
import { AdminDashboard } from './components/AdminDashboard';
import { Footer } from './components/Footer';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, query, orderBy, getDocFromServer, doc } from 'firebase/firestore';
import { Product } from './types';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [view, setView] = useState<'home' | 'shop' | 'checkout' | 'admin'>('home');
  const [products, setProducts] = useState<Product[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const prods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(prods);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'products');
    });
    return () => unsubscribe();
  }, []);

  // Test connection
  useEffect(() => {
    async function testConnection() {
      const path = 'test/connection';
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. The client is operating in offline mode.");
        } else {
          handleFirestoreError(error, OperationType.GET, path);
        }
      }
    }
    testConnection();
  }, []);

  const trendingProducts = products.filter(p => p.trending);

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900 selection:bg-zinc-900 selection:text-white">
      <Toaster position="bottom-right" />
      
      <Navbar 
        onCartClick={() => setIsCartOpen(true)} 
        setView={setView} 
        currentView={view}
        user={user}
      />

      <main className="pt-16">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Hero onShopClick={() => setView('shop')} />
              <section className="max-w-7xl mx-auto px-4 py-16">
                <div className="flex items-baseline justify-between mb-8">
                  <h2 className="text-2xl font-medium tracking-tight">Trending Now</h2>
                  <button 
                    onClick={() => setView('shop')}
                    className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
                  >
                    View all products &rarr;
                  </button>
                </div>
                <ProductGrid products={trendingProducts.length > 0 ? trendingProducts : products.slice(0, 4)} />
              </section>
            </motion.div>
          )}

          {view === 'shop' && (
            <motion.div
              key="shop"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-7xl mx-auto px-4 py-12"
            >
              <h1 className="text-4xl font-medium tracking-tight mb-12">Our Collection</h1>
              <ProductGrid products={products} showFilters />
            </motion.div>
          )}

          {view === 'checkout' && (
            <motion.div
              key="checkout"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="max-w-3xl mx-auto px-4 py-12"
            >
              <CheckoutForm onBack={() => setView('shop')} onSuccess={() => setView('home')} />
            </motion.div>
          )}

          {view === 'admin' && (
            <motion.div
              key="admin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto px-4 py-12"
            >
              <AdminDashboard user={user} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer setView={setView} />
      
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        onCheckout={() => {
          setIsCartOpen(false);
          setView('checkout');
        }}
      />
    </div>
  );
}
