import React from 'react'

// One render error must never white-screen the night.
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('SlowPour error boundary:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-6 bg-background text-foreground font-body">
          <div className="text-center max-w-sm">
            <p className="font-heading text-2xl font-semibold mb-2">A dram went sideways</p>
            <p className="text-sm text-muted-foreground mb-6">
              Something unexpected happened. Reloading usually sorts it.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 h-12 rounded-lg bg-primary text-primary-foreground font-heading text-base"
            >
              Reload
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
