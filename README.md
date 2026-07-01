# Exam Planner 🎓

Exam Planner is an AI-powered study companion designed to help students track their upcoming exams, intelligently plan their study sessions, and stay accountable with friends. 

Built with **Next.js 16 (App Router)**, **Supabase**, and the **Groq AI API** (Llama 3.3).

## Features ✨
- **Subject Tracking**: Keep track of mid-terms, finals, quizzes, and assignments. Add your syllabus topics and estimate your daily availability.
- **AI Study Plans**: Generates a day-by-day study schedule automatically based on your exam date, daily hours, and topics using the Groq API.
- **Auto-Reshuffling**: If you miss a few sessions, simply click "Reshuffle" and the AI will adapt your remaining study items across the remaining days.
- **Social Accountability**: Add friends and view a leaderboard of active study streaks.
- **Shared Courses**: If you and a friend add a subject with the exact same name, it automatically creates a shared course indicator, gently nudging you to study together.

## Tech Stack 🛠️
- **Framework**: [Next.js](https://nextjs.org/) (React, App Router, Server Actions)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL, Row-Level Security)
- **AI Engine**: [Groq](https://groq.com/) (Llama 3.3 70B Versatile)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: Custom UI with `react-hot-toast` for elegant notifications.

## Getting Started 🚀

### 1. Clone the repository
```bash
git clone https://github.com/omorfarukullas/Exam-Planner.git
cd Exam-Planner
npm install
```

### 2. Environment Variables
Create a `.env.local` file in the root of the project with the following keys:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Groq AI
GROQ_API_KEY=your_groq_api_key
```

### 3. Database Setup (Supabase)
Navigate to your Supabase project's SQL Editor and run the migration files in order:
1. `supabase/migrations/001_init.sql` (Auth & Profiles)
2. `supabase/migrations/002_subjects.sql` (Subjects table)
3. `supabase/migrations/003_study_plans.sql` (Study plans table)
4. `supabase/migrations/004_social_layer.sql` (Friendships, Study sessions & Streaks)

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.