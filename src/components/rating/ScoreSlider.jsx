import React from 'react'
import * as SliderPrimitive from '@radix-ui/react-slider'

export default function ScoreSlider({ value, onChange }) {
  return (
    <div>
      <div className="flex justify-between items-end mb-4">
        <span className="text-xs text-muted-foreground uppercase tracking-widest">Score</span>
        <span className="font-heading text-4xl font-semibold text-primary">{value}</span>
      </div>
      <SliderPrimitive.Root
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={1}
        max={10}
        step={1}
        className="relative flex items-center select-none touch-none w-full py-2"
      >
        <SliderPrimitive.Track className="bg-secondary relative grow rounded-full h-2">
          <SliderPrimitive.Range className="absolute bg-primary rounded-full h-full" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          className="block w-5 h-5 bg-primary rounded-full shadow focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
        />
      </SliderPrimitive.Root>
      <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
        <span>1</span>
        <span>5</span>
        <span>10</span>
      </div>
    </div>
  )
}
