import React from 'react'

const TAGS = [
  'Sweet', 'Fruity', 'Spicy', 'Smoky', 'Oaky', 'Sherry',
  'Vanilla', 'Honey', 'Malty', 'Peaty', 'Smooth', 'Strong',
]

export default function FlavourTags({ selected = [], onChange }) {
  const toggle = (tag) => {
    if (selected.includes(tag)) {
      onChange(selected.filter(t => t !== tag))
    } else {
      onChange([...selected, tag])
    }
  }

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Flavour notes">
      {TAGS.map((tag) => {
        const on = selected.includes(tag)
        return (
          <button
            key={tag}
            onClick={() => toggle(tag)}
            aria-pressed={on}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all border ${
              on
                ? 'bg-primary/15 border-primary/50 text-primary'
                : 'bg-secondary/60 border-border text-muted-foreground hover:border-primary/30'
            }`}
          >
            {tag}
          </button>
        )
      })}
    </div>
  )
}
