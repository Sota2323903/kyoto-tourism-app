# Kyoto Compass

京都観光支援Webアプリ。Next.js App Router、TypeScript、Tailwind CSS、Prisma、PostgreSQL/PostGIS、Auth.js (NextAuth.js) を使用します。

## Database setup

1. PostgreSQLとPostGISをローカルに用意する
2. `.env.example`を`.env`へコピーし、`DATABASE_URL`と`AUTH_SECRET`を設定する（Next.js用に`.env.local`を併用する場合は同じ値を設定する）
3. Prisma Clientを生成する

```bash
npm run db:generate
```

初回のデータベース作成後にマイグレーションを作成します。PostGIS拡張は、生成された最初のマイグレーションの先頭で次を実行するようにしてください。

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

```bash
npm run db:migrate
```

本番環境では、コミット済みのマイグレーションを次のコマンドで適用します。

```bash
npm run db:deploy
```

`Spot.location`はPostGISの`geography(Point, 4326)`型です。Prismaでは`Unsupported`として定義し、空間検索などのPostGIS固有処理はSQLクエリで実装します。

スポット機能は既存の`Region`、単一言語の`Spot.name`/`description`、文字列の`Spot.category`を残したまま拡張しています。既存データを壊さずに、`SpotTranslation`、`Category`、`CategoryTranslation`、`SpotImage`、SNSリンク、営業時間・料金JSONを追加する方式です。既存データの移行が完了するまで、旧カラムをフォールバックとして利用できます。

公開スポットAPI：

```text
GET /api/spots?page=1&pageSize=20&language=ja&q=寺&categoryId=...
```

距離検索とCSV取り込みのロジックは、それぞれ`src/services/spot-service.ts`の`getNearbyPublishedSpots`、`src/services/spot-import-service.ts`の`importSpotsFromCsv`に分離しています。CSV入力は緯度経度とHTTPSの外部リンクを検証し、1行ごとの失敗を結果として返します。

## Application architecture

- `src/services/`: Prismaアクセスとビジネスロジック。Next.jsのAPI RouteやServer Actionから呼び出し、将来のLambda移行でも再利用する
- `src/lib/prisma.ts`: Prisma Clientの共有インスタンス
- `src/lib/auth.ts`: Auth.jsのJWTセッション設定とRole同期
- `middleware.ts`: ゲスト公開ルート、認証必須ルート、管理者専用ルートの境界

現時点のルート方針：

- ゲスト利用可: `/`, `/spots`, `/api/auth/*`
- ログイン必須: `/account/*`, `/favorites/*`, `/saved-routes/*`
- `ADMIN`または`SUPER_ADMIN`のみ: `/admin/*`

Auth.jsはローカル検証用のCredentialsプロバイダーを実装しています。初期シードで作成されるローカル管理者は`admin@example.com`、パスワードは`KyotoCompass-local-2026!`です。本番環境では必ず変更し、OAuth等の本番向けプロバイダーを追加してください。

監査ログは`src/services/audit-log-service.ts`の`createAuditLog`を共通入口とし、Auth.jsのログイン・ログアウトイベントを自動記録します。管理機能の作成・更新・削除では、各サービス処理の成功後に`AUDIT_ACTIONS.ADMIN_OPERATION`を使って記録します。トークン、パスワード、OAuthアクセストークンなどの秘密値はメタデータへ渡さないでください。

## EC2 deployment

`.github/workflows/deploy.yml`は`main`へのPushでAmazon Linux 2023のEC2へSSH接続し、`npm ci`、`prisma migrate deploy`、`npm run build`、PM2の再起動を順に実行します。EC2には`/home/ec2-user/kyoto-app`、Node.js、npm、PM2、Gitを事前に用意し、本番用`.env`はEC2上だけに配置してください。

GitHub ActionsのSecretsには`EC2_HOST`、`EC2_SSH_KEY`を登録します。`DATABASE_URL`や`NEXTAUTH_SECRET`はGitHubへ登録せず、EC2の環境変数として管理します。既存環境で`AUTH_SECRET`を使用している場合は、`NEXTAUTH_SECRET`への移行が完了するまでミドルウェアのみ互換利用できます。

## Development

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
