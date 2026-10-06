// 表情の名前。characters/<キャラ>/svg/ のファイル名（拡張子なし）。normal は必須
export type Mood = string

// characters/<キャラ>/character.json の中身に、表情ごとの SVG を足したもの
export type Character = {
  name: string
  label: string
  userCall: string
  color: string
  size: number
  maxLine: number
  greeting: string
  errorLine: string
  thinkingLine: string
  // Windows の通知。返答が終わったとき、権限の確認待ちのときに出す
  notify: { enabled: boolean; doneLine: string; permissionLine: string }
  activities: { tool: string; line: string }[]
  workingMood: Mood
  errorMood: Mood
  moods: { mood: Mood; words: string[] }[]
  svgs: Record<Mood, string>
}

declare module 'claude-code' {
  interface PluginState {
    'desktop-pet': { line: string | null; activity: string | null; mood: Mood }
  }
}
