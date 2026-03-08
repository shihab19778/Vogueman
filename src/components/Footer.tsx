import React from 'react';

interface FooterProps {
  setView: (view: any) => void;
}

export function Footer({ setView }: FooterProps) {
  return (
    <footer className="bg-zinc-50 border-t border-zinc-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold tracking-tighter mb-6">VOGUEMEN</h3>
            <p className="text-zinc-500 max-w-sm mb-6">
              VogueMen is a premium men's apparel brand dedicated to providing high-quality, minimalist clothing for the modern man.
            </p>
            <div className="flex gap-4">
              {/* Social placeholders */}
              <div className="w-8 h-8 rounded-full bg-zinc-200" />
              <div className="w-8 h-8 rounded-full bg-zinc-200" />
              <div className="w-8 h-8 rounded-full bg-zinc-200" />
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-6">Shop</h4>
            <ul className="space-y-4 text-sm text-zinc-500">
              <li><button onClick={() => setView('shop')} className="hover:text-zinc-900">T-Shirts</button></li>
              <li><button onClick={() => setView('shop')} className="hover:text-zinc-900">Panjabis</button></li>
              <li><button onClick={() => setView('shop')} className="hover:text-zinc-900">Polo Shirts</button></li>
              <li><button onClick={() => setView('shop')} className="hover:text-zinc-900">Pants & Trousers</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-6">Support</h4>
            <ul className="space-y-4 text-sm text-zinc-500">
              <li><a href="#" className="hover:text-zinc-900">Size Guide</a></li>
              <li><a href="#" className="hover:text-zinc-900">Shipping Policy</a></li>
              <li><a href="#" className="hover:text-zinc-900">Returns & Exchanges</a></li>
              <li><a href="#" className="hover:text-zinc-900">Contact Us</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-zinc-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-400">
          <p>© 2026 VogueMen Apparel. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-zinc-900">Privacy Policy</a>
            <a href="#" className="hover:text-zinc-900">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
