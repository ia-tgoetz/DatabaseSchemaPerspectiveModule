import React from 'react';
// @ts-ignore
import { NodeProps, NodeResizer, Handle, Position, useViewport } from 'reactflow';

export interface NoteLabelNodeData {
    label: string;
    text: string;
    isEditable?: boolean;
    isEditing?: boolean; // New flag for external triggers
    style?: any;
    textStyle?: any;
    paletteId: string;
    onTextChange?: (id: string, newText: string) => void;
    onResizeEnd?: (id: string, x: number, y: number, width: number, height: number) => void;
}

export const NoteLabelNode = ({ id, data, selected }: NodeProps<NoteLabelNodeData>) => {
    const { zoom } = useViewport();
    const [isEditing, setIsEditing] = React.useState(false);
    const [text, setText] = React.useState(data.text || data.label || '');

    // Sync with incoming data changes
    React.useEffect(() => {
        setText(data.text || data.label || '');
    }, [data.text, data.label]);

    // Support external edit mode trigger from context menu
    React.useEffect(() => {
        if (data.isEditing) {
            setIsEditing(true);
        }
    }, [data.isEditing]);

    const handleDoubleClick = (e: React.MouseEvent) => {
        if (data.isEditable !== false) {
            e.stopPropagation();
            setIsEditing(true);
        }
    };

    const handleBlur = () => {
        setIsEditing(false);
        if (data.onTextChange && text !== (data.text || data.label)) {
            data.onTextChange(id, text);
        }
    };

    const isNote = data.paletteId === 'Note';

    const nodeStyle: React.CSSProperties = {
        padding: '10px',
        border: selected ? '2px solid var(--callToAction)' : (data.style?.border || '1px solid var(--neutral-40)'),
        borderRadius: data.style?.borderRadius || '4px',
        backgroundColor: data.style?.backgroundColor || 'var(--neutral-00)',
        minWidth: '60px',
        minHeight: '30px',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: isEditing ? 'text' : 'grab',
        pointerEvents: 'auto',
        overflow: 'hidden',
        boxSizing: 'border-box',
        ...data.style
    };

    const textStyle: React.CSSProperties = {
        color: data.textStyle?.color || 'var(--neutral-90)',
        fontSize: data.textStyle?.fontSize || '14px',
        textAlign: 'center',
        width: '100%',
        wordBreak: 'break-word',
        whiteSpace: 'pre-wrap',
        userSelect: isEditing ? 'text' : 'none',
        ...data.textStyle
    };

    // Calculate dynamic resizer handle size based on zoom (matching ContainerNode logic)
    const resizerSize = Math.max(10, Math.round(16 / zoom));

    return (
        <div onDoubleClick={handleDoubleClick} style={nodeStyle} className={isEditing ? 'nodrag' : ''}>
            {/* Hidden handles to explicitly prevent connections */}
            <Handle type="source" position={Position.Top} style={{ display: 'none', pointerEvents: 'none' }} />
            <Handle type="target" position={Position.Top} style={{ display: 'none', pointerEvents: 'none' }} />
            
            <NodeResizer
                color="var(--callToAction)"
                isVisible={selected && data.isEditable !== false}
                minWidth={40}
                minHeight={20}
                handleStyle={{ width: `${resizerSize}px`, height: `${resizerSize}px`, borderRadius: '4px' }}
                onResizeEnd={(e, params) => {
                    if (data.onResizeEnd) data.onResizeEnd(id, params.x, params.y, params.width, params.height);
                }}
            />
            {isEditing ? (
                <textarea
                    className="nodrag nopan"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onBlur={handleBlur}
                    autoFocus
                    onKeyDown={(e) => {
                        // For Labels, we still treat Enter as "done" unless Shift is held.
                        // Notes allow free-form Enter.
                        if (!isNote && e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleBlur();
                        }
                    }}
                    style={{ 
                        ...textStyle,
                        border: 'none', 
                        background: 'rgba(255,255,255,0.1)', 
                        outline: 'none',
                        resize: 'none',
                        width: '100%',
                        height: '100%',
                        padding: '4px',
                        boxSizing: 'border-box',
                        overflow: 'hidden'
                    }}
                />
            ) : (
                <div style={{ ...textStyle, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {text || (isNote ? 'Double-click to add note' : 'Label')}
                </div>
            )}
        </div>
    );
};
