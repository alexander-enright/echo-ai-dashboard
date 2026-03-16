# Echo - AI Social Dashboard

An AI-powered social media automation tool for X (Twitter). Generate motivational quotes, engage with posts, and track your activity - all from one clean dashboard.

![Echo Dashboard](https://img.shields.io/badge/Echo-AI%20Dashboard-red)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

## Features

- **Quote Generator**: Generate AI-powered motivational quotes or pull from a curated famous quotes collection
- **Comment Generator**: Generate thoughtful comments on any X post using AI
- **Retweet Tool**: Like, retweet, and optionally comment on posts with one click
- **Activity Feed**: Track all your posts, comments, and engagements
- **Topic Selection**: Tailor content for Sports, Entrepreneurship, or General themes

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes (Serverless)
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI GPT-4o-mini
- **Social API**: X (Twitter) API v2
- **Deployment**: Vercel

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/alexenright/echo-ai-dashboard.git
cd echo-ai-dashboard
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Required environment variables:

| Variable | Description | Get From |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API access | [OpenAI Platform](https://platform.openai.com/api-keys) |
| `X_API_KEY` | X API Key | [Twitter Dev Portal](https://developer.twitter.com) |
| `X_API_SECRET` | X API Secret | [Twitter Dev Portal](https://developer.twitter.com) |
| `X_ACCESS_TOKEN` | X Access Token | [Twitter Dev Portal](https://developer.twitter.com) |
| `X_ACCESS_SECRET` | X Access Secret | [Twitter Dev Portal](https://developer.twitter.com) |
| `SUPABASE_URL` | Supabase project URL | [Supabase Dashboard](https://supabase.com) |
| `SUPABASE_ANON_KEY` | Supabase anon key | [Supabase Dashboard](https://supabase.com) |

### 3. Database Setup

1. Create a new project on [Supabase](https://supabase.com)
2. Go to the SQL Editor
3. Run the schema from `scripts/supabase-schema.sql`

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the dashboard.

## Project Structure

```
echo/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── generate-quote/
│   │   ├── generate-comment/
│   │   ├── post-tweet/
│   │   ├── comment-tweet/
│   │   ├── retweet/
│   │   └── activity/
│   ├── page.tsx           # Main dashboard
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── Header.tsx
│   ├── QuoteGenerator.tsx
│   ├── CommentGenerator.tsx
│   ├── RetweetTool.tsx
│   └── ActivityFeed.tsx
├── lib/                   # Utilities
│   ├── supabase.ts       # Database client
│   ├── openai.ts         # AI generation
│   ├── twitter.ts        # X API client
│   └── quotes.json       # Famous quotes dataset
├── types/                 # TypeScript types
├── scripts/               # Setup scripts
│   └── supabase-schema.sql
├── .env.example          # Environment template
├── next.config.js        # Next.js config
├── tailwind.config.ts     # Tailwind config
└── package.json
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/generate-quote` | POST | Generate motivational or famous quotes |
| `/api/generate-comment` | POST | Generate AI comment for a tweet |
| `/api/post-tweet` | POST | Post a tweet to X |
| `/api/comment-tweet` | POST | Reply to a tweet |
| `/api/retweet` | POST | Like, retweet, and optionally comment |
| `/api/activity` | GET | Get recent activity from database |

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repo on [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

```bash
# Or deploy via CLI
npm i -g vercel
vercel --prod
```

## Database Schema

### posts
- `id` (uuid, PK)
- `content` (text)
- `type` (text: motivational/famous)
- `posted_at` (timestamp)
- `tweet_id` (text, nullable)

### comments
- `id` (uuid, PK)
- `tweet_id` (text)
- `comment_text` (text)
- `created_at` (timestamp)

### engagement_logs
- `id` (uuid, PK)
- `tweet_id` (text)
- `action` (text: like, retweet, comment)
- `created_at` (timestamp)

## Security Notes

- All API keys are server-side only (stored in environment variables)
- API routes handle all X/Twitter interactions - never expose credentials client-side
- Consider adding authentication (Supabase Auth) for production use
- Review X API rate limits: [Twitter API Limits](https://developer.twitter.com/en/docs/twitter-api/rate-limits)

## Roadmap

- [ ] Post Scheduler
- [ ] Daily Quote Auto-Generator
- [ ] Character counter for tweets
- [ ] Dark/Light mode toggle
- [ ] Analytics dashboard
- [ ] Multi-account support

## License

MIT License - feel free to use this for your own social media automation!

---

Built with ❤️ by Alex
