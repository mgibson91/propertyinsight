import Messages from './messages';
import { Button, TextFieldInput } from '@radix-ui/themes';
import Link from 'next/link';
import { PasswordField } from "@/shared/password-field";
import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import { createClient } from '@/utils/supabase/server'

export default function Login() {
  const signIn = async (formData: FormData) => {
    'use server'

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return redirect('/login?message=Could not authenticate user')
    }

    return redirect('/dashboard')
  }

  const signUp = async (formData: FormData) => {
    'use server'

    const origin = headers().get('origin')
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
      },
    })

    if (error) {
      return redirect('/login?message=Could not authenticate user')
    }

    return redirect('/login?message=Check email to continue sign in process')
  }

  return (
    <div className="flex flex-auto items-center justify-center">
      <div className="flex flex-col items-center gap-5">
        <img className="h-24" src="/tradescan-logo.png" alt="Logo" />

        <form
          action={signIn}
          className="flex-1 flex flex-col w-[300px] justify-center gap-2 text-foreground"
          method="post"
        >
          <label className="text-md" htmlFor="email">
            Email
          </label>

          <TextFieldInput size='3' type="email" name="email" placeholder="you@example.com" required />

          <label className="text-md" htmlFor="password">
            Password
          </label>

          <PasswordField name="password" />

          <div className="flex justify-end">
            <Link href={'/password/reset'} className={'hover:text-accent-text transition-all duration-200'}>
              Forgot password?
            </Link>
          </div>

          <div className="flex items-center gap-3 mt-3">
            <Button size="3" className="flex-auto" formAction={signUp} color={'gray'}>
              Sign Up
            </Button>

            <Button size="3" className="flex-auto">
              Log In
            </Button>
          </div>

          <Messages />
        </form>
      </div>
    </div>
  );
}
