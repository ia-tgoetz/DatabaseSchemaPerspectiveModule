import type { CSSProperties } from 'react';

export const TEXT_NODE_PALETTE_IDS = new Set(['Note', 'Label']);

// ─── Shared UI style primitives ───────────────────────────────────────────────

export const sharedInputStyle: CSSProperties = {
    width: '100%', padding: '6px 8px', backgroundColor: 'var(--neutral-00)', border: '1px solid var(--neutral-40)',
    color: 'var(--neutral-90)', borderRadius: '4px', boxSizing: 'border-box', fontSize: '12px'
};

export const labelRowStyle: CSSProperties = { marginBottom: '10px', display: 'flex', flexDirection: 'column' };
export const sectionTitleStyle: CSSProperties = { fontSize: '14px', fontWeight: 'bold', color: 'var(--callToAction)', borderBottom: '1px solid var(--neutral-40)', paddingBottom: '4px', marginBottom: '10px' };

export const STANDARD_PALETTE: string[] = [
    '#ffffff', '#e0e0e0', '#c0c0c0', '#a0a0a0', '#808080', '#606060', '#404040', '#202020', '#000000',
    '#ffcccc', '#ff9999', '#ff6666', '#ff3333', '#ff0000', '#cc0000', '#990000', '#660000', '#330000',
    '#ffe5cc', '#ffcc99', '#ffb266', '#ff9933', '#ff8000', '#cc6600', '#994c00', '#663300', '#331900',
    '#ffffcc', '#ffff99', '#ffff66', '#ffff33', '#ffff00', '#cccc00', '#999900', '#666600', '#333300',
    '#ccffcc', '#99ff99', '#66ff66', '#33ff33', '#00ff00', '#00cc00', '#009900', '#006600', '#003300',
    '#ccffff', '#99ffff', '#66ffff', '#33ffff', '#00ffff', '#00cccc', '#009999', '#006666', '#003333',
    '#ccccff', '#9999ff', '#6666ff', '#3333ff', '#0000ff', '#0000cc', '#000099', '#000066', '#000033',
    '#ffccff', '#ff99ff', '#ff66ff', '#ff33ff', '#ff00ff', '#cc00cc', '#990099', '#660066', '#330033'
];
