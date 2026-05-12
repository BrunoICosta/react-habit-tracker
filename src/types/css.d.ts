import 'react'

declare module 'react' {
  // Allow CSS custom properties (e.g. `--habit-color`) in inline styles.
  interface CSSProperties {
    [key: `--${string}`]: string | number | undefined
  }
}
