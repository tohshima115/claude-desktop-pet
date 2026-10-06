// characters/simple-pet から tools/build-character.mjs で生成。手で編集しない
import type { Character } from '../types'

export const character: Character = {
  "name": "ぷに",
  "label": "ぷに",
  "userCall": "",
  "color": "#5fb8a3",
  "size": 72,
  "maxLine": 60,
  "greeting": "今日もいっしょにがんばろうね。",
  "errorLine": "あわわ、エラーで止まっちゃった…",
  "thinkingLine": "かんがえ中…",
  "notify": {
    "enabled": true,
    "doneLine": "おわったよ。",
    "permissionLine": "たしかめてほしいことがあるよ。"
  },
  "activities": [
    {
      "tool": "^(Edit|Write|NotebookEdit)$",
      "line": "かきかき中…"
    },
    {
      "tool": "^(Read|Grep|Glob)$",
      "line": "よみよみ中…"
    },
    {
      "tool": "^(Bash|PowerShell)$",
      "line": "コマンド実行中…"
    },
    {
      "tool": "^(WebSearch|WebFetch)$",
      "line": "しらべもの中…"
    },
    {
      "tool": "^(Agent|Workflow)$",
      "line": "なかまと手分け中…"
    },
    {
      "tool": "^mcp__",
      "line": "そとのサービスとお話し中…"
    }
  ],
  "workingMood": "serious",
  "errorMood": "troubled",
  "moods": [
    {
      "mood": "troubled",
      "words": [
        "すみません",
        "ごめん",
        "失敗",
        "エラー",
        "だめでした",
        "あわわ"
      ]
    },
    {
      "mood": "worried",
      "words": [
        "休んで",
        "無理しないで",
        "心配",
        "大丈夫",
        "疲れ"
      ]
    },
    {
      "mood": "happy",
      "words": [
        "やった",
        "よかった",
        "できました",
        "できた",
        "通りました",
        "ありがとう"
      ]
    }
  ],
  "svgs": {
    "happy": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><g stroke=\"#2f3a40\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M20 52L8 30\" fill=\"none\" stroke-width=\"6\"/><path d=\"M80 52L92 30\" fill=\"none\" stroke-width=\"6\"/><ellipse cx=\"38\" cy=\"88\" rx=\"8\" ry=\"4\" fill=\"#6fbfab\"/><ellipse cx=\"62\" cy=\"88\" rx=\"8\" ry=\"4\" fill=\"#6fbfab\"/><path d=\"M50 22C74 22 86 44 86 64C86 80 72 88 50 88C28 88 14 80 14 64C14 44 26 22 50 22Z\" fill=\"#8fd6c4\"/><path d=\"M30 36C34 30 40 27 45 27\" fill=\"none\" stroke=\"#ffffff\" stroke-width=\"4\"/><path d=\"M33 55Q38 49 43 55\" fill=\"none\"/><path d=\"M57 55Q62 49 67 55\" fill=\"none\"/><ellipse cx=\"30\" cy=\"64\" rx=\"5\" ry=\"3\" fill=\"#f4a6a6\" stroke=\"none\"/><ellipse cx=\"70\" cy=\"64\" rx=\"5\" ry=\"3\" fill=\"#f4a6a6\" stroke=\"none\"/><path d=\"M43 62Q50 74 57 62Z\" fill=\"#e0605e\"/><path d=\"M14 9L16.1 13.9L21 16L16.1 18.1L14 23L11.9 18.1L7 16L11.9 13.9Z\" fill=\"#ffd34d\" stroke=\"none\"/><path d=\"M86 8L87.8 12.2L92 14L87.8 15.8L86 20L84.2 15.8L80 14L84.2 12.2Z\" fill=\"#ffd34d\" stroke=\"none\"/><path d=\"M50 3L51.5 6.5L55 8L51.5 9.5L50 13L48.5 9.5L45 8L48.5 6.5Z\" fill=\"#ffd34d\" stroke=\"none\"/></g></svg>",
    "normal": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><g stroke=\"#2f3a40\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><ellipse cx=\"38\" cy=\"88\" rx=\"8\" ry=\"4\" fill=\"#6fbfab\"/><ellipse cx=\"62\" cy=\"88\" rx=\"8\" ry=\"4\" fill=\"#6fbfab\"/><path d=\"M50 22C74 22 86 44 86 64C86 80 72 88 50 88C28 88 14 80 14 64C14 44 26 22 50 22Z\" fill=\"#8fd6c4\"/><path d=\"M30 36C34 30 40 27 45 27\" fill=\"none\" stroke=\"#ffffff\" stroke-width=\"4\"/><circle cx=\"38\" cy=\"54\" r=\"3.5\" fill=\"#2f3a40\" stroke=\"none\"/><circle cx=\"62\" cy=\"54\" r=\"3.5\" fill=\"#2f3a40\" stroke=\"none\"/><ellipse cx=\"30\" cy=\"64\" rx=\"5\" ry=\"3\" fill=\"#f4a6a6\" stroke=\"none\"/><ellipse cx=\"70\" cy=\"64\" rx=\"5\" ry=\"3\" fill=\"#f4a6a6\" stroke=\"none\"/><path d=\"M45 64Q50 68 55 64\" fill=\"none\"/></g></svg>",
    "serious": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><g stroke=\"#2f3a40\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><ellipse cx=\"38\" cy=\"88\" rx=\"8\" ry=\"4\" fill=\"#6fbfab\"/><ellipse cx=\"62\" cy=\"88\" rx=\"8\" ry=\"4\" fill=\"#6fbfab\"/><path d=\"M50 22C74 22 86 44 86 64C86 80 72 88 50 88C28 88 14 80 14 64C14 44 26 22 50 22Z\" fill=\"#8fd6c4\"/><path d=\"M30 36C34 30 40 27 45 27\" fill=\"none\" stroke=\"#ffffff\" stroke-width=\"4\"/><circle cx=\"38\" cy=\"54\" r=\"9\" fill=\"#ffffff\" fill-opacity=\"0.6\"/><circle cx=\"62\" cy=\"54\" r=\"9\" fill=\"#ffffff\" fill-opacity=\"0.6\"/><path d=\"M47 54L53 54\" fill=\"none\"/><circle cx=\"38\" cy=\"55\" r=\"3\" fill=\"#2f3a40\" stroke=\"none\"/><circle cx=\"62\" cy=\"55\" r=\"3\" fill=\"#2f3a40\" stroke=\"none\"/><path d=\"M31 41L44 44\" fill=\"none\"/><path d=\"M69 41L56 44\" fill=\"none\"/><path d=\"M45 68L55 68\" fill=\"none\"/><path d=\"M57 48L61 46\" fill=\"none\" stroke=\"#ffffff\" stroke-width=\"2\"/></g></svg>",
    "troubled": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><g stroke=\"#2f3a40\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M78 50L90 34L82 26\" fill=\"none\" stroke-width=\"6\"/><ellipse cx=\"38\" cy=\"88\" rx=\"8\" ry=\"4\" fill=\"#6fbfab\"/><ellipse cx=\"62\" cy=\"88\" rx=\"8\" ry=\"4\" fill=\"#6fbfab\"/><path d=\"M50 22C74 22 86 44 86 64C86 80 72 88 50 88C28 88 14 80 14 64C14 44 26 22 50 22Z\" fill=\"#8fd6c4\"/><path d=\"M30 36C34 30 40 27 45 27\" fill=\"none\" stroke=\"#ffffff\" stroke-width=\"4\"/><circle cx=\"38\" cy=\"54\" r=\"3.5\" fill=\"#2f3a40\" stroke=\"none\"/><circle cx=\"62\" cy=\"54\" r=\"3.5\" fill=\"#2f3a40\" stroke=\"none\"/><ellipse cx=\"30\" cy=\"64\" rx=\"5\" ry=\"3\" fill=\"#f4a6a6\" stroke=\"none\"/><ellipse cx=\"70\" cy=\"64\" rx=\"5\" ry=\"3\" fill=\"#f4a6a6\" stroke=\"none\"/><path d=\"M33 46L43 44\" fill=\"none\"/><path d=\"M57 44L67 46\" fill=\"none\"/><path d=\"M42 66Q46 62 50 66Q54 70 58 66\" fill=\"none\"/><path d=\"M24 26Q18 36 24 40Q30 36 24 26Z\" fill=\"#8ec5ff\"/></g></svg>",
    "worried": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><g stroke=\"#2f3a40\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\" transform=\"rotate(-12 50 80)\"><ellipse cx=\"38\" cy=\"88\" rx=\"8\" ry=\"4\" fill=\"#6fbfab\"/><ellipse cx=\"62\" cy=\"88\" rx=\"8\" ry=\"4\" fill=\"#6fbfab\"/><path d=\"M50 22C74 22 86 44 86 64C86 80 72 88 50 88C28 88 14 80 14 64C14 44 26 22 50 22Z\" fill=\"#8fd6c4\"/><path d=\"M30 36C34 30 40 27 45 27\" fill=\"none\" stroke=\"#ffffff\" stroke-width=\"4\"/><circle cx=\"38\" cy=\"55\" r=\"4.5\" fill=\"#2f3a40\" stroke=\"none\"/><circle cx=\"62\" cy=\"55\" r=\"4.5\" fill=\"#2f3a40\" stroke=\"none\"/><circle cx=\"39.5\" cy=\"53.5\" r=\"1.5\" fill=\"#ffffff\" stroke=\"none\"/><circle cx=\"63.5\" cy=\"53.5\" r=\"1.5\" fill=\"#ffffff\" stroke=\"none\"/><path d=\"M31 47Q36 46 43 42\" fill=\"none\"/><path d=\"M69 47Q64 46 57 42\" fill=\"none\"/><ellipse cx=\"30\" cy=\"64\" rx=\"5\" ry=\"3\" fill=\"#f4a6a6\" stroke=\"none\"/><ellipse cx=\"70\" cy=\"64\" rx=\"5\" ry=\"3\" fill=\"#f4a6a6\" stroke=\"none\"/><path d=\"M46 69Q50 66 54 69\" fill=\"none\"/></g></svg>"
  }
}
