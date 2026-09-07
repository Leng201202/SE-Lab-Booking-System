import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AuthPanel() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName, role },
          },
        });
        if (error) throw error;
        toast.success("Account created — you can start booking.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google sign-in failed");
      return;
    }
  }

  return (
    <div className="mx-auto mt-10 w-full max-w-md panel p-7">
      <p className="text-[11px] uppercase tracking-[0.2em] text-ink/50">SE Lab access</p>
      <h2 className="mt-2 text-2xl">
        {mode === "signin" ? "Sign in to book" : "Create your lab account"}
      </h2>
      <p className="mt-1 text-[13px] text-ink/55">
        Teachers and students share one calendar — every booking is visible to everyone.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {mode === "signup" && (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="A. Rivera"
              />
            </div>
            <div className="space-y-1.5">
              <Label>I am a</Label>
              <div className="grid grid-cols-2 gap-2">
                {(["student", "teacher"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`rounded-xl border px-3 py-2 text-sm capitalize transition-colors ${
                      role === r
                        ? "border-sun bg-sun/15 font-semibold text-ember"
                        : "border-ink/15 text-ink/60 hover:bg-ink/5"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@university.edu"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        <Button type="submit" disabled={busy} className="w-full rounded-xl">
          {mode === "signin" ? "Sign in" : "Create account"}
        </Button>
      </form>

      <Button
        type="button"
        variant="outline"
        onClick={handleGoogle}
        className="mt-3 w-full rounded-xl border-ink/15 bg-transparent"
      >
        Continue with Google
      </Button>

      <button
        type="button"
        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        className="mt-5 w-full text-[13px] text-ink/55 underline-offset-4 hover:underline"
      >
        {mode === "signin" ? "No account yet? Create one" : "Already registered? Sign in"}
      </button>
    </div>
  );
}
