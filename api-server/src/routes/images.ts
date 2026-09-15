import { Router, type IRouter } from "express";
import path from "path";
import fs from "fs/promises";

const router: IRouter = Router();

router.get("/images/:filename", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.filename) ? req.params.filename[0] : req.params.filename;
  const filename = path.basename(raw);

  if (!/^gen_[a-z0-9_]+\.(png|mp4)$/.test(filename)) {
    res.status(400).json({ error: "Invalid filename" });
    return;
  }

  const filePath = path.resolve(process.cwd(), "public", "generations", filename);
  const isVideo = filename.endsWith(".mp4");

  try {
    const data = await fs.readFile(filePath);
    res.setHeader("Content-Type", isVideo ? "video/mp4" : "image/png");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.send(data);
  } catch {
    res.status(404).json({ error: "File not found" });
  }
});

export default router;
