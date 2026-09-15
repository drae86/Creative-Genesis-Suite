const API_BASE = "/api";

export interface Generation {
  id: number;
  title: string | null;
  prompt: string;
  enhancedPrompt: string | null;
  type: "image" | "video";
  status: "pending" | "generating" | "completed" | "failed";
  imageUrl: string | null;
  thumbnailUrl: string | null;
  aspectRatio: string;
  model: string;
  style: string | null;
  settings: string;
  notes: string | null;
  isFavorite: boolean;
  parentId: number | null;
  collectionIds: number[];
  createdAt: string;
  updatedAt: string;
}

export interface GlassRoomEntry {
  id: number;
  generationId: number;
  creatorName: string | null;
  creatorContact: string | null;
  contactPublic: boolean;
  displayUntil: string;
  createdAt: string;
  generation: Generation;
}

export interface GlassRoomInput {
  generationId: number;
  creatorName?: string | null;
  creatorContact?: string | null;
  contactPublic?: boolean;
}

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const api = {
  getPublicGallery: (limit = 100, offset = 0) =>
    fetchApi<Generation[]>(`/public-gallery?limit=${limit}&offset=${offset}`),
  
  getGlassRoom: (limit = 50, offset = 0) =>
    fetchApi<GlassRoomEntry[]>(`/glass-room?limit=${limit}&offset=${offset}`),
  
  getGeneration: (id: number) =>
    fetchApi<Generation>(`/generations/${id}`),

  submitToGlassRoom: (data: GlassRoomInput) =>
    fetchApi<GlassRoomEntry>("/glass-room", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
