export interface Story {
  title: string;
  synopsis: string;
  chapters: string[];
}

export interface GeneratedScene {
  chapterIndex: number;
  narrative: string;
  imageBase64: string;
  timestamp: number;
}

export interface PlayerState {
  isPlaying: boolean;
  isInfinite: boolean; // Loop whole story (restart at end)
  isGenerating: boolean;
  currentChapterIndex: number;
  error: string | null;
}