import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, 'data.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const PORT = process.env.PORT ? Number(process.env.PORT) : 5174;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

const app = express();
app.use(cors({ origin: true, credentials: false }));
app.use(express.json({ limit: '2mb' }));
app.use('/uploads', express.static(UPLOADS_DIR));

const buildUploadUrl = (filePath) => `/uploads/${filePath.replace(/\\/g, '/')}`;

const createUploader = (subDir) => {
  const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
      try {
        const targetDir = path.join(UPLOADS_DIR, subDir);
        await fs.mkdir(targetDir, { recursive: true });
        cb(null, targetDir);
      } catch (err) {
        cb(err, '');
      }
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname || '').toLowerCase();
      const safeExt = ext || '.jpg';
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
    }
  });
  return multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image uploads are allowed'));
      }
    }
  });
};

const avatarUpload = createUploader('avatars');
const galleryUpload = createUploader('gallery');

const emptyData = () => ({
  users: [],
  customers: [],
  products: [],
  orders: [],
  announcements: [],
  messages: [],
  gallery: []
});

const normalizeData = (data) => ({
  ...emptyData(),
  ...data,
  users: Array.isArray(data?.users) ? data.users : [],
  customers: Array.isArray(data?.customers) ? data.customers : [],
  products: Array.isArray(data?.products) ? data.products : [],
  orders: Array.isArray(data?.orders) ? data.orders : [],
  announcements: Array.isArray(data?.announcements) ? data.announcements : [],
  messages: Array.isArray(data?.messages) ? data.messages : [],
  gallery: Array.isArray(data?.gallery) ? data.gallery : []
});

const loadData = async () => {
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf8');
    return normalizeData(JSON.parse(raw));
  } catch (err) {
    return emptyData();
  }
};

const saveData = async (data) => {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
};

const nextId = (prefix, items) => {
  const max = items.reduce((acc, item) => {
    const match = String(item.id || '').match(/(\d+)$/);
    const num = match ? Number(match[1]) : 0;
    return Math.max(acc, num);
  }, 0);
  return `${prefix}-${String(max + 1).padStart(3, '0')}`;
};

const authMiddleware = async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'Missing token' });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.sub;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const data = await loadData();
  const existing = data.users.find(
    (user) => user.email.toLowerCase() === String(email).toLowerCase()
  );
  if (existing) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const customerId = nextId('CUST', data.customers);
  const userId = nextId('USR', data.users);

  const customer = {
    id: customerId,
    name,
    phone: '',
    email,
    addresses: [],
    totalOrders: 0,
    totalSpent: 0,
    joinedDate: new Date().toISOString().split('T')[0]
  };

  const user = {
    id: userId,
    name,
    email,
    passwordHash,
    customerId,
    phone: '',
    avatarUrl: '',
    createdAt: new Date().toISOString()
  };

  data.customers.push(customer);
  data.users.push(user);
  await saveData(data);

  const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: '7d' });
  return res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      customerId: user.customerId,
      phone: user.phone,
      avatarUrl: user.avatarUrl
    }
  });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing credentials' });
  }

  const data = await loadData();
  const user = data.users.find(
    (entry) => entry.email.toLowerCase() === String(email).toLowerCase()
  );
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: '7d' });
  return res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      customerId: user.customerId,
      phone: user.phone || '',
      avatarUrl: user.avatarUrl || ''
    }
  });
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  const data = await loadData();
  const user = data.users.find((entry) => entry.id === req.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  return res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      customerId: user.customerId,
      phone: user.phone || '',
      avatarUrl: user.avatarUrl || ''
    }
  });
});

app.post('/api/uploads/avatar', authMiddleware, avatarUpload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const relative = path.relative(UPLOADS_DIR, req.file.path);
  return res.json({ url: buildUploadUrl(relative) });
});

app.post('/api/uploads/gallery', galleryUpload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const relative = path.relative(UPLOADS_DIR, req.file.path);
  return res.json({ url: buildUploadUrl(relative) });
});

app.patch('/api/auth/me', authMiddleware, async (req, res) => {
  const { name, email, phone, avatarUrl } = req.body || {};
  const data = await loadData();
  const user = data.users.find((entry) => entry.id === req.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (name) user.name = name;
  if (email) user.email = email;
  if (typeof phone === 'string') user.phone = phone;
  if (typeof avatarUrl === 'string') user.avatarUrl = avatarUrl;

  const customer = data.customers.find((entry) => entry.id === user.customerId);
  if (customer) {
    if (name) customer.name = name;
    if (email) customer.email = email;
    if (typeof phone === 'string') customer.phone = phone;
  }

  await saveData(data);
  return res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      customerId: user.customerId,
      phone: user.phone || '',
      avatarUrl: user.avatarUrl || ''
    }
  });
});

app.post('/api/customers/sync', authMiddleware, async (req, res) => {
  const { name, phone, email, address } = req.body || {};
  const data = await loadData();
  const user = data.users.find((entry) => entry.id === req.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  let customer = data.customers.find((entry) => entry.id === user.customerId);
  if (!customer) {
    customer = {
      id: user.customerId,
      name: name || user.name,
      phone: phone || user.phone || '',
      email: email || user.email,
      addresses: [],
      totalOrders: 0,
      totalSpent: 0,
      joinedDate: new Date().toISOString().split('T')[0]
    };
    data.customers.push(customer);
  }

  if (name) customer.name = name;
  if (email) customer.email = email;
  if (typeof phone === 'string') customer.phone = phone;
  if (address) {
    const trimmed = String(address).trim();
    if (trimmed && !customer.addresses.includes(trimmed)) {
      customer.addresses.push(trimmed);
    }
  }

  await saveData(data);
  return res.json({ customer });
});

app.post('/api/customers/record-order', authMiddleware, async (req, res) => {
  const { totalAmount, deliveryFee } = req.body || {};
  const data = await loadData();
  const user = data.users.find((entry) => entry.id === req.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const customer = data.customers.find((entry) => entry.id === user.customerId);
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  const amount = Number(totalAmount || 0);
  const fee = Number(deliveryFee || 0);
  customer.totalOrders += 1;
  customer.totalSpent += amount + fee;

  await saveData(data);
  return res.json({ customer });
});

app.get('/api/products', async (req, res) => {
  const data = await loadData();
  res.json({ products: data.products });
});

app.patch('/api/admin/products/:id', async (req, res) => {
  const { id } = req.params;
  const data = await loadData();
  const product = data.products.find((entry) => entry.id === id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const updates = req.body || {};
  Object.assign(product, updates, { id: product.id });
  await saveData(data);
  return res.json({ product });
});

app.get('/api/announcements', async (req, res) => {
  const data = await loadData();
  res.json({ announcements: data.announcements });
});

app.post('/api/admin/announcements', async (req, res) => {
  const { title, content, author } = req.body || {};
  if (!title || !content) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const data = await loadData();
  const announcement = {
    id: nextId('ANN', data.announcements),
    title,
    content,
    author: author || 'Admin',
    createdAt: new Date().toISOString()
  };
  data.announcements.unshift(announcement);
  await saveData(data);
  res.json({ announcement });
});

app.patch('/api/admin/announcements/:id', async (req, res) => {
  const { id } = req.params;
  const data = await loadData();
  const announcement = data.announcements.find((entry) => entry.id === id);
  if (!announcement) {
    return res.status(404).json({ error: 'Announcement not found' });
  }

  const { title, content } = req.body || {};
  if (title) announcement.title = title;
  if (content) announcement.content = content;
  announcement.updatedAt = new Date().toISOString();

  await saveData(data);
  res.json({ announcement });
});

app.delete('/api/admin/announcements/:id', async (req, res) => {
  const { id } = req.params;
  const data = await loadData();
  data.announcements = data.announcements.filter((entry) => entry.id !== id);
  await saveData(data);
  res.json({ ok: true });
});

app.get('/api/gallery', async (req, res) => {
  const data = await loadData();
  res.json({ gallery: data.gallery });
});

app.post('/api/admin/gallery', async (req, res) => {
  const { title, description, category, imageUrl } = req.body || {};
  if (!title || !category || !imageUrl) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const data = await loadData();
  const item = {
    id: nextId('GAL', data.gallery),
    title,
    description: description || '',
    category,
    imageUrl,
    createdAt: new Date().toISOString()
  };
  data.gallery.unshift(item);
  await saveData(data);
  res.json({ item });
});

app.patch('/api/admin/gallery/:id', async (req, res) => {
  const { id } = req.params;
  const data = await loadData();
  const item = data.gallery.find((entry) => entry.id === id);
  if (!item) {
    return res.status(404).json({ error: 'Gallery item not found' });
  }

  const { title, description, category, imageUrl } = req.body || {};
  if (title) item.title = title;
  if (typeof description === 'string') item.description = description;
  if (category) item.category = category;
  if (imageUrl) item.imageUrl = imageUrl;
  item.updatedAt = new Date().toISOString();

  await saveData(data);
  res.json({ item });
});

app.delete('/api/admin/gallery/:id', async (req, res) => {
  const { id } = req.params;
  const data = await loadData();
  data.gallery = data.gallery.filter((entry) => entry.id !== id);
  await saveData(data);
  res.json({ ok: true });
});

app.post('/api/messages', async (req, res) => {
  const { name, email, phone, message } = req.body || {};
  if (!name || !email || !phone || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const data = await loadData();
  const newMessage = {
    id: nextId('MSG', data.messages),
    name,
    email,
    phone,
    message,
    status: 'new',
    createdAt: new Date().toISOString()
  };
  data.messages.unshift(newMessage);
  await saveData(data);
  res.json({ message: newMessage });
});

app.get('/api/admin/messages', async (req, res) => {
  const data = await loadData();
  res.json({ messages: data.messages });
});

app.patch('/api/admin/messages/:id', async (req, res) => {
  const { id } = req.params;
  const data = await loadData();
  const message = data.messages.find((entry) => entry.id === id);
  if (!message) {
    return res.status(404).json({ error: 'Message not found' });
  }
  const { status } = req.body || {};
  if (status) message.status = status;
  message.updatedAt = new Date().toISOString();
  await saveData(data);
  res.json({ message });
});

app.delete('/api/admin/messages/:id', async (req, res) => {
  const { id } = req.params;
  const data = await loadData();
  data.messages = data.messages.filter((entry) => entry.id !== id);
  await saveData(data);
  res.json({ ok: true });
});

app.post('/api/orders', authMiddleware, async (req, res) => {
  const payload = req.body || {};
  const data = await loadData();
  const user = data.users.find((entry) => entry.id === req.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const items = Array.isArray(payload.items) ? payload.items : [];
  if (items.length === 0) {
    return res.status(400).json({ error: 'Order items required' });
  }

  const order = {
    id: nextId('ORD', data.orders),
    userId: user.id,
    customerId: user.customerId,
    customerName: payload.customerName || user.name,
    customerPhone: payload.customerPhone || user.phone || '',
    customerEmail: payload.customerEmail || user.email,
    items,
    totalAmount: Number(payload.totalAmount || 0),
    deliveryZone: payload.deliveryZone || 'local',
    deliveryFee: Number(payload.deliveryFee || 0),
    deliveryAddress: payload.deliveryAddress || '',
    deliveryDate: payload.deliveryDate || '',
    deliveryTimeWindow: payload.deliveryTimeWindow || '',
    status: payload.status || 'pending',
    notes: payload.notes || '',
    createdAt: new Date().toISOString()
  };

  data.orders.unshift(order);

  const customer = data.customers.find((entry) => entry.id === user.customerId);
  if (customer) {
    customer.totalOrders += 1;
    customer.totalSpent += order.totalAmount + order.deliveryFee;
    if (order.deliveryAddress && !customer.addresses.includes(order.deliveryAddress)) {
      customer.addresses.push(order.deliveryAddress);
    }
    if (order.customerPhone) customer.phone = order.customerPhone;
  }

  items.forEach((item) => {
    const productId = item.product?.id || item.productId || item.id;
    const qty = Number(item.quantity || 0);
    const product = data.products.find((entry) => entry.id === productId);
    if (product && qty > 0) {
      product.stock = Math.max(0, Number(product.stock || 0) - qty);
    }
  });

  await saveData(data);
  res.json({ order });
});

app.get('/api/orders/my', authMiddleware, async (req, res) => {
  const data = await loadData();
  const user = data.users.find((entry) => entry.id === req.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const orders = data.orders.filter((order) => order.customerId === user.customerId);
  res.json({ orders });
});

app.delete('/api/orders/my', authMiddleware, async (req, res) => {
  const data = await loadData();
  const user = data.users.find((entry) => entry.id === req.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const customerId = user.customerId;
  data.orders = data.orders.filter((order) => order.customerId !== customerId);

  const customer = data.customers.find((entry) => entry.id === customerId);
  if (customer) {
    const remainingOrders = data.orders.filter((order) => order.customerId === customerId);
    customer.totalOrders = remainingOrders.length;
    customer.totalSpent = remainingOrders.reduce(
      (sum, order) => sum + order.totalAmount + order.deliveryFee,
      0
    );
  }

  await saveData(data);
  res.json({ ok: true });
});

app.get('/api/admin/orders', async (req, res) => {
  const data = await loadData();
  res.json({ orders: data.orders });
});

app.patch('/api/admin/orders/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};
  const data = await loadData();
  const order = data.orders.find((entry) => entry.id === id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  if (status) order.status = status;
  await saveData(data);
  res.json({ order });
});

app.get('/api/admin/accounts', async (req, res) => {
  const data = await loadData();
  const accounts = data.users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    customerId: user.customerId,
    createdAt: user.createdAt
  }));
  res.json({ accounts });
});

app.get('/api/admin/customers', async (req, res) => {
  const data = await loadData();
  res.json({ customers: data.customers });
});

app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});
