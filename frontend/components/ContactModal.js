'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Phone, Mail, MessageCircle, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

// Update these in one place. Used by every CTA.
export const WHATSAPP_NUMBER = '919876543210' // +91 98765 43210 — REPLACE with real number
export const WHATSAPP_GREETING =
  "Hi Kalyanaya! I'd love to create a wedding website with you. Can we talk?"

export function whatsappUrl(msg = WHATSAPP_GREETING) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`
}

export default function ContactModal({ open, onClose, source = 'landing', templateInterest = '' }) {
  const [form, setForm] = useState({
    name: '', phone: '', email: '', partnerName: '',
    weddingDate: '', city: '', budget: '', message: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  function set(k, v) { setForm(p => ({ ...p, [k]: v })) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error('Please enter your name and phone'); return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, source, templateInterest }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not submit')
      setDone(true)
      toast.success('Thank you! We will reach out on WhatsApp within a few hours.')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  function close() {
    onClose?.()
    setTimeout(() => {
      setDone(false)
      setForm({ name: '', phone: '', email: '', partnerName: '', weddingDate: '', city: '', budget: '', message: '' })
    }, 300)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1F1A14]/70 backdrop-blur-sm p-4"
          onClick={close}
          data-testid="contact-modal"
        >
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl bg-[#FDFBF7] grid md:grid-cols-[1.1fr_1fr] max-h-[92vh] overflow-hidden shadow-2xl"
          >
            <button
              onClick={close}
              className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center hover:bg-[#3A3226]/10 text-[#3A3226]"
              aria-label="Close"
              data-testid="contact-modal-close"
            >
              <X size={20} />
            </button>

            {/* LEFT — copy + WhatsApp */}
            <div className="bg-[#3A3226] text-[#FDFBF7] p-10 md:p-12 flex flex-col">
              <div className="text-[#C9B896] tracking-[0.3em] text-[10px] uppercase mb-5">Begin Your Kalyanaya</div>
              <h2 className="font-serif font-light text-4xl md:text-5xl leading-tight mb-6">
                Tell us about <em className="italic text-[#C9B896]">your day</em>.
              </h2>
              <p className="text-[#FDFBF7]/75 leading-relaxed mb-8 text-sm">
                Kalyanaya is invite-only. Share a few details and our studio will reach you on WhatsApp within a few hours with a personal walk-through of templates and pricing.
              </p>

              <a
                href={whatsappUrl()}
                target="_blank"
                rel="noreferrer"
                data-testid="contact-modal-whatsapp"
                className="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#1ebe57] text-white rounded-none py-4 px-5 tracking-widest text-xs uppercase mb-4 transition"
              >
                <MessageCircle size={16} /> Chat on WhatsApp instead
              </a>

              <div className="mt-auto pt-8 space-y-2 text-sm text-[#FDFBF7]/70">
                <div className="flex items-center gap-3"><Phone size={14} className="text-[#C9B896]" /> +91 98765 43210</div>
                <div className="flex items-center gap-3"><Mail size={14} className="text-[#C9B896]" /> hello@kalyanaya.com</div>
              </div>
            </div>

            {/* RIGHT — form */}
            <div className="p-8 md:p-10 overflow-y-auto">
              {done ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12" data-testid="contact-success">
                  <div className="w-16 h-16 rounded-full bg-[#C9B896]/30 flex items-center justify-center mb-6">
                    <Check size={28} className="text-[#3A3226]" />
                  </div>
                  <h3 className="font-serif text-3xl text-[#3A3226] mb-3">We have you</h3>
                  <p className="text-[#3A3226]/70 max-w-sm mb-8">
                    Our studio will reach out on WhatsApp shortly. Meanwhile, you can also message us directly.
                  </p>
                  <a
                    href={whatsappUrl()}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe57] text-white px-6 py-3 tracking-widest text-xs uppercase transition"
                  >
                    <MessageCircle size={14} /> Open WhatsApp
                  </a>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4" data-testid="contact-form">
                  <div className="grid grid-cols-2 gap-3">
                    <FieldM label="Your name *">
                      <Input data-testid="contact-name" value={form.name} onChange={(e) => set('name', e.target.value)} required className="rounded-none border-[#C9B896] bg-transparent" />
                    </FieldM>
                    <FieldM label="Partner's name">
                      <Input data-testid="contact-partner" value={form.partnerName} onChange={(e) => set('partnerName', e.target.value)} className="rounded-none border-[#C9B896] bg-transparent" />
                    </FieldM>
                  </div>
                  <FieldM label="WhatsApp number *">
                    <Input type="tel" data-testid="contact-phone" value={form.phone} onChange={(e) => set('phone', e.target.value)} required placeholder="+91 98765 43210" className="rounded-none border-[#C9B896] bg-transparent" />
                  </FieldM>
                  <FieldM label="Email">
                    <Input type="email" data-testid="contact-email" value={form.email} onChange={(e) => set('email', e.target.value)} className="rounded-none border-[#C9B896] bg-transparent" />
                  </FieldM>
                  <div className="grid grid-cols-2 gap-3">
                    <FieldM label="Wedding date">
                      <Input type="date" data-testid="contact-date" value={form.weddingDate} onChange={(e) => set('weddingDate', e.target.value)} className="rounded-none border-[#C9B896] bg-transparent" />
                    </FieldM>
                    <FieldM label="City">
                      <Input data-testid="contact-city" value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="Mumbai, Delhi…" className="rounded-none border-[#C9B896] bg-transparent" />
                    </FieldM>
                  </div>
                  <FieldM label="Plan you have in mind">
                    <select
                      data-testid="contact-budget"
                      value={form.budget}
                      onChange={(e) => set('budget', e.target.value)}
                      className="w-full rounded-none border border-[#C9B896] bg-transparent py-2 px-3 text-sm text-[#3A3226] focus:outline-none focus:ring-1 focus:ring-[#8B7355]"
                    >
                      <option value="">Not sure yet</option>
                      <option value="Essential ₹2,499">Essential — ₹2,499</option>
                      <option value="Signature ₹4,999">Signature — ₹4,999</option>
                      <option value="Heirloom ₹7,000">Heirloom — ₹7,000</option>
                    </select>
                  </FieldM>
                  {templateInterest && (
                    <div className="text-xs text-[#8B7355] tracking-wider">
                      Interested in: <span className="text-[#3A3226] font-medium">{templateInterest}</span>
                    </div>
                  )}
                  <FieldM label="Anything else?">
                    <Textarea data-testid="contact-message" value={form.message} onChange={(e) => set('message', e.target.value)} rows={3} maxLength={1000} className="rounded-none border-[#C9B896] bg-transparent" />
                  </FieldM>
                  <Button
                    type="submit"
                    disabled={submitting}
                    data-testid="contact-submit"
                    className="w-full bg-[#3A3226] hover:bg-[#1F1A14] text-[#FDFBF7] rounded-none py-6 tracking-widest text-xs uppercase"
                  >
                    {submitting ? 'Sending…' : (<><Send size={14} className="mr-2" /> Send to Kalyanaya</>)}
                  </Button>
                  <p className="text-[10px] text-[#8B7355] tracking-wider text-center pt-1">
                    By submitting, you agree we'll contact you on WhatsApp/phone about your wedding website.
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function FieldM({ label, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[10px] tracking-widest uppercase text-[#8B7355]">{label}</Label>
      {children}
    </div>
  )
}
