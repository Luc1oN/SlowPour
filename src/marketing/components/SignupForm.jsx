import React, { useRef, useState } from 'react'
import { joinList } from '../../api/signups'

const MESSAGES = {
  success: { tone: 'good', text: "You're on the list. I'll be in touch when there's a date." },
  duplicate: { tone: 'good', text: "You're already on the list — nothing more to do." },
  invalid: { tone: 'bad', text: "That doesn't look like an email address. Have another go?" },
  error: { tone: 'bad', text: "That didn't send. Check your connection and try again." },
}

export default function SignupForm({ id = 'signup' }) {
  const [email, setEmail] = useState('')
  const [pour, setPour] = useState('')
  const [status, setStatus] = useState('idle')
  const emailRef = useRef(null)

  const busy = status === 'loading'
  const done = status === 'success' || status === 'duplicate'
  const message = MESSAGES[status]

  async function onSubmit(e) {
    e.preventDefault()
    if (busy || done) return

    setStatus('loading')
    const result = await joinList({ email, pourRequest: pour })
    setStatus(result)

    if (result === 'success' || result === 'duplicate') {
      setEmail('')
      setPour('')
    } else {
      emailRef.current?.focus()
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-md mx-auto" noValidate>
      <div className="space-y-4">
        <div>
          <label htmlFor={`${id}-email`} className="block text-sm text-muted-foreground mb-2">
            Your email
          </label>
          <input
            ref={emailRef}
            id={`${id}-email`}
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            disabled={busy || done}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            aria-invalid={message?.tone === 'bad' || undefined}
            className="w-full rounded-xl border border-border bg-card/80 px-4 py-3.5 text-base text-foreground
                       placeholder:text-muted-foreground/50 transition-colors
                       focus:border-primary/60 disabled:opacity-50"
          />
        </div>

        <div>
          <label htmlFor={`${id}-pour`} className="block text-sm text-muted-foreground mb-2">
            What would you like poured?{' '}
            <span className="text-muted-foreground/60">(optional)</span>
          </label>
          <input
            id={`${id}-pour`}
            name="pour"
            type="text"
            maxLength={500}
            disabled={busy || done}
            value={pour}
            onChange={(e) => setPour(e.target.value)}
            placeholder="Wine? Mead? Something you've written off?"
            className="w-full rounded-xl border border-border bg-card/80 px-4 py-3.5 text-base text-foreground
                       placeholder:text-muted-foreground/50 transition-colors
                       focus:border-primary/60 disabled:opacity-50"
          />
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground/70">
            Genuinely useful — it's how I work out what to run next.
          </p>
        </div>

        <button
          type="submit"
          disabled={busy || done}
          className="w-full rounded-xl bg-primary px-6 py-3.5 font-heading text-lg font-semibold
                     text-primary-foreground shadow-warm transition-all
                     hover:bg-primary/90 active:scale-[0.99]
                     disabled:opacity-60 disabled:active:scale-100"
        >
          {busy ? 'Just a second…' : done ? 'Done' : 'Join the list'}
        </button>
      </div>

      {/* Announced to screen readers the moment it changes */}
      <div role="status" aria-live="polite" className="min-h-[1.5rem] pt-3">
        {message && (
          <p className={`text-sm leading-relaxed ${message.tone === 'good' ? 'text-primary' : 'text-destructive'}`}>
            {message.text}
          </p>
        )}
      </div>
    </form>
  )
}
