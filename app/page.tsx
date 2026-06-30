import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen mesh-bg overflow-hidden relative">
      {/* Animated background orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" />
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{animationDelay: '1s'}} />
      <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{animationDelay: '2s'}} />

      {/* Navigation */}
      <nav className="relative z-10 flex justify-between items-center px-6 md:px-12 py-5">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <span className="font-bold text-lg text-gray-900">ExamPlanner</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-gray-600 font-medium hover:text-indigo-600 transition-colors px-4 py-2 text-sm">
            Log in
          </Link>
          <Link href="/signup" className="btn-primary text-sm px-5 py-2.5">
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero — centered */}
      <main className="relative z-10 flex flex-col items-center text-center px-6 pt-20 pb-16">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/80 border border-indigo-200 text-indigo-700 text-sm font-medium px-4 py-2 rounded-full shadow-sm mb-8">
          <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
          Built for Students · Free to use
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-tight max-w-3xl">
          Ace Every Exam,{' '}
          <span className="gradient-text">Stress-Free</span>
        </h1>

        <p className="mt-6 text-lg md:text-xl text-gray-500 max-w-xl leading-relaxed">
          Track deadlines, organize your syllabus, and watch live countdowns to every exam — all in one beautifully simple planner.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-10">
          <Link
            href="/signup"
            className="btn-primary px-10 py-4 rounded-2xl text-base"
          >
            Start Planning Free →
          </Link>
          <Link
            href="/login"
            className="flex items-center justify-center text-gray-700 font-semibold bg-white border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 rounded-2xl px-10 py-4 transition-all text-base"
          >
            Log In
          </Link>
        </div>

        {/* Social proof */}
        <div className="flex items-center gap-3 mt-8">
          <div className="flex -space-x-2">
            {['bg-indigo-500','bg-purple-500','bg-pink-500','bg-blue-500','bg-rose-400'].map((c, i) => (
              <div key={i} className={`w-8 h-8 ${c} rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold`}>
                {['A','B','C','D','E'][i]}
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-gray-700">500+ students</span> planning smarter
          </p>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-3 mt-14">
          {[
            { icon: '⏱️', label: 'Live Countdowns' },
            { icon: '🚦', label: 'Urgency Color Codes' },
            { icon: '📒', label: 'Syllabus Notes' },
            { icon: '📱', label: 'Mobile Friendly' },
            { icon: '🔒', label: 'Secure & Private' },
          ].map(({ icon, label }) => (
            <span
              key={label}
              className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 text-sm font-medium px-4 py-2 rounded-full shadow-sm"
            >
              {icon} {label}
            </span>
          ))}
        </div>
      </main>

      {/* How It Works Section */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-24">
        <h2 className="text-center text-2xl font-bold text-gray-800 mb-10">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { step: '01', icon: '➕', title: 'Add Subjects', desc: 'Enter your subject name, exam date, and any notes or syllabus topics.' },
            { step: '02', icon: '📊', title: 'Track Countdowns', desc: 'Your dashboard shows live countdowns, sorted by the closest exam date.' },
            { step: '03', icon: '🎯', title: 'Study Smarter', desc: 'Color-coded urgency lets you see at a glance what needs immediate attention.' },
          ].map(({ step, icon, title, desc }) => (
            <div key={step} className="bg-white/70 border border-white rounded-3xl p-6 text-center shadow-sm backdrop-blur-sm">
              <div className="text-xs font-bold text-indigo-400 tracking-widest mb-3">{step}</div>
              <div className="text-4xl mb-3">{icon}</div>
              <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Final CTA */}
        <div className="mt-14 text-center">
          <div className="inline-block bg-white/80 border border-indigo-100 rounded-3xl px-10 py-8 shadow-lg backdrop-blur-sm">
            <h3 className="text-2xl font-extrabold text-gray-900 mb-2">Ready to start planning?</h3>
            <p className="text-gray-500 mb-6 text-sm">It takes less than a minute to set up.</p>
            <Link href="/signup" className="btn-primary px-8 py-3.5 rounded-2xl text-base inline-block">
              Create Free Account →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-center py-6 text-sm text-gray-400 border-t border-gray-100">
        © {new Date().getFullYear()} ExamPlanner. Made with ❤️ for students.
      </footer>
    </div>
  )
}
