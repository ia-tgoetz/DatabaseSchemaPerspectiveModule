export interface ContextMenuState {
    id: string;
    top: number;
    left: number;
    type: 'node' | 'edge' | 'pane';
    clientX?: number;
    clientY?: number;
    isContainer?: boolean;
}
