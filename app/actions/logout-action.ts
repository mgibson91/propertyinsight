"use server";

import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { headers } from "next/headers";

export async function logoutAction() {
  const supabase = createServerActionClient({ cookies });
  await supabase.auth.signOut();

  const heads = headers();

  const pathname = heads.get("next-url");

  // console.log(heads)
  // console.log(pathname)
  return redirect(pathname ? `${pathname}/` : '/');
}
