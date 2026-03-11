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
const SUPER_ADMIN_USERNAME = process.env.SUPER_ADMIN_USERNAME || 'GoodrichSuperAdmin';
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || 'change-me';
const SUPER_ADMIN_FORCE_RESET = String(process.env.SUPER_ADMIN_FORCE_RESET || '').toLowerCase() === 'true';

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
const DELIVERY_FEE_PER_TRAY = 300;
const FARM_ORIGIN = {
  name: 'GS Kawangire Catholique',
  latitude: -1.7879506,
  longitude: 30.4722743
};
const NOMINATIM_USER_AGENT = 'GoodrichFarmApp/1.0 (delivery-estimation)';
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
  gallery: [],
  admins: [],
  security: [],
  auditLogs: [],
  loginAttempts: [],
  sessions: [],
  blockedIps: [],
  blockedDevices: []
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
  'gallery',
  'admins',
  'security',
  'auditLogs',
  'loginAttempts',
  'sessions',
  'blockedIps',
  'blockedDevices'
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
    fulfillmentMethod: { type: String, default: 'delivery' },
    deliveryZone: { type: String, default: 'local' },
    deliveryFee: { type: Number, default: 0 },
    deliveryDistanceKm: { type: Number, default: 0 },
    deliveryChargeableKm: { type: Number, default: 0 },
    deliveryAddress: { type: String, default: '' },
    locationMeta: { type: mongoose.Schema.Types.Mixed, default: null },
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

const adminSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, index: true, unique: true },
    name: { type: String, default: '' },
    username: { type: String, required: true, index: true, unique: true },
    email: { type: String, default: '' },
    passwordHash: { type: String, default: '' },
    role: { type: String, default: 'admin' },
    active: { type: Boolean, default: true },
    createdAt: { type: String, default: '' },
    updatedAt: { type: String },
    lastLoginAt: { type: String }
  },
  { strict: false, versionKey: false }
);

const securitySchema = new mongoose.Schema(
  {
    id: { type: String, required: true, index: true, unique: true },
    lockdown: { type: Boolean, default: false },
    lockdownReason: { type: String, default: '' },
    updatedAt: { type: String, default: '' },
    updatedBy: { type: String, default: '' }
  },
  { strict: false, versionKey: false }
);

const auditLogSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, index: true, unique: true },
    actorId: { type: String, default: '' },
    actorRole: { type: String, default: '' },
    action: { type: String, default: '' },
    target: { type: String, default: '' },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    createdAt: { type: String, default: '' }
  },
  { strict: false, versionKey: false }
);

const loginAttemptSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, index: true, unique: true },
    actorType: { type: String, default: '' },
    usernameOrEmail: { type: String, default: '' },
    ip: { type: String, default: '' },
    country: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    deviceId: { type: String, default: '' },
    deviceName: { type: String, default: '' },
    device: { type: String, default: '' },
    os: { type: String, default: '' },
    browser: { type: String, default: '' },
    status: { type: String, default: '' },
    createdAt: { type: String, default: '' }
  },
  { strict: false, versionKey: false }
);

const sessionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, index: true, unique: true },
    type: { type: String, default: '' },
    actorId: { type: String, default: '' },
    role: { type: String, default: '' },
    ip: { type: String, default: '' },
    country: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    deviceId: { type: String, default: '' },
    deviceName: { type: String, default: '' },
    device: { type: String, default: '' },
    os: { type: String, default: '' },
    browser: { type: String, default: '' },
    active: { type: Boolean, default: true },
    createdAt: { type: String, default: '' },
    lastSeenAt: { type: String, default: '' }
  },
  { strict: false, versionKey: false }
);

const blockedIpSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, index: true, unique: true },
    ip: { type: String, default: '' },
    reason: { type: String, default: '' },
    createdAt: { type: String, default: '' },
    createdBy: { type: String, default: '' }
  },
  { strict: false, versionKey: false }
);

const blockedDeviceSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, index: true, unique: true },
    userAgent: { type: String, default: '' },
    deviceId: { type: String, default: '' },
    reason: { type: String, default: '' },
    createdAt: { type: String, default: '' },
    createdBy: { type: String, default: '' }
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
const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);
const Security = mongoose.models.Security || mongoose.model('Security', securitySchema);
const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);
const LoginAttempt = mongoose.models.LoginAttempt || mongoose.model('LoginAttempt', loginAttemptSchema);
const Session = mongoose.models.Session || mongoose.model('Session', sessionSchema);
const BlockedIp = mongoose.models.BlockedIp || mongoose.model('BlockedIp', blockedIpSchema);
const BlockedDevice = mongoose.models.BlockedDevice || mongoose.model('BlockedDevice', blockedDeviceSchema);

const MODEL_MAP = {
  users: User,
  customers: Customer,
  products: Product,
  orders: Order,
  pendingPayments: PendingPayment,
  passwordResets: PasswordReset,
  announcements: Announcement,
  messages: Message,
  gallery: Gallery,
  admins: Admin,
  security: Security,
  auditLogs: AuditLog,
  loginAttempts: LoginAttempt,
  sessions: Session,
  blockedIps: BlockedIp,
  blockedDevices: BlockedDevice
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
  gallery: Array.isArray(data?.gallery) ? data.gallery : [],
  admins: Array.isArray(data?.admins) ? data.admins : [],
  security: Array.isArray(data?.security) ? data.security : [],
  auditLogs: Array.isArray(data?.auditLogs) ? data.auditLogs : [],
  loginAttempts: Array.isArray(data?.loginAttempts) ? data.loginAttempts : [],
  sessions: Array.isArray(data?.sessions) ? data.sessions : [],
  blockedIps: Array.isArray(data?.blockedIps) ? data.blockedIps : [],
  blockedDevices: Array.isArray(data?.blockedDevices) ? data.blockedDevices : []
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

const DEFAULT_SECURITY = {
  id: 'security',
  lockdown: false,
  lockdownReason: '',
  updatedAt: '',
  updatedBy: ''
};

const getSecurity = (data) => {
  if (!Array.isArray(data.security) || data.security.length === 0) {
    data.security = [{ ...DEFAULT_SECURITY }];
  }
  return data.security[0];
};

const nowIso = () => new Date().toISOString();

const getClientIp = (req) => {
  const header = req.headers['x-forwarded-for'];
  if (typeof header === 'string' && header.trim()) {
    return header.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || '';
};

const getUserAgent = (req) => String(req.headers['user-agent'] || '');

const getCountry = (req) =>
  String(
    req.headers['cf-ipcountry'] ||
      req.headers['x-vercel-ip-country'] ||
      req.headers['x-country'] ||
      ''
  );

const getDeviceId = (req) => String(req.headers['x-device-id'] || '');
const getDeviceName = (req) => String(req.headers['x-device-name'] || '');

const parseDevice = (ua) => {
  const lower = ua.toLowerCase();
  const os =
    lower.includes('windows') ? 'Windows' :
    lower.includes('mac os') || lower.includes('macintosh') ? 'macOS' :
    lower.includes('android') ? 'Android' :
    lower.includes('iphone') || lower.includes('ipad') ? 'iOS' :
    lower.includes('linux') ? 'Linux' :
    'Unknown';
  const browser =
    lower.includes('edg/') ? 'Edge' :
    lower.includes('chrome/') && !lower.includes('edg/') ? 'Chrome' :
    lower.includes('safari/') && !lower.includes('chrome/') ? 'Safari' :
    lower.includes('firefox/') ? 'Firefox' :
    'Unknown';
  return { os, browser, device: ua.slice(0, 120) };
};

const addAuditLog = async (data, entry) => {
  const log = {
    id: nextId('LOG', data.auditLogs),
    createdAt: nowIso(),
    ...entry
  };
  data.auditLogs.unshift(log);
  if (data.auditLogs.length > 2000) {
    data.auditLogs = data.auditLogs.slice(0, 2000);
  }
  await saveData(data);
};

const maybeAlert = async (data, { ip, usernameOrEmail, actorType }) => {
  const windowMs = 10 * 60 * 1000;
  const cutoff = Date.now() - windowMs;
  const recentFailures = data.loginAttempts.filter(
    (entry) =>
      entry.status === 'failed' &&
      entry.actorType === actorType &&
      Number(new Date(entry.createdAt || 0)) >= cutoff &&
      (entry.ip === ip || entry.usernameOrEmail === usernameOrEmail)
  );
  if (recentFailures.length < 5) return;

  const alreadyAlerted = data.auditLogs.some((log) => {
    if (log.action !== 'security_alert') return false;
    if (log.metadata?.ip !== ip && log.metadata?.usernameOrEmail !== usernameOrEmail) return false;
    return Number(new Date(log.createdAt || 0)) >= cutoff;
  });
  if (alreadyAlerted) return;

  data.auditLogs.unshift({
    id: nextId('LOG', data.auditLogs),
    createdAt: nowIso(),
    actorId: '',
    actorRole: 'system',
    action: 'security_alert',
    target: actorType,
    metadata: {
      ip,
      usernameOrEmail,
      reason: 'multiple_failed_logins'
    }
  });
  await saveData(data);
};

const ensureAdminSeed = async () => {
  const data = await loadData();
  const now = new Date().toISOString();
  let updated = false;

  if (!Array.isArray(data.admins)) {
    data.admins = [];
    updated = true;
  }

  let superAdmin = data.admins.find(
    (entry) => entry.username?.toLowerCase?.() === SUPER_ADMIN_USERNAME.toLowerCase()
  );

  if (!superAdmin) {
    const passwordHash = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 10);
    superAdmin = {
      id: data.admins.length === 0 ? 'ADMIN-001' : nextId('ADMIN', data.admins),
      name: 'Super Admin',
      username: SUPER_ADMIN_USERNAME,
      email: '',
      passwordHash,
      role: 'super_admin',
      active: true,
      createdAt: now
    };
    data.admins.unshift(superAdmin);
    updated = true;
  } else if (SUPER_ADMIN_FORCE_RESET) {
    superAdmin.passwordHash = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 10);
    superAdmin.role = 'super_admin';
    superAdmin.active = true;
    superAdmin.updatedAt = now;
    updated = true;
  }

  if (!Array.isArray(data.security) || data.security.length === 0) {
    data.security = [{ ...DEFAULT_SECURITY, updatedAt: now, updatedBy: 'system' }];
    updated = true;
  }

  if (SUPER_ADMIN_PASSWORD === 'change-me') {
    console.warn('Super admin password is using the default. Set SUPER_ADMIN_PASSWORD.');
  }

  if (updated) {
    await saveData(data);
  }
};

const nextId = (prefix, items) => {
  const max = items.reduce((acc, item) => {
    const match = String(item.id || '').match(/(\d+)$/);
    const num = match ? Number(match[1]) : 0;
    return Math.max(acc, num);
  }, 0);
  return `${prefix}-${String(max + 1).padStart(3, '0')}`;
};

const normalizeRwandaPhone = (value) => {
  const raw = String(value || '');
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('250') && digits.length === 12) return `+${digits}`;
  if (digits.startsWith('07') && digits.length === 10) return `+250${digits.slice(1)}`;
  if (digits.startsWith('7') && digits.length === 9) return `+250${digits}`;
  return raw.trim();
};

const isValidRwandaPhone = (value) => /^\+2507\d{8}$/.test(String(value || ''));

const haversineKm = (lat1, lon1, lat2, lon2) => {
  const toRad = (deg) => (Number(deg) * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return 6371 * c;
};

const resolveDestinationCoordinates = async ({ deliveryAddress, locationMeta }) => {
  const metaLat = Number(locationMeta?.latitude);
  const metaLng = Number(locationMeta?.longitude);
  if (Number.isFinite(metaLat) && Number.isFinite(metaLng)) {
    return {
      latitude: metaLat,
      longitude: metaLng,
      source: 'locationMeta'
    };
  }

  const addressText = String(deliveryAddress || '').trim();
  if (!addressText) return null;

  const query = encodeURIComponent(`${addressText}, Rwanda`);
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${query}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': NOMINATIM_USER_AGENT }
  });
  if (!res.ok) return null;
  const data = await res.json().catch(() => []);
  const first = Array.isArray(data) ? data[0] : null;
  const lat = Number(first?.lat);
  const lon = Number(first?.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  return {
    latitude: lat,
    longitude: lon,
    source: 'geocodedAddress',
    displayName: first?.display_name || ''
  };
};

const calculateDeliveryEstimate = async ({ items, fulfillmentMethod, deliveryAddress, locationMeta }) => {
  const trays = (Array.isArray(items) ? items : []).reduce((sum, item) => sum + Number(item?.quantity || 0), 0);
  if (fulfillmentMethod === 'pickup') {
    return {
      trays,
      distanceKm: 0,
      chargeableKm: 0,
      deliveryFee: 0,
      origin: FARM_ORIGIN,
      destination: null
    };
  }

  if (trays <= 0) {
    throw new Error('Order items required');
  }

  const destination = await resolveDestinationCoordinates({ deliveryAddress, locationMeta });
  if (!destination) {
    throw new Error('Unable to resolve destination location');
  }

  const rawDistance = haversineKm(
    FARM_ORIGIN.latitude,
    FARM_ORIGIN.longitude,
    destination.latitude,
    destination.longitude
  );
  const distanceKm = Number(rawDistance.toFixed(2));
  const chargeableKm = Math.max(1, Math.ceil(distanceKm));
  const deliveryFee = trays * chargeableKm * DELIVERY_FEE_PER_TRAY;

  return {
    trays,
    distanceKm,
    chargeableKm,
    deliveryFee,
    origin: FARM_ORIGIN,
    destination
  };
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
  const normalizedPhone = normalizeRwandaPhone(payload.customerPhone || user.phone || '');
  if (!isValidRwandaPhone(normalizedPhone)) {
    throw new Error('Invalid Rwanda phone number');
  }
  const fulfillmentMethod = payload.fulfillmentMethod === 'pickup' ? 'pickup' : 'delivery';
  const deliveryZone = 'local';
  const deliveryFee =
    typeof overrides.deliveryFee === 'number'
      ? overrides.deliveryFee
      : typeof payload.deliveryFee === 'number'
        ? payload.deliveryFee
        : 0;
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
  if (fulfillmentMethod === 'delivery' && !String(payload.deliveryAddress || '').trim()) {
    throw new Error('Delivery address is required');
  }

  const order = {
    id: nextId('ORD', data.orders),
    userId: user.id,
    customerId: user.customerId,
    customerName: payload.customerName || user.name,
    customerPhone: normalizedPhone,
    customerEmail: payload.customerEmail || user.email,
    items,
    totalAmount,
    fulfillmentMethod,
    deliveryZone,
    deliveryFee,
    deliveryDistanceKm: Number(payload.deliveryDistanceKm || 0),
    deliveryChargeableKm: Number(payload.deliveryChargeableKm || 0),
    deliveryAddress: fulfillmentMethod === 'delivery' ? payload.deliveryAddress || '' : '',
    locationMeta: payload.locationMeta || null,
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
    customer.phone = order.customerPhone;
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
    const data = await loadData();
    const security = getSecurity(data);
    if (security.lockdown) {
      return res.status(403).json({ error: 'System is in lockdown mode' });
    }
    const ip = getClientIp(req);
    const ua = getUserAgent(req);
    const deviceId = getDeviceId(req);
    const blockedIp = data.blockedIps.find((entry) => entry.ip === ip);
    const blockedDevice = data.blockedDevices.find(
      (entry) => entry.userAgent === ua || (entry.deviceId && entry.deviceId === deviceId)
    );
    if (blockedIp || blockedDevice) {
      return res.status(403).json({ error: 'Access blocked' });
    }
    const sessionId = payload.sid;
    const session = data.sessions.find((entry) => entry.id === sessionId);
    if (!session || !session.active || session.type !== 'user') {
      return res.status(401).json({ error: 'Session expired' });
    }
    session.lastSeenAt = nowIso();
    await saveData(data);
    req.userId = payload.sub;
    req.sessionId = sessionId;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const adminAuthMiddleware = async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'Missing admin token' });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload?.type !== 'admin') {
      return res.status(403).json({ error: 'Invalid admin token' });
    }
    const data = await loadData();
    const ip = getClientIp(req);
    const ua = getUserAgent(req);
    const deviceId = getDeviceId(req);
    const blockedIp = data.blockedIps.find((entry) => entry.ip === ip);
    const blockedDevice = data.blockedDevices.find(
      (entry) => entry.userAgent === ua || (entry.deviceId && entry.deviceId === deviceId)
    );
    if (payload.role !== 'super_admin' && (blockedIp || blockedDevice)) {
      return res.status(403).json({ error: 'Access blocked' });
    }
    const sessionId = payload.sid;
    const session = data.sessions.find((entry) => entry.id === sessionId);
    if (!session || !session.active || session.type !== 'admin') {
      return res.status(401).json({ error: 'Session expired' });
    }
    session.lastSeenAt = nowIso();
    await saveData(data);
    req.adminId = payload.sub;
    req.adminRole = payload.role;
    req.sessionId = sessionId;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid admin token' });
  }
};

const requireSuperAdmin = (req, res, next) => {
  if (req.adminRole !== 'super_admin') {
    return res.status(403).json({ error: 'Super admin access required' });
  }
  return next();
};

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api', async (req, res, next) => {
  if (req.path === '/health') return next();
  if (req.path === '/admin/auth/login') return next();
  const data = await loadData();
  const security = getSecurity(data);
  if (security.lockdown && !req.path.startsWith('/admin') && !req.path.startsWith('/super-admin')) {
    return res.status(403).json({ error: 'System is in lockdown mode' });
  }
  const ip = getClientIp(req);
  const ua = getUserAgent(req);
  const deviceId = getDeviceId(req);
  const deviceName = getDeviceName(req);
  const country = getCountry(req);
  const deviceId = getDeviceId(req);
  const deviceName = getDeviceName(req);
  const country = getCountry(req);
  const deviceId = getDeviceId(req);
  const blockedIp = data.blockedIps.find((entry) => entry.ip === ip);
  const blockedDevice = data.blockedDevices.find(
    (entry) => entry.userAgent === ua || (entry.deviceId && entry.deviceId === deviceId)
  );
  if ((blockedIp || blockedDevice) && !req.path.startsWith('/super-admin')) {
    return res.status(403).json({ error: 'Access blocked' });
  }
  return next();
});

const sanitizeAdmin = (admin) => ({
  id: admin.id,
  name: admin.name || '',
  username: admin.username,
  email: admin.email || '',
  role: admin.role || 'admin',
  active: admin.active !== false,
  createdAt: admin.createdAt,
  lastLoginAt: admin.lastLoginAt
});

app.post('/api/admin/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ error: 'Missing username or password' });
    }

    let data = await loadData();
    if (!Array.isArray(data.admins) || data.admins.length === 0) {
      await ensureAdminSeed();
      data = await loadData();
    }
    const security = getSecurity(data);
    const ip = getClientIp(req);
    const ua = getUserAgent(req);
    const deviceId = getDeviceId(req);
    const deviceName = getDeviceName(req);
    const country = getCountry(req);
    const admin = data.admins.find(
      (entry) => entry.username.toLowerCase() === String(username).toLowerCase()
    );

    if (!admin || admin.active === false) {
      data.loginAttempts.unshift({
        id: nextId('LOGN', data.loginAttempts),
        actorType: 'admin',
        usernameOrEmail: String(username),
        ip,
        country,
        userAgent: ua,
        deviceId,
        deviceName,
        ...parseDevice(ua),
        status: 'failed',
        createdAt: nowIso()
      });
      await saveData(data);
      await maybeAlert(data, { ip, usernameOrEmail: String(username), actorType: 'admin' });
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    if (security.lockdown && admin.role !== 'super_admin') {
      return res.status(403).json({ error: 'System is in lockdown mode' });
    }

    if (!admin.passwordHash) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    const ok = await bcrypt.compare(String(password), String(admin.passwordHash));
    if (!ok) {
      data.loginAttempts.unshift({
        id: nextId('LOGN', data.loginAttempts),
        actorType: 'admin',
        usernameOrEmail: String(username),
        ip,
        country,
        userAgent: ua,
        deviceId,
        deviceName,
        ...parseDevice(ua),
        status: 'failed',
        createdAt: nowIso()
      });
      await saveData(data);
      await maybeAlert(data, { ip, usernameOrEmail: String(username), actorType: 'admin' });
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    const now = new Date().toISOString();
    admin.lastLoginAt = now;
    admin.updatedAt = now;
    const session = {
      id: nextId('SESS', data.sessions),
      type: 'admin',
      actorId: admin.id,
      role: admin.role,
      ip,
      country,
      userAgent: ua,
      deviceId,
      deviceName,
      ...parseDevice(ua),
      active: true,
      createdAt: now,
      lastSeenAt: now
    };
    data.sessions.unshift(session);
    data.loginAttempts.unshift({
      id: nextId('LOGN', data.loginAttempts),
      actorType: 'admin',
      usernameOrEmail: String(username),
      ip,
      country,
      userAgent: ua,
      deviceId,
      deviceName,
      ...parseDevice(ua),
      status: 'success',
      createdAt: now
    });
    await saveData(data);

    const token = jwt.sign({ sub: admin.id, role: admin.role, type: 'admin', sid: session.id }, JWT_SECRET, {
      expiresIn: '8h'
    });
    return res.json({ token, admin: sanitizeAdmin(admin) });
  } catch (err) {
    console.error('Admin login failed:', err?.message || err);
    return res.status(500).json({ error: 'Admin login failed' });
  }
});

app.use('/api/admin', (req, res, next) => {
  if (req.path.startsWith('/auth/login')) {
    return next();
  }
  return adminAuthMiddleware(req, res, next);
});

app.use('/api/super-admin', adminAuthMiddleware, requireSuperAdmin);

app.get('/api/super-admin/admins', async (req, res) => {
  const data = await loadData();
  return res.json({ admins: data.admins.map(sanitizeAdmin) });
});

app.post('/api/super-admin/admins', async (req, res) => {
  const { name, username, email, password, role } = req.body || {};
  if (!name || !username || !email || !password) {
    return res.status(400).json({ error: 'Name, email, username, and password are required' });
  }

  const data = await loadData();
  const exists = data.admins.some(
    (entry) => entry.username.toLowerCase() === String(username).toLowerCase()
  );
  if (exists) {
    return res.status(400).json({ error: 'Username already exists' });
  }

  const now = new Date().toISOString();
  const passwordHash = await bcrypt.hash(String(password), 10);
  const admin = {
    id: nextId('ADMIN', data.admins),
    name: String(name),
    username: String(username),
    email: String(email),
    passwordHash,
    role: role === 'super_admin' ? 'super_admin' : 'admin',
    active: true,
    createdAt: now
  };
  data.admins.unshift(admin);
  await saveData(data);
  await addAuditLog(data, {
    actorId: req.adminId,
    actorRole: req.adminRole,
    action: 'admin_created',
    target: admin.id,
    metadata: { username: admin.username, role: admin.role }
  });
  return res.status(201).json({ admin: sanitizeAdmin(admin) });
});

app.patch('/api/super-admin/admins/:id', async (req, res) => {
  const { id } = req.params;
  const { name, username, email, password, role, active } = req.body || {};
  const data = await loadData();
  const admin = data.admins.find((entry) => entry.id === id);
  if (!admin) {
    return res.status(404).json({ error: 'Admin not found' });
  }

  if (username && String(username).toLowerCase() !== admin.username.toLowerCase()) {
    const exists = data.admins.some(
      (entry) => entry.username.toLowerCase() === String(username).toLowerCase()
    );
    if (exists) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    admin.username = String(username);
  }

  if (name !== undefined) admin.name = String(name);
  if (email !== undefined) admin.email = String(email);
  if (role) admin.role = role === 'super_admin' ? 'super_admin' : 'admin';
  if (typeof active === 'boolean') admin.active = active;
  if (password) {
    admin.passwordHash = await bcrypt.hash(String(password), 10);
  }
  admin.updatedAt = new Date().toISOString();
  await saveData(data);
  await addAuditLog(data, {
    actorId: req.adminId,
    actorRole: req.adminRole,
    action: 'admin_updated',
    target: admin.id,
    metadata: { username: admin.username, role: admin.role, active: admin.active }
  });
  return res.json({ admin: sanitizeAdmin(admin) });
});

app.delete('/api/super-admin/admins/:id', async (req, res) => {
  const { id } = req.params;
  const data = await loadData();
  const admin = data.admins.find((entry) => entry.id === id);
  if (!admin) {
    return res.status(404).json({ error: 'Admin not found' });
  }

  if (id === req.adminId) {
    return res.status(400).json({ error: 'Cannot delete your own account' });
  }

  if (admin.role === 'super_admin') {
    const superAdmins = data.admins.filter((entry) => entry.role === 'super_admin');
    if (superAdmins.length <= 1) {
      return res.status(400).json({ error: 'Cannot delete the last super admin' });
    }
  }

  data.admins = data.admins.filter((entry) => entry.id !== id);
  await saveData(data);
  await addAuditLog(data, {
    actorId: req.adminId,
    actorRole: req.adminRole,
    action: 'admin_deleted',
    target: id,
    metadata: { username: admin.username }
  });
  return res.json({ ok: true });
});

app.get('/api/super-admin/security', async (req, res) => {
  const data = await loadData();
  const security = getSecurity(data);
  return res.json({ security });
});

app.post('/api/super-admin/security/lockdown', async (req, res) => {
  const { enabled, reason } = req.body || {};
  const data = await loadData();
  const security = getSecurity(data);
  security.lockdown = Boolean(enabled);
  security.lockdownReason = String(reason || '');
  security.updatedAt = nowIso();
  security.updatedBy = req.adminId || '';
  await saveData(data);
  await addAuditLog(data, {
    actorId: req.adminId,
    actorRole: req.adminRole,
    action: security.lockdown ? 'lockdown_enabled' : 'lockdown_disabled',
    target: 'system',
    metadata: { reason: security.lockdownReason }
  });
  return res.json({ security });
});

app.get('/api/super-admin/security/logs', async (req, res) => {
  const data = await loadData();
  const limit = Math.min(Number(req.query.limit || 200), 1000);
  return res.json({ logs: data.auditLogs.slice(0, limit) });
});

app.get('/api/super-admin/security/login-attempts', async (req, res) => {
  const data = await loadData();
  const limit = Math.min(Number(req.query.limit || 200), 1000);
  return res.json({ attempts: data.loginAttempts.slice(0, limit) });
});

app.get('/api/super-admin/security/sessions', async (req, res) => {
  const data = await loadData();
  return res.json({ sessions: data.sessions.filter((s) => s.active !== false) });
});

app.get('/api/super-admin/security/blocklist', async (req, res) => {
  const data = await loadData();
  return res.json({ blockedIps: data.blockedIps, blockedDevices: data.blockedDevices });
});

app.post('/api/super-admin/security/sessions/:id/terminate', async (req, res) => {
  const data = await loadData();
  const session = data.sessions.find((entry) => entry.id === req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  session.active = false;
  session.lastSeenAt = nowIso();
  await saveData(data);
  await addAuditLog(data, {
    actorId: req.adminId,
    actorRole: req.adminRole,
    action: 'session_terminated',
    target: session.id,
    metadata: { type: session.type, actorId: session.actorId }
  });
  return res.json({ ok: true });
});

app.post('/api/super-admin/security/sessions/terminate-all', async (req, res) => {
  const data = await loadData();
  let terminated = 0;
  data.sessions.forEach((session) => {
    if (!session.active) return;
    if (session.role === 'super_admin') return;
    session.active = false;
    session.lastSeenAt = nowIso();
    terminated += 1;
  });
  await saveData(data);
  await addAuditLog(data, {
    actorId: req.adminId,
    actorRole: req.adminRole,
    action: 'sessions_terminated_all',
    target: 'system',
    metadata: { terminated }
  });
  return res.json({ terminated });
});

app.post('/api/super-admin/security/block-ip', async (req, res) => {
  const { ip, reason } = req.body || {};
  if (!ip) return res.status(400).json({ error: 'IP required' });
  const data = await loadData();
  if (!data.blockedIps.find((entry) => entry.ip === ip)) {
    data.blockedIps.unshift({
      id: nextId('BIP', data.blockedIps),
      ip,
      reason: String(reason || ''),
      createdAt: nowIso(),
      createdBy: req.adminId || ''
    });
    await saveData(data);
    await addAuditLog(data, {
      actorId: req.adminId,
      actorRole: req.adminRole,
      action: 'ip_blocked',
      target: ip,
      metadata: { reason: String(reason || '') }
    });
  }
  return res.json({ blockedIps: data.blockedIps });
});

app.post('/api/super-admin/security/unblock-ip', async (req, res) => {
  const { ip } = req.body || {};
  if (!ip) return res.status(400).json({ error: 'IP required' });
  const data = await loadData();
  data.blockedIps = data.blockedIps.filter((entry) => entry.ip !== ip);
  await saveData(data);
  await addAuditLog(data, {
    actorId: req.adminId,
    actorRole: req.adminRole,
    action: 'ip_unblocked',
    target: ip,
    metadata: {}
  });
  return res.json({ blockedIps: data.blockedIps });
});

app.post('/api/super-admin/security/block-device', async (req, res) => {
  const { userAgent, deviceId, reason } = req.body || {};
  if (!userAgent && !deviceId) return res.status(400).json({ error: 'Device required' });
  const data = await loadData();
  if (!data.blockedDevices.find((entry) => entry.userAgent === userAgent || entry.deviceId === deviceId)) {
    data.blockedDevices.unshift({
      id: nextId('BDEV', data.blockedDevices),
      userAgent: String(userAgent || ''),
      deviceId: String(deviceId || ''),
      reason: String(reason || ''),
      createdAt: nowIso(),
      createdBy: req.adminId || ''
    });
    await saveData(data);
    await addAuditLog(data, {
      actorId: req.adminId,
      actorRole: req.adminRole,
      action: 'device_blocked',
      target: userAgent || deviceId,
      metadata: { reason: String(reason || ''), deviceId: String(deviceId || '') }
    });
  }
  return res.json({ blockedDevices: data.blockedDevices });
});

app.post('/api/super-admin/security/unblock-device', async (req, res) => {
  const { userAgent, deviceId } = req.body || {};
  if (!userAgent && !deviceId) return res.status(400).json({ error: 'Device required' });
  const data = await loadData();
  data.blockedDevices = data.blockedDevices.filter(
    (entry) => entry.userAgent !== userAgent && entry.deviceId !== deviceId
  );
  await saveData(data);
  await addAuditLog(data, {
    actorId: req.adminId,
    actorRole: req.adminRole,
    action: 'device_unblocked',
    target: userAgent || deviceId,
    metadata: {}
  });
  return res.json({ blockedDevices: data.blockedDevices });
});


app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const data = await loadData();
  const security = getSecurity(data);
  if (security.lockdown) {
    return res.status(403).json({ error: 'System is in lockdown mode' });
  }
  const ip = getClientIp(req);
  const ua = getUserAgent(req);
  const blockedIp = data.blockedIps.find((entry) => entry.ip === ip);
  const blockedDevice = data.blockedDevices.find((entry) => entry.userAgent === ua);
  if (blockedIp || blockedDevice) {
    return res.status(403).json({ error: 'Access blocked' });
  }
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
  const now = nowIso();
  const session = {
    id: nextId('SESS', data.sessions),
    type: 'user',
    actorId: user.id,
    role: 'user',
    ip,
    userAgent: ua,
    country,
    deviceId,
    deviceName,
    ...parseDevice(ua),
    active: true,
    createdAt: now,
    lastSeenAt: now
  };
  data.sessions.unshift(session);
  data.loginAttempts.unshift({
    id: nextId('LOGN', data.loginAttempts),
    actorType: 'user',
    usernameOrEmail: String(email),
    ip,
    userAgent: ua,
    country,
    deviceId,
    deviceName,
    ...parseDevice(ua),
    status: 'success',
    createdAt: now
  });
  await saveData(data);

  const token = jwt.sign({ sub: user.id, type: 'user', sid: session.id }, JWT_SECRET, { expiresIn: '7d' });
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

app.post('/api/delivery/estimate', async (req, res) => {
  const payload = req.body || {};
  const fulfillmentMethod = payload.fulfillmentMethod === 'pickup' ? 'pickup' : 'delivery';
  try {
    const estimate = await calculateDeliveryEstimate({
      items: payload.items,
      fulfillmentMethod,
      deliveryAddress: payload.deliveryAddress,
      locationMeta: payload.locationMeta
    });
    return res.json({ estimate });
  } catch (err) {
    return res.status(400).json({ error: err?.message || 'Failed to estimate delivery fee' });
  }
});

app.post('/api/payments/manual', authMiddleware, async (req, res) => {
  const payload = req.body?.order || req.body || {};
  const data = await loadData();
  const user = data.users.find((entry) => entry.id === req.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const normalizedPhone = normalizeRwandaPhone(payload.customerPhone || user.phone || '');
  if (!isValidRwandaPhone(normalizedPhone)) {
    return res.status(400).json({ error: 'Invalid Rwanda phone number' });
  }
  const fulfillmentMethod = payload.fulfillmentMethod === 'pickup' ? 'pickup' : 'delivery';
  if (fulfillmentMethod === 'delivery' && !String(payload.deliveryAddress || '').trim()) {
    return res.status(400).json({ error: 'Delivery address is required' });
  }

  let items;
  try {
    items = buildOrderItems(payload.items, data.products);
  } catch (err) {
    return res.status(400).json({ error: 'Order items required' });
  }

  const deliveryZone = 'local';
  let estimate;
  try {
    estimate = await calculateDeliveryEstimate({
      items,
      fulfillmentMethod,
      deliveryAddress: payload.deliveryAddress,
      locationMeta: payload.locationMeta
    });
  } catch (err) {
    return res.status(400).json({ error: err?.message || 'Failed to estimate delivery fee' });
  }
  const deliveryFee = estimate.deliveryFee;
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
      customerPhone: normalizedPhone,
      customerEmail: payload.customerEmail || user.email,
      fulfillmentMethod,
      deliveryAddress: fulfillmentMethod === 'delivery' ? payload.deliveryAddress || '' : '',
      deliveryDistanceKm: estimate.distanceKm,
      deliveryChargeableKm: estimate.chargeableKm,
      locationMeta: payload.locationMeta || null,
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
  const security = getSecurity(data);
  if (security.lockdown) {
    return res.status(403).json({ error: 'System is in lockdown mode' });
  }
  const ip = getClientIp(req);
  const ua = getUserAgent(req);
  const blockedIp = data.blockedIps.find((entry) => entry.ip === ip);
  const blockedDevice = data.blockedDevices.find((entry) => entry.userAgent === ua);
  if (blockedIp || blockedDevice) {
    return res.status(403).json({ error: 'Access blocked' });
  }
  const user = data.users.find(
    (entry) => entry.email.toLowerCase() === String(email).toLowerCase()
  );
  if (!user) {
    data.loginAttempts.unshift({
      id: nextId('LOGN', data.loginAttempts),
      actorType: 'user',
      usernameOrEmail: String(email),
      ip,
      userAgent: ua,
      country,
      deviceId,
      deviceName,
      ...parseDevice(ua),
      status: 'failed',
      createdAt: nowIso()
    });
    await saveData(data);
    await maybeAlert(data, { ip, usernameOrEmail: String(email), actorType: 'user' });
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    data.loginAttempts.unshift({
      id: nextId('LOGN', data.loginAttempts),
      actorType: 'user',
      usernameOrEmail: String(email),
      ip,
      userAgent: ua,
      country,
      deviceId,
      deviceName,
      ...parseDevice(ua),
      status: 'failed',
      createdAt: nowIso()
    });
    await saveData(data);
    await maybeAlert(data, { ip, usernameOrEmail: String(email), actorType: 'user' });
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const now = nowIso();
  const session = {
    id: nextId('SESS', data.sessions),
    type: 'user',
    actorId: user.id,
    role: 'user',
    ip,
    userAgent: ua,
    country,
    deviceId,
    deviceName,
    ...parseDevice(ua),
    active: true,
    createdAt: now,
    lastSeenAt: now
  };
  data.sessions.unshift(session);
  data.loginAttempts.unshift({
    id: nextId('LOGN', data.loginAttempts),
    actorType: 'user',
    usernameOrEmail: String(email),
    ip,
    userAgent: ua,
    country,
    deviceId,
    deviceName,
    ...parseDevice(ua),
    status: 'success',
    createdAt: now
  });
  await saveData(data);

  const token = jwt.sign({ sub: user.id, type: 'user', sid: session.id }, JWT_SECRET, { expiresIn: '7d' });
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
  const security = getSecurity(data);
  if (security.lockdown) {
    return res.status(403).json({ error: 'System is in lockdown mode' });
  }
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
  const security = getSecurity(data);
  if (security.lockdown) {
    return res.status(403).json({ error: 'System is in lockdown mode' });
  }
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

  const fulfillmentMethod = payload.fulfillmentMethod === 'pickup' ? 'pickup' : 'delivery';
  if (fulfillmentMethod === 'delivery' && !String(payload.deliveryAddress || '').trim()) {
    return res.status(400).json({ error: 'Delivery address is required' });
  }
  let estimate;
  try {
    estimate = await calculateDeliveryEstimate({
      items: payload.items,
      fulfillmentMethod,
      deliveryAddress: payload.deliveryAddress,
      locationMeta: payload.locationMeta
    });
  } catch (err) {
    return res.status(400).json({ error: err?.message || 'Failed to estimate delivery fee' });
  }

  let order;
  try {
    order = createOrderRecord(data, user, {
      ...payload,
      fulfillmentMethod,
      deliveryFee: estimate.deliveryFee,
      deliveryDistanceKm: estimate.distanceKm,
      deliveryChargeableKm: estimate.chargeableKm
    });
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
  app.use(async (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    const allow = ['/setup-security', '/admin-dashboard'];
    const isAllowed =
      allow.includes(req.path) ||
      req.path.startsWith('/assets/') ||
      req.path.startsWith('/favicon') ||
      req.path.startsWith('/goodrich-logo.png') ||
      req.path.startsWith('/robots.txt') ||
      req.path.startsWith('/sitemap.xml');
    if (isAllowed) return next();
    const data = await loadData();
    const security = getSecurity(data);
    if (security.lockdown) {
      res.status(503).send('System is in lockdown mode.');
      return;
    }
    return next();
  });
  app.use(express.static(DIST_PATH));
}

app.get('/favicon.ico', (req, res) => res.redirect(301, '/favicon.png'));

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
  await ensureAdminSeed();
  app.listen(PORT, () => {
    console.log(`API server listening on http://localhost:${PORT}`);
  });
}

export { app };
export default app;



