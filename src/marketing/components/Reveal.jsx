import React from 'react'

// A plain wrapper. It used to hide its contents until scrolled into view;
// that meant a page which wasn't painting showed nothing at all, which is
// a bad trade for a site whose whole job is being read. The pacing comes
// from typography and whitespace instead.
export default function Reveal({ children, className = '' }) {
  return <div className={className}>{children}</div>
}
