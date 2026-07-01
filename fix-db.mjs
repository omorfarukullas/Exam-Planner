import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const env = fs.readFileSync('.env.local', 'utf-8')
const getEnv = (key) => env.split('\n').find(l => l.startsWith(key))?.split('=')[1]

const url = getEnv('NEXT_PUBLIC_SUPABASE_URL')
const key = getEnv('SUPABASE_SERVICE_ROLE_KEY')

const supabase = createClient(url, key)

async function main() {
  const { data: users } = await supabase.auth.admin.listUsers()
  for (const user of users.users) {
    console.log(`Checking user: ${user.email} (ID: ${user.id})`)
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (!profile) {
      console.log('Profile missing. Inserting...')
      const { error } = await supabase.from('profiles').insert({
        id: user.id,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        avatar_url: user.user_metadata?.avatar_url || ''
      })
      if (error) {
        console.error('Failed to insert profile:', error)
      } else {
        console.log('Profile inserted successfully.')
      }
    } else {
      console.log('Profile exists.')
    }
  }
}
main()
