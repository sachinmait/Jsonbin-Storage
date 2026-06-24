import { useState, useMemo } from "react";
import { Search, Github, Linkedin, Instagram, GraduationCap } from "lucide-react";
import type { Student, CourseTrack } from "@/types";

const TRACKS: CourseTrack[] = [
  "All Tracks",
  "Data Science",
  "Innovation & Entrepreneurship",
  "Literature & Creative Writing",
];

const TRACK_COLORS: Record<string, string> = {
  "Data Science": "bg-blue-100 text-blue-700 border-blue-200",
  "Innovation & Entrepreneurship": "bg-violet-100 text-violet-700 border-violet-200",
  "Literature & Creative Writing": "bg-rose-100 text-rose-700 border-rose-200",
};

interface Props {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
}

export default function Directory({ students }: Props) {
  const [search, setSearch] = useState("");
  const [selectedTrack, setSelectedTrack] = useState<CourseTrack>("All Tracks");

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.homeUniversity.toLowerCase().includes(search.toLowerCase());
      const matchesTrack = selectedTrack === "All Tracks" || s.track === selectedTrack;
      return matchesSearch && matchesTrack;
    });
  }, [students, search, selectedTrack]);

  return (
    <div className="flex flex-col min-h-full">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-foreground">Student Directory</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {filtered.length} student{filtered.length !== 1 ? "s" : ""} · Summer 2025
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search by name or university..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-input bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
              />
            </div>
            {/* Track Filter */}
            <select
              value={selectedTrack}
              onChange={(e) => setSelectedTrack(e.target.value as CourseTrack)}
              className="px-4 py-2.5 rounded-xl border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow cursor-pointer"
            >
              {TRACKS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-4 py-6 w-full">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
            <GraduationCap className="w-12 h-12 text-muted-foreground/40" />
            <p className="text-lg font-medium text-foreground">No students found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your search or filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((student) => (
              <StudentCard key={student.id} student={student} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StudentCard({ student }: { student: Student }) {
  return (
    <div className="bg-card border border-card-border rounded-2xl p-5 flex flex-col gap-4 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group">
      {/* Avatar + Name */}
      <div className="flex items-start gap-3">
        <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted flex-shrink-0 border border-border">
          <img
            src={student.avatarUrl}
            alt={student.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-foreground text-sm leading-tight truncate">{student.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{student.homeUniversity}</p>
          <span
            className={`inline-block mt-1.5 text-xs font-medium px-2 py-0.5 rounded-full border ${
              TRACK_COLORS[student.track] ?? "bg-muted text-muted-foreground border-border"
            }`}
          >
            {student.track}
          </span>
        </div>
      </div>

      {/* Bio */}
      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4 flex-1">{student.bio}</p>

      {/* Social Links */}
      <div className="flex items-center gap-2 pt-1 border-t border-border">
        {student.linkedin && (
          <a
            href={student.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors"
            title="LinkedIn"
          >
            <Linkedin className="w-4 h-4" />
          </a>
        )}
        {student.github && (
          <a
            href={student.github}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors"
            title="GitHub"
          >
            <Github className="w-4 h-4" />
          </a>
        )}
        {student.instagram && (
          <a
            href={student.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors"
            title="Instagram"
          >
            <Instagram className="w-4 h-4" />
          </a>
        )}
        {!student.linkedin && !student.github && !student.instagram && (
          <span className="text-xs text-muted-foreground/60">No socials linked</span>
        )}
      </div>
    </div>
  );
}
