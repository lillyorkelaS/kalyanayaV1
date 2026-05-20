'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Search, LogOut, LayoutDashboard, Heart, Settings, Calendar, Users,
  Edit3, Trash2, ExternalLink, Eye, Copy, X, Image as ImageIcon, MapPin,
  Clock, ChevronRight, Download, Mail, Phone, MessageCircle, ChevronLeft,
  GripVertical, Save, Inbox,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'

function authFetch(url, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('kal_token') : null
  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
  })
}

function fileToDataUri(file) {
  return new Promise((res, rej) => {
    const r = new FileReader()
    r.onload = () => res(r.result)
    r.onerror = rej
    r.readAsDataURL(file)
  })
}

export default function AdminPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [view, setView] = useState('dashboard') // dashboard | weddings | new | edit | rsvps
  const [editingId, setEditingId] = useState(null)
  const [rsvpWedding, setRsvpWedding] = useState(null)
  const [weddings, setWeddings] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const token = localStorage.getItem('kal_token')
    const u = localStorage.getItem('kal_user')
    if (!token || !u) { router.replace('/admin/login'); return }
    setUser(JSON.parse(u))
    loadWeddings()
  }, [])

  const loadWeddings = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('q', search)
      if (statusFilter !== 'all') params.set('status', statusFilter)
      const res = await authFetch(`/api/weddings?${params.toString()}`)
      if (res.status === 401) { localStorage.clear(); router.replace('/admin/login'); return }
      const data = await res.json()
      setWeddings(data.weddings || [])
    } catch (e) {
      toast.error('Failed to load weddings')
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, router])

  useEffect(() => {
    if (user) loadWeddings()
  }, [user, search, statusFilter, loadWeddings])

  function logout() {
    localStorage.clear()
    router.replace('/admin/login')
  }

  async function deleteWedding(id) {
    if (!confirm('Delete this wedding? This cannot be undone.')) return
    const res = await authFetch(`/api/weddings/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Wedding deleted'); loadWeddings() }
    else toast.error('Failed to delete')
  }

  async function togglePublish(w) {
    const newStatus = w.status === 'published' ? 'draft' : 'published'
    const res = await authFetch(`/api/weddings/${w.id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: newStatus }),
    })
    if (res.ok) { toast.success(`Wedding ${newStatus}`); loadWeddings() }
    else toast.error('Failed to update')
  }

  const stats = {
    total: weddings.length,
    published: weddings.filter(w => w.status === 'published').length,
    draft: weddings.filter(w => w.status === 'draft').length,
    rsvps: weddings.reduce((sum, w) => sum + (w.rsvpCount || 0), 0),
  }

  if (!user) return <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">Loading…</div>

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex">
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#3A3226] text-[#FDFBF7] flex flex-col">
        <div className="p-6 border-b border-[#FDFBF7]/10">
          <Link href="/" className="font-serif text-2xl">Kalyanaya<span className="text-[#C9B896]">·</span></Link>
          <div className="text-xs text-[#C9B896] mt-1 tracking-wider uppercase">Admin Studio</div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <NavItem icon={LayoutDashboard} label="Dashboard" active={view === 'dashboard'} onClick={() => setView('dashboard')} />
          <NavItem icon={Heart} label="Weddings" active={view === 'weddings' || view === 'new' || view === 'edit'} onClick={() => setView('weddings')} />
          <NavItem icon={Inbox} label="Leads" active={view === 'leads'} onClick={() => setView('leads')} />
        </nav>
        <div className="p-4 border-t border-[#FDFBF7]/10">
          <div className="text-xs text-[#C9B896]/70 mb-3 tracking-wider">{user.email}</div>
          <button onClick={logout} className="w-full flex items-center gap-2 text-sm py-2 hover:text-[#C9B896]">
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 overflow-x-hidden">
        <div className="max-w-7xl mx-auto p-8 md:p-12">
          {view === 'dashboard' && (
            <DashboardView user={user} stats={stats} weddings={weddings} onNew={() => setView('new')} onViewAll={() => setView('weddings')} onEdit={(id) => { setEditingId(id); setView('edit') }} />
          )}
          {view === 'weddings' && (
            <WeddingsList
              weddings={weddings}
              loading={loading}
              search={search} setSearch={setSearch}
              statusFilter={statusFilter} setStatusFilter={setStatusFilter}
              onNew={() => setView('new')}
              onEdit={(id) => { setEditingId(id); setView('edit') }}
              onDelete={deleteWedding}
              onTogglePublish={togglePublish}
              onViewRsvps={(w) => { setRsvpWedding(w); setView('rsvps') }}
            />
          )}
          {(view === 'new' || view === 'edit') && (
            <WeddingForm
              id={view === 'edit' ? editingId : null}
              onCancel={() => setView('weddings')}
              onSaved={() => { setView('weddings'); loadWeddings() }}
            />
          )}
          {view === 'rsvps' && rsvpWedding && (
            <RsvpView wedding={rsvpWedding} onBack={() => setView('weddings')} />
          )}
          {view === 'leads' && (
            <LeadsView />
          )}
        </div>
      </main>
    </div>
  )
}

function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition ${active ? 'bg-[#FDFBF7]/10 text-[#C9B896]' : 'hover:bg-[#FDFBF7]/5 text-[#FDFBF7]/90'}`}>
      <Icon size={16} /> {label}
    </button>
  )
}

function DashboardView({ user, stats, weddings, onNew, onViewAll, onEdit }) {
  return (
    <div>
      <div className="mb-12">
        <div className="text-[#8B7355] tracking-[0.3em] text-xs uppercase mb-2">Welcome back</div>
        <h1 className="font-serif font-light text-5xl text-[#3A3226]">Hello, <em className="italic">{user.name}</em></h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <StatCard label="Total Weddings" value={stats.total} />
        <StatCard label="Published" value={stats.published} />
        <StatCard label="Drafts" value={stats.draft} />
        <StatCard label="Total RSVPs" value={stats.rsvps} />
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-3xl text-[#3A3226]">Recent weddings</h2>
        <Button onClick={onNew} className="bg-[#3A3226] hover:bg-[#1F1A14] text-[#FDFBF7] rounded-none tracking-widest text-xs uppercase">
          <Plus size={14} className="mr-2" /> New Wedding
        </Button>
      </div>

      {weddings.length === 0 ? (
        <div className="border border-dashed border-[#C9B896] p-16 text-center">
          <Heart className="w-10 h-10 text-[#8B7355] mx-auto mb-4" />
          <h3 className="font-serif text-2xl text-[#3A3226] mb-2">Your first creation awaits</h3>
          <p className="text-[#3A3226]/70 mb-6">Begin by creating a wedding website for your first couple.</p>
          <Button onClick={onNew} className="bg-[#3A3226] hover:bg-[#1F1A14] text-[#FDFBF7] rounded-none tracking-widest text-xs uppercase">
            <Plus size={14} className="mr-2" /> Create Wedding
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {weddings.slice(0, 6).map(w => (
            <MiniCard key={w.id} w={w} onEdit={() => onEdit(w.id)} />
          ))}
        </div>
      )}
      {weddings.length > 6 && (
        <button onClick={onViewAll} className="mt-8 text-[#8B7355] hover:underline inline-flex items-center gap-2">View all weddings <ChevronRight size={14} /></button>
      )}
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="border border-[#C9B896]/50 bg-white/40 p-6">
      <div className="text-[10px] tracking-[0.3em] uppercase text-[#8B7355] mb-2">{label}</div>
      <div className="font-serif text-4xl text-[#3A3226]">{value}</div>
    </div>
  )
}

function MiniCard({ w, onEdit }) {
  return (
    <div className="border border-[#C9B896]/50 bg-white/40 group cursor-pointer hover:border-[#8B7355] transition" onClick={onEdit}>
      <div className="aspect-[4/3] bg-[#F5EFE4] overflow-hidden relative">
        {w.heroImage?.url ? (
          <img src={w.heroImage.url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#C9B896]"><ImageIcon size={32} /></div>
        )}
        <Badge className={`absolute top-3 left-3 rounded-none text-[10px] tracking-widest uppercase ${w.status === 'published' ? 'bg-[#3A3226] text-[#FDFBF7]' : 'bg-[#C9B896] text-[#3A3226]'}`}>
          {w.status}
        </Badge>
      </div>
      <div className="p-5">
        <div className="font-serif text-xl text-[#3A3226]">{w.brideName} <span className="italic text-[#8B7355]">&amp;</span> {w.groomName}</div>
        <div className="text-xs text-[#8B7355] mt-1 tracking-wider">{new Date(w.weddingDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
        <div className="text-xs text-[#3A3226]/60 mt-2">{w.rsvpCount || 0} RSVPs</div>
      </div>
    </div>
  )
}

function WeddingsList({ weddings, loading, search, setSearch, statusFilter, setStatusFilter, onNew, onEdit, onDelete, onTogglePublish, onViewRsvps }) {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <div className="text-[#8B7355] tracking-[0.3em] text-xs uppercase mb-2">Manage</div>
          <h1 className="font-serif font-light text-5xl text-[#3A3226]">Your weddings</h1>
        </div>
        <Button onClick={onNew} className="bg-[#3A3226] hover:bg-[#1F1A14] text-[#FDFBF7] rounded-none tracking-widest text-xs uppercase">
          <Plus size={14} className="mr-2" /> New Wedding
        </Button>
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B7355]" size={16} />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or URL" className="pl-10 rounded-none border-[#C9B896] bg-white/40" />
        </div>
        <div className="flex gap-1 border border-[#C9B896] bg-white/40">
          {['all', 'published', 'draft'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-5 py-2 text-xs uppercase tracking-widest transition ${statusFilter === s ? 'bg-[#3A3226] text-[#FDFBF7]' : 'text-[#3A3226]'}`}>{s}</button>
          ))}
        </div>
      </div>

      {loading ? <div className="text-center py-16 text-[#8B7355]">Loading…</div> : weddings.length === 0 ? (
        <div className="border border-dashed border-[#C9B896] p-16 text-center">
          <p className="text-[#3A3226]/70 mb-4">No weddings found.</p>
          <Button onClick={onNew} className="bg-[#3A3226] text-[#FDFBF7] rounded-none">Create One</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {weddings.map(w => {
            const publicUrl = `${baseUrl}/wedding/${w.slug}`
            return (
              <div key={w.id} className="flex flex-col md:flex-row gap-4 items-start md:items-center border border-[#C9B896]/50 bg-white/40 p-4">
                <div className="w-20 h-20 flex-shrink-0 bg-[#F5EFE4] overflow-hidden">
                  {w.heroImage?.url ? <img src={w.heroImage.url} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-[#C9B896]"><ImageIcon size={20} /></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-serif text-xl text-[#3A3226]">{w.brideName} <span className="italic text-[#8B7355]">&amp;</span> {w.groomName}</h3>
                    <Badge className={`rounded-none text-[10px] uppercase tracking-widest ${w.status === 'published' ? 'bg-[#3A3226] text-[#FDFBF7]' : 'bg-[#C9B896] text-[#3A3226]'}`}>{w.status}</Badge>
                  </div>
                  <div className="text-xs text-[#8B7355] mt-1">{new Date(w.weddingDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })} · /{w.slug} · {w.rsvpCount || 0} RSVPs</div>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {w.status === 'published' && (
                    <a href={publicUrl} target="_blank" rel="noreferrer" className="p-2 text-[#8B7355] hover:bg-[#F5EFE4]" title="View"><ExternalLink size={16} /></a>
                  )}
                  <button onClick={() => { navigator.clipboard.writeText(publicUrl); toast.success('Link copied') }} className="p-2 text-[#8B7355] hover:bg-[#F5EFE4]" title="Copy link"><Copy size={16} /></button>
                  <button onClick={() => onViewRsvps(w)} className="p-2 text-[#8B7355] hover:bg-[#F5EFE4]" title="View RSVPs"><Users size={16} /></button>
                  <button onClick={() => onTogglePublish(w)} className="p-2 text-[#8B7355] hover:bg-[#F5EFE4]" title="Toggle publish"><Eye size={16} /></button>
                  <button onClick={() => onEdit(w.id)} className="p-2 text-[#8B7355] hover:bg-[#F5EFE4]" title="Edit"><Edit3 size={16} /></button>
                  <button onClick={() => onDelete(w.id)} className="p-2 text-red-700 hover:bg-red-50" title="Delete"><Trash2 size={16} /></button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function WeddingForm({ id, onCancel, onSaved }) {
  const [tab, setTab] = useState('basic')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(!!id)
  const [form, setForm] = useState({
    brideName: '', groomName: '', tagline: '', weddingDate: '', slug: '',
    template: 'Moonveil', status: 'draft',
    story: '',
    heroImage: null, gallery: [],
    events: [],
    rsvpSettings: { enabled: true, deadline: '', mealOptions: ['Vegetarian', 'Non-Vegetarian'], guestLimit: null },
    advancedSettings: { socialMedia: { instagram: '', facebook: '' }, musicEmbed: '', giftRegistryLink: '', customDomain: '' },
  })

  useEffect(() => {
    if (!id) return
    (async () => {
      setLoading(true)
      const res = await authFetch(`/api/weddings/${id}`)
      const data = await res.json()
      if (res.ok && data.wedding) {
        const w = data.wedding
        // Parse stored datetime back into date + time fields
        let dateOnly = ''
        let timeOnly = ''
        if (w.weddingDate) {
          const dt = new Date(w.weddingDate)
          if (!isNaN(dt.getTime())) {
            // Convert to IST so admin sees same time they entered
            const istParts = new Intl.DateTimeFormat('en-CA', {
              timeZone: 'Asia/Kolkata',
              year: 'numeric', month: '2-digit', day: '2-digit',
              hour: '2-digit', minute: '2-digit', hour12: false,
            }).formatToParts(dt)
            const get = (t) => istParts.find(p => p.type === t)?.value
            dateOnly = `${get('year')}-${get('month')}-${get('day')}`
            const h = get('hour') === '24' ? '00' : get('hour')
            timeOnly = `${h}:${get('minute')}`
          }
        }
        setForm({
          ...form,
          ...w,
          weddingDate: dateOnly,
          weddingTime: timeOnly,
          rsvpSettings: {
            enabled: w.rsvpSettings?.enabled !== false,
            deadline: w.rsvpSettings?.deadline ? new Date(w.rsvpSettings.deadline).toISOString().slice(0, 10) : '',
            mealOptions: w.rsvpSettings?.mealOptions || ['Vegetarian', 'Non-Vegetarian'],
            guestLimit: w.rsvpSettings?.guestLimit || null,
          },
          advancedSettings: {
            socialMedia: w.advancedSettings?.socialMedia || { instagram: '', facebook: '' },
            musicEmbed: w.advancedSettings?.musicEmbed || '',
            giftRegistryLink: w.advancedSettings?.giftRegistryLink || '',
            customDomain: w.advancedSettings?.customDomain || '',
          },
        })
      }
      setLoading(false)
    })()
  }, [id])

  function set(k, v) { setForm(p => ({ ...p, [k]: v })) }

  async function uploadImage(file) {
    if (file.size > 8 * 1024 * 1024) { toast.error('Image must be under 8MB'); return null }
    const dataUri = await fileToDataUri(file)
    const res = await authFetch('/api/upload', { method: 'POST', body: JSON.stringify({ dataUri }) })
    const data = await res.json()
    if (!res.ok) { toast.error(data.error || 'Upload failed'); return null }
    return data
  }

  async function onHeroChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    toast.loading('Uploading…', { id: 'up' })
    const r = await uploadImage(file)
    toast.dismiss('up')
    if (r) { set('heroImage', { url: r.url, publicId: r.publicId }); toast.success('Hero uploaded') }
  }

  async function onGalleryChange(e) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    toast.loading(`Uploading ${files.length} image(s)…`, { id: 'gup' })
    const uploaded = []
    for (const f of files) {
      const r = await uploadImage(f)
      if (r) uploaded.push({ url: r.url, publicId: r.publicId })
    }
    toast.dismiss('gup')
    if (uploaded.length) {
      set('gallery', [...(form.gallery || []), ...uploaded])
      toast.success(`${uploaded.length} added`)
    }
    e.target.value = ''
  }

  function removeGalleryItem(idx) {
    set('gallery', form.gallery.filter((_, i) => i !== idx))
  }

  function addEvent() {
    set('events', [...(form.events || []), { name: '', date: form.weddingDate || '', startTime: '', endTime: '', venue: '', address: '', mapsLink: '', description: '' }])
  }
  function updateEvent(i, k, v) {
    const evs = [...form.events]
    evs[i] = { ...evs[i], [k]: v }
    set('events', evs)
  }
  function removeEvent(i) {
    set('events', form.events.filter((_, idx) => idx !== i))
  }

  async function save(status) {
    if (!form.brideName || !form.groomName || !form.weddingDate) {
      toast.error('Please fill bride name, groom name and date')
      setTab('basic'); return
    }
    setSaving(true)
    try {
      // Combine date + (optional) time into an ISO datetime with IST (+05:30)
      // so it displays consistently regardless of where server / viewer is.
      const time = (form.weddingTime || '').trim() || '12:00'
      const isoIST = `${form.weddingDate}T${time}:00+05:30`
      const combinedDate = new Date(isoIST)
      const payload = {
        ...form,
        status: status || form.status,
        weddingDate: isNaN(combinedDate.getTime()) ? form.weddingDate : combinedDate.toISOString(),
      }
      if (payload.rsvpSettings && !payload.rsvpSettings.deadline) delete payload.rsvpSettings.deadline
      const url = id ? `/api/weddings/${id}` : '/api/weddings'
      const method = id ? 'PUT' : 'POST'
      const res = await authFetch(url, { method, body: JSON.stringify(payload) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Save failed')
      toast.success(id ? 'Wedding updated' : 'Wedding created')
      onSaved()
    } catch (e) { toast.error(e.message) } finally { setSaving(false) }
  }

  if (loading) return <div className="text-center py-16 text-[#8B7355]">Loading…</div>

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'story', label: 'Story & Photos' },
    { id: 'events', label: 'Events' },
    { id: 'rsvp', label: 'RSVP' },
    { id: 'advanced', label: 'Advanced' },
  ]

  return (
    <div>
      <button onClick={onCancel} className="flex items-center gap-2 text-[#8B7355] hover:text-[#3A3226] mb-6 text-sm">
        <ChevronLeft size={16} /> Back to weddings
      </button>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <div className="text-[#8B7355] tracking-[0.3em] text-xs uppercase mb-2">{id ? 'Edit' : 'Create'}</div>
          <h1 className="font-serif font-light text-5xl text-[#3A3226]">
            {form.brideName && form.groomName ? <>{form.brideName} <em className="italic text-[#8B7355]">&amp;</em> {form.groomName}</> : 'New wedding'}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => save('draft')} disabled={saving} variant="outline" className="rounded-none border-[#3A3226] text-[#3A3226] bg-transparent tracking-widest text-xs uppercase">
            <Save size={14} className="mr-2" /> Save Draft
          </Button>
          <Button onClick={() => save('published')} disabled={saving} className="bg-[#3A3226] hover:bg-[#1F1A14] text-[#FDFBF7] rounded-none tracking-widest text-xs uppercase">
            {saving ? 'Saving…' : 'Publish'}
          </Button>
        </div>
      </div>

      {/* TABS */}
      <div className="border-b border-[#C9B896]/50 mb-8 flex flex-wrap">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-5 py-3 text-sm tracking-widest uppercase transition border-b-2 ${tab === t.id ? 'border-[#3A3226] text-[#3A3226]' : 'border-transparent text-[#8B7355] hover:text-[#3A3226]'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* PANELS */}
      <div className="max-w-3xl space-y-6">
        {tab === 'basic' && (
          <div className="space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Bride's full name *">
                <Input value={form.brideName} onChange={(e) => set('brideName', e.target.value)} className="rounded-none border-[#C9B896] bg-white/40" />
              </Field>
              <Field label="Groom's full name *">
                <Input value={form.groomName} onChange={(e) => set('groomName', e.target.value)} className="rounded-none border-[#C9B896] bg-white/40" />
              </Field>
            </div>
            <Field label="Tagline">
              <Input value={form.tagline} onChange={(e) => set('tagline', e.target.value)} placeholder="A love written in the stars" maxLength={200} className="rounded-none border-[#C9B896] bg-white/40" />
            </Field>
            <div className="grid md:grid-cols-3 gap-4">
              <Field label="Wedding date *">
                <Input type="date" value={form.weddingDate} onChange={(e) => set('weddingDate', e.target.value)} data-testid="wedding-date-input" className="rounded-none border-[#C9B896] bg-white/40" />
              </Field>
              <Field label="Muhurtham time" hint="Exact start time — countdown ticks to this moment">
                <Input type="time" value={form.weddingTime} onChange={(e) => set('weddingTime', e.target.value)} data-testid="wedding-time-input" className="rounded-none border-[#C9B896] bg-white/40" />
              </Field>
              <Field label="Custom URL slug" hint={`/wedding/${form.slug || 'your-url'}`}>
                <Input value={form.slug} onChange={(e) => set('slug', e.target.value)} placeholder="aanya-and-vikram" className="rounded-none border-[#C9B896] bg-white/40" />
              </Field>
            </div>
            <Field label="Template">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {[
                  { name: 'Moonveil', tag: 'Minimal · Timeless' },
                  { name: 'Royal Heritage', tag: 'Royal · Ornate' },
                  { name: 'Eternal Edit', tag: 'Cinematic · Bold' },
                  { name: 'Crimson Lotus', tag: 'Floral · Romantic' },
                  { name: 'Sapphire Saga', tag: 'Celestial · Mughal' },
                  { name: 'Sanctum Veil', tag: 'Christian · Sacred' },
                  { name: 'Marigold Bloom', tag: 'Festive · Vibrant' },
                  { name: 'Pearl & Velvet', tag: 'Art Deco · Gatsby' },
                  { name: 'Banyan & Brass', tag: 'South Indian · Temple' },
                  { name: 'Pichwai Bloom', tag: 'Pichwai · Royal Floral' },
                  { name: 'Albion Vow', tag: 'English · Classic · Garden' },
                ].map(t => (
                  <button key={t.name} onClick={() => set('template', t.name)}
                    className={`p-4 border text-left transition ${form.template === t.name ? 'border-[#3A3226] bg-[#3A3226] text-[#FDFBF7]' : 'border-[#C9B896] bg-white/40 text-[#3A3226] hover:border-[#3A3226]'}`}>
                    <div className="font-serif text-lg">{t.name}</div>
                    <div className="text-[10px] tracking-widest uppercase mt-1 opacity-70">{t.tag}</div>
                  </button>
                ))}
              </div>
            </Field>
          </div>
        )}

        {tab === 'story' && (
          <div className="space-y-6">
            <Field label="Our love story" hint="Share how you met, your journey, your favorite memories.">
              <Textarea value={form.story} onChange={(e) => set('story', e.target.value)} rows={8} maxLength={5000} className="rounded-none border-[#C9B896] bg-white/40" />
              <div className="text-xs text-[#8B7355] mt-1">{form.story?.length || 0} / 5000</div>
            </Field>

            <Field label="Hero image" hint="The first image guests see. Choose your most striking photo.">
              {form.heroImage?.url ? (
                <div className="relative inline-block">
                  <img src={form.heroImage.url} className="w-full max-w-md aspect-[16/10] object-cover border border-[#C9B896]" alt="" />
                  <button onClick={() => set('heroImage', null)} className="absolute top-2 right-2 bg-white/90 p-1.5"><X size={14} /></button>
                </div>
              ) : (
                <label className="block border-2 border-dashed border-[#C9B896] p-12 text-center cursor-pointer hover:border-[#8B7355] transition">
                  <ImageIcon className="w-8 h-8 text-[#8B7355] mx-auto mb-3" />
                  <div className="text-sm text-[#3A3226]">Click to upload hero image</div>
                  <div className="text-xs text-[#8B7355] mt-1">JPG, PNG, WEBP up to 8MB</div>
                  <input type="file" accept="image/*" onChange={onHeroChange} className="hidden" />
                </label>
              )}
            </Field>

            <Field label="Gallery" hint="Add multiple images to showcase your moments.">
              <label className="block border-2 border-dashed border-[#C9B896] p-6 text-center cursor-pointer hover:border-[#8B7355] transition mb-4">
                <Plus className="w-5 h-5 text-[#8B7355] mx-auto mb-2" />
                <div className="text-sm text-[#3A3226]">Add gallery images</div>
                <input type="file" accept="image/*" multiple onChange={onGalleryChange} className="hidden" />
              </label>
              {form.gallery?.length > 0 && (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                  {form.gallery.map((g, i) => (
                    <div key={g.publicId || i} className="relative aspect-square group">
                      <img src={g.url} className="w-full h-full object-cover" alt="" />
                      <button onClick={() => removeGalleryItem(i)} className="absolute top-1 right-1 bg-white/90 p-1 opacity-0 group-hover:opacity-100 transition">
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Field>
          </div>
        )}

        {tab === 'events' && (
          <div className="space-y-4">
            {form.events?.map((ev, i) => (
              <div key={i} className="border border-[#C9B896] p-5 bg-white/40 relative">
                <button onClick={() => removeEvent(i)} className="absolute top-3 right-3 text-red-700 hover:bg-red-50 p-1"><Trash2 size={14} /></button>
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Event name">
                    <Input value={ev.name} onChange={(e) => updateEvent(i, 'name', e.target.value)} placeholder="Mehendi, Sangeet, Ceremony…" className="rounded-none border-[#C9B896] bg-white/40" />
                  </Field>
                  <Field label="Date">
                    <Input type="date" value={ev.date ? String(ev.date).slice(0, 10) : ''} onChange={(e) => updateEvent(i, 'date', e.target.value)} className="rounded-none border-[#C9B896] bg-white/40" />
                  </Field>
                  <Field label="Start time">
                    <Input value={ev.startTime} onChange={(e) => updateEvent(i, 'startTime', e.target.value)} placeholder="6:00 PM" className="rounded-none border-[#C9B896] bg-white/40" />
                  </Field>
                  <Field label="End time">
                    <Input value={ev.endTime} onChange={(e) => updateEvent(i, 'endTime', e.target.value)} placeholder="11:00 PM" className="rounded-none border-[#C9B896] bg-white/40" />
                  </Field>
                  <Field label="Venue name" className="md:col-span-2">
                    <Input value={ev.venue} onChange={(e) => updateEvent(i, 'venue', e.target.value)} className="rounded-none border-[#C9B896] bg-white/40" />
                  </Field>
                  <Field label="Full address" className="md:col-span-2">
                    <Textarea value={ev.address} onChange={(e) => updateEvent(i, 'address', e.target.value)} rows={2} className="rounded-none border-[#C9B896] bg-white/40" />
                  </Field>
                  <Field label="Google Maps link" className="md:col-span-2">
                    <Input value={ev.mapsLink} onChange={(e) => updateEvent(i, 'mapsLink', e.target.value)} placeholder="https://maps.google.com/…" className="rounded-none border-[#C9B896] bg-white/40" />
                  </Field>
                  <Field label="Description" className="md:col-span-2">
                    <Textarea value={ev.description} onChange={(e) => updateEvent(i, 'description', e.target.value)} rows={2} maxLength={500} className="rounded-none border-[#C9B896] bg-white/40" />
                  </Field>
                </div>
              </div>
            ))}
            <button onClick={addEvent} className="w-full border-2 border-dashed border-[#C9B896] py-6 text-[#8B7355] hover:border-[#3A3226] hover:text-[#3A3226] flex items-center justify-center gap-2 transition">
              <Plus size={16} /> Add event
            </button>
          </div>
        )}

        {tab === 'rsvp' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between p-4 border border-[#C9B896] bg-white/40">
              <div>
                <div className="font-serif text-lg text-[#3A3226]">Enable RSVP</div>
                <div className="text-xs text-[#8B7355]">Let guests respond to your invitation</div>
              </div>
              <Switch checked={form.rsvpSettings.enabled} onCheckedChange={(v) => set('rsvpSettings', { ...form.rsvpSettings, enabled: v })} />
            </div>
            {form.rsvpSettings.enabled && (
              <>
                <Field label="RSVP deadline">
                  <Input type="date" value={form.rsvpSettings.deadline} onChange={(e) => set('rsvpSettings', { ...form.rsvpSettings, deadline: e.target.value })} className="rounded-none border-[#C9B896] bg-white/40" />
                </Field>
                <Field label="Meal options" hint="Comma separated">
                  <Input value={(form.rsvpSettings.mealOptions || []).join(', ')} onChange={(e) => set('rsvpSettings', { ...form.rsvpSettings, mealOptions: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} className="rounded-none border-[#C9B896] bg-white/40" />
                </Field>
              </>
            )}
          </div>
        )}

        {tab === 'advanced' && (
          <div className="space-y-5">
            <Field label="Instagram URL">
              <Input value={form.advancedSettings.socialMedia.instagram} onChange={(e) => set('advancedSettings', { ...form.advancedSettings, socialMedia: { ...form.advancedSettings.socialMedia, instagram: e.target.value } })} className="rounded-none border-[#C9B896] bg-white/40" />
            </Field>
            <Field label="Gift registry link">
              <Input value={form.advancedSettings.giftRegistryLink} onChange={(e) => set('advancedSettings', { ...form.advancedSettings, giftRegistryLink: e.target.value })} className="rounded-none border-[#C9B896] bg-white/40" />
            </Field>
            <Field label="Music/Video embed URL" hint="Spotify or YouTube link">
              <Input value={form.advancedSettings.musicEmbed} onChange={(e) => set('advancedSettings', { ...form.advancedSettings, musicEmbed: e.target.value })} className="rounded-none border-[#C9B896] bg-white/40" />
            </Field>
          </div>
        )}
      </div>
    </div>
  )
}

function Field({ label, hint, children, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="text-xs tracking-widest uppercase text-[#8B7355]">{label}</Label>
      {children}
      {hint && <div className="text-xs text-[#3A3226]/60">{hint}</div>}
    </div>
  )
}

function RsvpView({ wedding, onBack }) {
  const [rsvps, setRsvps] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    (async () => {
      const res = await authFetch(`/api/rsvp?weddingId=${wedding.id}`)
      const data = await res.json()
      setRsvps(data.rsvps || [])
      setLoading(false)
    })()
  }, [wedding.id])

  function exportCsv() {
    const token = localStorage.getItem('kal_token')
    fetch(`/api/rsvp/export?weddingId=${wedding.id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.blob())
      .then(b => {
        const url = URL.createObjectURL(b)
        const a = document.createElement('a')
        a.href = url; a.download = `rsvps-${wedding.slug}.csv`; a.click()
        URL.revokeObjectURL(url)
      })
  }

  const filtered = filter === 'all' ? rsvps : rsvps.filter(r => r.attending === filter)
  const stats = {
    total: rsvps.length,
    yes: rsvps.filter(r => r.attending === 'yes').length,
    no: rsvps.filter(r => r.attending === 'no').length,
    maybe: rsvps.filter(r => r.attending === 'maybe').length,
    guests: rsvps.filter(r => r.attending === 'yes').reduce((s, r) => s + (r.guests || 1), 0),
  }

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-[#8B7355] hover:text-[#3A3226] mb-6 text-sm">
        <ChevronLeft size={16} /> Back to weddings
      </button>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <div className="text-[#8B7355] tracking-[0.3em] text-xs uppercase mb-2">RSVPs for</div>
          <h1 className="font-serif font-light text-5xl text-[#3A3226]">{wedding.brideName} <em className="italic text-[#8B7355]">&amp;</em> {wedding.groomName}</h1>
        </div>
        <Button onClick={exportCsv} variant="outline" className="rounded-none border-[#3A3226] text-[#3A3226] bg-transparent tracking-widest text-xs uppercase">
          <Download size={14} className="mr-2" /> Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <StatCard label="Total" value={stats.total} />
        <StatCard label="Attending" value={stats.yes} />
        <StatCard label="Maybe" value={stats.maybe} />
        <StatCard label="Declined" value={stats.no} />
        <StatCard label="Total Guests" value={stats.guests} />
      </div>

      <div className="flex gap-1 mb-6">
        {['all', 'yes', 'maybe', 'no'].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-5 py-2 text-xs uppercase tracking-widest border ${filter === s ? 'bg-[#3A3226] text-[#FDFBF7] border-[#3A3226]' : 'bg-white/40 text-[#3A3226] border-[#C9B896]'}`}>{s}</button>
        ))}
      </div>

      {loading ? <div className="text-center py-16 text-[#8B7355]">Loading…</div> : filtered.length === 0 ? (
        <div className="border border-dashed border-[#C9B896] p-16 text-center text-[#3A3226]/70">No responses yet.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => (
            <div key={r.id} className="border border-[#C9B896]/50 bg-white/40 p-5">
              <div className="flex items-start justify-between flex-wrap gap-3 mb-3">
                <div>
                  <h3 className="font-serif text-xl text-[#3A3226]">{r.name}</h3>
                  <div className="flex items-center gap-4 text-xs text-[#8B7355] mt-1 flex-wrap">
                    {r.email && <span className="flex items-center gap-1"><Mail size={12} /> {r.email}</span>}
                    {r.phone && <span className="flex items-center gap-1"><Phone size={12} /> {r.phone}</span>}
                    <span>{new Date(r.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                <Badge className={`rounded-none tracking-widest uppercase text-[10px] ${r.attending === 'yes' ? 'bg-emerald-700' : r.attending === 'no' ? 'bg-red-700' : 'bg-amber-700'} text-white`}>
                  {r.attending === 'yes' ? `Attending · ${r.guests}` : r.attending}
                </Badge>
              </div>
              {(r.mealPreferences?.length > 0) && (
                <div className="text-sm text-[#3A3226]/70 mb-2">Meal: {r.mealPreferences.join(', ')}</div>
              )}
              {r.message && (
                <div className="flex gap-2 text-sm text-[#3A3226]/85 mt-3 pt-3 border-t border-[#C9B896]/30 italic">
                  <MessageCircle size={14} className="text-[#8B7355] flex-shrink-0 mt-1" />
                  "{r.message}"
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


function LeadsView() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  async function load() {
    setLoading(true)
    try {
      const res = await authFetch(`/api/leads?status=${filter}`)
      const data = await res.json()
      setLeads(data.leads || [])
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [filter])

  async function updateStatus(id, status) {
    const res = await authFetch(`/api/leads/${id}`, { method: 'PUT', body: JSON.stringify({ status }) })
    if (res.ok) { toast.success('Lead updated'); load() } else toast.error('Failed to update')
  }

  async function remove(id) {
    if (!confirm('Delete this lead?')) return
    const res = await authFetch(`/api/leads/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Deleted'); load() } else toast.error('Failed')
  }

  function exportCsv() {
    const token = localStorage.getItem('kal_token')
    fetch(`/api/leads/export`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.blob())
      .then(b => {
        const url = URL.createObjectURL(b)
        const a = document.createElement('a')
        a.href = url; a.download = `kalyanaya-leads.csv`; a.click()
        URL.revokeObjectURL(url)
      })
  }

  const stats = {
    total: leads.length,
    newCount: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    converted: leads.filter(l => l.status === 'converted').length,
  }

  return (
    <div data-testid="leads-view">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <div className="text-[#8B7355] tracking-[0.3em] text-xs uppercase mb-2">Inbox</div>
          <h1 className="font-serif font-light text-5xl text-[#3A3226]">Couples reaching out</h1>
        </div>
        <Button onClick={exportCsv} variant="outline" className="rounded-none border-[#3A3226] text-[#3A3226] bg-transparent tracking-widest text-xs uppercase">
          <Download size={14} className="mr-2" /> Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total" value={stats.total} />
        <StatCard label="New" value={stats.newCount} />
        <StatCard label="Contacted" value={stats.contacted} />
        <StatCard label="Converted" value={stats.converted} />
      </div>

      <div className="flex gap-1 mb-6 flex-wrap">
        {['all', 'new', 'contacted', 'converted', 'closed'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            data-testid={`leads-filter-${s}`}
            className={`px-5 py-2 text-xs uppercase tracking-widest border ${filter === s ? 'bg-[#3A3226] text-[#FDFBF7] border-[#3A3226]' : 'bg-white/40 text-[#3A3226] border-[#C9B896]'}`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-[#8B7355]">Loading…</div>
      ) : leads.length === 0 ? (
        <div className="border border-dashed border-[#C9B896] p-16 text-center text-[#3A3226]/70">No leads yet.</div>
      ) : (
        <div className="space-y-3">
          {leads.map(l => (
            <div key={l.id} className="border border-[#C9B896]/50 bg-white/40 p-5" data-testid={`lead-row-${l.id}`}>
              <div className="flex items-start justify-between flex-wrap gap-3 mb-3">
                <div>
                  <h3 className="font-serif text-xl text-[#3A3226]">
                    {l.name}{l.partnerName ? <span className="text-[#8B7355]"> &amp; {l.partnerName}</span> : null}
                  </h3>
                  <div className="flex items-center gap-4 text-xs text-[#8B7355] mt-1 flex-wrap">
                    {l.phone && (
                      <a href={`https://wa.me/${l.phone.replace(/[^\d]/g, '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-[#25D366]">
                        <MessageCircle size={12} /> {l.phone}
                      </a>
                    )}
                    {l.email && <a href={`mailto:${l.email}`} className="flex items-center gap-1 hover:text-[#3A3226]"><Mail size={12} /> {l.email}</a>}
                    {l.city && <span>{l.city}</span>}
                    {l.weddingDate && <span>· {l.weddingDate}</span>}
                    <span>· {new Date(l.createdAt).toLocaleString()}</span>
                  </div>
                  {l.budget && <div className="text-xs text-[#3A3226] mt-1">Plan interest: <span className="font-medium">{l.budget}</span></div>}
                  {l.templateInterest && <div className="text-xs text-[#3A3226]">Template: <span className="font-medium">{l.templateInterest}</span></div>}
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={l.status}
                    onChange={(e) => updateStatus(l.id, e.target.value)}
                    data-testid={`lead-status-${l.id}`}
                    className="text-xs border border-[#C9B896] bg-white/60 px-2 py-1 rounded-none"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="converted">Converted</option>
                    <option value="closed">Closed</option>
                  </select>
                  <button onClick={() => remove(l.id)} className="p-2 text-red-700 hover:bg-red-50"><Trash2 size={14} /></button>
                </div>
              </div>
              {l.message && (
                <div className="text-sm text-[#3A3226]/85 mt-3 pt-3 border-t border-[#C9B896]/30 italic">
                  "{l.message}"
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
