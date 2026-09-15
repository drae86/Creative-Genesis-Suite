const RUNWAY_API_BASE = "https://api.dev.runwayml.com/v1";
const RUNWAY_VERSION = "2024-11-06";

const ASPECT_RATIO_TO_RUNWAY: Record<string, string> = {
  "16:9": "1280:720",
  "9:16": "720:1280",
  "1:1":  "960:960",
  "4:3":  "1024:768",
  "3:4":  "768:1024",
};

const STYLE_PROMPT_ADDITIONS: Record<string, string> = {
  Photorealistic: "photorealistic, ultra-detailed, professional cinematography",
  Cinematic:      "cinematic, dramatic lighting, film grain, anamorphic lens, movie quality",
  Anime:          "anime art style, vibrant colors, fluid animation",
  Abstract:       "abstract visual art, bold shapes, avant-garde motion",
  Fantasy:        "fantasy art, magical atmosphere, ethereal lighting",
  "Neon Noir":    "neon noir, cyberpunk, dark rainy atmosphere, neon lights",
  "Oil Painting": "painterly style, rich textures, classical art",
};

async function runwayFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${RUNWAY_API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.RUNWAYML_API_KEY}`,
      "Content-Type": "application/json",
      "X-Runway-Version": RUNWAY_VERSION,
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Runway API error ${res.status}: ${body}`);
  }
  return res.json() as Promise<Record<string, unknown>>;
}

export async function generateVideoWithRunway(
  prompt: string,
  aspectRatio: string,
  style: string | null | undefined,
  duration: string | null | undefined
): Promise<string> {
  let fullPrompt = prompt;
  if (style && STYLE_PROMPT_ADDITIONS[style]) {
    fullPrompt = `${prompt}, ${STYLE_PROMPT_ADDITIONS[style]}`;
  }

  const ratio = ASPECT_RATIO_TO_RUNWAY[aspectRatio] ?? "1280:720";
  const durationSecs = duration === "10s" ? 10 : 5;

  // 1. Create the task
  const task = await runwayFetch("/text_to_video", {
    method: "POST",
    body: JSON.stringify({
      promptText: fullPrompt,
      model: "gen4_turbo",
      ratio,
      duration: durationSecs,
    }),
  });

  const taskId = task.id as string;

  // 2. Poll until complete (max 8 minutes)
  const MAX_POLLS = 96;
  const POLL_INTERVAL_MS = 5000;

  for (let i = 0; i < MAX_POLLS; i++) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));

    const status = await runwayFetch(`/tasks/${taskId}`);

    if (status.status === "SUCCEEDED") {
      const outputs = status.output as string[] | undefined;
      const videoUrl = outputs?.[0];
      if (!videoUrl) throw new Error("Runway returned no output URL");

      // 3. Download and save the video
      const { default: path } = await import("path");
      const { default: fs } = await import("fs/promises");

      const response = await fetch(videoUrl);
      if (!response.ok) throw new Error(`Failed to download Runway video: ${response.statusText}`);
      const buffer = Buffer.from(await response.arrayBuffer());

      const fileName = `gen_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.mp4`;
      const publicDir = path.resolve(process.cwd(), "public", "generations");
      await fs.mkdir(publicDir, { recursive: true });
      await fs.writeFile(path.join(publicDir, fileName), buffer);

      return `/api/images/${fileName}`;
    }

    if (status.status === "FAILED") {
      throw new Error(`Runway task failed: ${JSON.stringify(status.error)}`);
    }
    // PENDING / RUNNING → keep polling
  }

  throw new Error("Runway generation timed out after 8 minutes");
}
