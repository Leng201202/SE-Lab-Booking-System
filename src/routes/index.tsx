import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AuthPanel } from "@/components/AuthPanel";
import { LabCalendar } from "@/components/LabCalendar";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SE Lab Computer Booking — Sections 9:00 to 20:00" },
      {
        name: "description",
        content:
          "Book one of 10 SE lab computers in 2-hour sections. Teachers and students share one live calendar of every reservation.",
      },
      { property: "og:title", content: "SE Lab Computer Booking" },
      {
        property: "og:description",
        content: "Reserve a lab computer by 2-hour section. All bookings visible to everyone.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-sun font-display text-[15px] font-bold text-white">
        S
      </span>
      <div>
        <h1 className="text-[30px] leading-none">SE Lab Booking</h1>
        <p className="mt-1.5 text-[11px] uppercase tracking-[0.22em] text-ink/50">
          Computer booking · by section
        </p>
      </div>
    </div>
  );
}

function Index() {
  const { user, loading } = useAuth();

  const profileQuery = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name,role")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const name = profileQuery.data?.full_name || user?.email?.split("@")[0] || "";
  const initials =
    name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "SE";

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center px-5">
        <Brand />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="grid min-h-screen place-items-center px-5 py-8">
        <div className="w-full max-w-md">
          <div className="mb-2 flex justify-center">
            <Brand />
          </div>
          <p className="mt-4 text-center text-sm text-ink/55">
            Sign in to see live availability and book a computer for the hours you need.
          </p>
          <AuthPanel />
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-8">
      <header className="flex flex-wrap items-start justify-between gap-6">
        <Brand />

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-[0.18em] text-ink/45">
              {profileQuery.data?.role === "teacher" ? "Teacher" : "Student"}
            </p>
            <p className="text-sm font-semibold">{name}</p>
          </div>
          <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-sun to-ember font-display text-xs font-bold text-white">
            {initials}
          </div>
          <Button variant="ghost" className="rounded-xl" onClick={() => supabase.auth.signOut()}>
            Sign out
          </Button>
        </div>
      </header>

      <LabCalendar user={user} />
    </main>
  );
}
