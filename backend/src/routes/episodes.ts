import { Router } from "express";
import { listQuerySchema, patchWatchedSchema } from "../validators.js";
import { paginate } from "../utils/pagination.js";
import { Episode, EpisodesResponse } from "../types.js";
import { store } from "../data.js";


export const episodesRouter = Router();


// GET /episodes
episodesRouter.get("/", (req, res) => {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { sortBy, order, watched, page, pageSize, search } = parsed.data;

  let data: Episode[] = Array.from(store.values());

  // Filter watched
  if (watched === "true") data = data.filter((e) => e.watched);
  if (watched === "false") data = data.filter((e) => !e.watched);


  // Search (simple contains across title/seriesTitle/description)
  if (search) {
    const q = search.toLowerCase();
    data = data.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.seriesTitle.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q)
    );
  }

  // Sort
  const dir = order === "asc" ? 1 : -1;
  data.sort((a, b) => {
    switch (sortBy) {
      case "airDate":
        return (new Date(a.airDate).getTime() - new Date(b.airDate).getTime()) * dir;
      case "title":
        return a.title.localeCompare(b.title) * dir;
      case "seriesTitle":
        return a.seriesTitle.localeCompare(b.seriesTitle) * dir;
      case "season":
        return (a.season - b.season || a.episode - b.episode) * dir;
      case "episode":
        return (a.episode - b.episode || a.season - b.season) * dir;
      default:
        return 0;
    }
  });


  const { slice, total, hasMore } = paginate(data, page, pageSize);
  const resp: EpisodesResponse = {
    data: slice,
    page,
    pageSize,
    total,
    hasMore,
  };
  res.json(resp);
});


// PATCH /episodes/:id/watched
episodesRouter.patch("/:id/watched", (req, res) => {
  const id = String(req.params.id);
  const found = store.get(id);
  if (!found) return res.status(404).json({ error: "Episode not found" });

  const parsed = patchWatchedSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const updated = { ...found, watched: parsed.data.watched };
  store.set(id, updated);
  res.json(updated);
});