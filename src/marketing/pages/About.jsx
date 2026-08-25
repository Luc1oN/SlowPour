import React from 'react'
import GoldDivider from '../../components/shared/GoldDivider'
import Reveal from '../components/Reveal'
import { useTitle } from '../useTitle'

const NOT = [
  ['Not a course', 'There’s nothing to learn by heart and nothing to take away but an opinion.'],
  ['Not a class', 'I’m at the table, not at the top of the room.'],
  ['Not a drinking night', 'Measures are small, and there’s water and food in front of you all evening.'],
  ['Not a supper club', 'The food is there to break the night up, not to be the night.'],
]

function Section({ title, children }) {
  return (
    <section className="border-t border-border/40 px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-xl">
        <Reveal>
          <h2 className="font-heading text-3xl text-foreground sm:text-4xl">{title}</h2>
          <GoldDivider />
          <div className="space-y-5 text-lg leading-relaxed text-muted-foreground">
            {children}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

export default function About() {
  useTitle(
    'About — The Slow Pour',
    "What The Slow Pour is, what it isn't, and who runs it. Tasting nights in Cork for curious people, not experts.",
  )

  return (
    <>
      <section className="candle-glow px-6 pb-16 pt-16 sm:pt-20">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-heading text-4xl text-foreground sm:text-5xl">About</h1>
          <p className="mx-auto mt-5 max-w-md text-lg leading-relaxed text-muted-foreground">
            A small group, a table, and a handful of things worth trying.
          </p>
        </div>
      </section>

      <Section title="What it is">
        <p>
          A few times a year I put a small group around a table, pour a handful of things
          in an order that's been thought about, and talk about what's in the glass.
        </p>
        <p>
          You don't need to know anything. If you've never tried the category before,
          you're the person the night is designed for.
        </p>
      </Section>

      <section className="border-t border-border/40 px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-xl">
          <Reveal>
            <h2 className="font-heading text-3xl text-foreground sm:text-4xl">What it isn't</h2>
            <GoldDivider />
          </Reveal>

          <div className="space-y-7">
            {NOT.map(([title, body], i) => (
              <Reveal key={title}>
                <h3 className="font-heading text-xl text-primary">{title}</h3>
                <p className="mt-1.5 text-base leading-relaxed text-muted-foreground">{body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Section title="Who runs it">
        <p className="text-foreground">I'm Shane.</p>
        <p>
          This started as a text message. I asked a few friends whether anyone fancied a
          whiskey night, and enough of them said yes that I had to go and actually organise one.
        </p>
        <p>
          I'd been at it privately for years by then — reading, buying bottles I couldn't
          entirely justify, slowly working out what I liked and why. But I'd only been to a
          handful of tastings myself. I'm not a distiller, I don't work in the trade, and I've
          no qualifications in any of this. I'm someone who got curious and did the reading.
        </p>
        <p>
          That turned out to be the useful part. Because I remember not knowing, I know which
          questions feel stupid to ask — and they're usually the good ones.
        </p>
        <p>
          The planning is most of the pleasure, if I'm honest: working out the running order,
          sourcing the bottles, getting the room right, then watching people who didn't know
          each other at seven o'clock arguing about a favourite by ten.
        </p>
      </Section>

      <Section title="How the first one went">
        <p>
          Twelve people, and the experience in the room ran the whole range — some had never
          really drunk whiskey, some knew a fair amount.
        </p>
        <p>
          Everyone left with something they hadn't expected. For one person it was their first
          Scotch. For another it was finding out that the age on a bottle is the youngest thing
          in it, not the oldest. For someone else it was drinking a peaty whisky and, this time,
          liking it.
        </p>
        <p className="text-foreground">
          Everyone found one they liked. That's the only result I'm after.
        </p>
      </Section>

      <Section title="Why it isn't tied to one drink">
        <p>
          The first one was whiskey because whiskey is what I know best. But the argument was
          never about whiskey.
        </p>
        <p>
          Nearly everyone has written something off — wine, because of one bad glass; beer,
          because of a pint someone made you finish at eighteen; gin, mead, whatever yours is.
          The verdict almost always came from a poor example, poured badly, at the wrong moment.
        </p>
        <p>
          So the category will change. The night won't. Whatever's in the glass, it's the same
          evening: a few things worth trying, in a considered order, with someone to tell you
          what you're drinking and why.
        </p>
      </Section>

      <Section title="Where">
        <p>
          Cork. The first one ran in Cobh, and Cork is where they'll stay.
        </p>
        <p>
          Small rooms and small numbers. Twelve felt about right — enough for an argument
          about a favourite, few enough that everyone gets heard. I'd rather keep it that
          size than fill a function room.
        </p>
      </Section>
    </>
  )
}
