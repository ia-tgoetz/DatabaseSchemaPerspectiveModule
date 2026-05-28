import React from 'react';
// @ts-ignore
import { NodeProps, NodeResizer, Handle, Position } from 'reactflow';

export interface NoteLabelNodeData {
    label: string;
    text: string;
    isEditable?: boolean;
    style?: any;
    textStyle?: any;
    paletteId: string;
    onTextChange?: (id: string, newText: string) => void;
    onResizeEnd?: (id: string, x: number, y: number, width: number, height: number) => void;
}

export const NoteLabelNode = ({ id, data, selected }: NodeProps<NoteLabelNodeData>) => {
    const [isEditing, setIsEditing] = React.useState(false);
    const [text, setText] = React.useState(data.text || data.label || '');

    // Sync with incoming data changes
    React.useEffect(() => {
        setText(data.text || data.label || '');
    }, [data.text, data.label]);

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
        userSelect: isEditing ? 'text' : 'none',
        ...data.textStyle
    };

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
                onResizeEnd={(e, params) => {
                    if (data.onResizeEnd) data.onResizeEnd(id, params.x, params.y, params.width, params.height);
                }}
            />
            {isEditing ? (
                isNote ? (
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onBlur={handleBlur}
                        autoFocus
                        style={{ 
                            ...textStyle,
                            border: 'none', 
                            background: 'rgba(255,255,255,0.1)', 
                            outline: 'none',
                            resize: 'none',
                            height: '100%',
                            padding: '4px'
                        }}
                    />
                ) : (
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onBlur={handleBlur}
                        autoFocus
                        onKeyDown={(e) => { if (e.key === 'Enter') handleBlur(); }}
                        style={{ 
                            ...textStyle,
                            border: 'none', 
                            background: 'rgba(255,255,255,0.1)', 
                            outline: 'none',
                            padding: '4px'
                        }}
                    />
                )
            ) : (
                <div style={textStyle}>
                    {text || (isNote ? 'Double-click to add note' : 'Label')}
                </div>
            )}
        </div>
    );
};
