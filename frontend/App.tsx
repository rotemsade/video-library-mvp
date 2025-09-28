import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SafeAreaView, View, Text, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, Switch, TextInput, StyleSheet, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Episode, EpisodesResponse, Order, SortBy } from './src/types';
import { EpisodeItem } from './src/components/EpisodeItem';
import { SortMenu } from './src/components/SortMenu';
import { fetchEpisodes, patchWatched } from './src/api';
import offline from './src/data/offlineEpisodes.json';

const PAGE_SIZE = 8;
const WATCHED_KEY = 'watched_overrides_v1';

export default function App() {
    const [items, setItems] = useState<Episode[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [hideWatched, setHideWatched] = useState(true);
    const [sortBy, setSortBy] = useState<SortBy>('airDate');
    const [order, setOrder] = useState<Order>('desc');
    const [search, setSearch] = useState('');

    const [sortOpen, setSortOpen] = useState(false);
    const overridesRef = useRef<Record<string, boolean>>({});

    const effectiveWatchedParam = hideWatched ? 'false' : 'all';

    const applyOverrides = useCallback((arr: Episode[]) => {
        const ov = overridesRef.current;
        return arr.map(e => (ov[e.id] == null ? e : { ...e, watched: ov[e.id] }));
    }, []);

    const load = useCallback(async (reset = false) => {
        if (loading) return;
        setLoading(true);
        setError(null);
        try {
            const nextPage = reset ? 1 : page;
            const resp: EpisodesResponse = await fetchEpisodes({
                page: nextPage,
                pageSize: PAGE_SIZE,
                watched: effectiveWatchedParam as any,
                sortBy,
                order,
                search: search.trim() || undefined,
            });
            const withOverrides = applyOverrides(resp.data);
            setItems(prev => (reset ? withOverrides : [...prev, ...withOverrides]));
            setHasMore(resp.hasMore);
            setPage(reset ? 2 : nextPage + 1);
        } catch (e: any) {
            // Offline fallback
            const data = applyOverrides((offline as EpisodesResponse).data);
            const filtered = (effectiveWatchedParam === 'false') ? data.filter(e => !e.watched) : data;
            const sorted = [...filtered].sort((a, b) => {
                const dir = order === 'asc' ? 1 : -1;
                switch (sortBy) {
                    case 'airDate':
                        return (new Date(a.airDate).getTime() - new Date(b.airDate).getTime()) * dir;
                    case 'title':
                        return a.title.localeCompare(b.title) * dir;
                    case 'seriesTitle':
                        return a.seriesTitle.localeCompare(b.seriesTitle) * dir;
                    case 'season':
                        return (a.season - b.season || a.episode - b.episode) * dir;
                    case 'episode':
                        return (a.episode - b.episode || a.season - b.season) * dir;
                    default:
                        return 0;
                }
            });
            setItems(sorted.slice(0, PAGE_SIZE * (reset ? 1 : page)));
            setHasMore(false);
            setPage(reset ? 2 : page + 1);
            setError('Offline mode: showing bundled sample data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [loading, page, effectiveWatchedParam, sortBy, order, search, applyOverrides]);

    useEffect(() => {
        (async () => {
            const raw = await AsyncStorage.getItem(WATCHED_KEY);
            if (raw) overridesRef.current = JSON.parse(raw);
            load(true);
        })();
        }, []);

        // Re-query on control changes
        useEffect(() => {
            load(true);
        }, [hideWatched, sortBy, order]);

        const onEnd = () => { if (hasMore && !loading) load(false); };
        const onRefresh = () => { setRefreshing(true); load(true); };

        const header = (
            <View style={styles.controls}>
                <View style={styles.rowBetween}>
                    <Text style={styles.h1}>Episodes</Text>
                    <TouchableOpacity onPress={() => setSortOpen(true)} style={styles.sortBtn}>
                        <Text style={styles.sortText}>Sort</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.rowBetween}>
                    <View style={[styles.searchBox, Platform.OS === 'ios' && { paddingVertical: 10 }]}>
                        <TextInput
                            placeholder="Search title or series…"
                            value={search}
                            onChangeText={setSearch}
                            onSubmitEditing={() => load(true)}
                            returnKeyType="search"
                        />
                    </View>
                    <View style={styles.switchBox}>
                        <Text style={{ marginRight: 6 }}>Hide watched</Text>
                        <Switch value={hideWatched} onValueChange={(v) => setHideWatched(v)} />
                    </View>
                </View>
                {error && (<Text style={styles.errorText}>{error}</Text>)}
            </View>
        );

        const toggleWatched = async (e: Episode) => {
            const next = !e.watched;
            // optimistic update
            setItems(prev => prev.map(x => x.id === e.id ? { ...x, watched: next } : x));
            overridesRef.current[e.id] = next;
            await AsyncStorage.setItem(WATCHED_KEY, JSON.stringify(overridesRef.current));
            try { await patchWatched(e.id, next); } catch {}
        };

        const keyExtractor = useCallback((e: Episode) => e.id, []);
        const renderItem = useCallback(({ item }: { item: Episode }) => (
            <EpisodeItem episode={item} onToggle={toggleWatched} />
        ), []);

    return (
        <SafeAreaView style={styles.safe}>
            <FlatList
                data={items}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                ListHeaderComponent={header}
                contentContainerStyle={{ padding: 14 }}
                onEndReached={onEnd}
                onEndReachedThreshold={0.3}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListFooterComponent={loading ? <ActivityIndicator style={{ marginVertical: 16 }} /> : null}
            />
            <SortMenu
                visible={sortOpen}
                sortBy={sortBy}
                order={order}
                onClose={() => setSortOpen(false)}
                onChange={({ sortBy: s, order: o }) => { setSortBy(s); setOrder(o); }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#f6f7f9' },
    h1: { fontSize: 22, fontWeight: '800' },
    controls: { paddingVertical: 8 },
    rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 8 },
    sortBtn: { backgroundColor: '#111', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
    sortText: { color: 'white', fontWeight: '700' },
    searchBox: { flex: 1, backgroundColor: 'white', borderRadius: 12, paddingHorizontal: 12, marginRight: 12, borderWidth: 1, borderColor: '#eee' },
    switchBox: { flexDirection: 'row', alignItems: 'center' },
    errorText: { color: '#b00020', marginTop: 4 },
});