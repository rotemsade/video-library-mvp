import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { Order, SortBy } from '../types';

export function SortMenu({
    visible,
    sortBy,
    order,
    onClose,
    onChange,
}: {
    visible: boolean;
    sortBy: SortBy;
    order: Order;
    onClose: () => void;
    onChange: (s: { sortBy: SortBy; order: Order }) => void;
}) {
    const sortOptions: SortBy[] = ['airDate', 'title', 'seriesTitle', 'season', 'episode'];
    const orders: Order[] = ['asc', 'desc'];

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.backdrop}>
                <View style={styles.card}>
                    <Text style={styles.title}>Sort</Text>
                    <Text style={styles.section}>Field</Text>
                    <View style={styles.rowWrap}>
                        {sortOptions.map((s) => (
                            <TouchableOpacity key={s} style={[styles.pill, s === sortBy && styles.pillActive]} onPress={() => onChange({ sortBy: s, order })}>
                                <Text style={[styles.pillText, s === sortBy && styles.pillTextActive]}>{s}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <Text style={styles.section}>Order</Text>
                    <View style={styles.rowWrap}>
                        {orders.map((o) => (
                            <TouchableOpacity key={o} style={[styles.pill, o === order && styles.pillActive]} onPress={() => onChange({ sortBy, order: o })}>
                                <Text style={[styles.pillText, o === order && styles.pillTextActive]}>{o}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <View style={{ height: 12 }} />
                    <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                        <Text style={{ color: 'white', fontWeight: '600' }}>Done</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}


const styles = StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
    card: { backgroundColor: 'white', borderRadius: 16, padding: 16, width: '88%' },
    title: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
    section: { fontSize: 14, fontWeight: '600', marginTop: 8, marginBottom: 6 },
    rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    pill: { paddingVertical: 6, paddingHorizontal: 10, borderWidth: 1, borderColor: '#ddd', borderRadius: 999 },
    pillActive: { backgroundColor: '#222' },
    pillText: { color: '#222' },
    pillTextActive: { color: 'white' },
    closeBtn: { backgroundColor: '#222', paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
});