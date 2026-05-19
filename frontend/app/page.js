'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Sparkles, Heart, Camera, Calendar, Users, Mail, Star, Check, ChevronRight,
  Menu, X, MessageCircle, Phone,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import ContactModal, { whatsappUrl } from '@/components/ContactModal'

const HERO_IMG = 'https://images.unsplash.com/photo-1756190564669-215843660e93'
const TEMPLATE_IMGS = [
  'https://images.unsplash.com/photo-1767955694884-d4bf352c23c2',
  'https://images.unsplash.com/photo-1769500804089-b91e952710a4',
  'https://images.pexels.com/photos/29497172/pexels-photo-29497172.jpeg',
  'https://images.unsplash.com/photo-1708077809012-4740dd43bd53',
  'https://images.unsplash.com/photo-1584242353192-7a1df2e855d8',
  'https://images.unsplash.com/photo-1519741497674-611481863552',
  'https://images.unsplash.com/photo-1604608672516-f1b9b1d1ce4f',
  'https://images.unsplash.com/photo-1519225421980-715cb0215aed',
]
const FEATURE_IMG_1 = 'https://images.pexels.com/photos/19590224/pexels-photo-19590224.jpeg'
const FEATURE_IMG_2 = 'https://images.pexels.com/photos/35328204/pexels-photo-35328204.jpeg'

const features = [
  { icon: Sparkles, title: 'Cinematic Templates', desc: 'Editorial-grade designs crafted for unforgettable weddings.' },
  { icon: Heart, title: 'Personal Storytelling', desc: 'Share your love story with elegance and emotion.' },
  { icon: Camera, title: 'Stunning Galleries', desc: 'Display your moments in breathtaking visual layouts.' },
  { icon: Calendar, title: 'Event Timeline', desc: 'Mehendi, Sangeet, Ceremony — every ritual in its place.' },
  { icon: Users, title: 'Smart RSVPs', desc: 'Track guests, meals, and messages in real time.' },
  { icon: Mail, title: 'Shareable Forever', desc: 'A beautiful link your family will treasure for years.' },
]

const templates = [
  { name: 'Moonveil', tag: 'Minimal · Modern · Timeless', img: TEMPLATE_IMGS[0], desc: 'Editorial elegance. Ivory whitespace, slate accents, fashion-magazine restraint.' },
  { name: 'Royal Heritage', tag: 'Rich · Traditional · Luxurious', img: TEMPLATE_IMGS[1], desc: 'Burgundy and gold, ornate borders, mandalas — a true Mughal celebration.' },
  { name: 'Eternal Edit', tag: 'Cinematic · Contemporary · Bold', img: TEMPLATE_IMGS[2], desc: 'A film about you. Dark mode, letterboxed hero, chapter-numbered timeline.' },
  { name: 'Crimson Lotus', tag: 'Floral · Romantic · Garden', img: TEMPLATE_IMGS[3], desc: 'Blush peonies, sage sprigs, floating petals — a love story in full bloom.' },
  { name: 'Sapphire Saga', tag: 'Celestial · Mughal · Royal', img: TEMPLATE_IMGS[4], desc: 'Midnight blue, silver stars, jharokha arches — a saga written in the sky.' },
  { name: 'Sanctum Veil', tag: 'Christian · Sacred · Cathedral', img: TEMPLATE_IMGS[5], desc: 'Cathedral arches, dove, olive branches — ivory grace for a sacred union.' },
  { name: 'Marigold Bloom', tag: 'Festive · Vibrant · Joyful', img: TEMPLATE_IMGS[6], desc: 'Marigold yellow, emerald green, hanging toran — a colourful Indian celebration.' },
  { name: 'Pearl & Velvet', tag: 'Art Deco · Gatsby · Luxe', img: TEMPLATE_IMGS[7], desc: 'Champagne shimmer on emerald velvet — a Gatsby-era affair to remember.' },
]

const testimonials = [
  { name: 'Aanya & Vikram', role: 'Mumbai', quote: 'Our families opened the link and gasped. It felt like a film. Worth every rupee.' },
  { name: 'Priya & Rohan', role: 'Bangalore', quote: 'The RSVPs poured in. We tracked meals, songs, even messages. Effortless.' },
  { name: 'Meera & Arjun', role: 'Delhi', quote: 'Guests from Toronto to Dubai felt close to our day. Truly cinematic.' },
]

const pricing = [
  { name: 'Essential', price: '2,499', features: ['1 stunning template', 'Up to 100 guests', 'RSVP tracking', 'Photo gallery', '6 months hosting'], popular: false },
  { name: 'Signature', price: '4,999', features: ['All 8 luxury templates', 'Unlimited guests', 'Advanced RSVP + meals', 'Unlimited photos', '1 year hosting', 'Custom URL slug', 'Password protection'], popular: true },
  { name: 'Heirloom', price: '7,000', features: ['Everything in Signature', 'Custom domain', 'Priority support', 'Video embeds', '3 years hosting', 'Gift registry link', 'Music integration'], popular: false },
]

const faqs = [
  { q: 'How does Kalyanaya work?', a: "Kalyanaya is a concierge service — we craft your wedding website for you. Share your story, photos and details with us on WhatsApp; our studio designs the site within 24–48 hours. You review, we polish, you share." },
  { q: 'Can I edit the website after publishing?', a: 'Absolutely. Just message us — we will update events, photos, story, anything — usually within a few hours.' },
  { q: 'Will my website work on phones?', a: 'Every Kalyanaya website is meticulously crafted to be flawless on every device — phone, tablet, and desktop.' },
  { q: 'How do guests RSVP?', a: 'Guests visit your link and fill a beautiful form with attendance, meal preference, and a personal message. You see every response in real time.' },
  { q: 'Is my website private?', a: 'Yes — we can add password protection so only invited guests can view your wedding page.' },
  { q: 'Can I use a custom domain like ours.wedding?', a: 'Yes, on the Heirloom plan you can point your own domain to your Kalyanaya site.' },
  { q: 'How do I get started?', a: "Tap any 'Contact Us' button or message us on WhatsApp. We will hop on a quick call to understand your vision, choose a template, and start building." },
  { q: 'Do you offer refunds?', a: 'If you are unhappy within 7 days of payment and we cannot resolve it, we offer a full refund.' },
]

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
}

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [contactOpen, setContactOpen] = useState(false)
  const [templateInterest, setTemplateInterest] = useState('')

  function openContact(interest = '') {
    setTemplateInterest(interest)
    setContactOpen(true)
    setMobileOpen(false)
  }

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-[#3A3226]" data-testid="landing-page">
      <ContactModal
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        templateInterest={templateInterest}
        source="landing"
      />

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[#FDFBF7]/80 border-b border-[#C9B896]/30">
        <div className="container mx-auto flex items-center justify-between py-5 px-4">
          <Link href="/" className="font-serif text-2xl tracking-wide text-[#3A3226]" data-testid="brand-link">
            Kalyanaya
            <span className="ml-1 text-[#8B7355]">·</span>
          </Link>
          <div className="hidden md:flex items-center gap-10 text-sm tracking-wide">
            <a href="#features" className="hover:text-[#8B7355] transition">Features</a>
            <a href="#templates" className="hover:text-[#8B7355] transition">Templates</a>
            <a href="#pricing" className="hover:text-[#8B7355] transition">Pricing</a>
            <a href="#faq" className="hover:text-[#8B7355] transition">FAQ</a>
            <a
              href={whatsappUrl()}
              target="_blank"
              rel="noreferrer"
              className="text-[#25D366] hover:text-[#1ebe57] flex items-center gap-1"
              data-testid="nav-whatsapp"
            >
              <MessageCircle size={14} /> WhatsApp
            </a>
            <Button
              onClick={() => openContact()}
              data-testid="nav-contact-btn"
              className="bg-[#3A3226] hover:bg-[#1F1A14] text-[#FDFBF7] rounded-none px-6 py-5 tracking-widest text-xs uppercase"
            >
              Contact Us
            </Button>
          </div>
          <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)} aria-label="menu">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {mobileOpen && (
          <div className="md:hidden border-t border-[#C9B896]/30 bg-[#FDFBF7] px-4 py-6 flex flex-col gap-4 text-sm">
            <a href="#features" onClick={() => setMobileOpen(false)}>Features</a>
            <a href="#templates" onClick={() => setMobileOpen(false)}>Templates</a>
            <a href="#pricing" onClick={() => setMobileOpen(false)}>Pricing</a>
            <a href="#faq" onClick={() => setMobileOpen(false)}>FAQ</a>
            <a href={whatsappUrl()} target="_blank" rel="noreferrer" className="text-[#25D366] flex items-center gap-2">
              <MessageCircle size={14} /> WhatsApp
            </a>
            <Button onClick={() => openContact()} className="bg-[#3A3226] text-[#FDFBF7] rounded-none w-full">Contact Us</Button>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center pt-24">
        <div className="absolute inset-0">
          <img src={HERO_IMG} alt="Luxury wedding" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#FDFBF7] via-[#FDFBF7]/85 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#FDFBF7]/60 via-transparent to-transparent" />
        </div>
        <div className="container mx-auto relative z-10 px-4 py-24">
          <motion.div initial="hidden" animate="show" variants={fadeUp} className="max-w-2xl">
            <div className="text-[#8B7355] tracking-[0.3em] text-xs uppercase mb-6">Premium Luxury · Indian Weddings</div>
            <h1 className="font-serif font-light text-6xl md:text-7xl lg:text-8xl leading-[1.05] text-[#3A3226] mb-8">
              The wedding of <em className="italic text-[#8B7355]">a lifetime</em>, captured in a website worthy of it.
            </h1>
            <p className="text-lg md:text-xl text-[#3A3226]/80 leading-relaxed mb-10 max-w-xl">
              Concierge-crafted, editorial wedding websites for couples who refuse to settle.
              Built by our studio in 24 hours. Treasured forever.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={() => openContact()}
                data-testid="hero-contact-btn"
                className="bg-[#3A3226] hover:bg-[#1F1A14] text-[#FDFBF7] rounded-none px-10 py-7 tracking-widest text-xs uppercase"
              >
                Contact Us <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
              <a href="#templates">
                <Button variant="outline" className="border-[#3A3226] text-[#3A3226] hover:bg-[#3A3226] hover:text-[#FDFBF7] rounded-none px-10 py-7 tracking-widest text-xs uppercase bg-transparent">
                  View Templates
                </Button>
              </a>
              <a
                href={whatsappUrl()}
                target="_blank"
                rel="noreferrer"
                data-testid="hero-whatsapp-btn"
                className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe57] text-white rounded-none px-8 py-7 tracking-widest text-xs uppercase transition"
              >
                <MessageCircle size={14} /> WhatsApp
              </a>
            </div>
            <div className="mt-16 flex items-center gap-8 text-sm text-[#3A3226]/70">
              <div className="flex items-center gap-1 text-[#8B7355]">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
              </div>
              <span>Loved by 200+ couples · Featured in editorial reviews</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* DIVIDER */}
      <div className="container mx-auto px-4 py-12 flex items-center gap-6">
        <div className="flex-1 h-px bg-[#C9B896]/50" />
        <div className="font-serif italic text-[#8B7355]">A Kalyanaya wedding is forever</div>
        <div className="flex-1 h-px bg-[#C9B896]/50" />
      </div>

      {/* FEATURES */}
      <section id="features" className="py-24 md:py-32">
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="text-center mb-20">
            <div className="text-[#8B7355] tracking-[0.3em] text-xs uppercase mb-4">What we offer</div>
            <h2 className="font-serif font-light text-5xl md:text-6xl text-[#3A3226]">
              Crafted for the <em className="italic">most important</em> day of your life.
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
            {features.map((f, i) => (
              <motion.div key={f.title} initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.08 }}>
                <div className="w-12 h-12 mb-6 border border-[#C9B896] flex items-center justify-center">
                  <f.icon className="w-5 h-5 text-[#8B7355]" />
                </div>
                <h3 className="font-serif text-2xl mb-3 text-[#3A3226]">{f.title}</h3>
                <p className="text-[#3A3226]/70 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TEMPLATES */}
      <section id="templates" className="py-24 md:py-32 bg-[#F5EFE4]">
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="text-center mb-20">
            <div className="text-[#8B7355] tracking-[0.3em] text-xs uppercase mb-4">Eight signatures</div>
            <h2 className="font-serif font-light text-5xl md:text-6xl text-[#3A3226]">
              Choose a <em className="italic">canvas</em> worthy of your story.
            </h2>
            <p className="mt-6 text-[#3A3226]/70 max-w-2xl mx-auto">Eight distinct moods — from minimal editorial to Christian cathedral, festive marigold to Gatsby art deco.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {templates.map((t, i) => (
              <motion.div
                key={t.name}
                initial="hidden" whileInView="show" viewport={{ once: true }}
                variants={fadeUp} transition={{ delay: i * 0.08 }}
                className="group cursor-pointer"
                onClick={() => openContact(t.name)}
                data-testid={`template-card-${t.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
              >
                <div className="relative aspect-[3/4] overflow-hidden mb-6">
                  <img src={t.img} alt={t.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#3A3226]/50 to-transparent" />
                  <div className="absolute top-4 left-4 bg-[#FDFBF7] text-[#3A3226] text-[10px] tracking-widest uppercase px-3 py-1">Available</div>
                  <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition">
                    <div className="bg-[#FDFBF7] text-[#3A3226] text-[10px] tracking-widest uppercase px-3 py-2 inline-flex items-center gap-1">
                      Enquire about {t.name} <ChevronRight size={12} />
                    </div>
                  </div>
                </div>
                <h3 className="font-serif text-3xl text-[#3A3226] mb-2">{t.name}</h3>
                <p className="text-[#8B7355] text-sm tracking-wider mb-2">{t.tag}</p>
                <p className="text-[#3A3226]/65 text-sm leading-relaxed">{t.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-16 items-center">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
            <img src={FEATURE_IMG_1} alt="Mehendi joy" className="w-full aspect-[4/5] object-cover" />
          </motion.div>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="space-y-12">
            <div>
              <div className="text-[#8B7355] tracking-[0.3em] text-xs uppercase mb-4">Loved by couples</div>
              <h2 className="font-serif font-light text-4xl md:text-5xl text-[#3A3226] leading-tight">
                Stories from <em className="italic">our couples</em>.
              </h2>
            </div>
            {testimonials.map((t) => (
              <div key={t.name} className="border-l-2 border-[#C9B896] pl-6">
                <p className="font-serif italic text-xl text-[#3A3226] leading-relaxed mb-3">"{t.quote}"</p>
                <p className="text-sm text-[#8B7355] tracking-wider">— {t.name}, {t.role}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24 md:py-32 bg-[#3A3226] text-[#FDFBF7]">
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="text-center mb-20">
            <div className="text-[#C9B896] tracking-[0.3em] text-xs uppercase mb-4">Investment</div>
            <h2 className="font-serif font-light text-5xl md:text-6xl">
              A small price for an <em className="italic text-[#C9B896]">eternal</em> memory.
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricing.map((p, i) => (
              <motion.div key={p.name} initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.12 }}
                className={`relative border ${p.popular ? 'border-[#C9B896] bg-[#FDFBF7]/5' : 'border-[#FDFBF7]/20'} p-10 flex flex-col`}>
                {p.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#C9B896] text-[#3A3226] text-[10px] tracking-widest uppercase px-4 py-1">Most Chosen</div>}
                <h3 className="font-serif text-3xl mb-2">{p.name}</h3>
                <div className="font-serif text-5xl mb-1">₹{p.price}</div>
                <div className="text-[#C9B896]/80 text-xs tracking-widest uppercase mb-8">One-time payment</div>
                <ul className="space-y-3 mb-10 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-[#FDFBF7]/90">
                      <Check className="w-4 h-4 text-[#C9B896] mt-1 flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => openContact(`${p.name} plan`)}
                  data-testid={`pricing-${p.name.toLowerCase()}-btn`}
                  className={`w-full rounded-none py-6 tracking-widest text-xs uppercase ${p.popular ? 'bg-[#C9B896] text-[#3A3226] hover:bg-[#FDFBF7]' : 'bg-transparent border border-[#FDFBF7] text-[#FDFBF7] hover:bg-[#FDFBF7] hover:text-[#3A3226]'}`}
                >
                  Enquire
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 md:py-32">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
            <div className="text-[#8B7355] tracking-[0.3em] text-xs uppercase mb-4">Questions</div>
            <h2 className="font-serif font-light text-5xl md:text-6xl text-[#3A3226]">
              Things to <em className="italic">know</em>.
            </h2>
          </motion.div>
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-b border-[#C9B896]/40">
                <AccordionTrigger className="font-serif text-lg text-[#3A3226] hover:no-underline text-left">{f.q}</AccordionTrigger>
                <AccordionContent className="text-[#3A3226]/70 leading-relaxed">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CONTACT / CTA */}
      <section id="contact" className="relative py-32">
        <div className="absolute inset-0">
          <img src={FEATURE_IMG_2} alt="Sangeet celebration" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[#3A3226]/75" />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center text-[#FDFBF7]">
          <div className="text-[#C9B896] tracking-[0.3em] text-xs uppercase mb-4">Begin</div>
          <h2 className="font-serif font-light text-5xl md:text-7xl mb-8 max-w-3xl mx-auto leading-tight">
            Your love is unforgettable. <em className="italic text-[#C9B896]">Your website should be too.</em>
          </h2>
          <p className="text-[#FDFBF7]/80 max-w-xl mx-auto mb-10">
            Kalyanaya is an invite-only studio. Tell us about your wedding — we'll reach out on WhatsApp within hours.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              onClick={() => openContact()}
              data-testid="cta-contact-btn"
              className="bg-[#C9B896] hover:bg-[#FDFBF7] text-[#3A3226] rounded-none px-12 py-7 tracking-widest text-xs uppercase"
            >
              <Mail size={14} className="mr-2" /> Contact Form
            </Button>
            <a
              href={whatsappUrl()}
              target="_blank"
              rel="noreferrer"
              data-testid="cta-whatsapp-btn"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe57] text-white rounded-none px-12 py-7 tracking-widest text-xs uppercase transition"
            >
              <MessageCircle size={14} /> WhatsApp
            </a>
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-8 text-sm text-[#FDFBF7]/70">
            <a href={`tel:+919876543210`} className="flex items-center gap-2 hover:text-[#C9B896]"><Phone size={14} /> +91 98765 43210</a>
            <a href={`mailto:hello@kalyanaya.com`} className="flex items-center gap-2 hover:text-[#C9B896]"><Mail size={14} /> hello@kalyanaya.com</a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#C9B896]/30 py-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="font-serif text-2xl text-[#3A3226]">Kalyanaya<span className="text-[#8B7355]">·</span></div>
          <div className="flex gap-8 text-sm text-[#3A3226]/70">
            <a href="#features" className="hover:text-[#8B7355]">Features</a>
            <a href="#templates" className="hover:text-[#8B7355]">Templates</a>
            <a href="#pricing" className="hover:text-[#8B7355]">Pricing</a>
            <button onClick={() => openContact()} className="hover:text-[#8B7355]">Contact</button>
          </div>
          <div className="text-xs text-[#8B7355] tracking-wider">© {new Date().getFullYear()} Kalyanaya · Made with love in India</div>
        </div>
      </footer>

      {/* Floating WhatsApp button */}
      <a
        href={whatsappUrl()}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat on WhatsApp"
        data-testid="float-whatsapp-btn"
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#1ebe57] text-white shadow-lg flex items-center justify-center transition hover:scale-110"
      >
        <MessageCircle size={24} />
      </a>
    </main>
  )
}
