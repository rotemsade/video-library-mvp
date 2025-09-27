import { z } from "zod";

export const listQuerySchema = z.object({
    sortBy: z
    .enum(["airDate", "title", "seriesTitle", "season", "episode"])
    .default("airDate"),
    order: z.enum(["asc", "desc"]).default("asc"),
    watched: z.enum(["all", "true", "false"]).default("all"),
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(20),
    search: z.string().trim().optional().default(""),
});

export const patchWatchedSchema = z.object({
    watched: z.boolean(),
});