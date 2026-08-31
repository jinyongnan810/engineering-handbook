# エンジニアリング・ハンドブック (Engineering Handbook)

https://engineering-handbook-alpha.vercel.app

線形代数、アルゴリズム、統計学、数学などを幅広く網羅した、エンジニアリング学習トピックのための静的ファイルベースのハンドブックです。

各トピックはプレーンなMarkdownファイルで管理されています。サイトはこれらのファイルを読み込み、タグでフィルタリング可能な閲覧しやすいハンドブックとしてレンダリングします。CMSやバックエンド、ブラウザ側での編集機能はありません。

## 前提条件

- Node.js 22 & pnpm ([mise](https://mise.jdx.dev/) を使用している場合は `mise.toml` で設定済み)

## はじめ方

```bash
git clone <repo-url>
cd engineering-handbook
pnpm install
git config core.hooksPath .githooks
pnpm dev
```

フック設定により、`.githooks/pre-commit` にあるトラッキングされたコミット前フックが有効になり、コミットごとに `make lint` が実行されます。

## スクリプト一覧

```bash
pnpm dev        # 開発サーバーの起動
pnpm build      # プロダクションビルド
pnpm preview    # プロダクションビルドのプレビュー
pnpm lint       # リント
pnpm typecheck  # 型チェック
pnpm format     # prettierによるフォーマット
make lint       # フォーマット + リント + 型チェック
```

## コンテンツモデル

トピックのコンテンツは `content/` ディレクトリ配下に配置されています:

```text
content/
  index.json        # トピックのメタデータ
  topics/
    <slug>.md       # 各トピックのMarkdownファイル
```

`content/index.json` の各エントリは1つのトピックを定義します:

- `slug` — トピックのURLパス
- `title` — 表示タイトル
- `tags` — タグのリスト（例: `math`, `algebra`, `statistics`, `algorithms`, `aws`）
- `file` — `content/` からの相対パス

Markdownは、見出し、コードブロック、KaTeX数式、およびMermaidダイアグラムをサポートしています。

## トピックの追加

1. `content/topics/<slug>.md` を作成します。
2. `content/index.json` に対応するエントリを追加します。
3. `pnpm dev` を実行し、ページが正しくレンダリングされることを確認します。

## トピックの削除

1. `content/topics/<slug>.md` を削除します。
2. `content/index.json` から対応するエントリを削除します。

## 実装メモ

- コンテンツは実行時に `import.meta.glob` を介して読み込まれます
- Markdownレンダリングは `src/utils/markdown.tsx` でローカルに実装されています
- サイトは実行時には読み取り専用です。コンテンツの編集はローカルエディタで行ってください
