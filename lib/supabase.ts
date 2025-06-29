import { MMKV } from 'react-native-mmkv'
import { createClient } from '@supabase/supabase-js'

const storage = new MMKV()
const supabaseUrl = "https://okbcbegemffjnnbpusby.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rYmNiZWdlbWZmam5uYnB1c2J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMwNjU3MjcsImV4cCI6MjA0ODY0MTcyN30.xV5jRu4ZxKxGv5A3n2YjnAKgbeEdxcPWcSHFzk7t-Wc"
interface MMKVStorage {
 getItem: (key: string) => string | null
 setItem: (key: string, value: string) => void
 removeItem: (key: string) => void
}

const mmkvStorage: MMKVStorage = {
 getItem: (key) => storage.getString(key),
 setItem: (key, value) => storage.set(key, value),
 removeItem: (key) => storage.delete(key)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
 auth: {
   storage: mmkvStorage,
   autoRefreshToken: true,
   persistSession: true,
   detectSessionInUrl: false,
 },
})

export { supabase }