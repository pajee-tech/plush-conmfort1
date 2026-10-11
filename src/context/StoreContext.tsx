import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  Category,
  BlogPost,
  StoreSettings,
  Order,
  CartItem,
  PageRoute,
  AnalyticsEvent,
  OrderCustomer,
  OrderItem,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_BLOG_POSTS,
  INITIAL_SETTINGS,
  INITIAL_ORDERS,
} from '../data/initialData';
import { parseWooCommerceCsv, WooParseResult } from '../utils/wooCommerceParser';

export interface CsvImportResult {
  success: boolean;
  count: number;
  updatedCount?: number;
  addedCount?: number;
  totalParsed?: number;
  warnings?: string[];
  errors?: string[];
  missingImages?: string[];
  error?: string;
  products?: Product[];
}

interface AnalyticsMetrics {
  totalRevenue: number;
  totalOrders: number;
  itemsSold: number;
  averageOrderValue: number;
  productViews: Record<string, number>;
  categoryViews: Record<string, number>;
  searchQueries: Record<string, number>;
  addToCartCount: number;
  checkoutStartCount: number;
  purchaseCount: number;
  conversionRate: number; // percentage
}

interface StoreContextType {
  products: Product[];
  categories: Category[];
  activeCategories: Category[];
  blogPosts: BlogPost[];
  settings: StoreSettings;
  orders: Order[];
  cart: CartItem[];
  wishlist: string[];
  currentRoute: PageRoute;
  setRoute: (route: PageRoute) => void;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  
  // Cart
  addToCart: (productId: string, quantity?: number, selectedColour?: string, selectedSize?: string, selectedMaterial?: string) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartCount: number;

  // Wishlist
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Checkout
  createOrder: (data: {
    customer: OrderCustomer;
    paymentMethod: 'card' | 'klarna' | 'bank_transfer';
    deliveryOption: 'standard' | 'white_glove' | 'express';
    promoCode?: string;
  }) => Promise<Order>;

  // Admin
  addProduct: (product: Omit<Product, 'id'>) => Product;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  duplicateProduct: (productId: string) => Product;
  updateStock: (productId: string, newStock: number) => void;
  toggleProductPublish: (productId: string) => void;

  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (category: Category) => void;
  toggleCategoryActive: (categoryId: string) => void;

  updateOrderStatus: (orderId: string, status: Order['fulfilmentStatus'], courier?: string, trackingNumber?: string) => void;
  cancelOrder: (orderId: string) => void;

  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  
  addBlogPost: (post: Omit<BlogPost, 'id'>) => BlogPost;
  updateBlogPost: (post: BlogPost) => void;
  deleteBlogPost: (postId: string) => void;
  duplicateBlogPost: (postId: string) => BlogPost;
  toggleBlogPostStatus: (postId: string) => void;

  // CSV
  exportProductsCSV: () => string;
  importProductsCSV: (csvString: string, replaceAll?: boolean) => CsvImportResult;

  // Analytics
  trackEvent: (type: AnalyticsEvent['type'], targetId?: string, targetName?: string, query?: string, value?: number) => void;
  getAnalyticsMetrics: () => AnalyticsMetrics;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'plush_comfort_products_v4',
  CATEGORIES: 'plush_comfort_categories_v4',
  BLOGS: 'plush_comfort_blogs_v4',
  SETTINGS: 'plush_comfort_settings_v4',
  ORDERS: 'plush_comfort_orders_v4',
  CART: 'plush_comfort_cart_v4',
  WISHLIST: 'plush_comfort_wishlist_v4',
  ANALYTICS: 'plush_comfort_analytics_v4',
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Products - Ensure all 19 real imported products are loaded
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 19) {
          return parsed;
        }
      }
      return INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  // Categories - Always ensure all 9 verified categories exist with fresh SEO content
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (saved) {
        const parsed: Category[] = JSON.parse(saved);
        const existingSlugs = new Set(parsed.map((c) => c.slug));
        const merged = [...parsed];
        for (const initialCat of INITIAL_CATEGORIES) {
          if (!existingSlugs.has(initialCat.slug)) {
            merged.push(initialCat);
          } else {
            const idx = merged.findIndex((c) => c.slug === initialCat.slug);
            if (idx >= 0) {
              merged[idx] = {
                ...merged[idx],
                seoTitle: merged[idx].seoTitle || initialCat.seoTitle,
                seoDescription: merged[idx].seoDescription || initialCat.seoDescription,
                bottomSeoDescription: merged[idx].bottomSeoDescription || initialCat.bottomSeoDescription,
                subcategories: initialCat.subcategories?.length ? initialCat.subcategories : merged[idx].subcategories,
                faqs: initialCat.faqs?.length ? initialCat.faqs : merged[idx].faqs,
              };
            }
          }
        }
        return merged;
      }
      return INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  });

  // Blog posts
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BLOGS);
      return saved ? JSON.parse(saved) : INITIAL_BLOG_POSTS;
    } catch {
      return INITIAL_BLOG_POSTS;
    }
  });

  // Settings - Always preserve official logo
  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_SETTINGS,
          ...parsed,
          logoUrl: parsed.logoUrl || INITIAL_SETTINGS.logoUrl,
          logoAlt: parsed.logoAlt || INITIAL_SETTINGS.logoAlt,
        };
      }
      return INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  // Orders
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  // Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Wishlist
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WISHLIST);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Analytics Events
  const [analyticsEvents, setAnalyticsEvents] = useState<AnalyticsEvent[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ANALYTICS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Navigation State
  const [currentRoute, setCurrentRoute] = useState<PageRoute>({ name: 'home' });
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch (e) { console.error(e); }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (e) { console.error(e); }
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BLOGS, JSON.stringify(blogPosts));
    } catch (e) { console.error(e); }
  }, [blogPosts]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) { console.error(e); }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch (e) { console.error(e); }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    } catch (e) { console.error(e); }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlist));
    } catch (e) { console.error(e); }
  }, [wishlist]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ANALYTICS, JSON.stringify(analyticsEvents));
    } catch (e) { console.error(e); }
  }, [analyticsEvents]);

  // Handle URL history state for smooth browser back/forward and deep linking
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentRoute]);

  // Active categories helper (for customer facing views)
  const activeCategories = categories.filter((c) => c.isActive);

  // Cart calculations
  const cartSubtotal = cart.reduce((acc, item) => {
    const prod = products.find((p) => p.id === item.productId);
    if (!prod) return acc;
    const price = prod.salePrice ?? prod.price;
    return acc + price * item.quantity;
  }, 0);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const addToCart = (
    productId: string,
    quantity = 1,
    selectedColour?: string,
    selectedSize?: string,
    selectedMaterial?: string
  ) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.productId === productId &&
          item.selectedColour === selectedColour &&
          item.selectedSize === selectedSize
      );

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity,
        };
        return next;
      }

      const newItem: CartItem = {
        id: `${productId}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        productId,
        quantity,
        selectedColour: selectedColour || product.colours[0]?.name,
        selectedSize: selectedSize || product.sizes?.[0],
        selectedMaterial: selectedMaterial || product.materials[0],
      };
      return [...prev, newItem];
    });

    trackEvent('add_to_cart', productId, product.name, undefined, product.salePrice ?? product.price);
    setIsCartDrawerOpen(true);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const updateCartQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === cartItemId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Wishlist
  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  // Analytics Tracker
  const trackEvent = (
    type: AnalyticsEvent['type'],
    targetId?: string,
    targetName?: string,
    query?: string,
    value?: number
  ) => {
    const event: AnalyticsEvent = {
      type,
      targetId,
      targetName,
      query,
      value,
      timestamp: new Date().toISOString(),
    };
    setAnalyticsEvents((prev) => [...prev.slice(-499), event]); // keep last 500 events
  };

  // Order Placement
  const createOrder = async (data: {
    customer: OrderCustomer;
    paymentMethod: 'card' | 'klarna' | 'bank_transfer';
    deliveryOption: 'standard' | 'white_glove' | 'express';
    promoCode?: string;
  }): Promise<Order> => {
    // Calculate final pricing
    const subtotal = cartSubtotal;
    let deliveryFee = 0;
    if (data.deliveryOption === 'white_glove') {
      deliveryFee = settings.whiteGloveDeliveryFee;
    } else {
      deliveryFee = subtotal >= settings.freeDeliveryThreshold ? 0 : settings.standardDeliveryFee;
    }

    let discountAmount = 0;
    if (data.promoCode && data.promoCode.trim().toUpperCase() === 'PLUSH10') {
      discountAmount = Math.round(subtotal * 0.1 * 100) / 100;
    }

    const total = Math.max(0, subtotal - discountAmount + deliveryFee);

    // Build order items & deduct stock
    const orderItems: OrderItem[] = cart.map((item) => {
      const prod = products.find((p) => p.id === item.productId)!;
      return {
        productId: item.productId,
        name: prod.name,
        sku: prod.sku,
        price: prod.salePrice ?? prod.price,
        quantity: item.quantity,
        selectedColour: item.selectedColour,
        selectedSize: item.selectedSize,
        image: prod.images[0],
      };
    });

    // Update stock in products catalog
    setProducts((prev) =>
      prev.map((prod) => {
        const cartMatch = cart.find((c) => c.productId === prod.id);
        if (cartMatch) {
          const nextStock = Math.max(0, prod.stock - cartMatch.quantity);
          return { ...prod, stock: nextStock };
        }
        return prod;
      })
    );

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `PC-UK-${Math.floor(10000 + Math.random() * 90000)}`,
      createdAt: new Date().toISOString(),
      customer: data.customer,
      items: orderItems,
      subtotal,
      deliveryFee,
      discountAmount,
      total,
      promoCode: data.promoCode,
      paymentMethod: data.paymentMethod,
      paymentStatus: 'paid',
      fulfilmentStatus: 'processing',
      deliveryOption: data.deliveryOption,
      courier: data.deliveryOption === 'white_glove' ? 'Panther 2-Man White Glove' : 'DX Freight Specialists',
      trackingNumber: `DX-GB-${Math.floor(10000000 + Math.random() * 90000000)}`,
      estimatedDeliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      timeline: [
        {
          status: 'Order Placed',
          timestamp: new Date().toISOString(),
          note: `Payment confirmed via ${data.paymentMethod === 'klarna' ? 'Klarna Pay' : 'Stripe Card Checkout'} (£${total.toFixed(2)})`,
        },
        {
          status: 'Processing',
          timestamp: new Date().toISOString(),
          note: 'Order transferred to Calder Road workshop fulfillment queue.',
        },
      ],
    };

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    trackEvent('purchase', newOrder.id, newOrder.orderNumber, undefined, total);

    return newOrder;
  };

  // Product Admin Operations
  const addProduct = (productData: Omit<Product, 'id'>): Product => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
    };
    setProducts((prev) => [newProduct, ...prev]);
    return newProduct;
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
  };

  const deleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const duplicateProduct = (productId: string): Product => {
    const original = products.find((p) => p.id === productId);
    if (!original) throw new Error('Product not found');

    const duplicated: Product = {
      ...original,
      id: `prod-${Date.now()}`,
      name: `${original.name} (Copy)`,
      slug: `${original.slug}-copy-${Math.floor(Math.random() * 1000)}`,
      sku: `${original.sku}-CP`,
      isPublished: false,
    };

    setProducts((prev) => [duplicated, ...prev]);
    return duplicated;
  };

  const updateStock = (productId: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: Math.max(0, newStock) } : p))
    );
  };

  const toggleProductPublish = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, isPublished: !p.isPublished } : p))
    );
  };

  // Category Operations
  const addCategory = (categoryData: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...categoryData,
      id: `cat-${Date.now()}`,
    };
    setCategories((prev) => [...prev, newCategory]);
  };

  const updateCategory = (updated: Category) => {
    setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const toggleCategoryActive = (categoryId: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === categoryId ? { ...c, isActive: !c.isActive } : c))
    );
  };

  // Order Operations
  const updateOrderStatus = (
    orderId: string,
    status: Order['fulfilmentStatus'],
    courier?: string,
    trackingNumber?: string
  ) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        const timelineEntry = {
          status: status.charAt(0).toUpperCase() + status.slice(1),
          timestamp: new Date().toISOString(),
          note: trackingNumber ? `Updated tracking: ${trackingNumber} (${courier || 'Courier'})` : `Status changed to ${status}`,
        };
        return {
          ...order,
          fulfilmentStatus: status,
          courier: courier || order.courier,
          trackingNumber: trackingNumber || order.trackingNumber,
          timeline: [...order.timeline, timelineEntry],
        };
      })
    );
  };

  const cancelOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        return {
          ...order,
          fulfilmentStatus: 'cancelled',
          paymentStatus: 'refunded',
          timeline: [
            ...order.timeline,
            {
              status: 'Cancelled & Refunded',
              timestamp: new Date().toISOString(),
              note: 'Order was cancelled and refund processed to original payment method.',
            },
          ],
        };
      })
    );
  };

  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Blog post operations
  const addBlogPost = (postData: Omit<BlogPost, 'id'>): BlogPost => {
    const newPost: BlogPost = {
      ...postData,
      id: `blog-${Date.now()}`,
    };
    setBlogPosts((prev) => [newPost, ...prev]);
    return newPost;
  };

  const updateBlogPost = (post: BlogPost) => {
    setBlogPosts((prev) => prev.map((b) => (b.id === post.id ? post : b)));
  };

  const deleteBlogPost = (postId: string) => {
    setBlogPosts((prev) => prev.filter((b) => b.id !== postId));
  };

  const duplicateBlogPost = (postId: string): BlogPost => {
    const original = blogPosts.find((b) => b.id === postId);
    if (!original) throw new Error('Post not found');
    const duplicated: BlogPost = {
      ...original,
      id: `blog-${Date.now()}`,
      title: `${original.title} (Draft Copy)`,
      slug: `${original.slug}-copy-${Math.floor(100 + Math.random() * 900)}`,
      status: 'draft',
      isPublished: false,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    setBlogPosts((prev) => [duplicated, ...prev]);
    return duplicated;
  };

  const toggleBlogPostStatus = (postId: string) => {
    setBlogPosts((prev) =>
      prev.map((b) => {
        if (b.id !== postId) return b;
        const nextStatus = b.status === 'published' ? 'draft' : 'published';
        return {
          ...b,
          status: nextStatus,
          isPublished: nextStatus === 'published',
          lastUpdated: new Date().toISOString().split('T')[0],
        };
      })
    );
  };

  // CSV Import / Export
  const exportProductsCSV = (): string => {
    const headers = ['ID', 'Name', 'SKU', 'Category', 'Price', 'SalePrice', 'Stock', 'IsPublished'];
    const rows = products.map((p) => {
      const cat = categories.find((c) => c.id === p.categoryId)?.name || '';
      return [
        p.id,
        `"${p.name.replace(/"/g, '""')}"`,
        p.sku,
        `"${cat}"`,
        p.price,
        p.salePrice ?? '',
        p.stock,
        p.isPublished,
      ].join(',');
    });
    return [headers.join(','), ...rows].join('\n');
  };

  const importProductsCSV = (csvString: string, replaceAll: boolean = false): CsvImportResult => {
    try {
      if (!csvString || !csvString.trim()) {
        return { success: false, count: 0, error: 'Empty CSV input provided.' };
      }

      // 1. Try robust WooCommerce parsing
      const wooResult: WooParseResult = parseWooCommerceCsv(csvString, categories);

      if (wooResult.success && wooResult.products.length > 0) {
        if (replaceAll) {
          setProducts(wooResult.products);
          localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(wooResult.products));
          return {
            success: true,
            count: wooResult.products.length,
            addedCount: wooResult.products.length,
            updatedCount: 0,
            totalParsed: wooResult.totalParsed,
            warnings: wooResult.warnings,
            missingImages: wooResult.missingImages,
            products: wooResult.products,
          };
        }

        // Merge without duplicates
        let updatedCount = 0;
        let addedCount = 0;
        const currentProducts = [...products];

        for (const importedProd of wooResult.products) {
          const existingIndex = currentProducts.findIndex(
            (p) =>
              (importedProd.sku && p.sku && p.sku.toLowerCase() === importedProd.sku.toLowerCase()) ||
              p.slug === importedProd.slug ||
              p.name.toLowerCase() === importedProd.name.toLowerCase()
          );

          if (existingIndex !== -1) {
            // Update existing
            currentProducts[existingIndex] = {
              ...currentProducts[existingIndex],
              ...importedProd,
              id: currentProducts[existingIndex].id, // preserve ID
            };
            updatedCount++;
          } else {
            currentProducts.push(importedProd);
            addedCount++;
          }
        }

        setProducts(currentProducts);
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(currentProducts));

        return {
          success: true,
          count: addedCount + updatedCount,
          addedCount,
          updatedCount,
          totalParsed: wooResult.totalParsed,
          warnings: wooResult.warnings,
          missingImages: wooResult.missingImages,
          products: wooResult.products,
        };
      }

      // If WooCommerce parser encountered fatal schema errors, return specific error
      if (wooResult.errors.length > 0) {
        return {
          success: false,
          count: 0,
          error: wooResult.errors.join(' | '),
          errors: wooResult.errors,
          warnings: wooResult.warnings,
        };
      }

      return { success: false, count: 0, error: 'No valid products could be parsed from the CSV.' };
    } catch (err: unknown) {
      return { success: false, count: 0, error: err instanceof Error ? err.message : 'Invalid CSV format' };
    }
  };

  // Analytics Metrics Computation
  const getAnalyticsMetrics = (): AnalyticsMetrics => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => (o.paymentStatus === 'paid' ? sum + o.total : sum), 0);
    const itemsSold = orders.reduce((sum, o) => sum + o.items.reduce((iSum, item) => iSum + item.quantity, 0), 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const productViews: Record<string, number> = {};
    const categoryViews: Record<string, number> = {};
    const searchQueries: Record<string, number> = {};
    let addToCartCount = 0;
    let checkoutStartCount = 0;
    let purchaseCount = 0;

    analyticsEvents.forEach((ev) => {
      if (ev.type === 'product_view' && ev.targetName) {
        productViews[ev.targetName] = (productViews[ev.targetName] || 0) + 1;
      } else if (ev.type === 'category_view' && ev.targetName) {
        categoryViews[ev.targetName] = (categoryViews[ev.targetName] || 0) + 1;
      } else if (ev.type === 'search' && ev.query) {
        searchQueries[ev.query.toLowerCase()] = (searchQueries[ev.query.toLowerCase()] || 0) + 1;
      } else if (ev.type === 'add_to_cart') {
        addToCartCount++;
      } else if (ev.type === 'checkout_start') {
        checkoutStartCount++;
      } else if (ev.type === 'purchase') {
        purchaseCount++;
      }
    });

    const totalViews = Object.values(productViews).reduce((a, b) => a + b, 0);
    const conversionRate = totalViews > 0 ? Math.round((purchaseCount / totalViews) * 100 * 10) / 10 : 3.8;

    return {
      totalRevenue,
      totalOrders,
      itemsSold,
      averageOrderValue,
      productViews,
      categoryViews,
      searchQueries,
      addToCartCount,
      checkoutStartCount,
      purchaseCount,
      conversionRate,
    };
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        activeCategories,
        blogPosts,
        settings,
        orders,
        cart,
        wishlist,
        currentRoute,
        setRoute: setCurrentRoute,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        isSearchOpen,
        setIsSearchOpen,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartSubtotal,
        cartCount,
        toggleWishlist,
        isInWishlist,
        createOrder,
        addProduct,
        updateProduct,
        deleteProduct,
        duplicateProduct,
        updateStock,
        toggleProductPublish,
        addCategory,
        updateCategory,
        toggleCategoryActive,
        updateOrderStatus,
        cancelOrder,
        updateSettings,
        addBlogPost,
        updateBlogPost,
        deleteBlogPost,
        duplicateBlogPost,
        toggleBlogPostStatus,
        exportProductsCSV,
        importProductsCSV,
        trackEvent,
        getAnalyticsMetrics,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
