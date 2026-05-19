import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import {
  getDb,
  signToken,
  getAuthUser,
  hashPassword,
  comparePassword,
  uploadDataUri,
  destroyImage,
  slugify,
} from '@/lib/server'

function cors(res) {
  res.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*')
  res.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH')
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return res
}

function ok(data, status = 200) {
  return cors(NextResponse.json(data, { status }))
}
function err(message, status = 400) {
  return cors(NextResponse.json({ error: message }, { status }))
}

export async function OPTIONS() {
  return cors(new NextResponse(null, { status: 200 }))
}

async function handler(request, { params }) {
  const path = (params?.path || []).join('/')
  const route = '/' + path
  const method = request.method
  const db = await getDb()

  try {
    // ===== AUTH =====
    if (route === '/auth/register' && method === 'POST') {
      // Public self-registration is disabled. Only seeded admins can sign in.
      return err('Registration is disabled. Please contact us to get started.', 403)
    }

    if (route === '/auth/login' && method === 'POST') {
      const { email, password } = await request.json()
      if (!email || !password) return err('Missing fields')
      const user = await db.collection('users').findOne({ email: String(email).toLowerCase() })
      if (!user) return err('Invalid credentials', 401)
      const matched = await comparePassword(password, user.password)
      if (!matched) return err('Invalid credentials', 401)
      const token = signToken({ id: user.id, email: user.email, role: user.role, name: user.name })
      return ok({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } })
    }

    if (route === '/auth/me' && method === 'GET') {
      const u = getAuthUser(request)
      if (!u) return err('Unauthorized', 401)
      return ok({ user: u })
    }

    // ===== WEDDINGS =====
    if (route === '/weddings' && method === 'GET') {
      const u = getAuthUser(request)
      if (!u) return err('Unauthorized', 401)
      const url = new URL(request.url)
      const q = url.searchParams.get('q') || ''
      const status = url.searchParams.get('status') || 'all'
      const filter = { userId: u.id, deletedAt: { $exists: false } }
      if (status !== 'all') filter.status = status
      if (q) {
        filter.$or = [
          { brideName: { $regex: q, $options: 'i' } },
          { groomName: { $regex: q, $options: 'i' } },
          { slug: { $regex: q, $options: 'i' } },
        ]
      }
      const items = await db.collection('weddings').find(filter).sort({ createdAt: -1 }).limit(200).toArray()
      const cleaned = items.map(({ _id, ...rest }) => rest)
      // attach rsvpCount
      for (const w of cleaned) {
        w.rsvpCount = await db.collection('rsvps').countDocuments({ weddingId: w.id })
      }
      return ok({ weddings: cleaned })
    }

    if (route === '/weddings' && method === 'POST') {
      const u = getAuthUser(request)
      if (!u) return err('Unauthorized', 401)
      const body = await request.json()
      if (!body.brideName || !body.groomName || !body.weddingDate) return err('Missing required fields')
      let slug = body.slug ? slugify(body.slug) : slugify(`${body.brideName}-${body.groomName}`)
      // ensure uniqueness
      let suffix = 0
      let candidate = slug
      while (await db.collection('weddings').findOne({ slug: candidate, deletedAt: { $exists: false } })) {
        suffix += 1
        candidate = `${slug}-${suffix}`
      }
      slug = candidate
      const wedding = {
        id: uuidv4(),
        userId: u.id,
        slug,
        brideName: body.brideName,
        groomName: body.groomName,
        tagline: body.tagline || '',
        weddingDate: body.weddingDate,
        story: body.story || '',
        heroImage: body.heroImage || null,
        gallery: body.gallery || [],
        template: body.template || 'Moonveil',
        status: body.status || 'draft',
        events: body.events || [],
        rsvpSettings: body.rsvpSettings || { enabled: true, mealOptions: ['Vegetarian', 'Non-Vegetarian'] },
        advancedSettings: body.advancedSettings || {},
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      await db.collection('weddings').insertOne(wedding)
      const { _id, ...rest } = wedding
      return ok({ wedding: rest })
    }

    // /weddings/:id
    const wm = route.match(/^\/weddings\/([^\/]+)$/)
    if (wm) {
      const id = wm[1]
      const u = getAuthUser(request)
      if (!u) return err('Unauthorized', 401)
      const w = await db.collection('weddings').findOne({ id, userId: u.id, deletedAt: { $exists: false } })
      if (!w) return err('Not found', 404)
      if (method === 'GET') {
        const { _id, ...rest } = w
        return ok({ wedding: rest })
      }
      if (method === 'PUT') {
        const body = await request.json()
        const update = { ...body, updatedAt: new Date() }
        delete update.id; delete update._id; delete update.userId; delete update.createdAt
        if (body.slug && body.slug !== w.slug) {
          let s = slugify(body.slug); let suffix = 0; let c = s
          while (await db.collection('weddings').findOne({ slug: c, id: { $ne: id }, deletedAt: { $exists: false } })) {
            suffix += 1; c = `${s}-${suffix}`
          }
          update.slug = c
        }
        await db.collection('weddings').updateOne({ id }, { $set: update })
        const updated = await db.collection('weddings').findOne({ id })
        const { _id, ...rest } = updated
        return ok({ wedding: rest })
      }
      if (method === 'DELETE') {
        await db.collection('weddings').updateOne({ id }, { $set: { deletedAt: new Date() } })
        return ok({ ok: true })
      }
    }

    // ===== PUBLIC WEDDING =====
    const ps = route.match(/^\/public\/wedding\/([^\/]+)$/)
    if (ps && method === 'GET') {
      const slug = ps[1]
      const w = await db.collection('weddings').findOne({ slug, status: 'published', deletedAt: { $exists: false } })
      if (!w) return err('Wedding not found or unpublished', 404)
      const { _id, userId, ...rest } = w
      return ok({ wedding: rest })
    }

    // ===== RSVP =====
    if (route === '/rsvp' && method === 'POST') {
      const body = await request.json()
      if (!body.weddingSlug || !body.name || !body.attending) return err('Missing fields')
      const w = await db.collection('weddings').findOne({ slug: body.weddingSlug, status: 'published', deletedAt: { $exists: false } })
      if (!w) return err('Wedding not found', 404)
      const rsvp = {
        id: uuidv4(),
        weddingId: w.id,
        weddingSlug: w.slug,
        name: body.name,
        email: body.email || '',
        phone: body.phone || '',
        attending: body.attending,
        guests: Number(body.guests) || 1,
        mealPreferences: body.mealPreferences || [],
        message: body.message || '',
        createdAt: new Date(),
      }
      await db.collection('rsvps').insertOne(rsvp)
      const { _id, ...rest } = rsvp
      return ok({ rsvp: rest })
    }

    if (route === '/rsvp' && method === 'GET') {
      const u = getAuthUser(request)
      if (!u) return err('Unauthorized', 401)
      const url = new URL(request.url)
      const weddingId = url.searchParams.get('weddingId')
      if (!weddingId) return err('Missing weddingId')
      const w = await db.collection('weddings').findOne({ id: weddingId, userId: u.id })
      if (!w) return err('Not found', 404)
      const rsvps = await db.collection('rsvps').find({ weddingId }).sort({ createdAt: -1 }).toArray()
      return ok({ rsvps: rsvps.map(({ _id, ...r }) => r) })
    }

    if (route === '/rsvp/export' && method === 'GET') {
      const u = getAuthUser(request)
      if (!u) return err('Unauthorized', 401)
      const url = new URL(request.url)
      const weddingId = url.searchParams.get('weddingId')
      if (!weddingId) return err('Missing weddingId')
      const w = await db.collection('weddings').findOne({ id: weddingId, userId: u.id })
      if (!w) return err('Not found', 404)
      const rsvps = await db.collection('rsvps').find({ weddingId }).sort({ createdAt: -1 }).toArray()
      const headers = ['Name', 'Email', 'Phone', 'Attending', 'Guests', 'Meals', 'Message', 'Submitted']
      const rows = rsvps.map(r => [
        r.name, r.email || '', r.phone || '', r.attending, r.guests,
        (r.mealPreferences || []).join('; '), (r.message || '').replace(/\n/g, ' '),
        new Date(r.createdAt).toISOString()
      ])
      const csv = [headers, ...rows].map(row =>
        row.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')
      ).join('\n')
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="rsvps-${w.slug}.csv"`,
          'Access-Control-Allow-Origin': '*',
        },
      })
    }

    // ===== UPLOAD =====
    if (route === '/upload' && method === 'POST') {
      const u = getAuthUser(request)
      if (!u) return err('Unauthorized', 401)
      const body = await request.json()
      if (!body.dataUri) return err('Missing dataUri')
      const folder = body.folder || `kalyanaya/${u.id}`
      const result = await uploadDataUri(body.dataUri, folder)
      return ok(result)
    }

    if (route === '/upload' && method === 'DELETE') {
      const u = getAuthUser(request)
      if (!u) return err('Unauthorized', 401)
      const body = await request.json()
      if (!body.publicId) return err('Missing publicId')
      const r = await destroyImage(body.publicId)
      return ok(r)
    }

    // ===== LEADS (Contact form) =====
    if (route === '/leads' && method === 'POST') {
      const body = await request.json()
      const name = (body.name || '').trim()
      const phone = (body.phone || '').trim()
      const email = (body.email || '').trim()
      if (!name || !phone) return err('Name and phone are required')
      if (name.length > 120 || phone.length > 40 || (email && email.length > 160)) return err('Field too long')
      const lead = {
        id: uuidv4(),
        name,
        phone,
        email,
        partnerName: (body.partnerName || '').trim().slice(0, 120),
        weddingDate: (body.weddingDate || '').slice(0, 32),
        city: (body.city || '').trim().slice(0, 80),
        budget: (body.budget || '').trim().slice(0, 40),
        templateInterest: (body.templateInterest || '').trim().slice(0, 80),
        message: (body.message || '').trim().slice(0, 2000),
        source: (body.source || 'landing').slice(0, 40),
        status: 'new',
        createdAt: new Date(),
      }
      await db.collection('leads').insertOne(lead)
      const { _id, ...rest } = lead
      return ok({ lead: rest }, 201)
    }

    if (route === '/leads' && method === 'GET') {
      const u = getAuthUser(request)
      if (!u) return err('Unauthorized', 401)
      const url = new URL(request.url)
      const status = url.searchParams.get('status') || 'all'
      const filter = {}
      if (status !== 'all') filter.status = status
      const items = await db.collection('leads').find(filter).sort({ createdAt: -1 }).limit(500).toArray()
      return ok({ leads: items.map(({ _id, ...r }) => r) })
    }

    const lm = route.match(/^\/leads\/([^\/]+)$/)
    if (lm) {
      const u = getAuthUser(request)
      if (!u) return err('Unauthorized', 401)
      const id = lm[1]
      if (method === 'PUT') {
        const body = await request.json()
        const update = {}
        if (body.status) update.status = body.status
        if (body.notes !== undefined) update.notes = String(body.notes).slice(0, 4000)
        update.updatedAt = new Date()
        await db.collection('leads').updateOne({ id }, { $set: update })
        const updated = await db.collection('leads').findOne({ id })
        if (!updated) return err('Not found', 404)
        const { _id, ...rest } = updated
        return ok({ lead: rest })
      }
      if (method === 'DELETE') {
        await db.collection('leads').deleteOne({ id })
        return ok({ ok: true })
      }
    }

    if (route === '/leads/export' && method === 'GET') {
      const u = getAuthUser(request)
      if (!u) return err('Unauthorized', 401)
      const items = await db.collection('leads').find({}).sort({ createdAt: -1 }).toArray()
      const headers = ['Name', 'Phone', 'Email', 'Partner', 'Wedding Date', 'City', 'Budget', 'Template Interest', 'Message', 'Status', 'Source', 'Submitted']
      const rows = items.map(r => [
        r.name, r.phone || '', r.email || '', r.partnerName || '', r.weddingDate || '',
        r.city || '', r.budget || '', r.templateInterest || '', (r.message || '').replace(/\n/g, ' '),
        r.status || 'new', r.source || '', new Date(r.createdAt).toISOString(),
      ])
      const csv = [headers, ...rows].map(row =>
        row.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')
      ).join('\n')
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="kalyanaya-leads.csv"`,
          'Access-Control-Allow-Origin': '*',
        },
      })
    }

    // ===== HEALTH =====
    if (route === '/' || route === '/root') {
      return ok({ message: 'Kalyanaya API', ok: true })
    }

    return err(`Route ${route} not found`, 404)
  } catch (e) {
    console.error('API error:', e)
    return err(e.message || 'Internal server error', 500)
  }
}

export const GET = handler
export const POST = handler
export const PUT = handler
export const DELETE = handler
export const PATCH = handler
