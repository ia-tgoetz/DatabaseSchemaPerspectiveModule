import React from 'react';
// @ts-ignore
import { Handle, Position, NodeProps, useViewport, NodeResizer, useStore } from 'reactflow';
import { extractSvgMarkup, toSafeDataUri, nextSvgScopeId } from './svgSanitize';

export interface ArchitectureNodeData {
    label: string;
    image: string;
    text?: string;
    tooltip?: string;
    configs?: any;
    style?: any;
    labelStyle?: any;
    textStyle?: any;
    paletteId: string;
    inactive?: boolean;
    hideHandles?: boolean;
    globalHideHandles?: boolean;
    isEditable?: boolean;
    handleCount?: number;
    highlightedHandles?: string[];
    onGearClick?: (id: string, event: React.MouseEvent) => void;
    onTextChange?: (id: string, text: string) => void;
    onResizeEnd?: (id: string, x: number, y: number, width: number, height: number) => void;
}

const TEXT_PALETTE_IDS = new Set(['Note', 'Label']);

const NodeImage = ({ src, label }: { src: string, label: string }) => {
    const scopeId = React.useMemo(() => nextSvgScopeId(), []);
    const svgHtml = React.useMemo(() => extractSvgMarkup(src, scopeId), [src, scopeId]);
    if (svgHtml) {
        return (
            <div
                id={scopeId}
                style={{padding: '4px', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
                dangerouslySetInnerHTML={{ __html: svgHtml }}
                title={label}
            />
        );
    }
    const dataUri = toSafeDataUri(src);
    return dataUri ? <img src={dataUri} alt="" style={{padding: '4px', width: '100%', height: '100%', objectFit: 'contain' }} /> : null;
};

export const ArchitectureNode = ({ id, data, selected }: NodeProps<ArchitectureNodeData>) => {
    const { zoom } = useViewport();
    const [hovered, setHovered] = React.useState(false);
    const showHandles = !data.globalHideHandles && !data.hideHandles && data.isEditable !== false;
    const hasHighlightedHandles = !!(data.highlightedHandles && data.highlightedHandles.length > 0);
    const isConnectionInProgress = useStore((s: any) => s.connectionNodeId != null);
    const isTextNode = TEXT_PALETTE_IDS.has(data.paletteId);

    const [localText, setLocalText] = React.useState(data.text || '');
    React.useEffect(() => { setLocalText(data.text || ''); }, [data.text]);

    const finalLabelBg = data.labelStyle?.backgroundColor || 'var(--neutral-30)';
    const finalLabelColor = data.labelStyle?.color || 'var(--neutral-90)';
    const finalGearColor = data.labelStyle?.fill || finalLabelColor; 

    const { backgroundColor: imageBg, ...restStyle } = data.style || {};

    const combinedStyle: React.CSSProperties = {
        padding: '0px',
        borderRadius: '8px',
        backgroundColor: 'var(--neutral-10)',
        border: '1px solid var(--neutral-50)',
        color: 'var(--neutral-90)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        position: 'relative',
        ...restStyle,
        boxShadow: selected ? '0 0 0 2px rgba(0, 123, 255, 0.25)' : (restStyle.boxShadow || '0 2px 4px rgba(0,0,0,0.1)')
    };

    // Enhanced hit area: generous size that remains consistent in screen pixels for usability.
    // Targeting ~24px at 1.0 zoom, scaling up to ~22px as we zoom out.
    const hitSize = Math.min(22, Math.max(16, Math.round(24 / zoom)));

    // Handles are always mounted so React Flow's store always has registered positions.
    // This prevents the intermittent missing connection line (handle mounts just as a
    // drag starts, before its useEffect registration fires) and keeps edges anchored
    // when hideHandles is true.
    // Interactivity and visual appearance are controlled via pointerEvents + CSS (::after).
    const isHandleInteractive = showHandles && (hovered || selected || hasHighlightedHandles || isConnectionInProgress);
    const handleStyle: any = {
        background: 'transparent',
        width: '4px',
        height: '4px',
        opacity: 1,
        pointerEvents: isHandleInteractive ? 'auto' : 'none',
        zIndex: 20,
        '--hit-size': `${hitSize}px`
    };

    const handleCount = Math.max(1, Math.min(5, data.handleCount ?? 3));
    const positions = Array.from({ length: handleCount }, (_, i) => `${((i + 0.5) / handleCount) * 100}%`);
    const highlighted = new Set(data.highlightedHandles || []);
    const handleClass = (id: string) => {
        if (!showHandles) return 'arch-node-handle arch-node-handle--suppressed';
        return highlighted.has(id) ? 'arch-node-handle arch-node-handle--connected' : 'arch-node-handle';
    };

    // Calculate dynamic resizer handle size based on zoom
    const resizerSize = Math.max(10, Math.round(16 / zoom));

    return (
        <div style={combinedStyle} title={data.tooltip} onMouseEnter={() => setHovered(true)} onMouseLeave={(e) => { if (e.buttons === 0) setHovered(false); }}>

            {positions.map((pos, i) => (
                <Handle key={`top-${i}`} className={handleClass(`top-${i}`)} type="source" position={Position.Top} id={`top-${i}`} style={{ ...handleStyle, left: pos, top: '0px', transform: 'translate(-50%, -50%)' }} />
            ))}
            {positions.map((pos, i) => (
                <Handle key={`right-${i}`} className={handleClass(`right-${i}`)} type="source" position={Position.Right} id={`right-${i}`} style={{ ...handleStyle, top: pos, left: '100%', transform: 'translate(-50%, -50%)' }} />
            ))}
            {positions.map((pos, i) => (
                <Handle key={`bottom-${i}`} className={handleClass(`bottom-${i}`)} type="source" position={Position.Bottom} id={`bottom-${i}`} style={{ ...handleStyle, left: pos, top: '100%', transform: 'translate(-50%, -50%)' }} />
            ))}
            {positions.map((pos, i) => (
                <Handle key={`left-${i}`} className={handleClass(`left-${i}`)} type="source" position={Position.Left} id={`left-${i}`} style={{ ...handleStyle, top: pos, left: '0px', transform: 'translate(-50%, -50%)' }} />
            ))}

            <div
                style={{
                    position: 'absolute', top: 0, left: 0,
                    maxWidth: '100%', boxSizing: 'border-box', 
                    backgroundColor: finalLabelBg, padding: '4px 8px',
                    borderTopLeftRadius: '7px', 
                    borderTopRightRadius: '7px', 
                    borderBottomRightRadius: '8px',
                    fontSize: '12px', fontWeight: 'bold', color: finalLabelColor,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                    overflow: 'hidden',
                    zIndex: 10,
                    ...(data.labelStyle || {}) 
                }}
                onClick={(e) => {
                    e.stopPropagation();
                    if (data.onGearClick) data.onGearClick(id, e);
                }}
                title={data.label} 
            >
                <div className="arch-node-gear" style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                    <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill={finalGearColor} aria-label="Settings">
                        <path d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z"/>
                    </svg>
                </div>
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>
                    {data.label}
                </span>
            </div>

            {data.image && (
                <div
                    className="arch-node-svg-wrapper"
                    style={{ 
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        width: '100%', minHeight: 0, zIndex: 1, backgroundColor: imageBg || undefined,
                        filter: data.inactive ? 'grayscale(100%) blur(2px)' : undefined 
                    }}
                >
                    <NodeImage src={data.image} label={data.label} />
                </div>
            )}
        </div>
    );
};
