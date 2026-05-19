import { headers } from 'next/headers'
import MoonveilTemplate from '@/components/templates/Moonveil'
import RoyalHeritageTemplate from '@/components/templates/RoyalHeritage'
import EternalEditTemplate from '@/components/templates/EternalEdit'
import CrimsonLotusTemplate from '@/components/templates/CrimsonLotus'
import SapphireSagaTemplate from '@/components/templates/SapphireSaga'
import SanctumVeilTemplate from '@/components/templates/SanctumVeil'
import MarigoldBloomTemplate from '@/components/templates/MarigoldBloom'
import PearlVelvetTemplate from '@/components/templates/PearlVelvet'

const TEMPLATES = {
  'Moonveil': MoonveilTemplate,
  'Royal Heritage': RoyalHeritageTemplate,
  'Eternal Edit': EternalEditTemplate,
  'Crimson Lotus': CrimsonLotusTemplate,
  'Sapphire Saga': SapphireSagaTemplate,
  'Sanctum Veil': SanctumVeilTemplate,
  'Marigold Bloom': MarigoldBloomTemplate,
  'Pearl & Velvet': PearlVelvetTemplate,
}

async function getWedding(slug) {
  const h = headers()
  const proto = h.get('x-forwarded-proto') || 'http'
  const host = h.get('host')
  const base = process.env.NEXT_PUBLIC_BASE_URL || `${proto}://${host}`
  try {
    const res = await fetch(`${base}/api/public/wedding/${slug}`, { cache: 'no-store' })
    if (!res.ok) return null
    const data = await res.json()
    return data.wedding
  } catch (e) {
    return null
  }
}

export async function generateMetadata({ params }) {
  const w = await getWedding(params.slug)
  if (!w) return { title: 'Wedding not found · Kalyanaya' }
  return {
    title: `${w.brideName} & ${w.groomName} · Wedding`,
    description: w.tagline || `Join us as we celebrate the wedding of ${w.brideName} and ${w.groomName}.`,
    openGraph: {
      title: `${w.brideName} & ${w.groomName} · Wedding`,
      description: w.tagline,
      images: w.heroImage ? [w.heroImage.url] : [],
    },
  }
}

export default async function WeddingPage({ params }) {
  const w = await getWedding(params.slug)
  if (!w) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#FDFBF7] text-[#3A3226] px-6">
        <div className="text-center max-w-md">
          <div className="text-[#8B7355] tracking-[0.3em] text-xs uppercase mb-4">404</div>
          <h1 className="font-serif text-4xl mb-4">Wedding not found</h1>
          <p className="text-[#3A3226]/70">This wedding page is either unpublished or doesn't exist. Please check your link.</p>
          <a href="/" className="inline-block mt-8 underline text-[#8B7355]">Back to Kalyanaya</a>
        </div>
      </main>
    )
  }
  const Template = TEMPLATES[w.template] || MoonveilTemplate
  return <Template wedding={w} />
}
