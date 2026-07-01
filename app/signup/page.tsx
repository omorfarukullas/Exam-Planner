import { signup, signInWithGoogle } from '@/app/login/actions'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'

export default async function SignupPage(props: { searchParams: Promise<{ message: string }> }) {
  const searchParams = await props.searchParams
  return (
    <div className="min-h-screen mesh-bg bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-violet-500 dark:bg-violet-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[120px] opacity-20 dark:opacity-10 animate-float" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-400 dark:bg-cyan-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[120px] opacity-20 dark:opacity-10 animate-float" style={{animationDelay: '1.5s'}} />

      {/* Theme toggle top-right */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-lg neon-glow">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="font-bold text-xl text-foreground">ExamPlanner</span>
          </Link>
          <h1 className="text-3xl font-extrabold text-foreground">Start planning smarter</h1>
          <p className="text-muted dark:text-gray-400 mt-2">Create your free account in seconds</p>
        </div>

        {/* Card */}
        <div className="glass-card p-8 neon-glow">
          <form className="space-y-5">
            <button
              formAction={signInWithGoogle}
              formNoValidate
              className="w-full flex justify-center items-center gap-3 bg-white dark:bg-white/10 border-2 border-gray-200 dark:border-white/10 hover:border-violet-400 dark:hover:border-violet-500/50 text-gray-700 dark:text-gray-200 rounded-2xl px-4 py-3 font-semibold transition-all shadow-sm hover:shadow-md"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign up with Google
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200 dark:border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-[var(--card-bg)] text-muted dark:text-gray-500 font-medium">or sign up with email</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2" htmlFor="fullName">Full Name</label>
              <input className="input-field" type="text" name="fullName" id="fullName" placeholder="John Doe" required />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2" htmlFor="email">Email</label>
              <input className="input-field" type="email" name="email" id="email" placeholder="you@example.com" required />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2" htmlFor="password">Password</label>
              <input className="input-field" type="password" name="password" id="password" placeholder="Min. 8 characters" required />
            </div>

            {searchParams?.message && (
              <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-400 text-sm rounded-2xl">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                </svg>
                {searchParams.message}
              </div>
            )}

            <button formAction={signup} className="btn-primary w-full text-center py-3.5 rounded-2xl text-base">
              Create Account →
            </button>

            <p className="text-xs text-muted dark:text-gray-500 text-center">
              By signing up, you agree to our Terms of Service and Privacy Policy.
            </p>
          </form>

          <p className="text-center text-sm text-muted dark:text-gray-400 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-violet-600 dark:text-violet-400 font-semibold hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
