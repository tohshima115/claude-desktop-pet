import { describe, expect, test } from 'claude-code/testing'

import { character } from './character'
import { activityFor, closingLine, moodFor } from './register'

// どのキャラを組み込んでも通るように、期待する値は character から取る

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

const firstRule = (index: number) => {
  const rule = character.moods[index]
  if (rule === undefined || rule.words[0] === undefined) {
    throw new Error('character.json needs at least one mood rule with a word')
  }
  return { mood: rule.mood, word: rule.words[0] }
}

describe('closingLine', () => {
  test('最後の段落をひとことにする', async () => {
    expect(closingLine('報告です。\n\nログも残しました。\n\n…ふう。')).toBe('…ふう。')
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

  test('上限を超えたら切る', async () => {
    expect(closingLine('あ'.repeat(character.maxLine + 20))?.length).toBe(character.maxLine)
  })

  test('空の返答は null', async () => {
    expect(closingLine('')).toBe(null)
  })
})

describe('moodFor', () => {
  test('character.json の言葉で表情を決める', async () => {
    const { mood, word } = firstRule(0)
    expect(moodFor(`…${word}。`)).toBe(mood)
    expect(moodFor('決めてもらえたら、すぐ動きます。')).toBe('normal')
  })
})

describe('activityFor', () => {
  test('ツール名から作業中のひとことを決める', async () => {
    const first = character.activities[0]
    if (first !== undefined && /^\^\(?Edit/.test(first.tool)) {
      expect(activityFor('Edit')).toBe(first.line)
    }
    expect(activityFor('SomeUnknownTool')).toBe(character.thinkingLine)
  })
})

describe('character', () => {
  test('使う表情の絵がそろっている', async () => {
    for (const mood of ['normal', character.workingMood, character.errorMood, ...character.moods.map(m => m.mood)]) {
      expect(character.svgs[mood]).toBeDefined()
    }
  })
})

test('帯に挨拶を出し、返答が終わるとひとことと表情が変わる', async ($, on) => {
  on('turn.complete', async () => ({ text: '' }))

  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ plugin: 'desktop-pet', surface, ...BAND })
    expect(await ui.find({ type: 'Text', text: character.greeting })).toBeDefined()
    await ui.unmount()
  }

  const { mood, word } = firstRule(0)
  await $.turn.complete({
    answer: `本文です。\n\n${word}。`,
    durationMs: 1000,
    isAborted: false,
    turnId: 't1',
    reason: 'answer',
  })

  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ plugin: 'desktop-pet', surface, ...BAND })
    expect(await ui.find({ type: 'Text', text: `${word}。` })).toBeDefined()
    await ui.unmount()
  }

  const desktop = await $.ui.mount({ plugin: 'desktop-pet', surface: 'desktop', ...BAND })
  expect(await desktop.find({ type: 'Svg', alt: `${character.name}（${mood}）` })).toBeDefined()
  await desktop.unmount()
})
