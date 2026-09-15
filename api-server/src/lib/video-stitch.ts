import { spawn } from "child_process";
import path from "path";
import fs from "fs/promises";
import os from "os";

/**
 * Generates multiple video clips in parallel and stitches them into one file.
 * Each clip is 10 seconds; duration determines the count.
 */
export async function generateAndStitchClips(
  clipCount: number,
  generateClip: (index: number) => Promise<string>,
  outputPublicDir: string
): Promise<string> {
  // Generate all clips in parallel — each returns a local file path under /api/images/...
  const clipPaths = await Promise.all(
    Array.from({ length: clipCount }, (_, i) => generateClip(i))
  );

  // clipPaths are like /api/images/gen_xxx.mp4 — resolve to absolute file paths
  const absolutePaths = clipPaths.map((p) => {
    const filename = path.basename(p);
    return path.join(outputPublicDir, filename);
  });

  // Write ffmpeg concat list to a temp file
  const tmpDir = os.tmpdir();
  const concatFile = path.join(tmpDir, `concat_${Date.now()}.txt`);
  const concatContent = absolutePaths.map((p) => `file '${p}'`).join("\n");
  await fs.writeFile(concatFile, concatContent);

  // Output stitched file
  const outName = `gen_${Date.now()}_stitched.mp4`;
  const outPath = path.join(outputPublicDir, outName);

  await runFfmpegConcat(concatFile, outPath);

  // Clean up individual clips and temp file
  await Promise.allSettled([
    ...absolutePaths.map((p) => fs.unlink(p)),
    fs.unlink(concatFile),
  ]);

  return `/api/images/${outName}`;
}

function runFfmpegConcat(concatFile: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn("ffmpeg", [
      "-y",
      "-f", "concat",
      "-safe", "0",
      "-i", concatFile,
      "-c", "copy",
      outputPath,
    ]);

    let stderr = "";
    proc.stderr.on("data", (d: Buffer) => { stderr += d.toString(); });

    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exited ${code}: ${stderr.slice(-500)}`));
    });

    proc.on("error", reject);
  });
}
