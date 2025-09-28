import Constants from 'expo-constants';
import type { EpisodesResponse } from './types';


const BACKEND_URL = (Constants.expoConfig?.extra as any)?.BACKEND_URL || 'http://localhost:4000';


export async function fetchEpisodes(params: {
    page?: number;
    pageSize?: number;
    watched?: 'all' | 'true' | 'false';
    sortBy?: 'airDate' | 'title' | 'seriesTitle' | 'season' | 'episode';
    order?: 'asc' | 'desc';
    search?: string;
}): Promise<EpisodesResponse> {
    const url = new URL('/episodes', BACKEND_URL);
    const q = new URLSearchParams();
    if (params.page) q.set('page', String(params.page));
    if (params.pageSize) q.set('pageSize', String(params.pageSize));
    if (params.watched) q.set('watched', params.watched);
    if (params.sortBy) q.set('sortBy', params.sortBy);
    if (params.order) q.set('order', params.order);
    if (params.search) q.set('search', params.search);
    url.search = q.toString();


    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Failed to fetch episodes: ${res.status}`);
    return res.json();
}

export async function patchWatched(id: string, watched: boolean) {
    const res = await fetch(`${BACKEND_URL}/episodes/${id}/watched`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ watched })
    });
    if (!res.ok) throw new Error(`Failed to update watched: ${res.status}`);
    return res.json();
}