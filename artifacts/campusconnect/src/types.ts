export type CourseTrack = "Data Science" | "Innovation & Entrepreneurship" | "Literature & Creative Writing" | "All Tracks";

export type PostTag = "General" | "Housing" | "StudyGroups" | "RideSharing";

export type RsvpStatus = "going" | "maybe" | "cantGo";

export interface Student {
  id: string;
  name: string;
  homeUniversity: string;
  track: Exclude<CourseTrack, "All Tracks">;
  bio: string;
  avatarUrl: string;
  linkedin: string | null;
  github: string | null;
  instagram: string | null;
}

export interface Comment {
  id: string;
  authorName: string;
  content: string;
  timestamp: string;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorTrack: string;
  authorAvatar: string;
  tag: PostTag;
  content: string;
  timestamp: string;
  likes: number;
  likedBy: string[];
  comments: Comment[];
}

export interface CampusEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  isOfficial: boolean;
  rsvps: {
    going: number;
    maybe: number;
    cantGo: number;
  };
  userRsvp: RsvpStatus | null;
}
