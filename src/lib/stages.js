// ─────────────────────────────────────────────────────────
// Single source of truth for the night's structure.
// Every surface (guest app, admin, display) derives from this.
// To run a night with more whiskeys, edit this one file.
// ─────────────────────────────────────────────────────────

export const STAGES = [
  { id: 0, type: 'tasting', round: 1, slot: 1, label: 'Whiskey 1 · Round 1' },
  { id: 1, type: 'tasting', round: 1, slot: 2, label: 'Whiskey 2 · Round 1' },
  { id: 2, type: 'tasting', round: 1, slot: 3, label: 'Whiskey 3 · Round 1' },
  { id: 3, type: 'break',   label: 'Break' },
  { id: 4, type: 'tasting', round: 2, slot: 1, label: 'Whiskey 1 · Round 2' },
  { id: 5, type: 'tasting', round: 2, slot: 2, label: 'Whiskey 2 · Round 2' },
  { id: 6, type: 'tasting', round: 2, slot: 3, label: 'Whiskey 3 · Round 2' },
  { id: 7, type: 'mystery', label: 'Mystery Dram' },
  { id: 8, type: 'results', label: 'Final Results' },
]

export const LAST_STAGE = STAGES.length - 1
export const stageLabels = STAGES.map(s => s.label)

// The stage at which a whiskey (by round_number / slot) unlocks rating
export function rateUnlockStage(roundNumber) {
  const s = STAGES.find(st => st.type === 'tasting' && st.round === 2 && st.slot === roundNumber)
  return s ? s.id : Infinity
}

export function isRateable(whiskey, currentStage) {
  return currentStage >= rateUnlockStage(whiskey.round_number)
}

// Simple 5-step overview used on the Landing page and the Display
// pre-show screen. Distinct from the detailed STAGES list (which is
// stage-by-stage); this is the guest-facing "what to expect" summary.
export const FORMAT_OVERVIEW = [
  { icon: 'glencairn', label: 'Round 1', desc: 'Taste three whiskeys, take your notes' },
  { icon: 'watch',     label: 'Break',   desc: 'Pause and reflect' },
  { icon: 'repeat',    label: 'Round 2', desc: 'Revisit all three and rate as you go' },
  { icon: 'seal',      label: 'Mystery Dram', desc: 'The seal is broken' },
  { icon: 'laurel',    label: 'Final Results', desc: "Tonight's winner announced" },
]
