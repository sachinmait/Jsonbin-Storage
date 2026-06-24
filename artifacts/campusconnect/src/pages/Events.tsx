import { useState, useCallback } from "react";
import { MapPin, Clock, Users, Shield, CalendarDays } from "lucide-react";
import { saveEvents, isConfigured } from "@/lib/jsonbin";
import type { CampusEvent, RsvpStatus } from "@/types";

function formatDate(isoString: string): { date: string; time: string; relative: string } {
  const d = new Date(isoString);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffH = Math.round(diffMs / 3600000);
  const diffD = Math.floor(diffH / 24);

  let relative: string;
  if (diffH < 1) relative = "Starting soon";
  else if (diffH < 24) relative = `In ${diffH}h`;
  else if (diffD === 1) relative = "Tomorrow";
  else relative = `In ${diffD} days`;

  return {
    date: d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }),
    time: d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
    relative,
  };
}

const RSVP_OPTIONS: { key: RsvpStatus; label: string }[] = [
  { key: "going", label: "Going" },
  { key: "maybe", label: "Maybe" },
  { key: "cantGo", label: "Can't Go" },
];

const RSVP_ACTIVE_STYLES: Record<RsvpStatus, string> = {
  going: "bg-emerald-500 text-white border-emerald-600",
  maybe: "bg-amber-400 text-white border-amber-500",
  cantGo: "bg-rose-400 text-white border-rose-500",
};

interface Props {
  events: CampusEvent[];
  setEvents: React.Dispatch<React.SetStateAction<CampusEvent[]>>;
}

export default function Events({ events, setEvents }: Props) {
  const persist = useCallback(async (updated: CampusEvent[]) => {
    if (isConfigured()) {
      try {
        await saveEvents(updated);
      } catch (err) {
        console.error("Failed to persist events:", err);
      }
    }
  }, []);

  const handleRsvp = useCallback(
    (eventId: string, choice: RsvpStatus) => {
      setEvents((prev) => {
        const updated = prev.map((ev) => {
          if (ev.id !== eventId) return ev;
          const prev_choice = ev.userRsvp;
          const newRsvps = { ...ev.rsvps };

          if (prev_choice) newRsvps[prev_choice] = Math.max(0, newRsvps[prev_choice] - 1);
          const newChoice = prev_choice === choice ? null : choice;
          if (newChoice) newRsvps[newChoice] = newRsvps[newChoice] + 1;

          return { ...ev, rsvps: newRsvps, userRsvp: newChoice };
        });
        void persist(updated);
        return updated;
      });
    },
    [persist]
  );

  const official = events.filter((e) => e.isOfficial);
  const casual = events.filter((e) => !e.isOfficial);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Events Calendar</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {events.length} upcoming events · RSVP to save your spot
        </p>
      </div>

      {/* Official Events */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Official Program Events
          </h2>
          <span className="ml-auto text-xs text-muted-foreground">{official.length} events</span>
        </div>
        <div className="space-y-4">
          {official.map((ev) => (
            <EventCard key={ev.id} event={ev} onRsvp={handleRsvp} />
          ))}
        </div>
      </section>

      {/* Casual Events */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays className="w-4 h-4 text-violet-500" />
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Student Meetups
          </h2>
          <span className="ml-auto text-xs text-muted-foreground">{casual.length} events</span>
        </div>
        <div className="space-y-4">
          {casual.map((ev) => (
            <EventCard key={ev.id} event={ev} onRsvp={handleRsvp} />
          ))}
        </div>
      </section>
    </div>
  );
}

function EventCard({
  event,
  onRsvp,
}: {
  event: CampusEvent;
  onRsvp: (id: string, choice: RsvpStatus) => void;
}) {
  const { date, time, relative } = formatDate(event.date);
  const totalRsvp = event.rsvps.going + event.rsvps.maybe + event.rsvps.cantGo;

  return (
    <div
      className={`bg-card border rounded-2xl shadow-sm overflow-hidden transition-shadow hover:shadow-md ${
        event.isOfficial ? "border-primary/20" : "border-card-border"
      }`}
    >
      {/* Official Badge Banner */}
      {event.isOfficial && (
        <div className="bg-primary/8 border-b border-primary/15 px-5 py-2 flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-semibold text-primary">Official Program Event</span>
        </div>
      )}

      <div className="p-5">
        {/* Title + Date */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-semibold text-foreground text-base leading-snug flex-1">
            {event.title}
          </h3>
          <span className="flex-shrink-0 text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20 whitespace-nowrap">
            {relative}
          </span>
        </div>

        {/* Meta */}
        <div className="flex flex-col gap-1.5 mb-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{date} · {time}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{event.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-3.5 h-3.5 flex-shrink-0" />
            <span>
              {event.rsvps.going} going · {event.rsvps.maybe} maybe · {totalRsvp} total responses
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">{event.description}</p>

        {/* RSVP */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground font-medium mr-1">Your RSVP:</span>
          {RSVP_OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => onRsvp(event.id, key)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-150 ${
                event.userRsvp === key
                  ? RSVP_ACTIVE_STYLES[key]
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {label}
              {event.userRsvp === key && <span className="ml-1 opacity-80">✓</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
