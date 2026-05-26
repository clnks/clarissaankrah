# Supabase setup — Journal & Drafts

The Journal page works **out of the box** with the hardcoded seed entries.
Once you complete the steps below, the page will:

- Read entries live from your Supabase database (public — visible to anyone)
- Let you sign in as admin (only your email) to add / delete entries
- Upload attached PDFs to Supabase Storage

You can do this in about 15 minutes. Free tier is more than enough.

---

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → sign up (free).
2. Click **New project**.
3. Pick a name (e.g. `clarissa-portfolio`), a strong database password (save it somewhere safe — you won't need it for the site, but you will if you ever debug the DB), and a region close to you (London/Frankfurt for UK).
4. Wait \~2 minutes for the project to provision.

## 2. Run the schema SQL

In your Supabase project: **SQL Editor → New query**, paste this, click **Run**:

```sql
-- Journal entries
create table journal_entries (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('made', 'studied', 'read', 'attended')),
  title text not null,
  entry_date text not null,   -- YYYY-MM
  area text not null,
  source text,
  note text,
  link text,
  pdf_path text,
  pdf_name text,
  created_at timestamptz default now()
);

alter table journal_entries enable row level security;

-- Anyone can READ entries (public journal)
create policy "Public read" on journal_entries
  for select using (true);

-- Only your account can INSERT / UPDATE / DELETE.
-- IMPORTANT: replace the email below with YOUR email before running.
create policy "Admin write" on journal_entries
  for all
  to authenticated
  using (auth.jwt() ->> 'email' = 'YOUR_EMAIL_HERE@example.com')
  with check (auth.jwt() ->> 'email' = 'YOUR_EMAIL_HERE@example.com');
```

> ⚠️ Replace `YOUR_EMAIL_HERE@example.com` with **your real email** before running — this is what locks down writes so visitors can't post fake entries.

## 3. Create the PDF storage bucket

1. **Storage** (left sidebar) → **New bucket**.
2. Name it exactly `journal-pdfs` (no quotes, no caps).
3. ✅ Tick **Public bucket** (so visitors can read attached PDFs).
4. Click **Create bucket**.

Then **SQL Editor → New query** again, paste & run:

```sql
-- Only your account can upload / delete files in journal-pdfs.
create policy "Admin upload" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'journal-pdfs'
    and auth.jwt() ->> 'email' = 'YOUR_EMAIL_HERE@example.com'
  );

create policy "Admin delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'journal-pdfs'
    and auth.jwt() ->> 'email' = 'YOUR_EMAIL_HERE@example.com'
  );
```

Same warning: replace the email.

## 4. Create your admin user

1. **Authentication → Users → Add user → Create new user**.
2. Use the same email you put in the SQL above.
3. Pick a strong password — this is what you'll use to sign into the Journal admin.
4. Set **Auto-confirm user** to ON so you can sign in immediately.

## 5. Grab your API credentials

1. **Project Settings (gear icon) → API**.
2. Copy two values:
   - **Project URL** (looks like `https://xxxxxxxx.supabase.co`)
   - **anon / public** key (long string starting with `eyJ…`)

> The `anon` key is safe to expose in a public site — it can only do what your Row Level Security policies allow.

## 6. Paste them into `journal-config.js`

Open `journal-config.js` in this project. Replace the placeholder values:

```js
window.JOURNAL_CONFIG = {
  supabaseUrl:     "https://YOUR_PROJECT.supabase.co",
  supabaseAnonKey: "eyJ...your-anon-key...",
  adminEmail:      "you@example.com",
  storageBucket:   "journal-pdfs"
};
```

Save the file. **Commit and push to git.**

## 7. Use it

- Visit `journal.html` → you'll see entries (seed for now, your live ones once you add some).
- Click the tiny **"Admin"** link in the bottom-right corner.
- Sign in with your admin email + password.
- The **+ Add a journal entry** button appears. Fill it in, attach a PDF, hit save.
- Anyone visiting the page now sees that entry instantly.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| Page shows seed entries only, never your live ones | `journal-config.js` not filled in, or wrong URL/key |
| "Failed to load entries" warning | Supabase project paused (free tier sleeps after a week of no traffic) — log into Supabase dashboard to wake it |
| Sign-in says "Invalid login credentials" | Wrong password, or you forgot to auto-confirm the user in step 4 |
| Sign-in works but Add Entry says "permission denied" | The email in your SQL policies doesn't exactly match your auth user email — re-run the SQL with the correct email |
| PDF upload fails | The Storage bucket isn't named exactly `journal-pdfs`, or you skipped the storage policies SQL |

---

## When you're ready to apply the same to Writing drafts

Once the journal is working, ask me to wire the same pattern into `writing.html`. The schema and admin login will be reused — Writing just gets its own table.
