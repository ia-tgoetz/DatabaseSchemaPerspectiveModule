import * as React from 'react';
import { ComponentProps } from '@inductiveautomation/perspective-client';
import { observer } from 'mobx-react';
// @ts-ignore
import ReactFlow, { ReactFlowProvider, Background, Controls, ConnectionMode } from 'reactflow';
import 'reactflow/dist/style.css';
import { Sidebar, PaletteItem } from './Sidebar';
import { ArchitectureNode } from './ArchitectureNode';
import { ContainerNode } from './ContainerNode';
import { NoteLabelNode } from './NoteLabelNode';
import { edgeTypes } from './CustomEdge';
import { mapIgnitionToReactFlowEdges } from './EdgeUtils';
import { useArchitectureFlowHandlers } from './useArchitectureFlowHandlers';
import { ComponentErrorBoundary } from '../common/ComponentErrorBoundary';
import { TEXT_NODE_PALETTE_IDS } from './constants';
import { ContextMenuState } from './types';
import { StyleEditorModal } from './StyleEditorModal';
import { ContextMenu } from './ContextMenu';
import { useLongPress } from './useLongPress';
import { CanvasSearch } from './CanvasSearch';

// ─── Node types registration ──────────────────────────────────────────────────

const nodeTypes = { architecture: ArchitectureNode, container: ContainerNode, Note: NoteLabelNode, Label: NoteLabelNode };

// ─── Utility functions (used only by ArchitectureBuilder) ─────────────────────

const extractDeep = (obj: any): any => {
    if (obj === null || obj === undefined) return undefined;
    if (typeof obj !== 'object') return obj;
    if (Array.isArray(obj) || typeof obj.map === 'function') return obj.map((item: any) => extractDeep(item));
    const plain: any = {};
    for (const key in obj) plain[key] = extractDeep(obj[key]);
    return plain;
};

const mapIgnitionToReactFlowNodes = (
    ignitionNodes: any,
    paletteItems: any[],
    handleGearClick: (id: string) => void,
    handleResizeEnd: (id: string, x: number, y: number, w: number, h: number) => void,
    handleTextChange: (id: string, text: string) => void,
    selectedId: string | null,
    globalHideHandles: boolean,
    globalHandleCount: number,
    highlightedHandlesMap: Record<string, string[]>,
    isEditable: boolean
) => {
    if (!ignitionNodes) return [];
    return Object.entries(ignitionNodes)
        .filter(([id, nodeData]: any) => nodeData !== null && nodeData !== undefined)
        .map(([id, nodeData]: any) => {
            const palette = paletteItems.find((p: any) => p.id === nodeData.paletteId);
            const isContainer = nodeData.paletteId === 'container';
            const isTextNode = TEXT_NODE_PALETTE_IDS.has(nodeData.paletteId);
            const paletteImage = (nodeData.useOverrideImage && palette?.overrideImage) ? palette.overrideImage : palette?.image || '';

            let type = 'architecture';
            if (isContainer) type = 'container';
            else if (isTextNode) type = nodeData.paletteId;

            const isUnlocked = nodeData.configs?.unlocked === true;

            return {
                id, type, selected: id === selectedId,
                position: { x: nodeData.x || 0, y: nodeData.y || 0 },
                zIndex: isContainer ? (nodeData.zIndex ?? -100) : 1000,
                style: {
                    width: nodeData.width || (isContainer ? 300 : (isTextNode ? 150 : 150)),
                    height: nodeData.height || (isContainer ? 300 : (isTextNode ? 80 : 150)),
                    pointerEvents: (isContainer && !isUnlocked) ? 'none' : 'auto'
                },
                dragHandle: (isContainer && !isUnlocked) ? '.custom-drag-handle' : undefined,
                data: {
                    label: nodeData.label || 'Unknown', image: paletteImage || nodeData.image || '', text: nodeData.text || '', tooltip: nodeData.tooltip || '', configs: nodeData.configs || {},
                    style: nodeData.style || {}, labelStyle: nodeData.labelStyle || {}, textStyle: nodeData.textStyle || {},
                    paletteId: nodeData.paletteId || 'unknown', inactive: nodeData.inactive || false,
                    hideHandles: nodeData.hideHandles, globalHideHandles, handleCount: globalHandleCount,
                    highlightedHandles: highlightedHandlesMap[id] || [],
                    isEditable,
                    unlockMovement: isUnlocked,
                    enableResize: isContainer || isTextNode,
                    onGearClick: handleGearClick, onTextChange: handleTextChange,
                    onResizeEnd: (isContainer || isTextNode) ? handleResizeEnd : undefined,
                },
            };
        });
};

const isInsideContainer = (item: any, container: any): boolean => {
    const iw = item.paletteId === 'container' ? (item.width || 300) : 150;
    const ih = item.paletteId === 'container' ? (item.height || 300) : 150;
    const cw = container.width || 300, ch = container.height || 300;
    if (iw >= cw || ih >= ch) return false;
    return item.x >= container.x && item.y >= container.y && item.x + iw <= container.x + cw && item.y + ih <= container.y + ch;
};

const computeHierarchyData = (nodesDict: any, edgesDict: any) => {
    const allEntries: [string, any][] = Object.entries(nodesDict).filter(([, n]) => n) as [string, any][];
    const containerEntries = allEntries.filter(([, n]) => n.paletteId === 'container');
    const containers = containerEntries.map(([id, n]) => ({ id, ...n }));

    const connectionsByNode: Record<string, string[]> = {};
    Object.entries(edgesDict).forEach(([edgeId, edge]: any) => {
        if (!edge) return;
        [edge.source, edge.target].forEach((nodeId: string) => {
            if (!nodeId) return;
            if (!connectionsByNode[nodeId]) connectionsByNode[nodeId] = [];
            if (!connectionsByNode[nodeId].includes(edgeId)) connectionsByNode[nodeId].push(edgeId);
        });
    });
    Object.values(connectionsByNode).forEach(arr => arr.sort());

    const getChain = (item: any): any[] =>
        containers
            .filter(c => c.id !== item.id && isInsideContainer(item, c))
            .sort((a, b) => ((b.width || 300) * (b.height || 300)) - ((a.width || 300) * (a.height || 300)));

    const getDirectParent = (item: any): string | null => {
        const chain = getChain(item);
        return chain.length > 0 ? chain[chain.length - 1].id : null;
    };

    const nodeEnrichments: Record<string, { hierarchy: string[]; connections: string[] }> = {};
    allEntries.forEach(([id, n]) => {
        nodeEnrichments[id] = { hierarchy: getChain({ id, ...n }).map(c => c.id), connections: connectionsByNode[id] || [] };
    });

    const treeMap: Record<string, any> = {};
    containers.forEach(c => { treeMap[c.id] = { id: c.id, typeId: c.typeId || 'container', label: c.label || '', areas: [], nodes: [] }; });
    containers.forEach(c => { const parent = getDirectParent(c); if (parent && treeMap[parent]) treeMap[parent].areas.push(treeMap[c.id]); });
    allEntries.filter(([, n]) => n.paletteId !== 'container').forEach(([id, n]) => {
        const entry = { id, typeId: n.typeId || n.paletteId || '', label: n.label || '' };
        const parent = getDirectParent({ id, ...n });
        if (parent && treeMap[parent]) treeMap[parent].nodes.push(entry);
    });

    const rootHierarchy = {
        areas: containers.filter(c => getDirectParent(c) === null).map(c => treeMap[c.id]),
        nodes: allEntries.filter(([id, n]) => n.paletteId !== 'container' && getDirectParent({ id, ...n }) === null).map(([id, n]) => ({ id, typeId: n.typeId || n.paletteId || '', label: n.label || '' })),
    };

    return { nodeEnrichments, rootHierarchy };
};

// ─── Component ────────────────────────────────────────────────────────────────

export interface ArchitectureBuilderProps {
    enabled?: any; enableOnClickEvents?: any; hideHandles?: any; handleCount?: any;
    refreshHierarchy?: boolean; snapEnabled?: any; snapPixels?: any; edgeWidth?: any;
    style?: any; connectionTypes: any; paletteItems: any[];
    nodes: any; edges: any; hierarchy?: any;
}

export const ArchitectureBuilder = observer((props: ComponentProps<ArchitectureBuilderProps>) => {
    console.log('DEBUG: ArchitectureBuilder rendering, props:', props);
    const reactFlowWrapper = React.useRef<HTMLDivElement>(null);
    const clipboardRef = React.useRef<any>(null);
    const draggedItemRef = React.useRef<PaletteItem | null>(null);
    const hierarchyWriteRef = React.useRef<string>('');

    const [reactFlowInstance, setReactFlowInstance] = React.useState<any>(null);
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
    const [styleEditorNodeId, setStyleEditorNodeId] = React.useState<string | null>(null);
    const [contextMenu, setContextMenu] = React.useState<ContextMenuState | null>(null);
    const [activeSubMenu, setActiveSubMenu] = React.useState<'lineType' | 'connectionType' | 'animation' | 'swapNode' | 'order' | null>(null);
    const [selectedId, setSelectedId] = React.useState<string | null>(null);
    const [canvasSearchOpen, setCanvasSearchOpen] = React.useState(false);
    const [localNodes, setLocalNodes] = React.useState<any[]>([]);
    const [localEdges, setLocalEdges] = React.useState<any[]>([]);
    const [hoveredEdgeId, setHoveredEdgeId] = React.useState<string | null>(null);

    // Suppress ResizeObserver loop limit exceeded error which can cause white-screen in Ignition Designer
    React.useEffect(() => {
        const suppressResizeObserverError = (e: ErrorEvent) => {
            if (e.message && (e.message.includes('ResizeObserver loop') || e.message.includes('ResizeObserver loop limit exceeded'))) {
                e.stopImmediatePropagation();
                e.preventDefault();
            }
        };

        const handleOnError = (msg: any) => {
            if (typeof msg === 'string' && (msg.includes('ResizeObserver loop') || msg.includes('ResizeObserver loop limit exceeded'))) {
                return true;
            }
            return false;
        };

        window.addEventListener('error', suppressResizeObserverError, true);
        const oldOnError = window.onerror;
        window.onerror = handleOnError;

        return () => {
            window.removeEventListener('error', suppressResizeObserverError, true);
            window.onerror = oldOnError;
        };
    }, []);

    // Set document title and html[lang] for accessibility (WCAG 2.4.2, 3.1.1).
    // Both are restored on unmount so other Ignition views are not affected.
    React.useEffect(() => {
        const prevTitle = document.title;
        document.title = 'Architecture Builder';
        return () => { document.title = prevTitle; };
    }, []);

    React.useEffect(() => {
        const prevLang = document.documentElement.getAttribute('lang');
        document.documentElement.setAttribute('lang', 'en');
        return () => {
            if (prevLang === null) document.documentElement.removeAttribute('lang');
            else document.documentElement.setAttribute('lang', prevLang);
        };
    }, []);

    // ─── Prop extraction ───────────────────────────────────────────────────

    // Wrapped in useMemo so extractDeep (deep MobX clone) and JSON.stringify
    // only run when the relevant prop reference actually changes, not on every render.
    const rawNodesJson = React.useMemo(
        () => JSON.stringify(extractDeep(props.props.nodes) || {}),
        [props.props.nodes]
    );
    const rawEdgesJson = React.useMemo(
        () => JSON.stringify(extractDeep(props.props.edges) || {}),
        [props.props.edges]
    );
    const connectionTypesJson = React.useMemo(
        () => JSON.stringify(extractDeep(props.props.connectionTypes) || {}),
        [props.props.connectionTypes]
    );
    const paletteItemsJson = React.useMemo(
        () => JSON.stringify(extractDeep(props.props.paletteItems) || []),
        [props.props.paletteItems]
    );

    // Scalar display props use the same extractDeep + JSON pipeline as complex props.
    // Direct property access on Perspective's observable store can miss scalar updates;
    // running them through extractDeep forces a MobX subscription that reliably
    // triggers re-renders when any of these values change in the Designer or Session.
    const rawConfigJson = React.useMemo(() => JSON.stringify({
        edgeWidth:             extractDeep(props.props.edgeWidth),
        snapEnabled:           extractDeep(props.props.snapEnabled),
        snapPixels:            extractDeep(props.props.snapPixels),
        hideHandles:           extractDeep(props.props.hideHandles),
        handleCount:           extractDeep(props.props.handleCount),
        enabled:               extractDeep(props.props.enabled),
        enableOnClickEvents:   extractDeep(props.props.enableOnClickEvents),
    }), [
        props.props.edgeWidth, props.props.snapEnabled, props.props.snapPixels,
        props.props.hideHandles, props.props.handleCount, props.props.enabled,
        props.props.enableOnClickEvents,
    ]);

    const rawNodesDict = React.useMemo(() => JSON.parse(rawNodesJson), [rawNodesJson]);
    const rawEdgesDict = React.useMemo(() => JSON.parse(rawEdgesJson), [rawEdgesJson]);
    const connectionTypes = React.useMemo(() => JSON.parse(connectionTypesJson), [connectionTypesJson]);
    const paletteItems = React.useMemo(() => JSON.parse(paletteItemsJson), [paletteItemsJson]);
    const rawConfig = React.useMemo(() => JSON.parse(rawConfigJson), [rawConfigJson]);

    const globalHideHandles = rawConfig.hideHandles === true || String(rawConfig.hideHandles ?? '').toLowerCase() === 'true';
    const globalHandleCount = Math.max(1, Math.min(5, Number(rawConfig.handleCount) || 3));
    const isEnabled = rawConfig.enabled !== false && String(rawConfig.enabled ?? 'true').toLowerCase() !== 'false';
    const _enableOnClickEvents = rawConfig.enableOnClickEvents !== false && String(rawConfig.enableOnClickEvents ?? 'true').toLowerCase() !== 'false';
    const snapEnabled = rawConfig.snapEnabled !== false && String(rawConfig.snapEnabled ?? 'true').toLowerCase() !== 'false';
    const snapPixels = Number(rawConfig.snapPixels) || 15;
    const snapGrid = React.useMemo<[number, number]>(() => [snapPixels, snapPixels], [snapPixels]);
    const globalEdgeWidth = Math.max(1, Number(rawConfig.edgeWidth) || 6);

    // ─── Hierarchy sync ────────────────────────────────────────────────────

    React.useEffect(() => {
        if (!props.store?.props || !rawNodesDict || !rawEdgesDict) return;

        const { nodeEnrichments, rootHierarchy } = computeHierarchyData(rawNodesDict, rawEdgesDict);

        props.store.props.write('hierarchy', rootHierarchy);

        const enrichedNodes: any = {};
        Object.keys(rawNodesDict).forEach(id => {
            if (!rawNodesDict[id]) return;
            const { image: _image, ...nodeWithoutImage } = rawNodesDict[id];
            enrichedNodes[id] = { ...nodeWithoutImage, ...nodeEnrichments[id] };
        });

        const serialized = JSON.stringify(enrichedNodes);
        if (serialized !== hierarchyWriteRef.current) {
            hierarchyWriteRef.current = serialized;
            props.store.props.write('nodes', enrichedNodes);
        }
        props.store.props.write('refreshHierarchy', false);
    }, [props.props.refreshHierarchy, props.store]);

    // ─── Handlers hook ─────────────────────────────────────────────────────

    const {
        isUpdatingEdge, isDraggingNode, updatingEdgeRef,
        rawNodesDictRef,
        rawEdgesDictRef,
        closeContextMenu,
        getValidIntersection,
        isValidConnection,
        handleWaypointsChange,
        handleLabelChange,
        onConnect, onEdgeUpdate, onEdgeUpdateStart, onEdgeUpdateEnd, onConnectStart, onConnectEnd,
        onEdgesDelete, onEdgeContextMenu, onEdgeClick,
        handleLineTypeChange, handleConnectionTypeChange, handleAnimationChange,
        handleGearClick, handlePaletteItemClick, handleResizeEnd, handleTextChange,
        onNodesChange, onNodeDragStart, onNodeDrag, onNodeDragStop,
        onNodesDelete, onNodeContextMenu, onNodeClick,
        executeCopy, executePaste,
        onDragOver, onDrop, onMoveStart, onPaneClick, onPaneContextMenu,
        handleNodeSwap, handleContextMenuAction,
    } = useArchitectureFlowHandlers({
        store: props.store,
        componentEvents: props.componentEvents,
        rawNodesDict,
        rawEdgesDict,
        connectionTypes,
        globalHandleCount,
        paletteItems,
        snapEnabled,
        snapPixels,
        reactFlowInstance,
        reactFlowWrapper,
        isEnabled,
        selectedId,
        setSelectedId,
        setLocalNodes,
        setLocalEdges,
        contextMenu,
        setContextMenu,
        setActiveSubMenu,
        setStyleEditorNodeId,
        clipboardRef,
        draggedItemRef,
    });

    // ─── Derived flow data ─────────────────────────────────────────────────

    const highlightedHandlesMap = React.useMemo<Record<string, string[]>>(() => {
        const map: Record<string, string[]> = {};
        Object.values(rawEdgesDict).forEach((edge: any) => {
            if (!edge) return;
            if (edge.source && edge.sourceHandle) {
                if (!map[edge.source]) map[edge.source] = [];
                if (!map[edge.source].includes(edge.sourceHandle)) map[edge.source].push(edge.sourceHandle);
            }
            if (edge.target && edge.targetHandle) {
                if (!map[edge.target]) map[edge.target] = [];
                if (!map[edge.target].includes(edge.targetHandle)) map[edge.target].push(edge.targetHandle);
            }
        });
        return map;
    }, [rawEdgesDict]);

    const flowNodes = React.useMemo(
        () => mapIgnitionToReactFlowNodes(rawNodesDict, paletteItems, handleGearClick, handleResizeEnd, handleTextChange, selectedId, globalHideHandles, globalHandleCount, highlightedHandlesMap, isEnabled),
        [rawNodesDict, paletteItems, handleGearClick, handleResizeEnd, handleTextChange, selectedId, globalHideHandles, globalHandleCount, highlightedHandlesMap, isEnabled]
    );
    const flowEdges = React.useMemo(() =>
        mapIgnitionToReactFlowEdges(rawEdgesDict, rawNodesDict, connectionTypes, selectedId, handleWaypointsChange, handleLabelChange, snapEnabled, snapPixels, globalEdgeWidth),
        [rawEdgesDict, rawNodesDict, connectionTypes, selectedId, handleWaypointsChange, handleLabelChange, snapEnabled, snapPixels, globalEdgeWidth]
    );

    React.useEffect(() => {
        if (!isDraggingNode) {
            setLocalNodes(flowNodes);
        }
    }, [flowNodes, isDraggingNode]);

    React.useEffect(() => {
        if (!isUpdatingEdge && !isDraggingNode) {
            setLocalEdges(flowEdges);
        }
    }, [flowEdges, isUpdatingEdge, isDraggingNode]);

    React.useEffect(() => {
        let hasChanges = false;
        const corrected: Record<string, any> = {};

        for (const [edgeId, edge] of Object.entries(rawEdgesDict as Record<string, any>)) {
            const updated: any = { ...edge };

            const srcParts = (edge.sourceHandle as string)?.split('-');
            if (srcParts && parseInt(srcParts[1], 10) >= globalHandleCount) {
                updated.sourceHandle = `${srcParts[0]}-${globalHandleCount - 1}`;
                updated.waypoints = [];
                hasChanges = true;
            }

            const tgtParts = (edge.targetHandle as string)?.split('-');
            if (tgtParts && parseInt(tgtParts[1], 10) >= globalHandleCount) {
                updated.targetHandle = `${tgtParts[0]}-${globalHandleCount - 1}`;
                updated.waypoints = [];
                hasChanges = true;
            }

            corrected[edgeId] = updated;
        }

        if (hasChanges) {
            props.store.props.write('edges', corrected);
        }
    }, [globalHandleCount]);

    const displayEdges = React.useMemo(() => {
        const localMap = new Map(localEdges.map((e: any) => [e.id, e]));
        return flowEdges.filter(e => !isUpdatingEdge || e.id !== updatingEdgeRef.current).map((fresh: any) => {
            const local = localMap.get(fresh.id);
            const isHovered = fresh.id === hoveredEdgeId;
            const isSelected = fresh.data?.isSelected === true;
            const isAnimated = fresh.data?.animation !== 'none';

            let zIndex = fresh.zIndex || 2000;
            if (isHovered) zIndex = Math.max(zIndex, 4000);
            if (isAnimated) zIndex = 5000;

            const strokeWidth = (isHovered || isSelected) ? globalEdgeWidth + 2 : globalEdgeWidth;
            const waypoints = local?.data?.waypoints ?? fresh.data?.waypoints;
            return {
                ...fresh,
                updatable: isEnabled,
                zIndex,
                style: { ...fresh.style, strokeWidth },
                data: { ...fresh.data, waypoints, isEditable: isEnabled },
            };
        });
    }, [localEdges, flowEdges, hoveredEdgeId, globalEdgeWidth, isEnabled, isUpdatingEdge]);

    // ─── Keyboard shortcuts ────────────────────────────────────────────────

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') { closeContextMenu(); setStyleEditorNodeId(null); setCanvasSearchOpen(false); return; }
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') { e.preventDefault(); setCanvasSearchOpen(open => !open); return; }
            if (!isEnabled) return;
            if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;
            if ((e.ctrlKey || e.metaKey) && e.key === 'c') { if (selectedId && rawNodesDictRef.current[selectedId]) executeCopy(selectedId); }
            if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
                const clipboard = clipboardRef.current;
                if (clipboard && props.store?.props) {
                    const targetNode = clipboard.type === 'single' ? clipboard.node : Object.values(clipboard.nodes)[0];
                    const dropX = (targetNode as any).x + (snapEnabled ? snapPixels * 2 : 30);
                    const dropY = (targetNode as any).y + (snapEnabled ? snapPixels * 2 : 30);
                    executePaste(dropX, dropY);
                }
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isEnabled, selectedId, snapEnabled, snapPixels, props.store, executeCopy, executePaste, closeContextMenu]);

    const flyToNode = React.useCallback((nodeId: string, x: number, y: number, w: number, h: number) => {
        if (reactFlowInstance) {
            reactFlowInstance.fitBounds({ x, y, width: w, height: h }, { padding: 0.5, duration: 600 });
        }
        setSelectedId(nodeId);
        setCanvasSearchOpen(false);
    }, [reactFlowInstance]);

    // ─── Long-press context menu (mobile/touch support) ─────────────────────

    const handleLongPress = React.useCallback((clientX: number, clientY: number, target: Element) => {
        if (!isEnabled) return;
        const bounds = reactFlowWrapper.current?.getBoundingClientRect();
        if (!bounds) return;

        const top = clientY - bounds.top;
        const left = clientX - bounds.left;

        // Try to detect node
        const nodeEl = target.closest('.react-flow__node');
        if (nodeEl) {
            const id = nodeEl.getAttribute('data-id');
            if (id && rawNodesDictRef.current[id]) {
                setSelectedId(id);
                const isContainer = rawNodesDictRef.current[id].paletteId === 'container';
                setContextMenu({ id, top, left, type: 'node', isContainer, clientX, clientY });
                setActiveSubMenu(null);
                return;
            }
        }

        // Try to detect edge
        const edgeEl = target.closest('.react-flow__edge');
        if (edgeEl) {
            const id = edgeEl.getAttribute('data-testid')?.replace('rf__edge-', '');
            if (id && rawEdgesDictRef.current[id]) {
                setContextMenu({ id, top, left, type: 'edge', clientX, clientY });
                setActiveSubMenu(null);
                return;
            }
        }

        // Fallback: pane
        if (reactFlowInstance) {
            setContextMenu({ id: 'pane', top, left, type: 'pane', clientX, clientY });
            setActiveSubMenu(null);
        }
    }, [isEnabled, reactFlowInstance, setContextMenu, setActiveSubMenu, setSelectedId]);

    const longPressHandlers = useLongPress(handleLongPress);

    const { classes } = props.props.style || {};
    const emitProps = props.emit({ classes });

    // ─── Render ────────────────────────────────────────────────────────────

    return (
        <ComponentErrorBoundary componentEvents={props.componentEvents}>
            <div {...emitProps} style={{ ...emitProps.style, display: 'flex', backgroundColor: 'var(--neutral-00)' }} tabIndex={0}>
                <style>{`
                .arch-theme-wrapper {
                    display: flex; flex-direction: row; flex: 1; width: 100%; height: 100%;
                    --edge: #78D175; --panel: #78D175; --cloud: #25A4E9; --standard: #FF8C00;
                    --cirrusLink: #156D97; --sepasoft: #2DA449; --ia-darkgray: #39464B;
                    --ia-green: #8DC63E; --ia-gray: #445C6D; --ignition-orange: #F7901E;
                    --ignition-blue: #003E69; --ignition-darkblue: #002143;
                    --edge-green: #78D175; --edge-gray: #283439; --edge-dark-gray: #1E2528; --edge-light-gray: #4E5558;
                }
                .arch-node-gear { transform-origin: 50% 50%; transition: transform 0.75s ease-in-out; }
                .arch-node-gear:hover { transform: rotate(360deg); }
                .arch-node-gear:active { transform: translateX(-100%) rotate(-360deg); }
                .arch-node-svg-wrapper svg { width: 100%; height: 100%; max-width: 100%; max-height: 100%; object-fit: contain; }
                /* Animation keyframes: distance must match (dash + gap) for seamless loops */
                @keyframes arch-flow-forward { from { stroke-dashoffset: 100; } to { stroke-dashoffset: 0; } }
                @keyframes arch-flow-reverse { from { stroke-dashoffset: 0; } to { stroke-dashoffset: 100; } }

                /* Base handle is a transparent anchor — React Flow's translate(-50%,-50%) is forced via !important */
                .arch-node-handle {
                    background: transparent !important;
                    border-color: transparent !important;
                    transform: translate(-50%, -50%) !important;
                }

                /* ::before provides the large, zoom-aware hit area (interaction zone).
                   It uses the --hit-size variable passed from React state. */
                .arch-node-handle::before {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: var(--hit-size, 24px);
                    height: var(--hit-size, 24px);
                    background: transparent;
                }

                /* ::after renders the visible dot and owns all visual transitions.
                   By default, it is invisible (opacity: 0) to maintain a zero-footprint aesthetic when idle. */
                .arch-node-handle::after {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: var(--neutral-90);
                    border: 1px solid var(--neutral-90);
                    pointer-events: none;
                    opacity: 0;
                    transition: transform 0.15s ease-in-out, background 0.15s ease-in-out, border-color 0.15s ease-in-out, opacity 0.15s ease-in-out;
                }

                /* Show handles when:
                   1. The specific handle is hovered.
                   2. The parent node is hovered or selected.
                   3. The user is actively creating or moving an edge on the canvas.
                */
                .arch-node-handle:hover::after,
                .react-flow__node:hover .arch-node-handle::after,
                .react-flow__node.selected .arch-node-handle::after,
                .arch-creating-edge .arch-node-handle::after,
                .arch-moving-edge .arch-node-handle::after {
                    opacity: 1;
                }

                /* Handle Hover State: Provide clear feedback and scale the dot. */
                .arch-node-handle:hover::after {
                    background: var(--callToAction) !important;
                    border-color: var(--callToAction) !important;
                    transform: translate(-50%, -50%) scale(2.0);
                    opacity: 1 !important;
                }

                /* Suppressed: handle is in DOM for edge routing but completely invisible/non-interactive. */
                .arch-node-handle--suppressed::after { opacity: 0 !important; pointer-events: none !important; }
                .arch-node-handle--suppressed::before { pointer-events: none !important; }

                /* Connected handle: Always visible and emphasized when the edge/node is selected. */
                .arch-node-handle--connected::after {
                    opacity: 1 !important;
                    background: var(--callToAction) !important;
                    border-color: var(--callToAction) !important;
                    width: 10px !important;
                    height: 10px !important;
                    box-shadow: 0 0 8px var(--callToAction);
                }
                /* React Flow connection states: base stays transparent, ::after carries the color */
                .react-flow__handle.connecting { background: transparent !important; border-color: transparent !important; }
                .react-flow__handle.connecting::after { background: #3b82f6 !important; border-color: #2563eb !important; width: 14px !important; height: 14px !important; }
                .react-flow__handle.valid { background: transparent !important; border-color: transparent !important; cursor: crosshair !important; }
                .react-flow__handle.valid::after { background: #22c55e !important; border-color: #16a34a !important; width: 14px !important; height: 14px !important; }
                /* Cursors live on the base handle (the pointer-events target) */
                .arch-creating-edge .arch-node-handle { cursor: crosshair !important; }
                .arch-moving-edge .arch-node-handle { cursor: grab !important; }
                .arch-creating-edge .arch-node-handle.connecting:not(.valid):hover,
                .arch-moving-edge   .arch-node-handle.connecting:not(.valid):hover { cursor: not-allowed !important; }
                .arch-creating-edge .arch-node-handle.connecting:not(.valid):hover::after,
                .arch-moving-edge   .arch-node-handle.connecting:not(.valid):hover::after { background: #ef4444 !important; border-color: #dc2626 !important; }
                .react-flow__attribution a { min-height: 24px; min-width: 24px; display: inline-flex; align-items: center; padding: 0 6px; }
                `}</style>

                <div className="arch-theme-wrapper">
                    {isEnabled && <Sidebar paletteItems={paletteItems} isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} onDragStartItem={(item) => { draggedItemRef.current = item; }} onItemClick={handlePaletteItemClick} />}

                    <div role="main" aria-label="Architecture Builder Canvas" style={{ flexGrow: 1, height: '100%', position: 'relative', overflow: 'hidden' }} ref={reactFlowWrapper} className={isUpdatingEdge ? 'arch-moving-edge' : ''} {...longPressHandlers}>
                        <ReactFlowProvider>
                            <ReactFlow
                                nodes={localNodes} edges={displayEdges} nodeTypes={nodeTypes} edgeTypes={edgeTypes}
                                isValidConnection={isValidConnection} onInit={setReactFlowInstance}
                                onDrop={isEnabled ? onDrop : undefined} onDragOver={isEnabled ? onDragOver : undefined}
                                onConnect={isEnabled ? onConnect : undefined} onEdgeUpdate={isEnabled ? onEdgeUpdate : undefined}
                                onEdgeUpdateStart={isEnabled ? onEdgeUpdateStart : undefined}
                                onEdgeUpdateEnd={isEnabled ? onEdgeUpdateEnd : undefined}
                                onConnectStart={isEnabled ? onConnectStart : undefined}
                                onConnectEnd={isEnabled ? onConnectEnd : undefined}
                                onNodeDragStart={isEnabled ? onNodeDragStart : undefined} onNodeDrag={isEnabled ? onNodeDrag : undefined} onNodeDragStop={isEnabled ? onNodeDragStop : undefined}
                                onNodesChange={onNodesChange}
                                onNodeClick={onNodeClick} onEdgeClick={onEdgeClick}
                                onNodesDelete={isEnabled ? onNodesDelete : undefined} onEdgesDelete={isEnabled ? onEdgesDelete : undefined}
                                onNodeContextMenu={isEnabled ? onNodeContextMenu : undefined} onEdgeContextMenu={isEnabled ? onEdgeContextMenu : undefined}
                                onEdgeMouseEnter={(_evt, edge) => setHoveredEdgeId(edge.id)}
                                onEdgeMouseLeave={() => setHoveredEdgeId(null)}
                                onPaneClick={onPaneClick} onPaneContextMenu={isEnabled ? onPaneContextMenu : undefined} onMoveStart={onMoveStart}
                                nodesDraggable={isEnabled} nodesConnectable={isEnabled} elementsSelectable={isEnabled}
                                connectionMode={ConnectionMode.Loose} snapToGrid={snapEnabled} snapGrid={snapGrid}
                                connectionLineStyle={{ stroke: '#cccccc', strokeWidth: 6, fill: 'none' }}
                                elevateNodesOnSelect={false}
                                minZoom={0.05}
                                panOnScroll={false}
                                zoomOnScroll={true}
                                panOnDrag={true}
                                selectionOnDrag={false}
                                deleteKeyCode={['Delete', 'Backspace']}
                            >
                                <Background gap={snapPixels} />
                                <Controls showInteractive={false} />
                            </ReactFlow>
                        </ReactFlowProvider>

                        {canvasSearchOpen && (
                            <CanvasSearch
                                nodes={rawNodesDict}
                                paletteItems={paletteItems}
                                onFlyTo={flyToNode}
                                onClose={() => setCanvasSearchOpen(false)}
                            />
                        )}

                        {styleEditorNodeId && rawNodesDict[styleEditorNodeId] && (
                            <StyleEditorModal
                                node={rawNodesDict[styleEditorNodeId]}
                                onSave={(newStyle, newLabelStyle, newTextStyle) => {
                                    if (props.store?.props) {
                                        const nextNodes = { ...rawNodesDict };
                                        nextNodes[styleEditorNodeId].style = newStyle;
                                        nextNodes[styleEditorNodeId].labelStyle = newLabelStyle;
                                        nextNodes[styleEditorNodeId].textStyle = newTextStyle;
                                        props.store.props.write('nodes', nextNodes);
                                    }
                                    setStyleEditorNodeId(null);
                                }}
                                onCancel={() => setStyleEditorNodeId(null)}
                            />
                        )}

                        {contextMenu && (
                            <ContextMenu
                                contextMenu={contextMenu}
                                activeSubMenu={activeSubMenu}
                                setActiveSubMenu={setActiveSubMenu}
                                rawNodesDict={rawNodesDict}
                                rawEdgesDict={rawEdgesDict}
                                paletteItems={paletteItems}
                                connectionTypes={connectionTypes}
                                clipboardRef={clipboardRef}
                                wrapperRef={reactFlowWrapper}
                                getValidIntersection={getValidIntersection}
                                handleContextMenuAction={handleContextMenuAction}
                                handleNodeSwap={handleNodeSwap}
                                handleLineTypeChange={handleLineTypeChange}
                                handleConnectionTypeChange={handleConnectionTypeChange}
                                handleAnimationChange={handleAnimationChange}
                            />
                        )}
                    </div>
                </div>
            </div>
        </ComponentErrorBoundary>
    );
});
