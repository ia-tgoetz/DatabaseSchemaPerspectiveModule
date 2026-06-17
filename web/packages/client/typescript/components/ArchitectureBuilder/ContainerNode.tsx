import React from 'react';
// @ts-ignore
import { NodeProps, NodeResizer, useViewport } from 'reactflow';

export interface ContainerNodeData {
    label: string;
    style?: any;
    labelStyle?: any;
    isEditable?: boolean;
    unlockMovement?: boolean;
    enableResize?: boolean;
    onGearClick?: (id: string, event: React.MouseEvent) => void;
    onResizeEnd?: (id: string, x: number, y: number, width: number, height: number) => void;
}

export const ContainerNode = ({ id, data, selected }: NodeProps<ContainerNodeData>) => {
    const { zoom } = useViewport();
    const finalLabelBg = data.labelStyle?.backgroundColor || 'var(--neutral-30)';
    const finalLabelColor = data.labelStyle?.color || 'var(--neutral-90)';
    const finalGearColor = data.labelStyle?.fill || finalLabelColor; 
    
    // Use the unified flag passed from mapIgnitionToReactFlowNodes
    const isUnlocked = data.unlockMovement;

    const combinedStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        backgroundColor: data.style?.backgroundColor || data.style?.fill || 'rgba(128, 128, 128, 0.2)',
        border: selected ? '2px solid var(--callToAction)' : '2px dashed var(--neutral-50)', 
        borderRadius: '8px',
        position: 'relative',
        boxSizing: 'border-box',
        ...(data.style || {}),
        
        outline: (selected && !data.enableResize) ? '2px solid var(--callToAction)' : 'none',
        outlineOffset: '2px',
        // Panning fall-through handled at the node-wrapper level in ArchitectureBuilder.tsx
    };

    // Calculate dynamic resizer handle size based on zoom.
    const resizerSize = Math.max(10, Math.round(16 / zoom));

    return (
        <>
            <NodeResizer 
                color="var(--callToAction)" 
                isVisible={selected && data.enableResize === true}
                minWidth={150} 
                minHeight={150}
                // Resize handles MUST remain interactive even if the shell is 'none'
                handleStyle={{ width: `${resizerSize}px`, height: `${resizerSize}px`, borderRadius: '4px', pointerEvents: 'auto' }} 
                onResizeEnd={(e, params) => {
                    if (data.onResizeEnd) data.onResizeEnd(id, params.x, params.y, params.width, params.height);
                }}
            />
            <div style={combinedStyle}>
                {/* Lock/Unlock Indicator in the top-right corner */}
                <div style={{
                    position: 'absolute', top: '8px', right: '8px',
                    zIndex: 20, color: 'var(--neutral-60)',
                    display: 'flex', alignItems: 'center', pointerEvents: 'none',
                    opacity: 0.9,
                    filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.5))'
                }}>
                    {isUnlocked ? (
                        /* Unlocked Icon (Lock Open) */
                        <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="currentColor">
                            <path d="M240-640v-80q0-100 70-170t170-70q100 0 170 70t70 170h-80q0-66-47-113t-113-47q-66 0-113 47t-47 113v80H240Zm560 560H160V-560h640v480ZM240-160h480v-320H240v320Zm240-160q33 0 56.5-23.5T560-400q0-33-23.5-56.5T480-480q-33 0-56.5 23.5T400-400q0 33 23.5 56.5T480-320ZM240-160v-320 320Z"/>
                        </svg>
                    ) : (
                        /* Locked Icon */
                        <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="currentColor">
                            <path d="M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h40v-80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720v80h40q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Zm0-80h480v-400H240v400Zm240-120q33 0 56.5-23.5T560-360q0-33-23.5-56.5T480-440q-33 0-56.5 23.5T400-360q0 33 23.5 56.5T480-280ZM360-640h240v-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80ZM240-160v-400 400Z"/>
                        </svg>
                    )}
                </div>
                <div
                    className="custom-drag-handle"
                    onPointerDown={(e) => { e.stopPropagation(); }}
                    style={{
                        position: 'absolute', top: 0, left: 0,
                        maxWidth: '100%', boxSizing: 'border-box', 
                        backgroundColor: finalLabelBg, padding: '4px 8px',
                        borderTopLeftRadius: '7px', 
                        borderTopRightRadius: '7px', 
                        borderBottomRightRadius: '8px',
                        fontSize: '12px', fontWeight: 'bold', color: finalLabelColor,
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '6px',
                        overflow: 'hidden',
                        transition: 'background-color 0.2s ease',
                        zIndex: 10,
                        pointerEvents: 'auto', // Always interactive for dragging
                        ...(data.labelStyle || {}) 
                    }}
                    onMouseEnter={(e) => {
                        if (!data.unlockMovement) {
                            (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--neutral-40)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!data.unlockMovement) {
                            (e.currentTarget as HTMLElement).style.backgroundColor = finalLabelBg;
                        }
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
            </div>
        </>
    );
};