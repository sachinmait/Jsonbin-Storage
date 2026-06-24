import { useState, useEffect } from "react";
import { BookOpen, Calendar, Users, UserPlus } from "lucide-react";
import Directory from "@/pages/Directory";
import Feed from "@/pages/Feed";
import Events from "@/pages/Events";
import Join from "@/pages/Join";
import { initBins, isConfigured, getStudents, getPosts, getEvents } from "@/lib/jsonbin";
import { MOCK_STUDENTS, MOCK_POSTS, MOCK_EVENTS } from "@/lib/mockData";
import type { Student, Post, CampusEvent } from "@/types";

type Tab = "directory" | "feed" | "events" | "join";

const NAV_ITEMS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "directory", label: "Directory", icon: <Users className="w-5 h-5" /> },
  { id: "feed", label: "Feed", icon: <BookOpen className="w-5 h-5" /> },
  { id: "events", label: "Events", icon: <Calendar className="w-5 h-5" /> },
  { id: "join", label: "Join", icon: <UserPlus className="w-5 h-5" /> },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("directory");
  const [students, setStudents] = useState<Student[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        if (isConfigured()) {
          await initBins({
            students: MOCK_STUDENTS,
            posts: MOCK_POSTS,
            events: MOCK_EVENTS,
          });
          const [s, p, e] = await Promise.all([
            getStudents<Student>(),
            getPosts<Post>(),
            getEvents<CampusEvent>(),
          ]);
          setStudents(s);
          setPosts(p);
          setEvents(e);
        } else {
          setStudents(MOCK_STUDENTS);
          setPosts(MOCK_POSTS);
          setEvents(MOCK_EVENTS);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to connect to storage. Using local data.");
        setStudents(MOCK_STUDENTS);
        setPosts(MOCK_POSTS);
        setEvents(MOCK_EVENTS);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-md">
            <span className="text-primary-foreground text-2xl font-bold">C</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
          </div>
          <p className="text-muted-foreground text-sm">Loading CampusConnect...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border fixed h-full z-30">
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sidebar-primary flex items-center justify-center shadow-sm">
              <span className="text-sidebar-primary-foreground text-lg font-bold">C</span>
            </div>
            <div>
              <p className="font-bold text-sidebar-foreground text-base leading-tight">CampusConnect</p>
              <p className="text-xs text-sidebar-foreground/60 leading-tight">Summer 2025</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                activeTab === item.id
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-2 px-2">
            <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center">
              <span className="text-sidebar-accent-foreground text-xs font-semibold">You</span>
            </div>
            <div>
              <p className="text-xs font-medium text-sidebar-foreground">Guest User</p>
              <p className="text-xs text-sidebar-foreground/50">Summer 2025</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Error Banner */}
        {error && (
          <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-2 text-destructive text-sm text-center">
            {error}
          </div>
        )}

        {/* Page Content */}
        <div className="flex-1 pb-20 md:pb-0">
          {activeTab === "directory" && (
            <Directory students={students} setStudents={setStudents} />
          )}
          {activeTab === "feed" && (
            <Feed posts={posts} setPosts={setPosts} />
          )}
          {activeTab === "events" && (
            <Events events={events} setEvents={setEvents} />
          )}
          {activeTab === "join" && (
            <Join students={students} setStudents={setStudents} />
          )}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-sidebar border-t border-sidebar-border z-40 flex">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
              activeTab === item.id
                ? "text-sidebar-primary"
                : "text-sidebar-foreground/60 hover:text-sidebar-foreground"
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
