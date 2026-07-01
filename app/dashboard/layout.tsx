import { logout } from '@/app/login/actions'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { ThemeToggle } from '@/components/ThemeToggle'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* 
        TOP NAVIGATION BAR
        Clean, standard, recognizable top bar.
      */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-6xl mx-auto flex h-16 items-center px-4 sm:px-8">
          <div className="mr-8 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl">
              E
            </div>
            <span className="font-bold text-xl hidden sm:inline-block">ExamPlanner</span>
          </div>

          <nav className="flex items-center space-x-6 text-sm font-medium flex-1">
            <Link href="/dashboard" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Dashboard
            </Link>
            <Link href="/dashboard/add" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Add Subject
            </Link>
            <Link href="/dashboard/friends" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Friends
            </Link>
            <Link href="/dashboard/messages" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Messages
            </Link>
          </nav>

          <div className="flex flex-1 items-center justify-end space-x-4">
            <ThemeToggle />
            <form action={logout}>
              <button 
                title="Logout"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 w-full max-w-6xl mx-auto p-4 sm:p-8">
        {children}
      </main>
    </div>
  )
}
