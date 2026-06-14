import React from 'react'

// One render error must never white-screen the night.
// Temporarily shows the real error + stack so it can be diagnosed
// from a screenshot — remove the debug block once stable.
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, info: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    this.setState({ info })
    console.error('SlowPour error boundary:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-6 bg-background text-foreground font-body">
          <div className="text-center max-w-lg w-full">
            <p className="font-heading text-2xl font-semibold mb-2">A dram went sideways</p>
            <p className="text-sm text-muted-foreground mb-6">
              Something unexpected happened. Reloading usually sorts it.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 h-12 rounded-lg bg-primary text-primary-foreground font-heading text-base mb-6"
            >
              Reload
            </button>

            {/* DEBUG — remove once root cause found */}
            <div className="text-left bg-secondary/50 border border-border rounded-lg p-3 text-[11px] text-muted-foreground font-mono whitespace-pre-wrap break-words max-h-64 overflow-auto">
              <p className="text-destructive font-semibold mb-1">{String(this.state.error?.message || this.state.error)}</p>
              {this.state.error?.stack}
              {this.state.info?.componentStack && (
                <>
                  {'\n\n--- component stack ---'}
                  {this.state.info.componentStack}
                </>
              )}
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
