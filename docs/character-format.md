# character.json の書き方

`characters/<キャラ>/character.json` に、キャラごとの設定を書きます。例は [characters/simple-pet/character.json](../characters/simple-pet/character.json) です。

| 項目 | 中身 | 例 |
|---|---|---|
| `name` | キャラのフルネーム。絵の代替テキストに使う | `"ぷに"` |
| `label` | ターミナルで、ひとことの前に出す短い名前 | `"ぷに"` |
| `userCall` | 挨拶で呼びかける名前。空なら呼びかけない | `"山田さん"` |
| `color` | 吹き出しの枠と、ターミナルの名前の色 | `"#5fb8a3"` |
| `size` | 絵の大きさ（CSS ピクセル）。帯の中では 72 前後が見やすい | `72` |
| `maxLine` | 吹き出しに出す最大の文字数。超えたら切って「…」をつける | `60` |
| `greeting` | 最初に出す挨拶 | `"今日もいっしょにがんばろうね。"` |
| `errorLine` | 返答がエラーで止まったときのひとこと | `"あわわ、エラーで止まっちゃった…"` |
| `thinkingLine` | 入力を送った直後と、`activities` に当てはまらないツールのときのひとこと | `"かんがえ中…"` |
| `activities` | ツール名の正規表現と、そのツールを使っている間のひとこと。上から順に調べる | 下を参照 |
| `workingMood` | 作業中の表情 | `"serious"` |
| `errorMood` | エラーで止まったときの表情 | `"troubled"` |
| `moods` | 表情と、その表情にする言葉。返答の最後のひとことに言葉が含まれていたら、その表情にする。上にあるものほど優先し、どれにも当てはまらなければ `normal` | 下を参照 |

```json
"activities": [
  { "tool": "^(Edit|Write|NotebookEdit)$", "line": "かきかき中…" },
  { "tool": "^mcp__", "line": "そとのサービスとお話し中…" }
],
"moods": [
  { "mood": "troubled", "words": ["すみません", "エラー"] },
  { "mood": "happy", "words": ["やった", "できました"] }
]
```

## 絵

表情ごとに `svg/<表情>.svg` を置きます。

- `normal.svg` は必須です
- `workingMood`、`errorMood`、`moods` で名前を出した表情の絵も必須です。足りないと `tools/build-character.mjs` が止まります
- 1枚 131,072 文字以内にします。Claude Code の `Svg` 要素の上限です
- 背景は透明にします。Desktop のテーマが明るくても暗くても浮かないように、輪郭線をはっきりさせると見やすくなります
- 帯の中では 72px ほどに縮むので、顔の中だけの違いは見分けにくくなります。腕の位置や体の傾きなど、形でも区別できるようにすると分かりやすくなります
