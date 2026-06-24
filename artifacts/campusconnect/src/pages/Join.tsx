import { useState } from "react";
import { isConfigured, saveStudents } from "@/lib/jsonbin";
import type { Student } from "@/types";

type JoinProps = {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
};

type FormState = {
  name: string;
  university: string;
  track: string;
  bio: string;
  linkedin: string;
  github: string;
  instagram: string;
};

const INITIAL_FORM: FormState = {
  name: "",
  university: "",
  track: "",
  bio: "",
  linkedin: "",
  github: "",
  instagram: "",
};

export default function Join({ students, setStudents }: JoinProps) {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.name.trim() || !form.university.trim() || !form.track.trim()) {
      setError("Name, Home University, and Track are required.");
      return;
    }

    setSubmitting(true);
    try {
      const nextStudent: Student = {
        id: crypto.randomUUID(),
        name: form.name.trim(),
        university: form.university.trim(),
        major: form.track.trim(),
        year: "Summer 2025",
        bio: form.bio.trim() || "New member",
        interests: [],
        avatar: "",
        socialLinks: {
          linkedin: form.linkedin.trim(),
          github: form.github.trim(),
          instagram: form.instagram.trim(),
        },
      };

      const updated = [nextStudent, ...students];
      setStudents(updated);

      if (isConfigured()) {
        await saveStudents(updated);
      }

      setForm(INITIAL_FORM);
      setSuccess("Your information has been submitted successfully!");
    } catch (err) {
      console.error(err);
      setError("Failed to submit details. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Join CampusConnect</h1>
        <p className="text-muted-foreground mt-2">
          New member? Share your details and appear in the directory.
        </p>
      </div>

      <form onSubmit={onSubmit} className="bg-card border rounded-2xl p-5 md:p-6 space-y-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Full Name *</label>
            <input
              className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="Jane Doe"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Home University *</label>
            <input
              className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              value={form.university}
              onChange={(e) => updateField("university", e.target.value)}
              placeholder="Example University"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Track / Major *</label>
            <input
              className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              value={form.track}
              onChange={(e) => updateField("track", e.target.value)}
              placeholder="Computer Science"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">LinkedIn</label>
            <input
              className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              value={form.linkedin}
              onChange={(e) => updateField("linkedin", e.target.value)}
              placeholder="https://linkedin.com/in/username"
            />
          </div>

          <div>
            <label className="text-sm font-medium">GitHub</label>
            <input
              className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              value={form.github}
              onChange={(e) => updateField("github", e.target.value)}
              placeholder="https://github.com/username"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Instagram</label>
            <input
              className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              value={form.instagram}
              onChange={(e) => updateField("instagram", e.target.value)}
              placeholder="https://instagram.com/username"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Short Bio</label>
          <textarea
            className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm min-h-[100px] outline-none focus:ring-2 focus:ring-primary/30"
            value={form.bio}
            onChange={(e) => updateField("bio", e.target.value)}
            placeholder="Tell everyone a bit about yourself..."
          />
        </div>

        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-sm px-3 py-2">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-xl border border-green-500/30 bg-green-500/10 text-green-700 text-sm px-3 py-2">
            {success}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm font-medium disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit Information"}
          </button>
        </div>
      </form>
    </div>
  );
}
