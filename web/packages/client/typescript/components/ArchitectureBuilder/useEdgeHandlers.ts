import * as React from 'react';
// @ts-ignore
import { Edge, Connection } from 'reactflow';
import { ContextMenuState } from './types';
import { getSafeError, generateShortId } from './utils';

export interface UseEdgeHandlersParams {
    store: any;
    componentEvents: any;
    rawNodesDict: any;
    rawEdgesDict: any;
    connectionTypes: any;
    selectedId: string | null;
    setSelectedId: React.Dispatch<React.SetStateAction<string | null>>;
    contextMenu: ContextMenuState | null;
    setContextMenu: React.Dispatch<React.SetStateAction<ContextMenuState | null>>;
    setActiveSubMenu: React.Dispatch<React.SetStateAction<any>>;
    setLocalEdges: React.Dispatch<React.SetStateAction<any[]>>;
    reactFlowWrapper: React.RefObject<HTMLDivElement>;
    closeContextMenu: () => void;
}

export const useEdgeHandlers = ({
    store,
    componentEvents,
    rawNodesDict,
    rawEdgesDict,
    connectionTypes,
    selectedId,
    setSelectedId,
    contextMenu,
    setContextMenu,
    setActiveSubMenu,
    setLocalEdges,
    reactFlowWrapper,
    closeContextMenu,
}: UseEdgeHandlersParams) => {
    const [isUpdatingEdge, setIsUpdatingEdge] = React.useState(false);
    const updatingEdgeRef = React.useRef<string | null>(null);

    // ─── Validation ──────────────────────────────────────────────────────────

    const getValidIntersection = React.useCallback((sourceId: string, targetId: string, ignoreEdgeId?: string): string[] => {
        const sourceNode = rawNodesDict[sourceId];
        const targetNode = rawNodesDict[targetId];
        if (!sourceNode || !targetNode || !sourceNode.supportedConnections || !targetNode.supportedConnections) return [];
        let intersection = sourceNode.supportedConnections.filter((c: string) => targetNode.supportedConnections.includes(c));
        intersection = intersection.filter((connType: string) => {
            const typeDef = connectionTypes[connType];
            const isMultipleFalse = typeDef && (typeDef.multiple === false || String(typeDef.multiple).toLowerCase() === 'false');
            if (isMultipleFalse) {
                const edgeExists = Object.entries(rawEdgesDict).some(([id, e]: any) => {
                    if (ignoreEdgeId && id === ignoreEdgeId) return false;
                    return (e.source === sourceId && e.target === targetId && e.connectionType === connType) ||
                           (e.source === targetId && e.target === sourceId && e.connectionType === connType);
                });
                return !edgeExists;
            }
            return true;
        });
        return intersection;
    }, [rawNodesDict, rawEdgesDict, connectionTypes]);

    const isValidConnection = React.useCallback((connection: any) => {
        return getValidIntersection(connection.source, connection.target, updatingEdgeRef.current || undefined).length > 0;
    }, [getValidIntersection]);

    // ─── Edge handlers ───────────────────────────────────────────────────────

    const handleWaypointsChange = React.useCallback((edgeId: string, waypoints: { x: number; y: number }[]) => {
        try {
            if (!store?.props) return;
            const nextEdges = { ...rawEdgesDict };
            if (nextEdges[edgeId]) {
                nextEdges[edgeId] = { ...nextEdges[edgeId], waypoints };
                store.props.write('edges', nextEdges);
                setLocalEdges(edges => edges.map(e => e.id === edgeId ? { ...e, data: { ...e.data, waypoints } } : e));
            }
        } catch (error: any) {
            console.error("Error in handleWaypointsChange:", error);
            if (componentEvents?.fireComponentEvent) componentEvents.fireComponentEvent('onCanvasError', getSafeError(error, 'handleWaypointsChange'));
        }
    }, [store, rawEdgesDict, componentEvents, setLocalEdges]);

    const onConnect = React.useCallback((connectionParams: any) => {
        try {
            const validTypes = getValidIntersection(connectionParams.source, connectionParams.target);
            if (validTypes.length === 0) return;
            const selectedType = validTypes[0];
            const typeDef = connectionTypes[selectedType] || {};
            if (store?.props) {
                store.props.write('edges', {
                    ...rawEdgesDict,
                    [generateShortId()]: { ...connectionParams, lineType: 'smoothstep', dashed: false, arrow: typeDef.arrow !== false, showLabel: false, labelText: '', connectionType: selectedType, waypoints: [] },
                });
            }
        } catch (error: any) {
            console.error("Error in onConnect:", error);
            if (componentEvents?.fireComponentEvent) componentEvents.fireComponentEvent('onCanvasError', getSafeError(error, 'onConnect'));
        }
    }, [store, rawEdgesDict, getValidIntersection, connectionTypes, componentEvents]);

    const onEdgeUpdate = React.useCallback((oldEdge: Edge, newConnection: Connection) => {
        try {
            if (!newConnection.source || !newConnection.target) return;
            const validTypes = getValidIntersection(newConnection.source, newConnection.target, oldEdge.id);
            if (validTypes.length === 0) return;
            if (store?.props) {
                const nextEdges = { ...rawEdgesDict };
                const oldData = nextEdges[oldEdge.id];
                if (!validTypes.includes(oldData.connectionType)) return;

                const isHoriz = (side: string | undefined) => side === 'left' || side === 'right';
                const oldSrcSide = oldEdge.sourceHandle?.split('-')[0];
                const newSrcSide = newConnection.sourceHandle?.split('-')[0];
                const oldTgtSide = oldEdge.targetHandle?.split('-')[0];
                const newTgtSide = newConnection.targetHandle?.split('-')[0];

                const srcAxisChanged = isHoriz(oldSrcSide) !== isHoriz(newSrcSide);
                const tgtAxisChanged = isHoriz(oldTgtSide) !== isHoriz(newTgtSide);
                const nextWaypoints = (srcAxisChanged || tgtAxisChanged) ? [] : (oldData.waypoints || []);

                nextEdges[oldEdge.id] = {
                    ...oldData,
                    source: newConnection.source,
                    target: newConnection.target,
                    sourceHandle: newConnection.sourceHandle,
                    targetHandle: newConnection.targetHandle,
                    waypoints: nextWaypoints
                };
                store.props.write('edges', nextEdges);
            }
        } catch (error: any) {
            console.error("Error in onEdgeUpdate:", error);
            if (componentEvents?.fireComponentEvent) componentEvents.fireComponentEvent('onCanvasError', getSafeError(error, 'onEdgeUpdate'));
        }
    }, [store, rawEdgesDict, getValidIntersection, componentEvents]);

    const onEdgeUpdateStart = React.useCallback((event: any, edge: any) => {
        updatingEdgeRef.current = edge?.id || null;
        setIsUpdatingEdge(true);
    }, []);

    const onEdgeUpdateEnd = React.useCallback(() => {
        updatingEdgeRef.current = null;
        setIsUpdatingEdge(false);
    }, []);

    const onConnectStart = React.useCallback(() => {
        reactFlowWrapper.current?.classList.add('arch-creating-edge');
    }, [reactFlowWrapper]);
    const onConnectEnd = React.useCallback(() => {
        reactFlowWrapper.current?.classList.remove('arch-creating-edge');
    }, [reactFlowWrapper]);

    const onEdgesDelete = React.useCallback((deleted: Edge[]) => {
        try {
            if (!store?.props) return;
            const nextEdges = { ...rawEdgesDict };
            deleted.forEach(e => { delete nextEdges[e.id]; if (e.id === selectedId) setSelectedId(null); });
            store.props.write('edges', nextEdges);
        } catch (error: any) {
            console.error("Error in onEdgesDelete:", error);
            if (componentEvents?.fireComponentEvent) componentEvents.fireComponentEvent('onCanvasError', getSafeError(error, 'onEdgesDelete'));
        }
    }, [store, rawEdgesDict, selectedId, setSelectedId, componentEvents]);

    const onEdgeContextMenu = React.useCallback((event: any, edge: any) => {
        event.preventDefault();
        setSelectedId(edge.id);
        const bounds = reactFlowWrapper.current?.getBoundingClientRect();
        if (bounds) {
            setContextMenu({ id: edge.id, top: event.clientY - bounds.top, left: event.clientX - bounds.left, type: 'edge' });
            setActiveSubMenu(null);
        }
    }, [reactFlowWrapper, setSelectedId, setContextMenu, setActiveSubMenu]);

    const onEdgeClick = React.useCallback((event: any, edge: any) => {
        closeContextMenu();
        setSelectedId(edge.id);
        const rawEdge = rawEdgesDict[edge.id];
        if (componentEvents) componentEvents.fireComponentEvent('onEdgeClick', { id: edge.id, paletteId: rawEdge?.connectionType, type: 'edge' });
    }, [componentEvents, rawEdgesDict, setSelectedId, closeContextMenu]);

    const handleLineTypeChange = React.useCallback((newLineType: string) => {
        try {
            if (!contextMenu || contextMenu.type !== 'edge') return;
            if (componentEvents) componentEvents.fireComponentEvent('onContextMenuAction', { id: contextMenu.id, paletteId: rawEdgesDict[contextMenu.id]?.connectionType, type: contextMenu.type, action: `lineType:${newLineType}` });
            if (store?.props) {
                const nextEdges = { ...rawEdgesDict };
                if (nextEdges[contextMenu.id]) { nextEdges[contextMenu.id].lineType = newLineType; store.props.write('edges', nextEdges); }
            }
            closeContextMenu();
        } catch (error: any) {
            console.error("Error in handleLineTypeChange:", error);
            if (componentEvents?.fireComponentEvent) componentEvents.fireComponentEvent('onCanvasError', getSafeError(error, 'handleLineTypeChange'));
        }
    }, [contextMenu, componentEvents, rawEdgesDict, store, closeContextMenu]);

    const handleConnectionTypeChange = React.useCallback((newConnectionType: string) => {
        try {
            if (!contextMenu || contextMenu.type !== 'edge') return;
            if (componentEvents) componentEvents.fireComponentEvent('onContextMenuAction', { id: contextMenu.id, paletteId: rawEdgesDict[contextMenu.id]?.connectionType, type: contextMenu.type, action: `connectionType:${newConnectionType}` });
            if (store?.props) {
                const nextEdges = { ...rawEdgesDict };
                if (nextEdges[contextMenu.id]) {
                    const typeDef = connectionTypes[newConnectionType] || {};
                    nextEdges[contextMenu.id].connectionType = newConnectionType;
                    nextEdges[contextMenu.id].arrow = typeDef.arrow !== false;
                    store.props.write('edges', nextEdges);
                }
            }
            closeContextMenu();
        } catch (error: any) {
            console.error("Error in handleConnectionTypeChange:", error);
            if (componentEvents?.fireComponentEvent) componentEvents.fireComponentEvent('onCanvasError', getSafeError(error, 'handleConnectionTypeChange'));
        }
    }, [contextMenu, componentEvents, rawEdgesDict, connectionTypes, store, closeContextMenu]);

    const handleAnimationChange = React.useCallback((newAnimation: string) => {
        try {
            if (!contextMenu || contextMenu.type !== 'edge') return;
            if (componentEvents) componentEvents.fireComponentEvent('onContextMenuAction', { id: contextMenu.id, paletteId: rawEdgesDict[contextMenu.id]?.connectionType, type: contextMenu.type, action: `animation:${newAnimation}` });
            if (store?.props) {
                const nextEdges = { ...rawEdgesDict };
                if (nextEdges[contextMenu.id]) {
                    nextEdges[contextMenu.id].animation = newAnimation;
                    store.props.write('edges', nextEdges);
                }
            }
            closeContextMenu();
        } catch (error: any) {
            console.error("Error in handleAnimationChange:", error);
            if (componentEvents?.fireComponentEvent) componentEvents.fireComponentEvent('onCanvasError', getSafeError(error, 'handleAnimationChange'));
        }
    }, [contextMenu, componentEvents, rawEdgesDict, store, closeContextMenu]);

    const handleLabelChange = React.useCallback((edgeId: string, labelText: string) => {
        try {
            if (!store?.props) return;
            const nextEdges = { ...rawEdgesDict };
            if (nextEdges[edgeId]) {
                nextEdges[edgeId] = { ...nextEdges[edgeId], labelText };
                store.props.write('edges', nextEdges);
            }
        } catch (error: any) {
            console.error("Error in handleLabelChange:", error);
            if (componentEvents?.fireComponentEvent) componentEvents.fireComponentEvent('onCanvasError', getSafeError(error, 'handleLabelChange'));
        }
    }, [store, rawEdgesDict, componentEvents]);

    return {
        isUpdatingEdge,
        updatingEdgeRef,
        getValidIntersection,
        isValidConnection,
        handleWaypointsChange,
        onConnect,
        onEdgeUpdate,
        onEdgeUpdateStart,
        onEdgeUpdateEnd,
        onConnectStart,
        onConnectEnd,
        onEdgesDelete,
        onEdgeContextMenu,
        onEdgeClick,
        handleLineTypeChange,
        handleConnectionTypeChange,
        handleAnimationChange,
        handleLabelChange,
    };
};
