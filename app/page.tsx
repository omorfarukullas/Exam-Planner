import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function Home() {
  return (
    <div className="min-h-screen mesh-bg overflow-hidden relative bg-background">
      {/* Animated background orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500 dark:bg-violet-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[120px] opacity-20 dark:opacity-10 animate-float" />
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-cyan-400 dark:bg-cyan-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[120px] opacity-20 dark:opacity-10 animate-float" style={{animationDelay: '1s'}} />
      <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-pink-400 dark:bg-pink-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[120px] opacity-20 dark:opacity-10 animate-float" style={{animationDelay: '2s'}} />

      {/* Navigation */}
      <nav className="relative z-10 flex justify-between items-center px-6 md:px-12 py-5">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center shadow-lg neon-glow">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <span className="font-bold text-lg text-foreground">ExamPlanner</span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/login" className="text-muted dark:text-gray-400 font-medium hover:text-violet-600 dark:hover:text-violet-400 transition-colors px-4 py-2 text-sm">
            Log in
          </Link>
          <Link href="/signup" className="btn-primary text-sm px-5 py-2.5">
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex flex-col items-center text-center px-6 pt-20 pb-16">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 glass-card !rounded-full text-violet-600 dark:text-violet-400 text-sm font-medium px-5 py-2.5 mb-8 animate-border-glow">
          <span className="w-2 h-2 bg-violet-500 rounded-full animate-pulse" />
          Built for Students · Free to use
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-extrabold text-foreground leading-tight max-w-3xl">
          Ace Every Exam,{' '}
          <span className="gradient-text-animated">Stress-Free</span>
        </h1>

        <p className="mt-6 text-lg md:text-xl text-muted dark:text-gray-400 max-w-xl leading-relaxed">
          Track deadlines, organize your syllabus, and watch live countdowns to every exam — all in one beautifully smart planner.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-10">
          <Link href="/signup" className="btn-primary px-10 py-4 rounded-2xl text-base">
            Start Planning Free →
          </Link>
          <Link href="/login" className="btn-secondary flex items-center justify-center rounded-2xl px-10 py-4 text-base">
            Log In
          </Link>
        </div>

        {/* Social proof */}
        <div className="flex items-center gap-3 mt-8">
          <div className="flex -space-x-2">
            {['from-violet-500 to-indigo-600','from-purple-500 to-fuchsia-600','from-pink-500 to-rose-600','from-cyan-500 to-blue-600','from-amber-500 to-orange-600'].map((c, i) => (
              <div key={i} className={`w-8 h-8 bg-gradient-to-br ${c} rounded-full border-2 border-background flex items-center justify-center text-white text-xs font-bold shadow-lg`}>
                {['A','B','C','D','E'][i]}
              </div>
            ))}
          </div>
          <p className="text-sm text-muted dark:text-gray-500">
            <span className="font-semibold text-foreground">500+ students</span> planning smarter
          </p>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-3 mt-14">
          {[
            { icon: '⏱️', label: 'Live Countdowns' },
            { icon: '🤖', label: 'AI Brainstorming' },
            { icon: '💬', label: 'Study Messenger' },
            { icon: '🏆', label: 'Leaderboards' },
            { icon: '🔒', label: 'Secure & Private' },
          ].map(({ icon, label }) => (
            <span
              key={label}
              className="flex items-center gap-2 glass-card !rounded-full text-foreground text-sm font-medium px-4 py-2 !border-[var(--card-border)]"
            >
              {icon} {label}
            </span>
          ))}
        </div>
      </main>

      {/* How It Works Section */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-24">
        <h2 className="text-center text-2xl font-bold text-foreground mb-10">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { step: '01', icon: '➕', title: 'Add Subjects', desc: 'Enter your subject name, exam date, and any notes or syllabus topics.' },
            { step: '02', icon: '📊', title: 'Track Countdowns', desc: 'Your dashboard shows live countdowns, sorted by the closest exam date.' },
            { step: '03', icon: '🎯', title: 'Study Smarter', desc: 'AI brainstorms your topics and color-coded urgency highlights priorities.' },
          ].map(({ step, icon, title, desc }) => (
            <div key={step} className="glass-card p-6 text-center group hover:neon-glow transition-all">
              <div className="text-xs font-bold text-violet-500 dark:text-violet-400 tracking-widest mb-3">{step}</div>
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{icon}</div>
              <h3 className="font-bold text-foreground mb-2">{title}</h3>
              <p className="text-sm text-muted dark:text-gray-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Final CTA */}
        <div className="mt-14 text-center">
          <div className="inline-block glass-card px-10 py-8 neon-glow">
            <h3 className="text-2xl font-extrabold text-foreground mb-2">Ready to start planning?</h3>
            <p className="text-muted dark:text-gray-400 mb-6 text-sm">It takes less than a minute to set up.</p>
            <Link href="/signup" className="btn-primary px-8 py-3.5 rounded-2xl text-base inline-block">
              Create Free Account →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-center py-6 text-sm text-muted dark:text-gray-500 border-t border-[var(--card-border)]">
        © {new Date().getFullYear()} ExamPlanner. Made with ❤️ for students.
      </footer>
    </div>
  )
}
