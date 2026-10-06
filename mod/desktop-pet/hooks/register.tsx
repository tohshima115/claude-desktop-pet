import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Mood } from '../types'
import { character } from './character'

const line = atom({ plugin: 'desktop-pet', key: 'line' } as const, null)
const activity = atom({ plugin: 'desktop-pet', key: 'activity' } as const, null)
const mood = atom({ plugin: 'desktop-pet', key: 'mood' } as const, 'normal')

const greeting = character.userCall === '' ? character.greeting : `${character.userCall}、${character.greeting}`
const activityRules = character.activities.map(({ tool, line }) => ({ pattern: new RegExp(tool), line }))

// 返答の最後の段落を、吹き出し用のひとことにする。表、箇条書き、コード、出典は飛ばす。
export const closingLine = (answer: string): string | null => {
  const paragraphs = answer
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p !== '')
    .filter(p => !/^(```|\||- |\* |\d+\. |#|Sources:)/.test(p))

  const last = paragraphs.at(-1)
  // 確認の質問は本文で読んでほしいので、吹き出しには出さない
  if (last === undefined || /[?？]$/.test(last)) {
    return null
  }

  const plain = last
    .replace(/^>\s?/gm, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_`]/g, '')
    .replace(/\s*\n\s*/g, ' ')

  return plain.length > character.maxLine ? `${plain.slice(0, character.maxLine - 1)}…` : plain
}

// ひとことに含まれる言葉から表情を決める。character.json の moods の上にあるものほど優先する。
export const moodFor = (said: string): Mood =>
  character.moods.find(({ words }) => words.some(word => said.includes(word)))?.mood ?? 'normal'

// 作業中に吹き出しへ出すひとこと。ツール名から決める。
export const activityFor = (tool: string): string =>
  activityRules.find(({ pattern }) => pattern.test(tool))?.line ?? character.thinkingLine

export const register: Register = on => {
  on('prompt.submit', async ($, e, next) => {
    await update($, activity, () => character.thinkingLine)

    return next(e)
  })

  on('tool.call', async ($, e, next) => {
    await update($, activity, () => activityFor(e.tool))

    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    if (e.agentId === undefined) {
      await update($, activity, () => null)
      if (e.reason === 'answer') {
        const said = closingLine(e.answer)
        if (said !== null) {
          await update($, line, () => said)
          await update($, mood, () => moodFor(said))
        }
      } else if (e.reason === 'error') {
        await update($, line, () => character.errorLine)
        await update($, mood, () => character.errorMood)
      }
    }

    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey) {
      return next(e)
    }

    const doing = e.props.isWorking ? await read($, activity) : null
    const said = doing ?? (await read($, line)) ?? greeting
    const face = doing !== null ? character.workingMood : await read($, mood)

    if (e.surface !== 'desktop') {
      const { Box, Text } = $.ui.resolve(e)

      return (
        <Box>
          <Text color={character.color} bold>{character.label} </Text>
          <Text dimColor={doing !== null} wrap="truncate-end">{said}</Text>
        </Box>
      )
    }

    const { Box, Svg, Text } = $.ui.resolve(e)
    const svg = character.svgs[face] ?? character.svgs['normal'] ?? ''

    return (
      <Box flexDirection="row" alignItems="center" gap={1}>
        <Svg source={svg} alt={`${character.name}（${face}）`} width={character.size} height={character.size} />
        <Box borderStyle="round" borderColor={character.color} paddingX={1} flexShrink={1}>
          <Text dimColor={doing !== null} wrap="wrap">{said}</Text>
        </Box>
      </Box>
    )
  })
}
