# 作り方

自分のキャラを決めて、絵を作り、Claude Desktop の Code タブに出すまでの手順です。見本キャラの倉戸あいを作ったときの記録を例にしています。Claude Code 2.1.289（2026年10月）で確かめました。

## 1. キャラの話し方を決める

先に、Claude にどう話してほしいかを `~/.claude/CLAUDE.md` に書きます。テンプレートは [examples/CLAUDE.md-snippet.md](../examples/CLAUDE.md-snippet.md) です。

倉戸あいを作ったときに分かったことです。

- **語尾を変えるだけでは、普段の Claude とほとんど変わらない。** 丁寧な後輩キャラの「〜です！」は、もともとの Claude の丁寧語と同じに見える。キャラを立てるには、性格や相手との関係まで書く
- **好きなキャラを並べると、方向性が見つかりやすい。** 倉戸あいでは、好きなキャラを何人か調べて並べたところ「有能で落ち着いているが、相手にだけ見せる顔がある」という共通点があった。そこから「真面目な研究者肌の相棒で、相手を気遣う」性格にした
- **報告の本文までキャラで書くと読みにくい。** 本文は淡々と書き、感情は最後のひとことに集めると、読みやすさとキャラの両方が保てる。このひとことが、そのまま吹き出しに出る

## 2. 絵を作る

表情ごとに1枚ずつ、5枚ほど用意します。描き方は2通りあります。

### 手で描く

見本の `characters/simple-pet/` は、SVG を手で書いています。丸い体に目と口をつけるくらいの簡単な絵なら、1枚 1KB ほどで済み、上限を気にしなくて済みます。

### AI で作る

倉戸あいは Magnific（Seedream 5 Pro）で作りました。

1. **方向性の違う案をいくつか作る。** 倉戸あいでは、研究者、気遣いのお姉さん、オペレーター、エンジニアの4案を作った
2. **気に入った案を参照画像に入れて、色違いを作る。** 参照を入れると、顔とポーズを保ったまま色だけ変えられる
3. **決まった案を参照に入れて、ちびキャラを作る。** 帯の中では 72px ほどに縮むので、頭の大きいちびキャラのほうが表情が見える。あとでベクター化しやすいように、プロンプトで次のことを指定する
   - flat colors only, no gradients
   - bold clean dark outlines
   - pure white background
4. **ちびキャラを参照に入れて、表情の差分を作る。** 「同じキャラ、同じ服、同じ画風で」と指示すると、揃った差分ができる

### 表情だけでなく、ポーズも変える

72px に縮むと、**顔の中だけの違いは見分けられません**。倉戸あいでは最初に顔だけ変えた差分を作りましたが、帯に出すと区別がつかず、ポーズも変えて作り直しました。

| 表情 | 倉戸あいのポーズ | ぷにのポーズ |
|---|---|---|
| normal | タブレットを持って立つ | そのまま |
| happy | タブレットを頭の上に掲げてバンザイ、キラキラ | 両手を上げる、キラキラ |
| worried | タブレットを胸に抱えて、首をかしげる | 体を傾ける、眉を下げる |
| troubled | 片手で頭をかく、大きな汗のしずく | 片手を頭に、汗のしずく |
| serious | 人差し指で眼鏡を上げる | 眼鏡をかけて、眉を上げる |

## 3. SVG にする

Claude Desktop の Code タブで mod が使える絵の要素は `Svg` だけです。PNG を出す `Image` はターミナル専用なので、AI で作った絵はベクターに変換します。

1. ベクター化する。倉戸あいでは Magnific の images_to_svg を使った
2. 変換結果は 16 万〜21 万文字あり、`Svg` の上限 131,072 文字を超える。`tools/optimize-svg.mjs` で縮める

   ```sh
   node tools/optimize-svg.mjs in.svg characters/<キャラ>/svg/happy.svg
   ```

   次のことをしています。
   - 座標を整数に丸め、viewBox を半分にする（`--scale=1` で元の大きさのまま）
   - `transform="translate(0,0)"` など意味のない記述を消す
   - `rgb(...)` を `#rrggbb` にする
   - 背景の白い全面矩形を消して、透明にする（`--keep-bg` で残す）

3. 縮めると 8 万〜10 万文字になる。ブラウザで暗い背景と明るい背景に描いて、崩れや白い塊が残っていないか確かめる

## 4. キャラを組み込む

`characters/<キャラ>/` に `character.json` と `svg/` を置いて、組み込みます。`character.json` の項目は [character-format.md](character-format.md) にあります。

```sh
node tools/build-character.mjs characters/<キャラ>
claude plugin test mod/desktop-pet
```

`build-character.mjs` は、足りない絵や上限を超える絵があれば止まります。

`character.json` の `moods` に書く言葉は、CLAUDE.md で決めたひとことの例と合わせておきます。ひとことに含まれる言葉で表情が決まるからです。

## 5. mod の仕組み

`mod/desktop-pet/hooks/register.tsx` は、Claude Code の mod の仕組みを次のように使っています。書き方は Claude Code に入っている plugin-authoring スキルに従いました。

| 仕組み | 使い方 |
|---|---|
| `ui.render` の `AbovePrompt` | 入力欄の上の帯を描く。`e.surface` が `desktop` なら `Svg` と吹き出し、それ以外は文字だけ |
| `turn.complete` | 返答が終わったとき。`e.answer` から最後の段落を取り出して吹き出しに入れ、表情を決める |
| `tool.call` | ツールが呼ばれたとき。ツール名から作業中のひとことを決める |
| `prompt.submit` | 入力を送ったとき。`thinkingLine` にする |
| `atom` / `read` / `update` | 吹き出しの文、作業中のひとこと、表情を持つ。値を変えると帯が描き直される |

吹き出しに出す文は、返答の最後の段落です。表、箇条書き、コード、出典は飛ばし、「？」で終わる確認の質問も出しません。`maxLine` を超えたら切ります。

## 6. Windows の通知を差し替える

Claude Desktop の通知は、アプリ自身が作っていて、文を変える設定も、mod から書き換える口もありません。そこで、Desktop の通知は Windows の設定で切り、mod から自分で通知を出すことにしました。

| 仕組み | 使い方 |
|---|---|
| `turn.complete` | 返答が終わったら、吹き出しと同じひとことと表情で通知する |
| `classic.Notification` | `notification_type` に `permission` を含むとき（権限の確認待ち）に通知する |
| `$.process.run` | `powershell.exe` で `notify/notify.ps1` を動かす |
| `$.session.surfaces()` | `desktop` が入っていれば、その session は今 Desktop に表示されている |
| `session.start` | 送り主の登録を先に済ませる |

`notify.ps1` は Windows PowerShell 5.1 の WinRT の通知 API で通知を出します。送り主は `HKCU\Software\Classes\AppUserModelId\<ID>` に名前とアイコンを書いて登録します。session のタイトルは、会話の記録（`~/.claude/projects/*/<session ID>.jsonl`）の最後の `custom-title` の行から読みます。

### つまずいたところ

- **Desktop は、表示している session にだけ画面をつなぐ。** 別の session に切り替えると `session.detach` が、戻ると `session.attach` が届く。これで「その session を見ているか」が分かる
- **送り主を作った直後に通知を出すと、Windows が名前とアイコンを覚え損ねる。** session ごとに送り主を作ったところ、名前が ID のまま、アイコンなしで出た。一度覚えた送り主は、あとで名前を変えても反映されにくい。送り主は1つにして、session の開始時に先に登録し、session のタイトルは通知の1行目に入れることにした
- **スクリプトは UTF-8（BOM つき）で保存する。** Windows PowerShell 5.1 は BOM のない UTF-8 を正しく読めず、日本語が化ける
- **PowerShell 7（`pwsh`）では WinRT の型が読めない。** `powershell.exe` を使う
- **Claude のロゴは、Claude Desktop のパッケージの `assets\Square44x44Logo.targetsize-256_altform-unplated.png` にある。** リポジトリには入れず、`Get-AppxPackage` で場所を調べて、登録のときにコピーする
- **テストでは `session.id` などの答えを `{ value }` で返す。** 文字列をそのまま返すと「result object ではない」と言われて無視される

## 7. つまずいたところ（mod 全般）

### session の途中で読み込んだ mod が Desktop に出ない

ホットリロードで session の途中に mod を読み込んだところ、帯も toast も出ませんでした。mod 自身にファイルへ記録を書かせて調べると、次のことが分かりました。

- `session.start` は呼ばれていて、mod は動いていた
- `ui.render` の `AbovePrompt` が一度も呼ばれていなかった
- `$.session.surfaces()` が `[]` で、描画する画面が1つもつながっていなかった

`settings.json` の `env` に `CLAUDE_CODE_PLUGIN_DIRS` を書いて、**新しい session を開く**と、`surface=desktop` で描画が呼ばれて表示されました。

### `$` を関数に渡すと読み込みに失敗する

`$`（エンジンの interface）を関数に渡すときは、その関数をファイルの一番外側に `function` で宣言する必要があります。`register` の中で `const log = async ($, text) => ...` と書くと、読み込みの検証で止まります。

### 状態の型定義は1ファイルで完結させる

`$.state` に置く値の型（`types/index.d.ts` の `PluginState`）から別ファイルの型を import すると、`claude plugin validate` が「宣言されていない」と判定しました。型は `types/index.d.ts` の中に直接書きます。

### テストではイベントの終端を自分で用意する

`claude plugin test` の中で `$.turn.complete(...)` を呼ぶと、「その下で答えるものがない」と失敗します。テスト側で `on('turn.complete', async () => ({ text: '' }))` を登録しておきます。テスト環境ではファイルの読み書きや `$.session.surfaces()` も使えないので、記録のような補助の処理は失敗しても止まらないようにしておきます。

## 費用の目安（倉戸あいの場合）

Magnific のクレジットで、画像の生成が1枚 100、ベクター化が1枚 150 でした。

| 作業 | クレジット |
|---|---|
| デザイン案 4枚、色違い 4枚、ちびキャラ 1枚 | 900 |
| ちびキャラのベクター化 1枚 | 150 |
| 顔だけの表情差分 4枚＋ベクター化 4枚 | 1,000 |
| ポーズつきの差分 4枚＋ベクター化 4枚 | 1,000 |
| 合計 | 3,050 |

顔だけの差分は小さいと見分けられず使わなかったので、最初からポーズつきの差分を作れば 2,050 クレジットで済みます。
