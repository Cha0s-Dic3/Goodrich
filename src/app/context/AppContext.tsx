import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Types
export interface Product {
  id: string;
  name: string;
  description: string;
  category: 'eggs';
  size: 'small' | 'medium' | 'large' | 'extra-large';
  quantity: number; // eggs per tray
  price: number; // in FRW
  stock: number;
  image: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  items: CartItem[];
  totalAmount: number;
  deliveryZone: 'local' | 'regional' | 'national';
  deliveryFee: number;
  deliveryAddress: string;
  deliveryDate: string;
  deliveryTimeWindow?: string;
  status: 'pending' | 'confirmed' | 'processing' | 'out-for-delivery' | 'delivered' | 'cancelled';
  createdAt: string;
  notes?: string;
  paypackRef?: string;
  paymentStatus?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  addresses: string[];
  totalOrders: number;
  totalSpent: number;
  joinedDate: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  customerId: string;
  phone?: string;
  avatarUrl?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  author: string;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: 'new' | 'read' | 'archived';
  createdAt: string;
  updatedAt?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  description: string;
  category: 'facilities' | 'chickens' | 'team' | 'eggs';
  imageUrl: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PendingPayment {
  id: string;
  ref: string;
  status: string;
  amount: number;
  subtotal: number;
  deliveryFee: number;
  userId: string;
  customerId: string;
  orderPayload?: any;
  orderId?: string;
  createdAt: string;
  updatedAt?: string;
  failureReason?: string;
  retriedFrom?: string;
  retriedTo?: string;
}

interface AppContextType {
  // Products
  products: Product[];
  refreshProducts: () => Promise<void>;
  updateProduct: (productId: string, updates: Partial<Product>) => Promise<void>;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;

  // Orders
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'createdAt'>) => Promise<Order | null>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  loadOrders: (scope: 'user' | 'admin') => Promise<void>;
  clearOrderHistory: () => Promise<void>;

  // Payments
  payments: PendingPayment[];
  loadPayments: (scope: 'user' | 'admin') => Promise<void>;
  retryPayment: (ref: string) => Promise<string>;

  // Customers
  customers: Customer[];
  loadCustomers: () => Promise<void>;

  // Announcements
  announcements: Announcement[];
  refreshAnnouncements: () => Promise<void>;
  addAnnouncement: (announcement: Omit<Announcement, 'id' | 'createdAt'>) => Promise<void>;
  updateAnnouncement: (id: string, announcement: Partial<Announcement>) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;

  // Gallery
  gallery: GalleryItem[];
  loadGallery: () => Promise<void>;
  uploadGalleryImage: (file: File) => Promise<string>;
  addGalleryItem: (item: Omit<GalleryItem, 'id' | 'createdAt'>) => Promise<void>;
  updateGalleryItem: (id: string, item: Partial<GalleryItem>) => Promise<void>;
  deleteGalleryItem: (id: string) => Promise<void>;

  // Messages
  messages: Message[];
  loadMessages: () => Promise<void>;
  createMessage: (payload: { name: string; email: string; phone: string; message: string }) => Promise<void>;
  updateMessageStatus: (id: string, status: Message['status']) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;

  // Inventory management
  getLowStockItems: () => Product[];

  // Admin Auth
  isAdmin: boolean;
  adminLogin: (username: string, password: string) => boolean;
  adminLoginError: string | null;
  adminLogout: () => void;

  // User auth
  isUserLoggedIn: boolean;
  authUser: UserAccount | null;
  authToken: string | null;
  userLogin: (token: string, user: UserAccount) => void;
  userLogout: () => void;
  uploadAvatar: (file: File) => Promise<string>;
  updateUserProfile: (payload: Partial<UserAccount>) => Promise<void>;

  // Current Page
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const fetchJson = async (url: string, options?: RequestInit) => {
  const res = await fetch(url, options);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return res.json();
};

const uploadFile = async (url: string, file: File, token?: string | null) => {
  const formData = new FormData();
  formData.append('file', file);
  const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: formData
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Upload failed (${res.status})`);
  }
  const data = await res.json();
  return data.url as string;
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<PendingPayment[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('isAdmin') === 'true';
  });
  const [adminLoginError, setAdminLoginError] = useState<string | null>(null);

  const [isUserLoggedIn, setIsUserLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('isUserLoggedIn') === 'true';
  });

  const [authToken, setAuthToken] = useState<string | null>(() => {
    return localStorage.getItem('authToken');
  });

  const [authUser, setAuthUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('authUser');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentPageState, setCurrentPageState] = useState('home');

  // Persist data
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('isAdmin', isAdmin.toString());
  }, [isAdmin]);

  useEffect(() => {
    localStorage.setItem('isUserLoggedIn', isUserLoggedIn.toString());
  }, [isUserLoggedIn]);

  useEffect(() => {
    if (authToken) {
      localStorage.setItem('authToken', authToken);
    } else {
      localStorage.removeItem('authToken');
    }
  }, [authToken]);

  useEffect(() => {
    if (authUser) {
      localStorage.setItem('authUser', JSON.stringify(authUser));
      setIsUserLoggedIn(true);
    } else {
      localStorage.removeItem('authUser');
      setIsUserLoggedIn(false);
    }
  }, [authUser]);

  useEffect(() => {
    refreshProducts();
    refreshAnnouncements();
    loadGallery();
  }, []);

  const refreshProducts = async () => {
    try {
      const data = await fetchJson('/api/products');
      setProducts(data.products || []);
    } catch (err) {
      setProducts([]);
    }
  };

  const updateProduct = async (productId: string, updates: Partial<Product>) => {
    const data = await fetchJson(`/api/admin/products/${productId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    setProducts(prev => prev.map(p => (p.id === productId ? data.product : p)));
  };

  const refreshAnnouncements = async () => {
    try {
      const data = await fetchJson('/api/announcements');
      setAnnouncements(data.announcements || []);
    } catch (err) {
      setAnnouncements([]);
    }
  };

  const addAnnouncement = async (announcement: Omit<Announcement, 'id' | 'createdAt'>) => {
    const data = await fetchJson('/api/admin/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(announcement)
    });
    setAnnouncements(prev => [data.announcement, ...prev]);
  };

  const updateAnnouncement = async (id: string, updatedData: Partial<Announcement>) => {
    const data = await fetchJson(`/api/admin/announcements/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    });
    setAnnouncements(prev => prev.map(a => (a.id === id ? data.announcement : a)));
  };

  const deleteAnnouncement = async (id: string) => {
    await fetchJson(`/api/admin/announcements/${id}`, { method: 'DELETE' });
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  };

  const loadGallery = async () => {
    try {
      const data = await fetchJson('/api/gallery');
      setGallery(data.gallery || []);
    } catch (err) {
      setGallery([]);
    }
  };

  const addGalleryItem = async (item: Omit<GalleryItem, 'id' | 'createdAt'>) => {
    const data = await fetchJson('/api/admin/gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    setGallery(prev => [data.item, ...prev]);
  };

  const uploadGalleryImage = async (file: File) => {
    return uploadFile('/api/uploads/gallery', file);
  };

  const updateGalleryItem = async (id: string, item: Partial<GalleryItem>) => {
    const data = await fetchJson(`/api/admin/gallery/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    setGallery(prev => prev.map(entry => (entry.id === id ? data.item : entry)));
  };

  const deleteGalleryItem = async (id: string) => {
    await fetchJson(`/api/admin/gallery/${id}`, { method: 'DELETE' });
    setGallery(prev => prev.filter(entry => entry.id !== id));
  };

  const loadMessages = async () => {
    try {
      const data = await fetchJson('/api/admin/messages');
      setMessages(data.messages || []);
    } catch (err) {
      setMessages([]);
    }
  };

  const createMessage = async (payload: { name: string; email: string; phone: string; message: string }) => {
    await fetchJson('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  };

  const updateMessageStatus = async (id: string, status: Message['status']) => {
    const data = await fetchJson(`/api/admin/messages/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    setMessages(prev => prev.map(entry => (entry.id === id ? data.message : entry)));
  };

  const deleteMessage = async (id: string) => {
    await fetchJson(`/api/admin/messages/${id}`, { method: 'DELETE' });
    setMessages(prev => prev.filter(entry => entry.id !== id));
  };

  const loadOrders = async (scope: 'user' | 'admin') => {
    if (scope === 'user' && !authToken) {
      setOrders([]);
      return;
    }
    try {
      const data = await fetchJson(scope === 'admin' ? '/api/admin/orders' : '/api/orders/my', {
        headers: authToken && scope === 'user' ? { Authorization: `Bearer ${authToken}` } : undefined
      });
      setOrders(data.orders || []);
    } catch (err) {
      setOrders([]);
    }
  };

  const loadPayments = async (scope: 'user' | 'admin') => {
    if (scope === 'user' && !authToken) {
      setPayments([]);
      return;
    }
    try {
      const data = await fetchJson(
        scope === 'admin' ? '/api/admin/payments' : '/api/payments/my',
        {
          headers: authToken && scope === 'user' ? { Authorization: `Bearer ${authToken}` } : undefined
        }
      );
      setPayments(data.payments || []);
    } catch (err) {
      setPayments([]);
    }
  };

  const retryPayment = async (ref: string) => {
    if (!authToken) {
      throw new Error('Please log in first');
    }
    const data = await fetchJson(`/api/paypack/retry/${ref}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });
    await loadPayments('user');
    return data.ref as string;
  };

  const addOrder = async (order: Omit<Order, 'id' | 'createdAt'>) => {
    if (!authToken) {
      return null;
    }
    const data = await fetchJson('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify(order)
    });
    setOrders(prev => [data.order, ...prev]);
    return data.order as Order;
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    const data = await fetchJson(`/api/admin/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    setOrders(prev => prev.map(order => (order.id === orderId ? data.order : order)));
  };

  const clearOrderHistory = async () => {
    if (!authToken) return;
    await fetchJson('/api/orders/my', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${authToken}` }
    });
    setOrders([]);
  };

  const loadCustomers = async () => {
    try {
      const data = await fetchJson('/api/admin/customers');
      setCustomers(data.customers || []);
    } catch (err) {
      setCustomers([]);
    }
  };

  const updateUserProfile = async (payload: Partial<UserAccount>) => {
    if (!authToken) return;
    const data = await fetchJson('/api/auth/me', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify(payload)
    });
    setAuthUser(data.user);
  };

  const uploadAvatar = async (file: File) => {
    if (!authToken) {
      throw new Error('Please log in first');
    }
    return uploadFile('/api/uploads/avatar', file, authToken);
  };

  // Cart functions
  const addToCart = (product: Product, quantity: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  // Inventory management
  const getLowStockItems = () => {
    return products.filter(p => p.stock <= 20);
  };

  // Admin functions
  const adminLogin = (username: string, password: string): boolean => {
    if (isUserLoggedIn) {
      setAdminLoginError('User is logged in. Log out user account first.');
      return false;
    }
    if (username === 'Goodrich' && password === '123') {
      setIsAdmin(true);
      setAdminLoginError(null);
      return true;
    }
    setAdminLoginError('Invalid admin credentials.');
    return false;
  };

  const adminLogout = () => {
    setIsAdmin(false);
    setAdminLoginError(null);
  };

  const userLogin = (token: string, user: UserAccount) => {
    if (isAdmin) {
      throw new Error('Admin is logged in. Log out admin first.');
    }
    setAuthToken(token);
    setAuthUser(user);
  };

  const userLogout = () => {
    setAuthToken(null);
    setAuthUser(null);
    setOrders([]);
    setCart([]);
  };

  const setCurrentPage = (page: string) => {
    setCurrentPageState(page);
    if (page === 'admin') {
      window.history.pushState({}, '', '/admin-dashboard');
    } else if (page === 'account') {
      window.history.pushState({}, '', '/account');
    } else if (window.location.pathname === '/admin-dashboard') {
      window.history.pushState({}, '', '/');
    } else if (window.location.pathname === '/account') {
      window.history.pushState({}, '', '/');
    }
  };

  return (
    <AppContext.Provider
      value={{
        products,
        refreshProducts,
        updateProduct,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartTotal,
        orders,
        addOrder,
        updateOrderStatus,
        loadOrders,
        clearOrderHistory,
        payments,
        loadPayments,
        retryPayment,
        customers,
        loadCustomers,
        announcements,
        refreshAnnouncements,
        addAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        gallery,
        loadGallery,
        uploadGalleryImage,
        addGalleryItem,
        updateGalleryItem,
        deleteGalleryItem,
        messages,
        loadMessages,
        createMessage,
        updateMessageStatus,
        deleteMessage,
        getLowStockItems,
        isAdmin,
        adminLogin,
        adminLoginError,
        adminLogout,
        isUserLoggedIn,
        authUser,
        authToken,
        userLogin,
        userLogout,
        uploadAvatar,
        updateUserProfile,
        currentPage: currentPageState,
        setCurrentPage
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
