import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import crypto from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, 'data.json');
const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const DIST_PATH = path.join(__dirname, '../dist');
const PORT = process.env.PORT ? Number(process.env.PORT) : 5175;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:2007/goodrich';
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'goodrich';
const MONGODB_ENABLED = String(process.env.MONGODB_ENABLED || 'true').toLowerCase() === 'true';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const NODE_ENV = process.env.NODE_ENV || 'development';
const CLOUDINARY_URL = process.env.CLOUDINARY_URL || '';
const APP_BASE_URL = process.env.APP_BASE_URL || '';
const SMTP_HOST = process.env.SMTP_HOST || '';
const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const SMTP_FROM = process.env.SMTP_FROM || '';
const MANUAL_MOMO_RECEIVER_NAME = process.env.MANUAL_MOMO_RECEIVER_NAME || 'MUREKEYISONI Francine';
const MANUAL_MOMO_RECEIVER_PHONE = process.env.MANUAL_MOMO_RECEIVER_PHONE || '0786584808';

if (CLOUDINARY_URL) {
  cloudinary.config({ secure: true });
}

const ensureMongoConnected = async () => {
  if (!MONGODB_ENABLED) return;
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(MONGODB_URI, { dbName: MONGODB_DB_NAME });
};

const connectMongo = async () => {
  if (!MONGODB_ENABLED) return;
  try {
    await ensureMongoConnected();
    await syncMongoIndexes();
    const { host, name, readyState } = mongoose.connection;
    console.log(`MongoDB connected (state ${readyState}) to ${host}/${name}`);
  } catch (err) {
    console.error('MongoDB connection failed:', err?.message || err);
    process.exit(1);
  }
};

const DELIVERY_FEES = {
  local: 3000,
  regional: 10000,
  national: 15000
};
const MAX_ADMIN_LIMIT = 1000;
const SUPPORTED_LANGUAGES = ['en', 'rw', 'sw', 'fr'];
const DEFAULT_CONTENT_LANGUAGE = 'en';

const app = express();
app.use(cors({ origin: true, credentials: false }));
app.use(
  express.json({
    limit: '2mb',
    verify: (req, res, buf) => {
      req.rawBody = buf;
    }
  })
);
app.use('/uploads', express.static(UPLOADS_DIR));

const buildUploadUrl = (filePath) => `/uploads/${filePath.replace(/\\/g, '/')}`;
let mailerCache = null;


const getMailer = () => {
  if (mailerCache) return mailerCache;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
    return null;
  }
  mailerCache = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });
  return mailerCache;
};

const resolveUploadFilePath = (urlValue) => {
  if (typeof urlValue !== 'string' || !urlValue.startsWith('/uploads/')) {
    return null;
  }
  const relativePath = decodeURIComponent(urlValue.replace('/uploads/', ''));
  const normalized = path.normalize(relativePath);
  if (normalized.startsWith('..') || path.isAbsolute(normalized)) {
    return null;
  }
  return path.join(UPLOADS_DIR, normalized);
};

const extractCloudinaryPublicId = (urlValue) => {
  if (typeof urlValue !== 'string' || !urlValue.includes('/upload/')) {
    return null;
  }
  const withoutQuery = urlValue.split('?')[0];
  const uploadPart = withoutQuery.split('/upload/')[1];
  if (!uploadPart) return null;
  const segments = uploadPart.split('/');
  const versionIndex = segments.findIndex((seg) => /^v\d+$/.test(seg));
  const publicSegments = versionIndex >= 0 ? segments.slice(versionIndex + 1) : segments;
  if (publicSegments.length === 0) return null;
  const last = publicSegments[publicSegments.length - 1];
  publicSegments[publicSegments.length - 1] = last.replace(/\.[^.]+$/, '');
  return publicSegments.join('/');
};

const deleteUploadIfExists = async (urlValue) => {
  const cloudinaryPublicId = extractCloudinaryPublicId(urlValue);
  if (cloudinaryPublicId && CLOUDINARY_URL) {
    try {
      await cloudinary.uploader.destroy(cloudinaryPublicId, { resource_type: 'image' });
      return;
    } catch (err) {
      console.error('Failed to delete Cloudinary asset:', err?.message || err);
    }
  }

  const filePath = resolveUploadFilePath(urlValue);
  if (!filePath) return;
  try {
    await fs.unlink(filePath);
  } catch (err) {
    // Ignore missing files; cleanup is best-effort.
    if (err && err.code !== 'ENOENT') {
      console.error('Failed to delete upload:', err.message);
    }
  }
};

const createUploader = () =>
  multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image uploads are allowed'));
      }
    }
  });

const saveUploadedFile = async (subDir, file) => {
  if (CLOUDINARY_URL) {
    const folder = `goodrich/${subDir}`;
    const uploaded = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'image' },
        (error, result) => {
          if (error) return reject(error);
          return resolve(result);
        }
      );
      stream.end(file.buffer);
    });
    return { url: uploaded.secure_url, key: uploaded.public_id };
  }

  const ext = path.extname(file?.originalname || '') || '.bin';
  const filename = `${crypto.randomBytes(16).toString('hex')}${ext}`;
  const key = path.join(subDir, filename);
  const targetPath = path.join(UPLOADS_DIR, key);
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.writeFile(targetPath, file.buffer);
  return { url: buildUploadUrl(key), key };
};

const ensureUploadsDir = async () => {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
};

const avatarUpload = createUploader();
const galleryUpload = createUploader();
const productUpload = createUploader();

const emptyData = () => ({
  users: [],
  customers: [],
  products: [],
  orders: [],
  pendingPayments: [],
  passwordResets: [],
  announcements: [],
  messages: [],
  gallery: []
});

const DATA_PARTS = [
  'users',
  'customers',
  'products',
  'orders',
  'pendingPayments',
  'passwordResets',
  'announcements',
  'messages',
  'gallery'
];

const localizedTextSchema = new mongoose.Schema({}, { _id: false, strict: false });
const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.Mixed, required: true },
    quantity: { type: Number, required: true }
  },
  { _id: false, strict: false }
);

const userSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, index: true, unique: true },
    name: { type: String, default: '' },
    email: { type: String, required: true, index: true, unique: true },
    passwordHash: { type: String, default: '' },
    customerId: { type: String, index: true },
    phone: { type: String, default: '' },
    avatarUrl: { type: String, default: '' },
    createdAt: { type: String, default: '' },
    updatedAt: { type: String }
  },
  { strict: false, versionKey: false }
);

const customerSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, index: true, unique: true },
    name: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '', index: true },
    addresses: { type: [String], default: [] },
    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    joinedDate: { type: String, default: '' }
  },
  { strict: false, versionKey: false }
);

const productSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, index: true, unique: true },
    name: { type: localizedTextSchema, default: {} },
    description: { type: localizedTextSchema, default: {} },
    price: { type: Number, default: 0 },
    category: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    images: { type: [String], default: [] },
    unit: { type: String, default: '' },
    stock: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    createdAt: { type: String, default: '' },
    updatedAt: { type: String }
  },
  { strict: false, versionKey: false }
);

const orderSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, index: true, unique: true },
    userId: { type: String, index: true },
    customerId: { type: String, index: true },
    customerName: { type: String, default: '' },
    customerPhone: { type: String, default: '' },
    customerEmail: { type: String, default: '' },
    items: { type: [orderItemSchema], default: [] },
    totalAmount: { type: Number, default: 0 },
    deliveryZone: { type: String, default: 'local' },
    deliveryFee: { type: Number, default: 0 },
    deliveryAddress: { type: String, default: '' },
    deliveryDate: { type: String, default: '' },
    deliveryTimeWindow: { type: String, default: '' },
    status: { type: String, default: 'pending', index: true },
    notes: { type: String, default: '' },
    paymentStatus: { type: String },
    createdAt: { type: String, default: '' },
    updatedAt: { type: String }
  },
  { strict: false, versionKey: false }
);

const pendingPaymentSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, index: true, unique: true },
    ref: { type: String, index: true, unique: true },
    status: { type: String, default: 'pending', index: true },
    amount: { type: Number, default: 0 },
    subtotal: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    userId: { type: String, index: true },
    customerId: { type: String, index: true },
    orderPayload: { type: mongoose.Schema.Types.Mixed, default: {} },
    orderId: { type: String },
    failureReason: { type: String },
    retriedFrom: { type: String },
    retriedTo: { type: String },
    method: { type: String },
    receiverName: { type: String },
    receiverPhone: { type: String },
    createdAt: { type: String, default: '' },
    updatedAt: { type: String },
    approvedAt: { type: String },
    cancelledAt: { type: String },
    expiresAt: { type: Number }
  },
  { strict: false, versionKey: false }
);

const passwordResetSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, index: true, unique: true },
    userId: { type: String, index: true },
    email: { type: String, index: true },
    name: { type: String },
    token: { type: String, required: true },
    hasAccount: { type: Boolean, default: false },
    createdAt: { type: String, default: '' },
    expiresAt: { type: Number, default: 0 },
    used: { type: Boolean, default: false },
    usedAt: { type: String },
    sentAt: { type: String }
  },
  { strict: false, versionKey: false }
);

const announcementSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, index: true, unique: true },
    title: { type: localizedTextSchema, default: {} },
    content: { type: localizedTextSchema, default: {} },
    author: { type: String, default: 'Admin' },
    createdAt: { type: String, default: '' },
    updatedAt: { type: String }
  },
  { strict: false, versionKey: false }
);

const messageSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, index: true, unique: true },
    name: { type: String, default: '' },
    email: { type: String, default: '', index: true },
    phone: { type: String, default: '' },
    message: { type: String, default: '' },
    status: { type: String, default: 'new', index: true },
    createdAt: { type: String, default: '' },
    updatedAt: { type: String }
  },
  { strict: false, versionKey: false }
);

const gallerySchema = new mongoose.Schema(
  {
    id: { type: String, required: true, index: true, unique: true },
    title: { type: localizedTextSchema, default: {} },
    description: { type: localizedTextSchema, default: {} },
    category: { type: String, default: '', index: true },
    imageUrl: { type: String, default: '' },
    createdAt: { type: String, default: '' },
    updatedAt: { type: String }
  },
  { strict: false, versionKey: false }
);

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Customer = mongoose.models.Customer || mongoose.model('Customer', customerSchema);
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
const PendingPayment =
  mongoose.models.PendingPayment || mongoose.model('PendingPayment', pendingPaymentSchema);
const PasswordReset =
  mongoose.models.PasswordReset || mongoose.model('PasswordReset', passwordResetSchema);
const Announcement = mongoose.models.Announcement || mongoose.model('Announcement', announcementSchema);
const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);
const Gallery = mongoose.models.Gallery || mongoose.model('Gallery', gallerySchema);

const MODEL_MAP = {
  users: User,
  customers: Customer,
  products: Product,
  orders: Order,
  pendingPayments: PendingPayment,
  passwordResets: PasswordReset,
  announcements: Announcement,
  messages: Message,
  gallery: Gallery
};

let mongoWriteQueue = Promise.resolve();

const runMongoWrite = async (task) => {
  const run = mongoWriteQueue.then(task, task);
  mongoWriteQueue = run.catch(() => undefined);
  return run;
};

const syncMongoIndexes = async () => {
  const models = Object.values(MODEL_MAP);
  await Promise.all(
    models.map(async (model) => {
      try {
        await model.syncIndexes();
      } catch (err) {
        console.warn(`MongoDB index sync failed for ${model.modelName}:`, err?.message || err);
      }
    })
  );
};

const normalizeData = (data) => ({
  ...emptyData(),
  ...data,
  users: Array.isArray(data?.users) ? data.users : [],
  customers: Array.isArray(data?.customers) ? data.customers : [],
  products: Array.isArray(data?.products) ? data.products : [],
  orders: Array.isArray(data?.orders) ? data.orders : [],
  pendingPayments: Array.isArray(data?.pendingPayments) ? data.pendingPayments : [],
  passwordResets: Array.isArray(data?.passwordResets) ? data.passwordResets : [],
  announcements: Array.isArray(data?.announcements) ? data.announcements : [],
  messages: Array.isArray(data?.messages) ? data.messages : [],
  gallery: Array.isArray(data?.gallery) ? data.gallery : []
});

const getPartPath = (part) => path.join(DATA_DIR, `${part}.json`);

const ensureDataDir = async () => {
  await fs.mkdir(DATA_DIR, { recursive: true });
};

const readJsonFile = async (filePath, fallback) => {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    return fallback;
  }
};

const migrateLegacyDataFileIfNeeded = async () => {
  await ensureDataDir();
  const partPath = getPartPath('users');
  const hasPartFiles = await fs
    .access(partPath)
    .then(() => true)
    .catch(() => false);
  if (hasPartFiles) {
    return;
  }
  const legacy = await readJsonFile(DATA_PATH, null);
  if (!legacy) {
    return;
  }
  const normalized = normalizeData(legacy);
  await Promise.all(
    DATA_PARTS.map((part) =>
      fs.writeFile(getPartPath(part), JSON.stringify(normalized[part] || [], null, 2), 'utf8')
    )
  );
};

const loadDataFromFiles = async () => {
  await migrateLegacyDataFileIfNeeded();
  await ensureDataDir();
  const entries = await Promise.all(
    DATA_PARTS.map(async (part) => {
      const value = await readJsonFile(getPartPath(part), []);
      return [part, Array.isArray(value) ? value : []];
    })
  );
  return normalizeData(Object.fromEntries(entries));
};

const saveDataToFiles = async (data) => {
  const normalized = normalizeData(data);
  await ensureDataDir();
  await Promise.all(
    DATA_PARTS.map((part) =>
      fs.writeFile(getPartPath(part), JSON.stringify(normalized[part] || [], null, 2), 'utf8')
    )
  );
};

const stripMongoMeta = (item) => {
  if (!item || typeof item !== 'object') return item;
  const { _id, __v, ...rest } = item;
  return rest;
};

const loadDataFromMongo = async () => {
  if (!MONGODB_ENABLED) {
    return loadDataFromFiles();
  }
  await ensureMongoConnected();
  const entries = await Promise.all(
    DATA_PARTS.map(async (part) => {
      const model = MODEL_MAP[part];
      const items = model ? await model.find({}).lean() : [];
      return [part, Array.isArray(items) ? items.map(stripMongoMeta) : []];
    })
  );
  const data = Object.fromEntries(entries);
  const hasAnyData = DATA_PARTS.some((part) => Array.isArray(data[part]) && data[part].length > 0);

  if (!hasAnyData) {
    const fallback = await loadDataFromFiles();
    const hasFallbackData = DATA_PARTS.some(
      (part) => Array.isArray(fallback[part]) && fallback[part].length > 0
    );
    if (hasFallbackData) {
      await saveDataToMongo(fallback);
      return fallback;
    }
  }

  return normalizeData(data);
};

const saveDataToMongo = async (data) => {
  if (!MONGODB_ENABLED) {
    return saveDataToFiles(data);
  }
  await ensureMongoConnected();
  return runMongoWrite(async () => {
    const normalized = normalizeData(data);
    await Promise.all(
      DATA_PARTS.map(async (part) => {
        const model = MODEL_MAP[part];
        if (!model) return;
        await model.deleteMany({});
        const items = Array.isArray(normalized[part]) ? normalized[part] : [];
        if (items.length > 0) {
          const cleaned = items.map(stripMongoMeta);
          await model.insertMany(cleaned, { ordered: false });
        }
      })
    );
  });
};

const loadData = async () => {
  if (MONGODB_ENABLED) {
    return loadDataFromMongo();
  }
  return loadDataFromFiles();
};

const saveData = async (data) => {
  if (MONGODB_ENABLED) {
    return saveDataToMongo(data);
  }
  return saveDataToFiles(data);
};

const nextId = (prefix, items) => {
  const max = items.reduce((acc, item) => {
    const match = String(item.id || '').match(/(\d+)$/);
    const num = match ? Number(match[1]) : 0;
    return Math.max(acc, num);
  }, 0);
  return `${prefix}-${String(max + 1).padStart(3, '0')}`;
};

const paginateList = (items, req) => {
  const limitRaw = req.query.limit ? Number(req.query.limit) : null;
  const offsetRaw = req.query.offset ? Number(req.query.offset) : 0;
  const offset = Number.isFinite(offsetRaw) && offsetRaw > 0 ? Math.floor(offsetRaw) : 0;
  const limit =
    Number.isFinite(limitRaw) && limitRaw > 0
      ? Math.min(Math.floor(limitRaw), MAX_ADMIN_LIMIT)
      : null;
  return limit ? items.slice(offset, offset + limit) : items.slice(offset, offset + MAX_ADMIN_LIMIT);
};

const sanitizeLanguage = (value) => {
  const candidate = String(value || '').toLowerCase();
  return SUPPORTED_LANGUAGES.includes(candidate) ? candidate : DEFAULT_CONTENT_LANGUAGE;
};

const isLocalizedTextMap = (value) =>
  value && typeof value === 'object' && !Array.isArray(value);

const toLocalizedTextMap = (value, language = DEFAULT_CONTENT_LANGUAGE) => {
  if (typeof value === 'string') {
    const text = value.trim();
    return text ? { [language]: text } : {};
  }
  if (isLocalizedTextMap(value)) {
    const out = {};
    SUPPORTED_LANGUAGES.forEach((lang) => {
      if (typeof value[lang] === 'string' && value[lang].trim()) {
        out[lang] = value[lang].trim();
      }
    });
    return out;
  }
  return {};
};

const mergeLocalizedText = (currentValue, incomingValue, language = DEFAULT_CONTENT_LANGUAGE) => {
  const current = toLocalizedTextMap(currentValue, DEFAULT_CONTENT_LANGUAGE);
  if (incomingValue === undefined || incomingValue === null) {
    return current;
  }
  if (typeof incomingValue === 'string') {
    const text = incomingValue.trim();
    if (text) {
      current[language] = text;
    }
    return current;
  }
  if (isLocalizedTextMap(incomingValue)) {
    const incoming = toLocalizedTextMap(incomingValue, language);
    return { ...current, ...incoming };
  }
  return current;
};

const resolveLocalizedText = (value, language, fallback = DEFAULT_CONTENT_LANGUAGE) => {
  if (typeof value === 'string') {
    return value;
  }
  const map = toLocalizedTextMap(value, fallback);
  return (
    map[language] ||
    map[fallback] ||
    Object.values(map)[0] ||
    ''
  );
};

const localizeProduct = (product, language) => ({
  ...product,
  name: resolveLocalizedText(product?.name, language),
  description: resolveLocalizedText(product?.description, language)
});

const localizeAnnouncement = (announcement, language) => ({
  ...announcement,
  title: resolveLocalizedText(announcement?.title, language),
  content: resolveLocalizedText(announcement?.content, language)
});

const localizeGalleryItem = (item, language) => ({
  ...item,
  title: resolveLocalizedText(item?.title, language),
  description: resolveLocalizedText(item?.description, language)
});

const buildOrderItems = (itemsInput, products) => {
  const items = Array.isArray(itemsInput) ? itemsInput : [];
  const resolved = [];
  items.forEach((item) => {
    const productId = item?.product?.id || item?.productId || item?.id;
    const quantity = Number(item?.quantity || 0);
    if (!productId || !Number.isFinite(quantity) || quantity <= 0) {
      return;
    }
    const product = products.find((entry) => entry.id === String(productId));
    if (!product) {
      return;
    }
    const productSnapshot = {
      ...product,
      name: resolveLocalizedText(product?.name, DEFAULT_CONTENT_LANGUAGE),
      description: resolveLocalizedText(product?.description, DEFAULT_CONTENT_LANGUAGE)
    };
    resolved.push({ product: productSnapshot, quantity });
  });
  if (resolved.length === 0) {
    throw new Error('Order items required');
  }
  return resolved;
};

const createOrderRecord = (data, user, payload, overrides = {}) => {
  const items = buildOrderItems(payload.items, data.products);
  const deliveryZone =
    payload.deliveryZone === 'regional' || payload.deliveryZone === 'national'
      ? payload.deliveryZone
      : 'local';
  const computedDeliveryFee = DELIVERY_FEES[deliveryZone] ?? DELIVERY_FEES.local;
  const deliveryFee =
    typeof overrides.deliveryFee === 'number'
      ? overrides.deliveryFee
      : typeof payload.deliveryFee === 'number'
        ? payload.deliveryFee
        : computedDeliveryFee;
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.product.price || 0) * Number(item.quantity || 0),
    0
  );
  const totalAmount =
    typeof overrides.totalAmount === 'number'
      ? overrides.totalAmount
      : typeof payload.totalAmount === 'number'
        ? payload.totalAmount
        : subtotal;

  const order = {
    id: nextId('ORD', data.orders),
    userId: user.id,
    customerId: user.customerId,
    customerName: payload.customerName || user.name,
    customerPhone: payload.customerPhone || user.phone || '',
    customerEmail: payload.customerEmail || user.email,
    items,
    totalAmount,
    deliveryZone,
    deliveryFee,
    deliveryAddress: payload.deliveryAddress || '',
    deliveryDate: payload.deliveryDate || '',
    deliveryTimeWindow: payload.deliveryTimeWindow || '',
    status: overrides.status || payload.status || 'pending',
    notes: overrides.notes ?? payload.notes ?? '',
    createdAt: new Date().toISOString()
  };
  if (overrides.paymentStatus) {
    order.paymentStatus = overrides.paymentStatus;
  }

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

  return order;
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




app.get('/api/payments/my', authMiddleware, async (req, res) => {
  const data = await loadData();
  const payments = data.pendingPayments.filter((entry) => entry.userId === req.userId);
  res.json({ payments });
});

app.post('/api/payments/manual', authMiddleware, async (req, res) => {
  const payload = req.body?.order || req.body || {};
  const data = await loadData();
  const user = data.users.find((entry) => entry.id === req.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  let items;
  try {
    items = buildOrderItems(payload.items, data.products);
  } catch (err) {
    return res.status(400).json({ error: 'Order items required' });
  }

  const deliveryZone =
    payload.deliveryZone === 'regional' || payload.deliveryZone === 'national'
      ? payload.deliveryZone
      : 'local';
  const deliveryFee = DELIVERY_FEES[deliveryZone] ?? DELIVERY_FEES.local;
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.product.price || 0) * Number(item.quantity || 0),
    0
  );
  const amount = subtotal + deliveryFee;

  const payment = {
    id: nextId('PAY', data.pendingPayments),
    ref: `MAN-${Date.now()}-${Math.round(Math.random() * 1e6)}`,
    status: 'pending-approval',
    method: 'manual-momo',
    receiverName: MANUAL_MOMO_RECEIVER_NAME,
    receiverPhone: MANUAL_MOMO_RECEIVER_PHONE,
    amount,
    subtotal,
    deliveryFee,
    userId: user.id,
    customerId: user.customerId,
    orderPayload: {
      items: payload.items,
      customerName: payload.customerName || user.name,
      customerPhone: payload.customerPhone || user.phone || '',
      customerEmail: payload.customerEmail || user.email,
      deliveryAddress: payload.deliveryAddress || '',
      deliveryDate: payload.deliveryDate || '',
      deliveryTimeWindow: payload.deliveryTimeWindow || '',
      deliveryZone,
      notes: payload.notes || ''
    },
    createdAt: new Date().toISOString(),
    expiresAt: Date.now() + 30 * 60 * 1000
  };

  data.pendingPayments.unshift(payment);
  await saveData(data);
  return res.json({ payment });
});

app.get('/api/admin/payments', async (req, res) => {
  const data = await loadData();
  res.json({ payments: paginateList(data.pendingPayments, req) });
});


app.post('/api/admin/payments/approve/:id', async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: 'Missing payment id' });
  }

  const store = await loadData();
  const payment = store.pendingPayments.find((entry) => entry.id === id);
  if (!payment) {
    return res.status(404).json({ error: 'Payment not found' });
  }
  if (payment.status === 'approved' || payment.orderId) {
    return res.json({ payment, orderId: payment.orderId });
  }
  if (payment.status === 'cancelled') {
    return res.status(400).json({ error: 'Payment already cancelled' });
  }

  const user = store.users.find((entry) => entry.id === payment.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  let order;
  try {
    order = createOrderRecord(store, user, payment.orderPayload || {}, {
      status: 'confirmed',
      paymentStatus: 'approved',
      totalAmount: payment.subtotal,
      deliveryFee: payment.deliveryFee,
      notes: `${payment.orderPayload?.notes || ''}\nManual payment approved by admin.`.trim()
    });
  } catch (err) {
    return res.status(400).json({ error: err?.message || 'Failed to create order' });
  }

  payment.status = 'approved';
  payment.approvedAt = new Date().toISOString();
  payment.orderId = order.id;
  await saveData(store);
  return res.json({ payment, order });
});

app.post('/api/admin/payments/cancel/:id', async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body || {};
  if (!id) {
    return res.status(400).json({ error: 'Missing payment id' });
  }
  if (!reason || !String(reason).trim()) {
    return res.status(400).json({ error: 'Cancel reason is required' });
  }

  const store = await loadData();
  const payment = store.pendingPayments.find((entry) => entry.id === id);
  if (!payment) {
    return res.status(404).json({ error: 'Payment not found' });
  }
  if (payment.status === 'approved') {
    return res.status(400).json({ error: 'Payment already approved' });
  }

  payment.status = 'cancelled';
  payment.cancelledAt = new Date().toISOString();
  const trimmedReason = String(reason).trim().slice(0, 300);
  payment.failureReason = trimmedReason;
  await saveData(store);
  return res.json({ payment });
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

app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body || {};
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const data = await loadData();
  const user = data.users.find(
    (entry) => entry.email.toLowerCase() === String(email).toLowerCase()
  );

  if (!user) {
    return res.status(404).json({ error: 'No account found for that email' });
  }

  const token = String(crypto.randomInt(100000, 1000000));
  const expiresAt = Date.now() + 60 * 60 * 1000;
  const reset = {
    id: nextId('RST', data.passwordResets),
    userId: user.id,
    email: user.email,
    name: user.name,
    token,
    hasAccount: true,
    createdAt: new Date().toISOString(),
    expiresAt,
    used: false
  };
  data.passwordResets.unshift(reset);
  await saveData(data);
  return res.json({ ok: true });
});

app.post('/api/auth/reset-password', async (req, res) => {
  const { email, token, password } = req.body || {};
  if (!email || !token || !password) {
    return res.status(400).json({ error: 'Email, token, and password are required' });
  }
  if (String(password).length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const data = await loadData();
  const emailLower = String(email).toLowerCase();
  const reset = data.passwordResets.find((entry) => {
    if (!entry || !entry.token || entry.token !== token) return false;
    if (entry.email && String(entry.email).toLowerCase() === emailLower) return true;
    const user = data.users.find((item) => item.id === entry.userId);
    return user?.email && String(user.email).toLowerCase() === emailLower;
  });
  if (!reset) {
    return res.status(400).json({ error: 'Reset token is invalid', code: 'RESET_INVALID' });
  }
  if (reset.used) {
    return res.status(400).json({ error: 'Reset token is already used', code: 'RESET_USED' });
  }
  if (reset.expiresAt < Date.now()) {
    return res.status(400).json({ error: 'Reset token is expired', code: 'RESET_EXPIRED' });
  }

  const user = data.users.find((entry) => entry.id === reset.userId);
  if (!user) {
    return res.status(404).json({ error: 'No account found for that email', code: 'NO_ACCOUNT' });
  }

  user.passwordHash = await bcrypt.hash(String(password), 10);
  reset.used = true;
  reset.usedAt = new Date().toISOString();
  await saveData(data);
  return res.json({ ok: true });
});

app.get('/api/admin/password-resets', async (req, res) => {
  const data = await loadData();
  const resets = paginateList(data.passwordResets, req).map((entry) => {
    const user = data.users.find((item) => item.id === entry.userId);
    return {
      ...entry,
      email: entry.email || user?.email || '',
      name: entry.name || user?.name || ''
    };
  });
  res.json({ resets });
});

app.patch('/api/admin/password-resets/:id', async (req, res) => {
  const { id } = req.params;
  const { sentAt } = req.body || {};
  const data = await loadData();
  const reset = data.passwordResets.find((entry) => entry.id === id);
  if (!reset) {
    return res.status(404).json({ error: 'Reset request not found' });
  }
  if (sentAt) {
    reset.sentAt = typeof sentAt === 'string' ? sentAt : new Date().toISOString();
  }
  await saveData(data);
  return res.json({ reset });
});

app.delete('/api/admin/password-resets/:id', async (req, res) => {
  const { id } = req.params;
  const data = await loadData();
  const existing = data.passwordResets.find((entry) => entry.id === id);
  if (!existing) {
    return res.status(404).json({ error: 'Reset request not found' });
  }
  if (!existing.used) {
    return res.status(400).json({ error: 'Only used reset requests can be deleted' });
  }
  data.passwordResets = data.passwordResets.filter((entry) => entry.id !== id);
  await saveData(data);
  return res.json({ ok: true });
});
app.delete('/api/admin/password-resets/:id', async (req, res) => {
  const { id } = req.params;
  const data = await loadData();
  const existing = data.passwordResets.find((entry) => entry.id === id);
  if (!existing) {
    return res.status(404).json({ error: 'Reset request not found' });
  }
  if (!existing.used) {
    return res.status(400).json({ error: 'Only used reset requests can be deleted' });
  }
  data.passwordResets = data.passwordResets.filter((entry) => entry.id !== id);
  await saveData(data);
  return res.json({ ok: true });
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
  try {
    const stored = await saveUploadedFile('avatars', req.file);
    return res.json({ url: stored.url });
  } catch (err) {
    console.error('Avatar upload failed:', err?.message || err);
    return res.status(500).json({ error: err?.message || 'Failed to store uploaded file' });
  }
});

app.post('/api/uploads/gallery', galleryUpload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  try {
    const stored = await saveUploadedFile('gallery', req.file);
    return res.json({ url: stored.url });
  } catch (err) {
    console.error('Gallery upload failed:', err?.message || err);
    return res.status(500).json({ error: err?.message || 'Failed to store uploaded file' });
  }
});

app.post('/api/uploads/product', productUpload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  try {
    const stored = await saveUploadedFile('products', req.file);
    return res.json({ url: stored.url });
  } catch (err) {
    console.error('Product image upload failed:', err?.message || err);
    return res.status(500).json({ error: err?.message || 'Failed to store uploaded file' });
  }
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
  if (typeof avatarUrl === 'string') {
    const oldAvatarUrl = user.avatarUrl;
    user.avatarUrl = avatarUrl;
    if (oldAvatarUrl && oldAvatarUrl !== avatarUrl) {
      await deleteUploadIfExists(oldAvatarUrl);
    }
  }

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
  const language = sanitizeLanguage(req.query.lang);
  res.json({ products: data.products.map((product) => localizeProduct(product, language)) });
});

app.patch('/api/admin/products/:id', async (req, res) => {
  const { id } = req.params;
  const data = await loadData();
  const product = data.products.find((entry) => entry.id === id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const updates = req.body || {};
  const language = sanitizeLanguage(updates.lang);
  const { lang: _ignoredLang, name, description, ...otherUpdates } = updates;
  Object.assign(product, otherUpdates, { id: product.id });
  if (name !== undefined) {
    product.name = mergeLocalizedText(product.name, name, language);
  }
  if (description !== undefined) {
    product.description = mergeLocalizedText(product.description, description, language);
  }
  await saveData(data);
  return res.json({ product: localizeProduct(product, language) });
});

app.post('/api/admin/products', async (req, res) => {
  const payload = req.body || {};
  const language = sanitizeLanguage(payload.lang);
  const normalizedName = mergeLocalizedText({}, payload.name, language);
  const normalizedDescription = mergeLocalizedText({}, payload.description, language);
  if (!resolveLocalizedText(normalizedName, language)) {
    return res.status(400).json({ error: 'Product name is required' });
  }

  const data = await loadData();
  const product = {
    id: nextId('PROD', data.products),
    name: normalizedName,
    description: normalizedDescription,
    price: Number(payload.price || 0),
    category: payload.category || 'eggs',
    imageUrl: payload.imageUrl || '',
    images: Array.isArray(payload.images) ? payload.images : [],
    unit: payload.unit || '',
    stock: Number(payload.stock || 0),
    size: payload.size || 'medium',
    quantity: Number(payload.quantity || 30),
    isActive: payload.isActive !== false,
    createdAt: new Date().toISOString()
  };

  data.products.unshift(product);
  await saveData(data);
  return res.json({ product: localizeProduct(product, language) });
});

app.delete('/api/admin/products/:id', async (req, res) => {
  const { id } = req.params;
  const data = await loadData();
  const index = data.products.findIndex((entry) => entry.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }
  data.products.splice(index, 1);
  await saveData(data);
  return res.json({ ok: true });
});

app.get('/api/announcements', async (req, res) => {
  const data = await loadData();
  const language = sanitizeLanguage(req.query.lang);
  res.json({ announcements: data.announcements.map((entry) => localizeAnnouncement(entry, language)) });
});

app.post('/api/admin/announcements', async (req, res) => {
  const { title, content, author, lang } = req.body || {};
  const language = sanitizeLanguage(lang);
  const normalizedTitle = mergeLocalizedText({}, title, language);
  const normalizedContent = mergeLocalizedText({}, content, language);
  if (!resolveLocalizedText(normalizedTitle, language) || !resolveLocalizedText(normalizedContent, language)) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const data = await loadData();
  const announcement = {
    id: nextId('ANN', data.announcements),
    title: normalizedTitle,
    content: normalizedContent,
    author: author || 'Admin',
    createdAt: new Date().toISOString()
  };
  data.announcements.unshift(announcement);
  await saveData(data);
  res.json({ announcement: localizeAnnouncement(announcement, language) });
});

app.patch('/api/admin/announcements/:id', async (req, res) => {
  const { id } = req.params;
  const data = await loadData();
  const announcement = data.announcements.find((entry) => entry.id === id);
  if (!announcement) {
    return res.status(404).json({ error: 'Announcement not found' });
  }

  const { title, content, lang } = req.body || {};
  const language = sanitizeLanguage(lang);
  if (title !== undefined) announcement.title = mergeLocalizedText(announcement.title, title, language);
  if (content !== undefined) announcement.content = mergeLocalizedText(announcement.content, content, language);
  announcement.updatedAt = new Date().toISOString();

  await saveData(data);
  res.json({ announcement: localizeAnnouncement(announcement, language) });
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
  const language = sanitizeLanguage(req.query.lang);
  res.json({ gallery: data.gallery.map((item) => localizeGalleryItem(item, language)) });
});

app.post('/api/admin/gallery', async (req, res) => {
  const { title, description, category, imageUrl, lang } = req.body || {};
  const language = sanitizeLanguage(lang);
  const normalizedTitle = mergeLocalizedText({}, title, language);
  const normalizedDescription = mergeLocalizedText({}, description, language);
  if (!resolveLocalizedText(normalizedTitle, language) || !category || !imageUrl) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const data = await loadData();
  const item = {
    id: nextId('GAL', data.gallery),
    title: normalizedTitle,
    description: normalizedDescription,
    category,
    imageUrl,
    createdAt: new Date().toISOString()
  };
  data.gallery.unshift(item);
  await saveData(data);
  res.json({ item: localizeGalleryItem(item, language) });
});

app.patch('/api/admin/gallery/:id', async (req, res) => {
  const { id } = req.params;
  const data = await loadData();
  const item = data.gallery.find((entry) => entry.id === id);
  if (!item) {
    return res.status(404).json({ error: 'Gallery item not found' });
  }

  const { title, description, category, imageUrl, lang } = req.body || {};
  const language = sanitizeLanguage(lang);
  if (title !== undefined) item.title = mergeLocalizedText(item.title, title, language);
  if (description !== undefined) item.description = mergeLocalizedText(item.description, description, language);
  if (category) item.category = category;
  if (imageUrl && imageUrl !== item.imageUrl) {
    const oldImageUrl = item.imageUrl;
    item.imageUrl = imageUrl;
    await deleteUploadIfExists(oldImageUrl);
  }
  item.updatedAt = new Date().toISOString();

  await saveData(data);
  res.json({ item: localizeGalleryItem(item, language) });
});

app.delete('/api/admin/gallery/:id', async (req, res) => {
  const { id } = req.params;
  const data = await loadData();
  const existing = data.gallery.find((entry) => entry.id === id);
  data.gallery = data.gallery.filter((entry) => entry.id !== id);
  if (existing?.imageUrl) {
    await deleteUploadIfExists(existing.imageUrl);
  }
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
  res.json({ messages: paginateList(data.messages, req) });
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

  let order;
  try {
    order = createOrderRecord(data, user, payload);
  } catch (err) {
    return res.status(400).json({ error: err?.message || 'Order items required' });
  }

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
  res.json({ orders: paginateList(data.orders, req) });
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
  res.json({ accounts: paginateList(accounts, req) });
});

app.get('/api/admin/customers', async (req, res) => {
  const data = await loadData();
  res.json({ customers: paginateList(data.customers, req) });
});

if (NODE_ENV === 'production') {
  app.use(express.static(DIST_PATH));
}

// SPA Fallback - serve index.html for all non-API routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return next();
  }
  if (NODE_ENV === 'production') {
    return res.sendFile(path.join(DIST_PATH, 'index.html'));
  }
  // In development, only serve index.html if the file exists
  return res.sendFile(path.join(DIST_PATH, 'index.html'));
});

app.use((err, req, res, next) => {
  if (!err) return next();
  if (err?.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'Image exceeds 5MB limit' });
  }
  if (typeof err?.message === 'string' && err.message.includes('Only image uploads are allowed')) {
    return res.status(400).json({ error: 'Only image uploads are allowed' });
  }
  console.error('Unhandled request error:', err?.message || err);
  return res.status(500).json({ error: err?.message || 'Request failed' });
});

const runningInFunction = Boolean(process.env.FUNCTION_TARGET || process.env.K_SERVICE);
if (!runningInFunction) {
  await ensureUploadsDir();
  await connectMongo();
  app.listen(PORT, () => {
    console.log(`API server listening on http://localhost:${PORT}`);
  });
}

export { app };
export default app;



