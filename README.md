# Insight Capture Dashboard

A Next.js web dashboard for viewing and managing insights captured via the Insight Capture Chrome Extension.

## Features

- 🔐 User authentication with Supabase
- 📊 View all your captured insights
- 🖼️ Display screenshots and notes
- 🗑️ Delete insights
- 📱 Responsive design with Tailwind CSS

## Tech Stack

- **Frontend:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS
- **Backend:** Supabase (Auth + Database)
- **Language:** JavaScript

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase account with the Insight Capture database configured

### Installation

1. Clone the repository:
```bash
git clone https://github.com/47eilt/insight-capture.git
cd insight-capture
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Deploy to Netlify

1. Push your code to GitHub
2. Import your repository on [Netlify](https://netlify.com)
3. Build command: `npm run build`
4. Publish directory: `.next`
5. Add environment variables
6. Deploy!

## Project Structure

```
insight-capture-dashboard/
├── app/
│   ├── dashboard/
│   │   └── page.js          # Dashboard with insights grid
│   ├── login/
│   │   └── page.js          # Login/Signup page
│   ├── layout.js            # Root layout
│   ├── page.js              # Home page (redirects)
│   └── globals.css          # Global styles
├── lib/
│   └── supabase.js          # Supabase client
├── .env.local               # Environment variables (not committed)
├── .env.local.example       # Example env file
└── package.json
```

## Database Schema

The app expects a `insights` table in Supabase with the following structure:

```sql
create table insights (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  page_title text,
  page_url text,
  screenshot_url text,
  note text,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table insights enable row level security;

-- Policy: Users can only see their own insights
create policy "Users can view own insights"
  on insights for select
  using (auth.uid() = user_id);

-- Policy: Users can insert their own insights
create policy "Users can insert own insights"
  on insights for insert
  with check (auth.uid() = user_id);

-- Policy: Users can delete their own insights
create policy "Users can delete own insights"
  on insights for delete
  using (auth.uid() = user_id);
```

## Related Projects

- [Insight Capture Chrome Extension](../insight-capture-extension-FINAL) - The Chrome extension that captures insights

## License

MIT

## Author

Max ([@47eilt](https://github.com/47eilt))
