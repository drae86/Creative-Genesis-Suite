import { fal } from "@fal-ai/client";
import path from "path";
import fs from "fs/promises";

fal.config({ credentials: process.env.FAL_KEY });

const ASPECT_RATIO_TO_FAL: Record<string, string> = {
  "1:1":  "square",
  "16:9": "landscape_16_9",
  "9:16": "portrait_9_16",
  "4:3":  "landscape_4_3",
  "3:4":  "portrait_3_4",
};

const DURATION_SECONDS: Record<string, number> = {
  "5s":  5,
  "10s": 10,
  "30s": 5,
  "60s": 10,
};

const STYLE_PROMPT_ADDITIONS: Record<string, string> = {
  Photorealistic: "photorealistic, ultra-detailed, professional cinematography, 8k",
  Cinematic:      "cinematic, dramatic lighting, film grain, anamorphic lens, movie quality",
  Anime:          "anime art style, vibrant colors, fluid animation, Studio Ghibli inspired",
  Abstract:       "abstract visual art, bold shapes, non-representational, avant-garde motion",
  Fantasy:        "fantasy art, magical atmosphere, ethereal lighting, highly detailed",
  "Neon Noir":    "neon noir, cyberpunk, dark rainy atmosphere, neon lights, city streets",
  "Oil Painting": "painterly style, rich textures, classical art, expressive brushwork",
};

export async function generateVideoFromPrompt(
  prompt: string,
  aspectRatio: string,
  style: string | null | undefined,
  duration: string | null | undefined
): Promise<string> {
  let fullPrompt = prompt;
  if (style && STYLE_PROMPT_ADDITIONS[style]) {
    fullPrompt = `${prompt}, ${STYLE_PROMPT_ADDITIONS[style]}`;
  }

  const falAspectRatio = ASPECT_RATIO_TO_FAL[aspectRatio] ?? "landscape_16_9";
  const durationSecs = DURATION_SECONDS[duration ?? "5s"] ?? 5;

  const result = await fal.subscribe("fal-ai/kling-video/v2.1/standard/text-to-video", {
    input: {
      prompt: fullPrompt,
      aspect_ratio: falAspectRatio,
      duration: durationSecs as 5 | 10,
    },
  }) as { data: { video: { url: string } } };

  const videoUrl: string = result.data.video.url;

  const response = await fetch(videoUrl);
  if (!response.ok) throw new Error(`Failed to download video: ${response.statusText}`);
  const buffer = Buffer.from(await response.arrayBuffer());

  const fileName = `gen_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.mp4`;
  const publicDir = path.resolve(process.cwd(), "public", "generations");
  await fs.mkdir(publicDir, { recursive: true });
  await fs.writeFile(path.join(publicDir, fileName), buffer);

  return `/api/images/${fileName}`;
}
