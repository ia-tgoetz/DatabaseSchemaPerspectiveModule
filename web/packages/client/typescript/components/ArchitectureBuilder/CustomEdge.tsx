import * as React from 'react';
// @ts-ignore
import { BaseEdge, getBezierPath, getStraightPath, EdgeLabelRenderer, useReactFlow } from 'reactflow';
import { buildPolylinePath, computeAutoWaypoints } from './EdgeUtils';

type Waypoint = { x: number; y: number };

interface DragState {
    startClientX: number;
    startClientY: number;
    startCoord: number;
    wp0Idx: number;
    wp1Idx: number;
    isH: boolean;
    baseWaypoints: Waypoint[];
    snapEnabled: boolean;
    snapPixels: number;
    onWaypointsChange: ((wps: Waypoint[]) => void) | undefined;
}

export const CustomEdge = ({
    sourceX, sourceY, targetX, targetY,
    sourcePosition, targetPosition,
    data, markerEnd, style, label, interactionWidth, zIndex,
}: any) => {
    const storedWaypoints: Waypoint[] = data?.waypoints ?? [];
    const showLabel = data?.showLabel === true;
    const { getZoom } = useReactFlow();
    const zoom = getZoom();

    // Calculate dynamic interaction width (selection/drag zone)
    const dynamicInteractionWidth = Math.max(20, Math.round(24 / zoom));

    // Calculate dynamic segment handle dimensions (colored pills)
    const hWidth = Math.max(24, Math.round(36 / zoom));
    const hHeight = Math.max(10, Math.round(14 / zoom));

    // terminal points (native reactflow coordinates)
    const sx = sourceX;
    const sy = sourceY;
    const tx = targetX;
    const ty = targetY;

    // null = at rest (derive from props); non-null = user is actively dragging.
    const [liveWaypoints, setLiveWaypoints] = React.useState<Waypoint[] | null>(null);
    const dragState = React.useRef<DragState | null>(null);

    const [isEditing, setIsEditing] = React.useState(false);
    const [editingText, setEditingText] = React.useState(label);

    const isStepType = data?.lineType === 'step' || data?.lineType === 'smoothstep' || !data?.lineType;
    const isHorizSrc = sourcePosition === 'right' || sourcePosition === 'left';
    const isHorizTgt = targetPosition === 'right' || targetPosition === 'left';

    // Priority: active drag > stored custom waypoints > auto-routed (only if NO waypoints exist).
    const baseWaypoints: Waypoint[] =
        liveWaypoints ??
        (storedWaypoints.length > 0
            ? storedWaypoints
            : computeAutoWaypoints(sx, sy, sourcePosition, tx, ty, targetPosition));

    // Pin logic uses shifted terminal coordinates to enforce orthogonality on manual paths.
    const pinnedWaypoints: Waypoint[] =
        isStepType && baseWaypoints.length > 0
            ? baseWaypoints.map((wp, i) => {
                const result = { ...wp }; // Shallow copy to avoid mutation
                // Pin FIRST waypoint to the handle's exit axis.
                // If it's a side handle (horiz), force WP0.y to handle's Y.
                // If it's a top/bottom handle (vert), force WP0.x to handle's X.
                if (i === 0) {
                    if (isHorizSrc) result.y = sy;
                    else result.x = sx;
                }
                // Pin LAST waypoint to the handle's entry axis.
                if (i === baseWaypoints.length - 1) {
                    if (isHorizTgt) result.y = ty;
                    else result.x = tx;
                }
                return result;
            })
            : baseWaypoints;

    // Filter out redundant waypoints (points that coincide with handles) to prevent 
    // zero-length segments that cause rendering artifacts or 'weird' line jumps.
    const filteredWaypoints = pinnedWaypoints.filter((wp, i) => {
        if (i === 0) {
            // First point is redundant if it exactly matches the source handle
            return Math.hypot(wp.x - sx, wp.y - sy) > 1;
        }
        if (i === pinnedWaypoints.length - 1) {
            // Last point is redundant if it exactly matches the target handle
            return Math.hypot(wp.x - tx, wp.y - ty) > 1;
        }
        return true;
    });

    const allPts: Waypoint[] = [{ x: sx, y: sy }, ...filteredWaypoints, { x: tx, y: ty }];

    // ─── Path computation ────────────────────────────────────────────────

    let edgePath = '', labelX = (sx + tx) / 2, labelY = (sy + ty) / 2;

    if (isStepType) {
        edgePath = buildPolylinePath(allPts, data?.lineType === 'step' ? 0 : 12);
        if (allPts.length >= 2) {
            const mid = Math.floor(allPts.length / 2);
            labelX = (allPts[mid - 1].x + allPts[mid].x) / 2;
            labelY = (allPts[mid - 1].y + allPts[mid].y) / 2;
        }
    } else if (data?.lineType === 'straight') {
        [edgePath, labelX, labelY] = getStraightPath({ sourceX: sx, sourceY: sy, targetX: tx, targetY: ty });
    } else {
        [edgePath, labelX, labelY] = getBezierPath({ sourceX: sx, sourceY: sy, targetX: tx, targetY: ty, sourcePosition, targetPosition });
    }

    // ─── Pointer-capture drag engine ──────────────────────────────────────

    const canEdit = data?.isSelected && isStepType && data?.isEditable !== false;

    const applyDelta = (ref: DragState, clientX: number, clientY: number): Waypoint[] => {
        const zoom = getZoom();
        const rawDelta = ref.isH
            ? (clientY - ref.startClientY) / zoom
            : (clientX - ref.startClientX) / zoom;
        let newCoord = ref.startCoord + rawDelta;
        if (ref.snapEnabled && ref.snapPixels) newCoord = Math.round(newCoord / ref.snapPixels) * ref.snapPixels;
        return ref.baseWaypoints.map((wp, i) =>
            i === ref.wp0Idx || i === ref.wp1Idx
                ? ref.isH ? { ...wp, y: newCoord } : { ...wp, x: newCoord }
                : wp
        );
    };

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, segIdx: number, isH: boolean) => {
        e.stopPropagation();
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);

        const startWps = pinnedWaypoints;
        dragState.current = {
            startClientX: e.clientX,
            startClientY: e.clientY,
            startCoord: isH ? startWps[segIdx - 1].y : startWps[segIdx - 1].x,
            wp0Idx: segIdx - 1,
            wp1Idx: segIdx,
            isH,
            baseWaypoints: startWps,
            snapEnabled: data?.snapEnabled ?? true,
            snapPixels: data?.snapPixels ?? 15,
            onWaypointsChange: data?.onWaypointsChange,
        };
        setLiveWaypoints(startWps);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!dragState.current) return;
        setLiveWaypoints(applyDelta(dragState.current, e.clientX, e.clientY));
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        const ref = dragState.current;
        if (!ref) return;
        e.currentTarget.releasePointerCapture(e.pointerId);
        ref.onWaypointsChange?.(applyDelta(ref, e.clientX, e.clientY));
        dragState.current = null;
        setLiveWaypoints(null);
    };

    const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!dragState.current) return;
        e.currentTarget.releasePointerCapture(e.pointerId);
        dragState.current = null;
        setLiveWaypoints(null);
    };

    // ─── Label editing ───────────────────────────────────────────────────

    const handleLabelDoubleClick = () => {
        setIsEditing(true);
        setEditingText(label);
    };


    const handleSave = () => {
        if (editingText !== label && data?.onLabelChange) {
            data.onLabelChange(editingText);
        }
        setIsEditing(false);
    };

    const handleLabelInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            handleSave();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            setIsEditing(false);
        }
    };

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setEditingText(e.target.value);
    };


    // ─── Render ───────────────────────────────────────────────────────────

    const segHandlePts: Waypoint[] = [{ x: sx, y: sy }, ...pinnedWaypoints, { x: tx, y: ty }];
    const isDashed = data?.dashed === true;
    const animation = isDashed ? 'none' : (data?.animation ?? 'none');
    
    // Shared overlay style for particles
    const overlayBaseStyle: React.CSSProperties = { 
        ...style, 
        fill: 'none', 
        stroke: 'rgba(255, 255, 255, 0.95)', 
        strokeWidth: Math.max(3, (style?.strokeWidth || 6) * 0.5), 
        pointerEvents: 'none',
        strokeLinecap: 'round'
    };

    return (
        <>
            {/* 1. Base solid edge (always rendered, keeps the arrow) */}
            <BaseEdge
                path={edgePath}
                markerEnd={markerEnd}
                style={{ 
                    ...style, 
                    fill: 'none', 
                    strokeLinecap: 'round',
                    filter: 'drop-shadow(0px 1px 1px rgba(0,0,0,0.3))'
                }}
                interactionWidth={dynamicInteractionWidth}
            />

            {/* 2. Animation Layers (Overlays) */}
            {animation === 'forward' && (
                <BaseEdge
                    path={edgePath}
                    style={{
                        ...overlayBaseStyle,
                        strokeDasharray: '10 90',
                        animation: 'arch-flow-forward 0.75s linear infinite',
                            filter: `
                            drop-shadow(1px 0px 0px rgba(0, 0, 0, 1)) 
                            drop-shadow(-1px 0px 0px rgba(0, 0, 0, 1)) 
                            drop-shadow(0px 1px 0px rgba(0, 0, 0, 1)) 
                            drop-shadow(0px -1px 0px rgba(0, 0, 0, 1))
                            `
                    }}
                />
            )}
            {animation === 'bidirectional' && (
                <>
                    <BaseEdge
                        path={edgePath}
                        style={{
                            ...overlayBaseStyle,
                            strokeDasharray: '10 90',
                            animation: 'arch-flow-forward 0.75s linear infinite',
                            filter: `
                            drop-shadow(1px 0px 0px rgba(0, 0, 0, 1)) 
                            drop-shadow(-1px 0px 0px rgba(0, 0, 0, 1)) 
                            drop-shadow(0px 1px 0px rgba(0, 0, 0, 1)) 
                            drop-shadow(0px -1px 0px rgba(0, 0, 0, 1))
                            `
                        }}
                    />
                    <BaseEdge
                        path={edgePath}
                        style={{
                            ...overlayBaseStyle,
                            strokeDasharray: '10 90',
                            strokeDashoffset: 50,
                            animation: 'arch-flow-reverse 0.75s linear infinite',
                            filter: `
                            drop-shadow(1px 0px 0px rgba(0, 0, 0, 1)) 
                            drop-shadow(-1px 0px 0px rgba(0, 0, 0, 1)) 
                            drop-shadow(0px 1px 0px rgba(0, 0, 0, 1)) 
                            drop-shadow(0px -1px 0px rgba(0, 0, 0, 1))
                            `
                        }}
                    />
                </>
            )}

            {label && showLabel && (
                <EdgeLabelRenderer>
                    <div
                        onDoubleClick={handleLabelDoubleClick}
                        style={{
                            position: 'absolute',
                            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                            backgroundColor: 'var(--neutral-10)', padding: '2px 8px', borderRadius: '4px',
                            border: `1px solid var(--neutral-40)`, fontSize: '12px', fontWeight: 'bold',
                            color: style?.stroke || 'var(--neutral-90)', pointerEvents: 'auto',
                            zIndex: (zIndex ?? 5000) + 50, cursor: 'pointer', whiteSpace: 'pre-wrap', textAlign: 'center',
                        }}
                        className="nodrag nopan"
                    >
                        {label}
                    </div>
                </EdgeLabelRenderer>
            )}
            {isEditing && (
                <EdgeLabelRenderer>
                    <div
                        className="nodrag nopan"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            position: 'fixed',
                            top: 0, left: 0, right: 0, bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.45)',
                            zIndex: 9999,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            pointerEvents: 'auto',
                        }}
                    >
                        <div style={{
                            backgroundColor: 'var(--neutral-10)',
                            borderRadius: '8px',
                            padding: '16px',
                            border: '1px solid var(--neutral-40)',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.35)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px',
                            minWidth: '220px',
                        }}>
                            <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--neutral-70)' }}>
                                Edit Label
                            </div>
                            <textarea
                                value={editingText}
                                onChange={handleTextareaChange}
                                onKeyDown={handleLabelInputKeyDown}
                                autoFocus
                                rows={3}
                                style={{
                                    backgroundColor: 'var(--neutral-20)',
                                    padding: '6px 8px',
                                    borderRadius: '4px',
                                    border: '1px solid var(--neutral-40)',
                                    fontSize: '12px',
                                    color: 'var(--neutral-90)',
                                    outline: 'none',
                                    resize: 'vertical',
                                    fontFamily: 'inherit',
                                    pointerEvents: 'auto',
                                }}
                            />
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    style={{
                                        padding: '4px 14px', borderRadius: '4px',
                                        border: '1px solid var(--neutral-40)',
                                        backgroundColor: 'var(--neutral-20)',
                                        color: 'var(--neutral-90)',
                                        fontSize: '12px', cursor: 'pointer',
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    style={{
                                        padding: '4px 14px', borderRadius: '4px',
                                        border: 'none',
                                        backgroundColor: 'var(--callToAction)',
                                        color: 'white',
                                        fontSize: '12px', fontWeight: 'bold', cursor: 'pointer',
                                    }}
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                </EdgeLabelRenderer>
            )}
            {canEdit && segHandlePts.length >= 4 && (
                <EdgeLabelRenderer>
                    {segHandlePts.slice(0, -1).map((pt, i) => {
                        const next = segHandlePts[i + 1];
                        if (i === 0 || i === segHandlePts.length - 2) return null;
                        const dx = Math.abs(next.x - pt.x);
                        const dy = Math.abs(next.y - pt.y);
                        if (dx + dy < 10) return null;
                        const isH = dx > dy;
                        const mx = (pt.x + next.x) / 2;
                        const my = (pt.y + next.y) / 2;
                        return (
                            <div
                                key={`seg-${i}`}
                                className="nodrag nopan"
                                onPointerDown={(e) => handlePointerDown(e, i, isH)}
                                onPointerMove={handlePointerMove}
                                onPointerUp={handlePointerUp}
                                onPointerCancel={handlePointerCancel}
                                title={isH ? 'Drag up/down' : 'Drag left/right'}
                                style={{
                                    position: 'absolute',
                                    transform: `translate(-50%, -50%) translate(${mx}px, ${my}px)`,
                                    width: isH ? `${hWidth}px` : `${hHeight}px`,
                                    height: isH ? `${hHeight}px` : `${hWidth}px`,
                                    borderRadius: `${hHeight / 2}px`,
                                    backgroundColor: 'var(--callToAction)',
                                    opacity: 0.85,
                                    cursor: isH ? 'ns-resize' : 'ew-resize',
                                    zIndex: (zIndex ?? 5000) + 100,
                                    pointerEvents: 'all',
                                    touchAction: 'none',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
                                }}
                            />
                        );
                    })}
                </EdgeLabelRenderer>
            )}
        </>
    );
};

export const edgeTypes = { custom: CustomEdge };
