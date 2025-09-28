import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { Episode } from '../types';

export function EpisodeItem({ episode, onToggle }: { episode: Episode; onToggle: (e: Episode) => void }) {
    const subtitle = `${episode.seriesTitle} S${episode.season}E${episode.episode}`;
    const durationMin = Math.round(episode.durationSeconds / 60);
    const date = new Date(episode.airDate).toLocaleDateString();


    return (
        <View style={[styles.card, episode.watched && styles.cardWatched]}>
            <Text style={styles.subtitle}>{subtitle}</Text>
            <Text style={styles.title}>{episode.title}</Text>
            <Text style={styles.meta}>{durationMin} min • {date}</Text>
            <Text style={styles.desc} numberOfLines={3}>{episode.description}</Text>
            <View style={styles.rowBetween}>
                <Text style={[styles.badge, episode.watched ? styles.badgeWatched : styles.badgeUnwatched]}>
                    {episode.watched ? 'Watched' : 'Unwatched'}
                </Text>
                <TouchableOpacity onPress={() => onToggle(episode)} style={styles.cta}>
                    <Text style={styles.ctaText}>{episode.watched ? 'Mark Unwatched' : 'Mark Watched'}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}


const styles = StyleSheet.create({
    card: { backgroundColor: 'white', borderRadius: 16, padding: 14, marginVertical: 8, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
    cardWatched: { opacity: 0.85 },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
    title: { fontSize: 16, fontWeight: '700', marginTop: 4 },
    subtitle: { fontSize: 12, color: '#666', fontWeight: '600' },
    meta: { fontSize: 12, color: '#666', marginTop: 2 },
    desc: { fontSize: 13, color: '#333', marginTop: 8 },
    badge: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 999, fontSize: 12, overflow: 'hidden' },
    badgeWatched: { backgroundColor: '#e6f7ec', color: '#0a8f3a' },
    badgeUnwatched: { backgroundColor: '#fff1e6', color: '#c05c00' },
    cta: { paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#111', borderRadius: 10 },
    ctaText: { color: 'white', fontWeight: '600' },
});