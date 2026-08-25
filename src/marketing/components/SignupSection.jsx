import React from 'react'
import SignupForm from './SignupForm'
import GoldDivider from '../../components/shared/GoldDivider'

// The same ask, in the same words, on every page. This is the one thing
// the site is actually for.
export default function SignupSection() {
  return (
    <section id="signup" className="scroll-mt-20 border-t border-border/40 px-6 py-20 sm:py-24">
      <div className="mx-auto max-w-md text-center">
        <h2 className="font-heading text-3xl sm:text-4xl text-foreground">
          Hear about the next one
        </h2>

        <GoldDivider />

        <p className="mx-auto mb-8 max-w-sm text-base leading-relaxed text-muted-foreground">
          There's roughly one of these a quarter. Put your email in and you'll get a
          message when there's a date — and nothing else in between.
        </p>

        <SignupForm id="signup" />
      </div>
    </section>
  )
}
