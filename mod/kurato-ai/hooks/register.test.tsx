import { describe, expect, test } from 'claude-code/testing'

import { activityFor, closingLine, moodFor } from './register'

const BAND = {
  component: 'AbovePrompt',
  props: {
    hasSurvey: false,
    isWorking: false,
    maxRows: 10,
    bodyColumns: 80,
    scroll: { bodyRows: 9, offset: 0, total: 0 },
    view: {},
  },
} as const

describe('closingLine', () => {
  test('最後の段落を一言にする', async () => {
    expect(closingLine('報告です。\n\nログも残しました。\n\n…よかったあ。')).toBe('…よかったあ。')
  })

  test('表、箇条書き、出典は飛ばす', async () => {
    const answer = '進めますね。\n\n- 一つ目\n- 二つ目\n\n| a | b |\n|---|---|\n\nSources:\n- [x](https://x)'
    expect(closingLine(answer)).toBe('進めますね。')
  })

  test('太字とリンクを外す', async () => {
    expect(closingLine('**大丈夫**です。[ログ](a.md)を見てください')).toBe('大丈夫です。ログを見てください')
  })

  test('確認の質問は吹き出しに出さない', async () => {
    expect(closingLine('本文です。\n\nこれで進めていいですか？')).toBe(null)
  })

  test('60 文字を超えたら切る', async () => {
    expect(closingLine('あ'.repeat(80))?.length).toBe(60)
  })

  test('空の返答は null', async () => {
    expect(closingLine('')).toBe(null)
  })
})

describe('activityFor', () => {
  test('ツール名から作業中の一言を決める', async () => {
    expect(activityFor('Edit')).toBe('書いてます…')
    expect(activityFor('Grep')).toBe('読んでます…')
    expect(activityFor('mcp__claude_ai_Magnific__images_generate')).toBe('生成してます…')
    expect(activityFor('mcp__claude_ai_Gmail__search_threads')).toBe('外のサービスとやりとりしてます…')
  })
})

test('帯に挨拶を出し、返答が終わると締めの一言に変わる', async ($, on) => {
  on('turn.complete', async () => ({ text: '' }))

  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ plugin: 'kurato-ai', surface, ...BAND })
    expect(await ui.find({ type: 'Text', text: /よろしくお願いします/ })).toBeDefined()
    await ui.unmount()
  }

  await $.turn.complete({
    answer: '本文です。\n\n…ありがとうございました。',
    durationMs: 1000,
    isAborted: false,
    turnId: 't1',
    reason: 'answer',
  })

  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ plugin: 'kurato-ai', surface, ...BAND })
    expect(await ui.find({ type: 'Text', text: /ありがとうございました/ })).toBeDefined()
    await ui.unmount()
  }

  const desktop = await $.ui.mount({ plugin: 'kurato-ai', surface: 'desktop', ...BAND })
  expect(await desktop.find({ type: 'Svg' })).toBeDefined()
  await desktop.unmount()
})

describe('moodFor', () => {
  test('締めの一言から表情を決める', async () => {
    expect(moodFor('…よかったあ。二人で粘った甲斐がありましたね。')).toBe('happy')
    expect(moodFor('もう1時を回っていますよ。今日は休んでください。')).toBe('worried')
    expect(moodFor('うう…ずれてました。でも原因は分かったので、次いきます。')).toBe('troubled')
    expect(moodFor('決めてもらえたら、すぐ動きます。')).toBe('normal')
  })
})

test('返答の中身で表情が変わる', async ($, on) => {
  on('turn.complete', async () => ({ text: '' }))
  await $.turn.complete({
    answer: '本文です。\n\nやった、通りました！',
    durationMs: 1000,
    isAborted: false,
    turnId: 't2',
    reason: 'answer',
  })
  const ui = await $.ui.mount({ plugin: 'kurato-ai', surface: 'desktop', ...BAND })
  expect(await ui.find({ type: 'Svg', alt: '倉戸あい（happy）' })).toBeDefined()
  await ui.unmount()
})
