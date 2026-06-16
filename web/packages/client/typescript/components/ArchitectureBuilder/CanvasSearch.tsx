import React, { useState, useMemo, useEffect, useRef } from 'react';
import { PaletteItem } from './Sidebar';
import { sharedInputStyle } from './constants';

interface SearchResult {
    id: string;
    label: string;
    typeName: string;
    x: number;
    y: number;
    w: number;
    h: number;
}

interface CanvasSearchProps {
    nodes: Record<string, any>;
    paletteItems: PaletteItem[];
    onFlyTo: (nodeId: string, x: number, y: number, w: number, h: number) => void;
    onClose: () => void;
}

export const CanvasSearch = ({ nodes, paletteItems, onFlyTo, onClose }: CanvasSearchProps) => {
    const [query, setQuery] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    useEffect(() => { inputRef.current?.focus(); }, []);

    const paletteMap = useMemo(() => {
        const map: Record<string, string> = {};
        paletteItems.forEach(p => { map[p.id] = p.label; });
        return map;
    }, [paletteItems]);

    const results: SearchResult[] = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return [];
        return Object.entries(nodes)
            .filter(([, node]) => {
                const label = (node.label || '').toLowerCase();
                const paletteId = (node.paletteId || '').toLowerCase();
                const typeId = (node.typeId || '').toLowerCase();
                return label.includes(q) || paletteId.includes(q) || typeId.includes(q);
            })
            .map(([id, node]) => ({
                id,
                label: node.label || id,
                typeName: paletteMap[node.paletteId] || node.paletteId || '',
                x: node.x || 0,
                y: node.y || 0,
                w: node.width || 150,
                h: node.height || 150,
            }));
    }, [nodes, paletteMap, query]);

    useEffect(() => { setHighlightedIndex(0); }, [results.length]);

    // Scroll highlighted item into view
    useEffect(() => {
        const list = listRef.current;
        if (!list || results.length === 0) return;
        const item = list.children[highlightedIndex] as HTMLElement;
        if (item) item.scrollIntoView({ block: 'nearest' });
    }, [highlightedIndex, results.length]);

    const selectResult = (result: SearchResult) => {
        onFlyTo(result.id, result.x, result.y, result.w, result.h);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') { onClose(); return; }
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightedIndex(i => Math.min(i + 1, results.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightedIndex(i => Math.max(i - 1, 0));
        } else if (e.key === 'Enter' && results[highlightedIndex]) {
            selectResult(results[highlightedIndex]);
        }
    };

    return (
        <div style={{ position: 'absolute', top: '12px', left: '50%', transform: 'translateX(-50%)', zIndex: 100, width: '320px' }}>
            <div style={{ backgroundColor: 'var(--neutral-10)', border: '1px solid var(--neutral-40)', borderRadius: '6px', boxShadow: '0 4px 16px rgba(0,0,0,0.25)', overflow: 'hidden' }}>

                <div style={{ position: 'relative', padding: '8px' }}>
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search canvas... (Esc to close)"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        style={{ ...sharedInputStyle, paddingRight: query ? '24px' : '8px' }}
                    />
                    {query && (
                        <span
                            onClick={() => { setQuery(''); inputRef.current?.focus(); }}
                            style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--neutral-60)', fontSize: '14px' }}
                        >×</span>
                    )}
                </div>

                {results.length > 0 && (
                    <div ref={listRef} style={{ maxHeight: '300px', overflowY: 'auto', borderTop: '1px solid var(--neutral-40)' }}>
                        {results.map((result, i) => (
                            <div
                                key={result.id}
                                onClick={() => selectResult(result)}
                                onMouseEnter={() => setHighlightedIndex(i)}
                                style={{
                                    padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    backgroundColor: i === highlightedIndex ? 'var(--neutral-30)' : 'transparent',
                                    borderBottom: i < results.length - 1 ? '1px solid var(--neutral-40)' : 'none',
                                }}
                            >
                                <span style={{ color: 'var(--neutral-90)', fontSize: '13px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                                    {result.label}
                                </span>
                                {result.typeName && (
                                    <span style={{ fontSize: '11px', color: 'var(--neutral-60)', backgroundColor: 'var(--neutral-30)', borderRadius: '3px', padding: '2px 6px', marginLeft: '8px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                                        {result.typeName}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {query.trim() && results.length === 0 && (
                    <div style={{ padding: '12px', color: 'var(--neutral-60)', fontSize: '13px', textAlign: 'center', borderTop: '1px solid var(--neutral-40)' }}>
                        No nodes match "{query}"
                    </div>
                )}
            </div>
        </div>
    );
};
