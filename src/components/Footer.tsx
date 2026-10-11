import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { BrandLogo } from './BrandLogo';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { setRoute, settings, activeCategories } = useStore();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || !newsletterEmail.includes('@')) return;
    setNewsletterSubscribed(true);
  };

  return (
    <footer className="bg-[#FAF7F2] border-t border-[#E8E0D5] text-[#4A3E37]">
      {/* 4 Feature Trust Badges Bar (Matches bottom strip in screenshot) */}
      <div className="border-b border-[#E8E0D5] bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
            {/* Free Shipping */}
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#FAF5EE] flex items-center justify-center text-[#A25828] shrink-0 border border-[#E8E0D5]">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#221C18]">Free UK Delivery</h4>
                <p className="text-xs text-[#736961] mt-0.5">On all orders over £{settings.freeDeliveryThreshold}</p>
              </div>
            </div>

            {/* Easy Returns */}
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#FAF5EE] flex items-center justify-center text-[#A25828] shrink-0 border border-[#E8E0D5]">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#221C18]">30-Day Comfort Trial</h4>
                <p className="text-xs text-[#736961] mt-0.5">Hassle-free UK returns policy</p>
              </div>
            </div>

            {/* Secure Payment */}
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#FAF5EE] flex items-center justify-center text-[#A25828] shrink-0 border border-[#E8E0D5]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#221C18]">Secure Payment</h4>
                <p className="text-xs text-[#736961] mt-0.5">100% encrypted Stripe & Klarna</p>
              </div>
            </div>

            {/* UK Support */}
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#FAF5EE] flex items-center justify-center text-[#A25828] shrink-0 border border-[#E8E0D5]">
                <Headphones className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#221C18]">UK Customer Support</h4>
                <p className="text-xs text-[#736961] mt-0.5">Mon–Sat 9am–6pm helpline</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Newsletter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand & Address Column (2 cols wide on desktop) */}
          <div className="lg:col-span-2 space-y-4">
            <BrandLogo variant="footer" />

            <div className="space-y-2 text-xs text-[#524842] pt-2">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#A25828] shrink-0 mt-0.5" />
                <span>{settings.address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#A25828] shrink-0" />
                <a href={`tel:${settings.phone.replace(/\s+/g, '')}`} className="hover:text-[#A25828] underline">
                  {settings.phone}
                </a>
                <span className="text-stone-400">·</span>
                <a
                  href={`https://wa.me/447923119077`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-700 font-semibold hover:underline"
                >
                  WhatsApp Us
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#A25828] shrink-0" />
                <a href={`mailto:${settings.email}`} className="hover:text-[#A25828]">
                  {settings.email}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#A25828] shrink-0" />
                <span>{settings.businessHours}</span>
              </div>
            </div>
          </div>

          {/* Column 2: Collections */}
          <div>
            <h4 className="font-serif font-bold text-base text-[#221C18] mb-4">
              Collections
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={() => setRoute({ name: 'category', categorySlug: 'sofas' })}
                  className="hover:text-[#A25828] transition-colors cursor-pointer"
                >
                  Handcrafted Sofas
                </button>
              </li>
              <li>
                <button
                  onClick={() => setRoute({ name: 'category', categorySlug: 'sofas', subcategorySlug: 'corner-sofas' })}
                  className="hover:text-[#A25828] transition-colors cursor-pointer"
                >
                  Corner & Chaise Sofas
                </button>
              </li>
              <li>
                <button
                  onClick={() => setRoute({ name: 'category', categorySlug: 'sofas', subcategorySlug: '3-seater-sofas' })}
                  className="hover:text-[#A25828] transition-colors cursor-pointer"
                >
                  3-Seater Living Room Sofas
                </button>
              </li>
              <li>
                <button
                  onClick={() => setRoute({ name: 'category', categorySlug: 'beds' })}
                  className="hover:text-[#A25828] transition-colors cursor-pointer"
                >
                  Bespoke Ottoman Beds
                </button>
              </li>
              <li>
                <button
                  onClick={() => setRoute({ name: 'category', categorySlug: 'beds', subcategorySlug: 'upholstered-beds' })}
                  className="hover:text-[#A25828] transition-colors cursor-pointer"
                >
                  Upholstered Wingback Beds
                </button>
              </li>
              <li>
                <button
                  onClick={() => setRoute({ name: 'shop' })}
                  className="hover:text-[#A25828] transition-colors cursor-pointer font-semibold text-[#A25828]"
                >
                  Shop All Collections &rarr;
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Care */}
          <div>
            <h4 className="font-serif font-bold text-base text-[#221C18] mb-4">
              Customer Care
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={() => setRoute({ name: 'delivery' })}
                  className="hover:text-[#A25828] transition-colors cursor-pointer"
                >
                  UK Delivery & White Glove
                </button>
              </li>
              <li>
                <button
                  onClick={() => setRoute({ name: 'returns' })}
                  className="hover:text-[#A25828] transition-colors cursor-pointer"
                >
                  30-Day Comfort Trial & Returns
                </button>
              </li>
              <li>
                <button
                  onClick={() => setRoute({ name: 'account' })}
                  className="hover:text-[#A25828] transition-colors cursor-pointer"
                >
                  Track Order & Dispatch
                </button>
              </li>
              <li>
                <button
                  onClick={() => setRoute({ name: 'wishlist' })}
                  className="hover:text-[#A25828] transition-colors cursor-pointer"
                >
                  Saved Wishlist
                </button>
              </li>
              <li>
                <button
                  onClick={() => setRoute({ name: 'faqs' })}
                  className="hover:text-[#A25828] transition-colors cursor-pointer"
                >
                  Frequently Asked Questions
                </button>
              </li>
              <li>
                <button
                  onClick={() => setRoute({ name: 'contact' })}
                  className="hover:text-[#A25828] transition-colors cursor-pointer"
                >
                  Contact Dewsbury Showroom
                </button>
              </li>
              <li>
                <button
                  onClick={() => setRoute({ name: 'admin' })}
                  className="hover:text-[#A25828] transition-colors cursor-pointer flex items-center gap-1 text-[#8A786A]"
                >
                  <Lock className="w-3 h-3" />
                  Store Administration
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter & Buying Guides */}
          <div>
            <h4 className="font-serif font-bold text-base text-[#221C18] mb-4">
              Join Our Circle
            </h4>
            <p className="text-xs text-[#6B6159] leading-relaxed mb-3">
              Subscribe for exclusive fabric previews, seasonal sales, and British interior inspiration.
            </p>
            {newsletterSubscribed ? (
              <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Thank you! You are subscribed to Plush Comfort updates.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="w-full text-xs px-3 py-2 rounded-lg bg-white border border-[#D5C7B7] text-[#221C18] placeholder-stone-400 focus:outline-none focus:border-[#A25828]"
                />
                <button
                  type="submit"
                  className="w-full bg-[#A25828] text-white hover:bg-[#8A461A] text-xs font-semibold py-2 rounded-lg transition-colors cursor-pointer"
                >
                  Subscribe
                </button>
              </form>
            )}

            <div className="pt-4">
              <button
                onClick={() => setRoute({ name: 'blog' })}
                className="text-xs font-semibold text-[#A25828] hover:underline"
              >
                Read UK Buying Guides &rarr;
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Legal, Payment Badges & Copyright */}
        <div className="border-t border-[#E8E0D5] mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#8A786A]">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span>&copy; {new Date().getFullYear()} Plush Comfort UK. All rights reserved.</span>
            <button
              onClick={() => setRoute({ name: 'privacy' })}
              className="hover:text-[#221C18] transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => setRoute({ name: 'terms' })}
              className="hover:text-[#221C18] transition-colors cursor-pointer"
            >
              Terms & Conditions
            </button>
            <button
              onClick={() => setRoute({ name: 'cookies' })}
              className="hover:text-[#221C18] transition-colors cursor-pointer"
            >
              Cookie Policy
            </button>
          </div>

          {/* Payment Icons */}
          <div className="flex items-center gap-2 text-stone-500 font-mono text-[11px]">
            <span className="px-2 py-1 bg-white rounded border border-[#E8E0D5]">Visa</span>
            <span className="px-2 py-1 bg-white rounded border border-[#E8E0D5]">Mastercard</span>
            <span className="px-2 py-1 bg-white rounded border border-[#E8E0D5]">Klarna</span>
            <span className="px-2 py-1 bg-white rounded border border-[#E8E0D5]">Apple Pay</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
