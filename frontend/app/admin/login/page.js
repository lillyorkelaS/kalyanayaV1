'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('kal_token')) {
      router.replace('/admin')
    }
  }, [router])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      localStorage.setItem('kal_token', data.token)
      localStorage.setItem('kal_user', JSON.stringify(data.user))
      toast.success('Welcome back')
      router.push('/admin')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex bg-[#FDFBF7]" data-testid="admin-login-page">
      <div className="hidden md:flex md:w-1/2 relative">
        <img src="https://images.unsplash.com/photo-1756190564669-215843660e93" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#3A3226]/85 via-[#3A3226]/45 to-transparent" />
        <div className="relative z-10 mt-auto p-12 text-[#FDFBF7]">
          <div className="text-[#C9B896] tracking-[0.3em] text-xs uppercase mb-4 flex items-center gap-2">
            <ShieldCheck size={14} /> Restricted · Studio Access
          </div>
          <h2 className="font-serif font-light text-5xl leading-tight">
            Craft a wedding worthy of <em className="italic text-[#C9B896]">forever</em>.
          </h2>
          <p className="mt-4 text-[#FDFBF7]/75 text-sm max-w-md">
            This portal is for Kalyanaya studio staff only. Couples — please return to the homepage to contact us.
          </p>
        </div>
      </div>
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <Link href="/" className="font-serif text-2xl text-[#3A3226] mb-12 inline-block" data-testid="brand-link">
            Kalyanaya<span className="text-[#8B7355]">·</span>
          </Link>
          <h1 className="font-serif font-light text-4xl text-[#3A3226] mb-2">Admin sign in</h1>
          <p className="text-[#3A3226]/70 mb-10">Use your Kalyanaya studio credentials to continue.</p>
          <form onSubmit={handleSubmit} className="space-y-5" data-testid="admin-login-form">
            <div className="space-y-2">
              <Label className="text-xs tracking-widest uppercase text-[#8B7355]">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-testid="admin-email-input"
                className="rounded-none border-[#C9B896] focus-visible:ring-[#8B7355] py-6 bg-transparent"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs tracking-widest uppercase text-[#8B7355]">Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                data-testid="admin-password-input"
                className="rounded-none border-[#C9B896] focus-visible:ring-[#8B7355] py-6 bg-transparent"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              data-testid="admin-login-submit"
              className="w-full bg-[#3A3226] hover:bg-[#1F1A14] text-[#FDFBF7] rounded-none py-7 tracking-widest text-xs uppercase"
            >
              {loading ? 'Please wait…' : 'Sign In'}
            </Button>
          </form>
          <div className="mt-8 text-center text-xs text-[#3A3226]/55 tracking-wider">
            Access by invitation only. Forgot password? Contact your studio admin.
          </div>
        </motion.div>
      </div>
    </main>
  )
}
