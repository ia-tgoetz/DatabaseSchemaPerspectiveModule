import React, { useState, useMemo } from 'react';
import { extractSvgMarkup, toSafeDataUri, nextSvgScopeId } from './svgSanitize';
import { sharedInputStyle } from './constants';

const PaletteThumb = ({ src, label }: { src: string, label: string }) => {
    const scopeId = React.useMemo(() => nextSvgScopeId(), []);
    const svgHtml = React.useMemo(() => extractSvgMarkup(src, scopeId), [src, scopeId]);
    if (svgHtml) {
        return (
            <div
                id={scopeId}
                style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
                dangerouslySetInnerHTML={{ __html: svgHtml }}
                title={label}
            />
        );
    }
    const dataUri = toSafeDataUri(src);
    return dataUri ? <img src={dataUri} alt={label} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : null;
};

export interface PaletteItem {
    id: string;
    typeId?: string;
    category?: string;
    label: string;
    tooltip?: string;
    image: string;
    overrideImage?: string;
    supportedConnections?: string[];
    defaultConfigs?: any;
    hideHandles?: boolean;
    style?: any;
    labelStyle?: any;
    swappableWith?: string[];
}

export interface SidebarProps {
    paletteItems: PaletteItem[];
    isOpen: boolean;
    toggleSidebar: () => void;
    onDragStartItem: (item: PaletteItem) => void;
    onItemClick: (item: PaletteItem) => void;
}

export const Sidebar = ({ paletteItems, isOpen, toggleSidebar, onDragStartItem, onItemClick }: SidebarProps) => {
    const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
    const [searchQuery, setSearchQuery] = useState('');

    const { containerItems, groupedItems } = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        const containers: PaletteItem[] = [];
        const groups: Record<string, PaletteItem[]> = {};

        paletteItems.forEach(item => {
            if (q && !item.label.toLowerCase().includes(q)) return;
            if (item.id === 'container') {
                containers.push(item);
            } else {
                const category = item.category || 'General';
                if (!groups[category]) groups[category] = [];
                groups[category].push(item);
            }
        });
        return { containerItems: containers, groupedItems: groups };
    }, [paletteItems, searchQuery]);

    const toggleCategory = (category: string) => {
        setCollapsedCategories((prev) => ({ ...prev, [category]: prev[category] === false }));
    };

    const onDragStart = (event: React.DragEvent<HTMLDivElement>, item: PaletteItem) => {
        onDragStartItem(item);
        event.dataTransfer.effectAllowed = 'move';

        const imgSrc = toSafeDataUri(item.image);
        if (imgSrc) {
            const ghost = document.createElement('div');
            // Scale based on canvas zoom (approximated)
            const zoom = parseFloat(document.querySelector('.react-flow__viewport')?.getAttribute('style')?.match(/scale\(([^)]+)\)/)?.[1] || '1');
            const size = Math.round(150 * zoom);
            ghost.style.cssText = `position:fixed;top:-200px;left:-200px;width:${size}px;height:${size}px;pointer-events:none;`;
            
            const img = document.createElement('img');
            img.src = imgSrc;
            img.style.cssText = `width:${size}px;height:${size}px;object-fit:contain;display:block;`;
            ghost.appendChild(img);
            document.body.appendChild(ghost);
            event.dataTransfer.setDragImage(ghost, size / 2, size / 2);
            setTimeout(() => { if (document.body.contains(ghost)) document.body.removeChild(ghost); }, 0);
        }
    };

    return (
        <div style={{ display: 'flex', height: '100%', position: 'relative', zIndex: 5 }}>
            <div style={{ width: isOpen ? '250px' : '0px', backgroundColor: 'var(--neutral-20)', borderRight: isOpen ? '1px solid var(--neutral-40)' : 'none', overflowY: 'auto', overflowX: 'hidden', transition: 'width 0.3s ease', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '15px', whiteSpace: 'nowrap' }}>
                    <h3 style={{ marginTop: 0, color: 'var(--neutral-90)' }}>Palette</h3>

                    <div style={{ marginBottom: '12px', position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Search palette..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ ...sharedInputStyle, paddingRight: searchQuery ? '24px' : '8px' }}
                        />
                        {searchQuery && (
                            <span
                                onClick={() => setSearchQuery('')}
                                style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--neutral-60)', fontSize: '14px', lineHeight: 1 }}
                            >×</span>
                        )}
                    </div>

                    {containerItems.length > 0 && (
                        <div style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid var(--neutral-40)' }}>
                            {containerItems.map((item) => {
                                const { classes: _c, backgroundColor: imageBg, ...itemStyle } = item.style || {};
                                const { classes: _lc, ...labelStyle } = item.labelStyle || {};
                                return (
                                    <div
                                        key={item.id}
                                        draggable
                                        onDragStart={(e) => onDragStart(e, item)}
                                        onClick={() => onItemClick(item)}
                                        style={{ border: '1px dashed var(--neutral-50)', backgroundColor: 'var(--neutral-30)', padding: '10px', marginBottom: '8px', cursor: 'grab', display: 'flex', alignItems: 'center', borderRadius: '4px', fontWeight: 'bold', ...itemStyle }}
                                    >
                                        <div style={{ width: '20px', height: '20px', marginRight: '10px', backgroundColor: imageBg || undefined }}><PaletteThumb src={item.image} label={item.label} /></div>
                                        <span style={{ color: 'var(--neutral-90)', fontSize: '14px', ...labelStyle }}>{item.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {Object.entries(groupedItems).map(([category, items]) => {
                        const isCollapsed = searchQuery.trim() ? false : collapsedCategories[category] !== false;
                        return (
                            <div key={category} style={{ marginBottom: '15px' }}>
                                <div onClick={() => toggleCategory(category)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', backgroundColor: 'var(--neutral-30)', padding: '8px 10px', borderRadius: '4px', marginBottom: '8px', fontWeight: 'bold', color: 'var(--neutral-90)', userSelect: 'none' }}>
                                    <span>{category}</span><span style={{ fontSize: '12px' }}>{isCollapsed ? '▶' : '▼'}</span>
                                </div>
                                {!isCollapsed && (
                                    <div style={{ paddingLeft: '5px' }}>
                                        {items.map((item) => {
                                            const { classes: _c, backgroundColor: imageBg, ...itemStyle } = item.style || {};
                                            const { classes: _lc, ...labelStyle } = item.labelStyle || {};
                                            return (
                                                <div
                                                    key={item.id}
                                                    draggable
                                                    onDragStart={(e) => onDragStart(e, item)}
                                                    onClick={() => onItemClick(item)}
                                                    style={{ border: '1px solid var(--neutral-40)', backgroundColor: 'var(--neutral-10)', padding: '8px', marginBottom: '8px', cursor: 'grab', display: 'flex', alignItems: 'center', borderRadius: '4px', ...itemStyle }}
                                                >
                                                    <div style={{ width: '20px', height: '20px', marginRight: '10px', backgroundColor: imageBg || undefined }}><PaletteThumb src={item.image} label={item.label} /></div>
                                                    <span style={{ color: 'var(--neutral-90)', fontSize: '14px', ...labelStyle }}>{item.label}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {searchQuery.trim() && Object.keys(groupedItems).length === 0 && containerItems.length === 0 && (
                        <div style={{ color: 'var(--neutral-60)', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>
                            No components match "{searchQuery}"
                        </div>
                    )}
                </div>
            </div>
            <div onClick={toggleSidebar} style={{ width: '20px', height: '50px', backgroundColor: 'var(--neutral-40)', border: '1px solid var(--neutral-50)', borderLeft: 'none', borderRadius: '0 4px 4px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginTop: '20px', color: 'var(--neutral-90)' }}>
                {isOpen ? '◀' : '▶'}
            </div>
        </div>
    );
};