import { MongoClient } from 'mongodb'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { v2 as cloudinary } from 'cloudinary'
import { randomUUID } from 'crypto'

let _client
let _db
let _seedPromise

export async function getDb() {
  if (!_db) {
    _client = new MongoClient(process.env.MONGO_URL)
    await _client.connect()
    _db = _client.db(process.env.DB_NAME)
  }
  // Run seed once on first DB access (lazy, idempotent)
  if (!_seedPromise) {
    _seedPromise = seedAdmin(_db).catch(e => { console.error('Admin seed failed:', e); _seedPromise = null })
  }
  return _db
}

async function seedAdmin(db) {
  const email = (process.env.ADMIN_EMAIL || 'admin@kalyanaya.com').toLowerCase()
  const password = process.env.ADMIN_PASSWORD || 'KalyanayaAdmin@2026'
  const name = process.env.ADMIN_NAME || 'Kalyanaya Admin'
  const existing = await db.collection('users').findOne({ email })
  if (existing) return
  const user = {
    id: randomUUID(),
    email,
    password: await bcrypt.hash(password, 10),
    name,
    role: 'admin',
    createdAt: new Date(),
  }
  await db.collection('users').insertOne(user)
  console.log(`[seed] Admin user created: ${email}`)
}

export function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' })
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET)
  } catch (e) {
    return null
  }
}

export function getAuthUser(request) {
  const auth = request.headers.get('authorization') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) return null
  return verifyToken(token)
}

export async function hashPassword(p) {
  return bcrypt.hash(p, 10)
}

export async function comparePassword(p, h) {
  return bcrypt.compare(p, h)
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export { cloudinary }

export async function uploadDataUri(dataUri, folder = 'kalyanaya') {
  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: 'image',
  })
  return { url: result.secure_url, publicId: result.public_id }
}

export async function destroyImage(publicId) {
  try {
    return await cloudinary.uploader.destroy(publicId, { invalidate: true })
  } catch (e) {
    return { result: 'error', error: e.message }
  }
}

export function slugify(s) {
  return String(s)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}
