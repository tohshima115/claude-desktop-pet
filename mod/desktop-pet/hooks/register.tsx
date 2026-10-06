import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

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

// Desktop は、表示している session にだけ画面をつなぐ（別の session に切り替えると離れる）
async function isShownOnDesktop($: EngineInterface): Promise<boolean> {
  try {
    return (await $.session.surfaces()).includes('desktop')
  } catch {
    return false
  }
}

// 通知を出そうとした結果を notify/notify.log に残す（最新の 50 行）。記録に失敗しても止めない
async function logNotify($: EngineInterface, text: string) {
  try {
    const path = `${$.plugin.root}/notify/notify.log`
    const old = (await $.fs.exists(path)) ? (await $.fs.read(path)).split('\n').filter(l => l !== '') : []
    const stamp = new Date(await $.clock.now()).toISOString()
    await $.fs.write(path, [...old, `${stamp} ${text}`].slice(-50).join('\n') + '\n')
  } catch {
    // 記録できなくても、通知や作業には関係しない
  }
}

function notifyArgv($: EngineInterface, args: string[]): string[] {
  return ['powershell.exe', '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', `${$.plugin.root}/notify/notify.ps1`, ...args]
}

// Windows の通知を、キャラのそのときの表情のアイコンで出す。Windows 以外では powershell.exe がなく、何もしない
async function notify($: EngineInterface, body: string, face: Mood) {
  if (!character.notify.enabled) {
    return
  }
  let sessionId = '?'
  try {
    sessionId = await $.session.id()
    // この session を表示していなければ、Claude のウィンドウが前面でも通知する。
    // 表示していれば、Claude のウィンドウが前面かどうかの判断を notify.ps1 に任せる
    const shown = await isShownOnDesktop($)
    const force = shown ? [] : ['-Force']
    const result = await $.process.run(
      notifyArgv($, ['-Body', body, '-Mood', face, '-SessionId', sessionId, '-FallbackTitle', character.name, ...force]),
      { timeoutMs: 15000 },
    )
    const stderr = result.stderr.trim().replace(/\s+/g, ' ').slice(0, 300)
    await logNotify($, `${sessionId.slice(0, 8)} shown=${shown} exit=${result.exitCode}${stderr === '' ? '' : ` stderr=${stderr}`}`)
  } catch (error) {
    await logNotify($, `${sessionId.slice(0, 8)} failed: ${String(error).slice(0, 300)}`)
  }
}

// 送り主「Claude」を先に登録しておく。初めての通知の直前に登録すると、Windows が名前とアイコンを覚え損ねる
async function registerSender($: EngineInterface) {
  if (!character.notify.enabled) {
    return
  }
  try {
    await $.process.run(notifyArgv($, ['-RegisterOnly']), { timeoutMs: 15000 })
  } catch {
    // Windows 以外や、登録できなかったときは何もしない
  }
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    void registerSender($)

    return next(e)
  })

  on('classic.Notification', async ($, e, next) => {
    if (e.notification_type.includes('permission')) {
      const call = character.userCall === '' ? '' : `${character.userCall}、`
      void notify($, `${call}${character.notify.permissionLine}`, 'worried' in character.svgs ? 'worried' : 'normal')
    }

    return next(e)
  })

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
        void notify($, said ?? character.notify.doneLine, said === null ? 'normal' : moodFor(said))
      } else if (e.reason === 'error') {
        await update($, line, () => character.errorLine)
        await update($, mood, () => character.errorMood)
        void notify($, character.errorLine, character.errorMood)
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
