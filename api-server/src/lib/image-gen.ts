import { generateImageBuffer } from "@workspace/integrations-openai-ai-server/image";
import { openai } from "@workspace/integrations-openai-ai-server";
import path from "path";
import fs from "fs/promises";

const ASPECT_RATIO_TO_SIZE: Record<string, "1024x1024" | "1536x1024" | "1024x1536"> = {
  "1:1": "1024x1024",
  "4:3": "1536x1024",
  "3:4": "1024x1536",
  "16:9": "1536x1024",
  "9:16": "1024x1536",
};

const STYLE_PROMPT_ADDITIONS: Record<string, string> = {
  Photorealistic: "photorealistic, ultra-detailed, professional photography, 8k resolution",
  Cinematic: "cinematic, dramatic lighting, film grain, anamorphic lens, movie still",
  Anime: "anime art style, vibrant colors, detailed illustration, Studio Ghibli inspired",
  Abstract: "abstract art, bold shapes, non-representational, expressionist, avant-garde",
  Fantasy: "fantasy art, magical, ethereal, highly detailed, concept art",
  "Neon Noir": "neon noir, cyberpunk, dark atmosphere, neon lights, rain-slicked streets",
  "Oil Painting": "oil painting style, visible brushstrokes, classical art, rich textures, masterpiece",
};

export async function generateImageFromPrompt(
  prompt: string,
  aspectRatio: string,
  style: string | null | undefined,
  _negativePrompt: string | null | undefined,
  _enhancePrompt: boolean
): Promise<string> {
  const size = ASPECT_RATIO_TO_SIZE[aspectRatio] ?? "1024x1024";

  let fullPrompt = prompt;
  if (style && STYLE_PROMPT_ADDITIONS[style]) {
    fullPrompt = `${prompt}, ${STYLE_PROMPT_ADDITIONS[style]}`;
  }

  const buffer = await generateImageBuffer(fullPrompt, size as "1024x1024");

  // Save to public directory and return a data URL path
  const fileName = `gen_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.png`;
  const publicDir = path.resolve(process.cwd(), "public", "generations");

  await fs.mkdir(publicDir, { recursive: true });
  const filePath = path.join(publicDir, fileName);
  await fs.writeFile(filePath, buffer);

  return `/api/images/${fileName}`;
}
