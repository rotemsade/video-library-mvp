export type Episode = {
    id: string;
    seriesId: string;
    seriesTitle: string;
    season: number;
    episode: number;
    title: string;
    description: string;
    durationSeconds: number;
    airDate: string; // ISO
    watched: boolean;
};

export type EpisodesResponse = {
    data: Episode[];
    page: number;
    pageSize: number;
    total: number;
    hasMore: boolean;
};

export type SortBy = 'airDate' | 'title' | 'seriesTitle' | 'season' | 'episode';
export type Order = 'asc' | 'desc';