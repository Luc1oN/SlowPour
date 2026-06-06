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
    <div className="flex flex-wrap gap-2">
      {TAGS.map((tag) => (
        <button
          key={tag}
          onClick={() => toggle(tag)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
            selected.includes(tag)
              ? 'bg-primary/15 border-primary/50 text-primary'
              : 'bg-secondary/50 border-border text-muted-foreground hover:border-border'
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  )
}
