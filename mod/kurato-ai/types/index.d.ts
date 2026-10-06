export type Mood = 'normal' | 'happy' | 'worried' | 'troubled' | 'serious'

declare module 'claude-code' {
  interface PluginState {
    'kurato-ai': { line: string | null; activity: string | null; mood: Mood }
  }
}
