export function paginate<T>(arr: T[], page: number, pageSize: number) {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const slice = arr.slice(start, end);
    return { slice, total: arr.length, hasMore: end < arr.length };
}