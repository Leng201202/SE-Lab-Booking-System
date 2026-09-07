import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const OPEN_HOUR = 9;
export const CLOSE_HOUR = 20;
export const HOURS = Array.from({ length: CLOSE_HOUR - OPEN_HOUR }, (_, i) => OPEN_HOUR + i);
export const COMPUTERS = Array.from({ length: 10 }, (_, i) => i + 1);

type Booking = {
  id: string;
  user_id: string;
  computer_id: number;
  booking_date: string;
  start_hour: number;
  end_hour: number;
  mode: "onsite" | "remote";
  purpose: string;
};

type Profile = { id: string; full_name: string; role: "teacher" | "student" };

export function toDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

function label(hour: number) {
  return `${String(hour).padStart(2, "0")}:00`;
}

function formatDay(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y!, m! - 1, d!).toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function shiftDay(key: string, delta: number) {
  const [y, m, d] = key.split("-").map(Number);
  const dt = new Date(y!, m! - 1, d! + delta);
  return toDateKey(dt);
}

export function LabCalendar({ user }: { user: User | null }) {
  const queryClient = useQueryClient();
  // Set on the client only: the server's date can differ from the visitor's timezone.
  const [date, setDate] = useState("");
  useEffect(() => {
    setDate(toDateKey(new Date()));
  }, []);
  const [target, setTarget] = useState<{ computer: number; hour: number } | null>(null);
  const [purpose, setPurpose] = useState("");
  const [startHour, setStartHour] = useState(OPEN_HOUR);
  const [endHour, setEndHour] = useState(OPEN_HOUR + 1);
  const [mode, setMode] = useState<"onsite" | "remote">("onsite");

  const bookingsQuery = useQuery({
    enabled: !!date,
    queryKey: ["bookings", date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("id,user_id,computer_id,booking_date,start_hour,end_hour,mode,purpose")
        .eq("booking_date", date);
      if (error) throw error;
      return (data ?? []) as Booking[];
    },
  });

  const profilesQuery = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("id,full_name,role");
      if (error) throw error;
      return (data ?? []) as Profile[];
    },
  });

  const profileById = useMemo(() => {
    const map = new Map<string, Profile>();
    (profilesQuery.data ?? []).forEach((p) => map.set(p.id, p));
    return map;
  }, [profilesQuery.data]);

  const bookings = bookingsQuery.data ?? [];

  const bookingAt = useMemo(() => {
    const map = new Map<string, Booking>();
    bookings.forEach((b) => {
      for (let h = b.start_hour; h < b.end_hour; h++) map.set(`${b.computer_id}-${h}`, b);
    });
    return map;
  }, [bookings]);

  const bookedHours = bookings.reduce((sum, b) => sum + (b.end_hour - b.start_hour), 0);
  const totalHours = COMPUTERS.length * HOURS.length;

  const openTarget = (computer: number, hour: number) => {
    setTarget({ computer, hour });
    setPurpose("");
    setMode("onsite");
    setStartHour(hour);
    setEndHour(Math.min(hour + 2, CLOSE_HOUR));
  };

  const createBooking = useMutation({
    mutationFn: async (vars: {
      computer: number;
      start: number;
      end: number;
      mode: "onsite" | "remote";
      purpose: string;
    }) => {
      const { error } = await supabase.from("bookings").insert({
        user_id: user!.id,
        computer_id: vars.computer,
        booking_date: date,
        start_hour: vars.start,
        end_hour: vars.end,
        mode: vars.mode,
        purpose: vars.purpose,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Computer booked");
      setTarget(null);
      setPurpose("");
      queryClient.invalidateQueries({ queryKey: ["bookings", date] });
    },
    onError: (e: unknown) =>
      toast.error(e instanceof Error ? e.message : "That time range is already taken"),
  });

  const cancelBooking = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("bookings").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Booking cancelled");
      setTarget(null);
      queryClient.invalidateQueries({ queryKey: ["bookings", date] });
    },
    onError: () => toast.error("Could not cancel this booking"),
  });

  const selected = target ? bookingAt.get(`${target.computer}-${target.hour}`) : undefined;
  const selectedProfile = selected ? profileById.get(selected.user_id) : undefined;
  const rangeInvalid = endHour <= startHour;

  return (
    <>
      <div className="mt-7 grid grid-cols-12 gap-3">
        <div className="col-span-12 panel p-5 md:col-span-7">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-[0.16em] text-ink/50">
              Timetable for
            </span>
            <span className="rounded-full bg-sage/10 px-2.5 py-1 text-[11px] font-medium text-sage">
              Live · visible to all
            </span>
          </div>
          <h2 className="mt-2 text-xl">{date ? formatDay(date) : "Today"}</h2>
          <p className="text-[13px] text-ink/55">
            {bookedHours} of {totalHours} computer-hours booked · choose your own hours
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              className="rounded-xl border-ink/15 bg-transparent"
              onClick={() => setDate(shiftDay(date, -1))}
            >
              Previous day
            </Button>
            <Input
              type="date"
              value={date}
              onChange={(e) => e.target.value && setDate(e.target.value)}
              className="w-[10.5rem] rounded-xl bg-white/70"
            />
            <Button
              variant="outline"
              className="rounded-xl border-ink/15 bg-transparent"
              onClick={() => setDate(shiftDay(date, 1))}
            >
              Next day
            </Button>
            <Button
              variant="ghost"
              className="rounded-xl"
              onClick={() => setDate(toDateKey(new Date()))}
            >
              Today
            </Button>
          </div>
        </div>

        <div
          className="col-span-12 rounded-2xl p-5 md:col-span-5"
          style={{
            background: "linear-gradient(135deg, var(--sun), var(--ember))",
            boxShadow: "0 22px 44px -22px oklch(0.6 0.16 45 / 0.55)",
          }}
        >
          <p className="text-[11px] uppercase tracking-[0.18em] text-white/70">Lab hours</p>
          <p className="mt-2 font-display text-3xl leading-none text-white">09:00 – 20:00</p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-white/15 px-3 py-2">
              <p className="text-lg font-semibold text-white">10</p>
              <p className="text-[11px] text-white/70">computers</p>
            </div>
            <div className="rounded-xl bg-white/15 px-3 py-2">
              <p className="text-lg font-semibold text-white">{totalHours - bookedHours}</p>
              <p className="text-[11px] text-white/70">hours free</p>
            </div>
            <div className="rounded-xl bg-white/15 px-3 py-2">
              <p className="text-lg font-semibold text-white">{bookings.length}</p>
              <p className="text-[11px] text-white/70">bookings</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto rounded-2xl border border-white/70 bg-white/55 shadow-[0_22px_44px_-30px_oklch(0.55_0.14_50/0.4)]">
        <div className="min-w-[900px]">
          <div className="grid grid-cols-[86px_repeat(10,1fr)] border-b border-ink/10 text-center text-[11px] uppercase tracking-[0.1em] text-ink/50">
            <div className="py-3 pl-4 text-left">Time</div>
            {COMPUTERS.map((c) => (
              <div key={c} className="py-3">
                PC {String(c).padStart(2, "0")}
              </div>
            ))}
          </div>

          {HOURS.map((hour, idx) => (
            <div
              key={hour}
              className={`grid grid-cols-[86px_repeat(10,1fr)] ${
                idx < HOURS.length - 1 ? "border-b border-ink/10" : ""
              }`}
            >
              <div className="flex items-center py-3 pl-4">
                <span className="text-sm font-semibold">{label(hour)}</span>
                <span className="ml-1 text-[10px] text-ink/40">–{hour + 1}</span>
              </div>
              {COMPUTERS.map((computer) => {
                const booking = bookingAt.get(`${computer}-${hour}`);
                const profile = booking ? profileById.get(booking.user_id) : undefined;
                const isTeacher = profile?.role === "teacher";
                const isStart = booking?.start_hour === hour;
                return (
                  <div key={computer} className="p-1">
                    <button
                      type="button"
                      onClick={() => openTarget(computer, hour)}
                      className={`flex h-full min-h-[44px] w-full flex-col justify-center rounded-lg px-2 py-1 text-left transition-colors ${
                        booking
                          ? isTeacher
                            ? "border border-sage/25 bg-sage/15"
                            : "border border-ember/25 bg-ember/15"
                          : "border border-dashed border-ink/20 hover:bg-sun/10"
                      }`}
                    >
                      {booking ? (
                        isStart ? (
                          <>
                            <span
                              className={`truncate text-[11px] font-semibold ${isTeacher ? "text-sage" : "text-ember"}`}
                            >
                              {profile?.full_name || "Lab user"}
                            </span>
                            <span
                              className={`truncate text-[10px] ${isTeacher ? "text-sage/80" : "text-ember/80"}`}
                            >
                              {label(booking.start_hour)}–{label(booking.end_hour)} ·{" "}
                              {booking.mode === "remote" ? "Remote" : "Onsite"}
                            </span>
                          </>
                        ) : (
                          <span
                            className={`text-[10px] ${isTeacher ? "text-sage/70" : "text-ember/70"}`}
                          >
                            ⋯ continues
                          </span>
                        )
                      ) : (
                        <span className="w-full text-center text-[11px] text-ink/40">Open</span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-5 text-[12px] text-ink/60">
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-sage/70" />
          Teacher
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-ember/70" />
          Student
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded border border-dashed border-ink/40" />
          Available — tap to book
        </span>
      </div>

      <Dialog open={target !== null} onOpenChange={(open) => !open && setTarget(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display">
              {selected ? "Booking details" : "Book this computer"}
            </DialogTitle>
            <DialogDescription>
              {target &&
                `PC ${String(target.computer).padStart(2, "0")}${date ? ` · ${formatDay(date)}` : ""}`}
            </DialogDescription>
          </DialogHeader>

          {selected ? (
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-ink/50">Booked by </span>
                <span className="font-semibold">{selectedProfile?.full_name || "Lab user"}</span>{" "}
                <span className="capitalize text-ink/50">
                  ({selectedProfile?.role ?? "student"})
                </span>
              </p>
              <p>
                <span className="text-ink/50">Time: </span>
                {label(selected.start_hour)} – {label(selected.end_hour)} (
                {selected.end_hour - selected.start_hour}h)
              </p>
              <p>
                <span className="text-ink/50">Usage: </span>
                {selected.mode === "remote" ? "Remote" : "Onsite"}
              </p>
              {selected.purpose && (
                <p>
                  <span className="text-ink/50">Purpose: </span>
                  {selected.purpose}
                </p>
              )}
            </div>
          ) : !user ? (
            <p className="text-sm text-ink/60">Sign in below to book this computer.</p>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>From</Label>
                  <Select
                    value={String(startHour)}
                    onValueChange={(v) => {
                      const s = Number(v);
                      setStartHour(s);
                      if (endHour <= s) setEndHour(Math.min(s + 1, CLOSE_HOUR));
                    }}
                  >
                    <SelectTrigger className="rounded-xl bg-white/70">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {HOURS.map((h) => (
                        <SelectItem key={h} value={String(h)}>
                          {label(h)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>To</Label>
                  <Select value={String(endHour)} onValueChange={(v) => setEndHour(Number(v))}>
                    <SelectTrigger className="rounded-xl bg-white/70">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from(
                        { length: CLOSE_HOUR - startHour },
                        (_, i) => startHour + 1 + i,
                      ).map((h) => (
                        <SelectItem key={h} value={String(h)}>
                          {label(h)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>How will you use it?</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(["onsite", "remote"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMode(m)}
                      className={`rounded-xl border px-3 py-2 text-sm capitalize transition-colors ${
                        mode === m
                          ? "border-sun bg-sun/15 font-semibold text-ink"
                          : "border-ink/15 text-ink/60 hover:bg-sun/5"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="purpose">Purpose (optional)</Label>
                <Input
                  id="purpose"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="Software Engineering lab work"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            {selected ? (
              user && selected.user_id === user.id ? (
                <Button
                  variant="destructive"
                  className="rounded-xl"
                  disabled={cancelBooking.isPending}
                  onClick={() => cancelBooking.mutate(selected.id)}
                >
                  Cancel booking
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="rounded-xl border-ink/15 bg-transparent"
                  onClick={() => setTarget(null)}
                >
                  Close
                </Button>
              )
            ) : user ? (
              <Button
                className="rounded-xl"
                disabled={createBooking.isPending || rangeInvalid}
                onClick={() =>
                  target &&
                  createBooking.mutate({
                    computer: target.computer,
                    start: startHour,
                    end: endHour,
                    mode,
                    purpose,
                  })
                }
              >
                Confirm booking
              </Button>
            ) : (
              <Button
                variant="outline"
                className="rounded-xl border-ink/15 bg-transparent"
                onClick={() => setTarget(null)}
              >
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
