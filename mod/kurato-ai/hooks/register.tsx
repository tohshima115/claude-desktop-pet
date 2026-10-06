import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import { chibiSvgs } from './chibi'
import type { Mood } from '../types'

const line = atom({ plugin: 'kurato-ai', key: 'line' } as const, null)
const activity = atom({ plugin: 'kurato-ai', key: 'activity' } as const, null)
const mood = atom({ plugin: 'kurato-ai', key: 'mood' } as const, 'normal')

// 呼びかける相手の名前。自分の名前に変える
const USER_NAME = ''
const GREETING = `${USER_NAME === '' ? '' : `${USER_NAME}さん、`}今日もよろしくお願いします。`
const MAX_LINE = 60

// 返答の最後の段落を、吹き出し用の一言にする。表、箇条書き、コード、出典は飛ばす。
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

  return plain.length > MAX_LINE ? `${plain.slice(0, MAX_LINE - 1)}…` : plain
}

// 締めの一言から表情を決める。上にあるものほど優先する。
export const moodFor = (said: string): Mood => {
  if (/すみません|ごめんなさい|失敗|落ちました|ずれ|エラー|だめでした|出ませんでした|うう/.test(said)) return 'troubled'
  if (/休んで|無理しないで|心配|大丈夫ですか|疲れ|夜更かし|遅い時間/.test(said)) return 'worried'
  if (/やった|よかった|通りました|できました|出ました|うれしい|えへへ|ありがとう|完璧/.test(said)) return 'happy'
  return 'normal'
}

// 作業中に吹き出しへ出す一言。ツール名から決める。
export const activityFor = (tool: string): string => {
  if (/^(Edit|Write|NotebookEdit)$/.test(tool)) return '書いてます…'
  if (/^(Read|Grep|Glob)$/.test(tool)) return '読んでます…'
  if (/^(Bash|PowerShell)$/.test(tool)) return 'コマンドを動かしてます…'
  if (/^(WebSearch|WebFetch)$/.test(tool)) return '調べてます…'
  if (/^(Agent|Workflow)$/.test(tool)) return '手分けして進めてます…'
  if (/generate|to_svg|upscale/i.test(tool)) return '生成してます…'
  if (/^mcp__/.test(tool)) return '外のサービスとやりとりしてます…'
  return '考えてます…'
}

export const register: Register = on => {
  on('prompt.submit', async ($, e, next) => {
    await update($, activity, () => '考えてます…')

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
        await update($, line, () => 'うう…エラーで止まっちゃいました。')
        await update($, mood, () => 'troubled')
      }
    }

    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey) {
      return next(e)
    }

    const doing = e.props.isWorking ? await read($, activity) : null
    const said = doing ?? (await read($, line)) ?? GREETING
    const face: Mood = doing !== null ? 'serious' : await read($, mood)

    if (e.surface !== 'desktop') {
      const { Box, Text } = $.ui.resolve(e)

      return (
        <Box>
          <Text color="#d47d64" bold>あい </Text>
          <Text dimColor={doing !== null} wrap="truncate-end">{said}</Text>
        </Box>
      )
    }

    const { Box, Svg, Text } = $.ui.resolve(e)

    return (
      <Box flexDirection="row" alignItems="center" gap={1}>
        <Svg source={chibiSvgs[face]} alt={`倉戸あい（${face}）`} width={72} height={72} />
        <Box borderStyle="round" borderColor="#d47d64" paddingX={1} flexShrink={1}>
          <Text dimColor={doing !== null} wrap="wrap">{said}</Text>
        </Box>
      </Box>
    )
  })
}
