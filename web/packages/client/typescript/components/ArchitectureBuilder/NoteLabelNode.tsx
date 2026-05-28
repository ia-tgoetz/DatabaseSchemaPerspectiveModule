import React from 'react';
// @ts-ignore
import { NodeProps, NodeResizer, Handle, Position } from 'reactflow';

export interface NoteLabelNodeData {
    label: string;
    isEditable?: boolean;
    onTextChange?: (id: string, newText: string) => void;
    onResizeEnd?: (id: string, x: number, y: number, width: number, height: number) => void;
}

export const NoteLabelNode = ({ id, data, selected }: NodeProps<NoteLabelNodeData>) => {
    const [isEditing, setIsEditing] = React.useState(false);
    const [text, setText] = React.useState(data.label || '');

    const handleDoubleClick = () => {
        if (data.isEditable !== false) {
            setIsEditing(true);
        }
    };

    const handleBlur = () => {
        setIsEditing(false);
        if (data.onTextChange) {
            data.onTextChange(id, text);
        }
    };

    const nodeStyle: React.CSSProperties = {
        padding: '10px',
        border: selected ? '2px solid var(--callToAction)' : '1px solid var(--neutral-40)',
        borderRadius: '4px',
        backgroundColor: 'var(--neutral-00)',
        minWidth: '100px',
        minHeight: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: isEditing ? 'text' : 'grab',
        pointerEvents: 'auto',
    };

    return (
        <div onDoubleClick={handleDoubleClick} style={nodeStyle} className={!isEditing ? 'nodrag' : ''}>
            {/* Disabled handles to explicitly prevent connections */}
            <Handle type="source" position={Position.Top} style={{ display: 'none' }} />
            <Handle type="target" position={Position.Top} style={{ display: 'none' }} />
            
            <NodeResizer
                color="var(--callToAction)"
                isVisible={selected && data.isEditable !== false}
                minWidth={50}
                minHeight={20}
                onResizeEnd={(e, params) => {
                    if (data.onResizeEnd) data.onResizeEnd(id, params.x, params.y, params.width, params.height);
                }}
            />
            {isEditing ? (
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onBlur={handleBlur}
                    autoFocus
                    style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'center' }}
                />
            ) : (
                <span style={{ pointerEvents: 'none', userSelect: 'none' }}>{text}</span>
            )}
        </div>
    );
};
