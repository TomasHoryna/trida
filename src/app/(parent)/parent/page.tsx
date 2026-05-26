import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ParentPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto max-w-2xl py-12">
      <h1 className="text-2xl font-semibold">Vítej, {user.email}!</h1>
      <p className="mt-4 text-muted-foreground">
        Phase 1 Day 1 — Supabase Auth funguje. Day 3 sem přidáme správu dětí.
      </p>
      <form action="/auth/logout" method="POST" className="mt-6">
        <button type="submit" className="rounded-md border px-4 py-2 transition hover:bg-muted">
          Odhlásit se
        </button>
      </form>
    </div>
  );
}
