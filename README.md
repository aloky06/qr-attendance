# 📱 QR Attendance System

Home office ke liye smart QR-based attendance system. Har **60 second** mein automatically QR code change hota hai. HMAC-SHA256 se secured.

## ✨ Features

- 🔄 **Auto-rotating QR** — Har minute naya QR code, replay attack impossible
- ✅ **Check-in + Check-out** — Pehla scan = check-in, doosra scan = check-out
- 📊 **Admin Dashboard** — Live QR display, attendance records, employee management
- 👥 **Multi-employee** — Unlimited employees add kar sakte ho
- 📅 **Daily Reports** — Date-wise attendance dekhna
- 🔒 **Secure** — HMAC token, no fake entries possible
- ☁️ **Vercel + Supabase** — Free mein deploy hota hai

---

## 🚀 Step-by-Step Setup

### Step 1 — Supabase Project Banao (Free)

1. [supabase.com](https://supabase.com) pe jaao aur **New Project** banao
2. Project name, password note karo
3. Project create hone ke baad **Settings → API** mein jaao
4. Yeh values copy karo:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

### Step 2 — Database Tables Banao

1. Supabase Dashboard → **SQL Editor** → **New Query**
2. `lib/schema.sql` file ka poora content paste karo
3. **Run** button dabao
4. "Success" aayega — tables ban gayi!

### Step 3 — Local Setup

```bash
# Repo clone karo
git clone https://github.com/YOUR_USERNAME/qr-attendance.git
cd qr-attendance

# Dependencies install karo
npm install

# Environment file banao
cp .env.local.example .env.local
```

Phir `.env.local` file kholo aur apni values fill karo:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
ADMIN_SECRET=koi_bhi_strong_secret_yahan_likho
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

```bash
# Development server start karo
npm run dev
```

Browser mein kholo: `http://localhost:3000`

---

### Step 4 — GitHub pe Push Karo

```bash
git init
git add .
git commit -m "Initial commit - QR Attendance System"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/qr-attendance.git
git push -u origin main
```

---

### Step 5 — Vercel pe Deploy Karo (Free)

1. [vercel.com](https://vercel.com) pe jaao → **New Project**
2. Apna GitHub repo import karo
3. **Environment Variables** section mein yeh sab add karo:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `ADMIN_SECRET` | Koi bhi strong secret |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` |

4. **Deploy** button dabao!
5. Deploy hone ke baad `NEXT_PUBLIC_APP_URL` ko actual Vercel URL se update karo

---

## 📖 Usage — Kaise Use Karein

### Admin (Office Screen pe)
1. `/admin` page kholo
2. Password daalo (default: `admin123`)
3. QR code screen pe show hoga — yeh har minute change hoga
4. **Employees tab** mein nayi employees add karo
5. **Attendance tab** mein daily records dekho

### Employee (Apne Phone se)
1. Office screen pe dikhne wala QR scan karo (camera app ya QR reader se)
2. Link khulega — apna naam search karo
3. **Attendance Lagao** button dabao
4. Pehli baar = Check-in ✅
5. Wapas scan karo = Check-out ✅

---

## 🔧 Admin Password Change Karna

`app/admin/page.tsx` mein line dhundo:
```js
const adminPass = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123'
```

Vercel mein `NEXT_PUBLIC_ADMIN_PASSWORD` environment variable add karo apne password ke saath.

---

## 🗂️ Project Structure

```
qr-attendance/
├── app/
│   ├── page.tsx              # Home page
│   ├── admin/page.tsx        # Admin dashboard
│   ├── attendance/page.tsx   # Employee attendance marking
│   └── api/
│       ├── generate-qr/      # QR token generation
│       ├── mark-attendance/  # Check-in / Check-out logic
│       ├── employees/        # Employee CRUD
│       └── reports/          # Attendance reports
├── lib/
│   ├── supabase.ts          # Database client
│   ├── qr-utils.ts          # HMAC token logic
│   └── schema.sql           # Database tables
└── .env.local.example       # Environment variables template
```

---

## 🛡️ Security

- QR token = `HMAC-SHA256(ADMIN_SECRET, "YYYY-MM-DD HH:MM")`
- Har minute token change hota hai — screenshot wala QR kaam nahi karta
- 2-minute grace window for slow network
- Employee ID UUID based — guessable nahi

## 📞 Support

Koi problem aaye toh issues raise karo!
