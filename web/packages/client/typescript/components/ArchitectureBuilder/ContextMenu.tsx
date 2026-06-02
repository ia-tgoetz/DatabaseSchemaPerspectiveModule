import * as React from 'react';
import { extractSvgMarkup, toSafeDataUri, nextSvgScopeId } from './svgSanitize';
import { TEXT_NODE_PALETTE_IDS } from './constants';
import { ContextMenuState } from './types';

// ─── Style constants (menu-local) ─────────────────────────────────────────────

const MENU_ITEM_STYLE: React.CSSProperties = { padding: '5px 8px', cursor: 'pointer', color: 'var(--neutral-90)' };
const MENU_ITEM_FLEX_STYLE: React.CSSProperties = { padding: '5px 8px', cursor: 'pointer', color: 'var(--neutral-90)', display: 'flex', justifyContent: 'space-between', gap: '12px' };
const MENU_DIVIDER_STYLE: React.CSSProperties = { borderTop: '1px solid var(--neutral-40)', margin: '4px 0' };
const FLYOUT_PANEL_STYLE: React.CSSProperties = { backgroundColor: 'var(--neutral-20)', border: '1px solid var(--neutral-50)', borderRadius: '4px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)', padding: '4px' };
const CONTAINER_STYLE: React.CSSProperties = { position: 'absolute', zIndex: 10, backgroundColor: 'var(--neutral-20)', border: '1px solid var(--neutral-50)', borderRadius: '4px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)', padding: '4px', minWidth: '140px', fontSize: '12px' };

// ─── SwapIcon ─────────────────────────────────────────────────────────────────

const SwapIcon = ({ image, label }: { image: string, label: string }) => {
    const scopeId = React.useMemo(() => nextSvgScopeId(), []);
    const svgHtml = React.useMemo(() => extractSvgMarkup(image, scopeId), [image, scopeId]);
    if (svgHtml) return <div id={scopeId} style={{ width: '100%', height: '100%', overflow: 'hidden' }} dangerouslySetInnerHTML={{ __html: svgHtml }} title={label} />;
    const dataUri = toSafeDataUri(image);
    return dataUri ? <img src={dataUri} alt={label} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : null;
};

// ─── ContextMenu ──────────────────────────────────────────────────────────────

export interface ContextMenuProps {
    contextMenu: ContextMenuState;
    activeSubMenu: 'lineType' | 'connectionType' | 'animation' | 'swapNode' | 'order' | null;
    setActiveSubMenu: React.Dispatch<React.SetStateAction<'lineType' | 'connectionType' | 'animation' | 'swapNode' | 'order' | null>>;
    rawNodesDict: any;
    rawEdgesDict: any;
    paletteItems: any[];
    connectionTypes: any;
    clipboardRef: React.MutableRefObject<any>;
    wrapperRef: React.RefObject<HTMLDivElement>;
    getValidIntersection: (sourceId: string, targetId: string, ignoreEdgeId?: string) => string[];
    handleContextMenuAction: (action: string) => void;
    handleNodeSwap: (newId: string) => void;
    handleLineTypeChange: (newLineType: string) => void;
    handleConnectionTypeChange: (newConnectionType: string) => void;
    handleAnimationChange: (newAnimation: string) => void;
}

export const ContextMenu = React.memo(({
    contextMenu,
    activeSubMenu,
    setActiveSubMenu,
    rawNodesDict,
    rawEdgesDict,
    paletteItems,
    connectionTypes,
    clipboardRef,
    wrapperRef,
    getValidIntersection,
    handleContextMenuAction,
    handleNodeSwap,
    handleLineTypeChange,
    handleConnectionTypeChange,
    handleAnimationChange,
}: ContextMenuProps) => {
    // Memoize derived edge state — avoids recomputing getValidIntersection on every render
    const availableConnections = React.useMemo(() => {
        if (contextMenu.type !== 'edge') return [];
        const edge = rawEdgesDict[contextMenu.id];
        if (!edge) return [];
        const intersection = getValidIntersection(edge.source, edge.target, contextMenu.id);
        const result = [...intersection];
        if (edge.connectionType && !result.includes(edge.connectionType)) result.push(edge.connectionType);
        return result;
    }, [contextMenu, rawEdgesDict, getValidIntersection]);

    const currentLineType = contextMenu.type === 'edge' ? (rawEdgesDict[contextMenu.id]?.lineType || 'smoothstep') : 'smoothstep';
    const currentConnectionType = contextMenu.type === 'edge' ? (rawEdgesDict[contextMenu.id]?.connectionType || '') : '';

    const validSwapItems = React.useMemo(() => {
        if (contextMenu.type !== 'node') return [];
        const node = rawNodesDict[contextMenu.id];
        if (!node) return [];
        const currentPaletteItem = paletteItems.find((p: any) => p.id === node.paletteId);
        if (!currentPaletteItem?.swappableWith) return [];
        return paletteItems.filter((p: any) => currentPaletteItem.swappableWith.includes(p.id));
    }, [contextMenu, rawNodesDict, paletteItems]);

    const flyoutStyle: React.CSSProperties = (wrapperRef.current && contextMenu.left + 310 > wrapperRef.current.clientWidth)
        ? { position: 'absolute', top: '-0px', right: '100%', marginRight: '0px' }
        : { position: 'absolute', top: '-0px', left: '100%', marginLeft: '0px' };

    return (
        <div style={{ ...CONTAINER_STYLE, top: contextMenu.top, left: contextMenu.left }}>

            {contextMenu.type === 'pane' && (
                <div style={{ padding: '5px 8px', cursor: clipboardRef.current ? 'pointer' : 'not-allowed', color: clipboardRef.current ? 'var(--neutral-90)' : 'var(--neutral-50)' }} onClick={() => { if (clipboardRef.current) handleContextMenuAction('paste'); }}>
                    📋 Paste
                </div>
            )}

            {contextMenu.type !== 'pane' && (
                <>
                    <div style={MENU_ITEM_STYLE} onMouseEnter={() => setActiveSubMenu(null)} onClick={() => handleContextMenuAction('config')}>⚙️ Config</div>

                    {contextMenu.type === 'node' && (
                        <>
                            <div style={{ padding: '5px 8px', cursor: 'pointer', color: 'var(--callToAction)' }} onMouseEnter={() => setActiveSubMenu(null)} onClick={() => handleContextMenuAction('editStyle')}>🎨 Edit Style</div>
                            {TEXT_NODE_PALETTE_IDS.has(rawNodesDict[contextMenu.id]?.paletteId) && (
                                <div style={MENU_ITEM_STYLE} onMouseEnter={() => setActiveSubMenu(null)} onClick={() => handleContextMenuAction('editContent')}>📝 Edit Content</div>
                            )}
                            {contextMenu.isContainer && (
                                <>
                                    <div style={MENU_DIVIDER_STYLE} />
                                    <div style={MENU_ITEM_FLEX_STYLE} onMouseEnter={() => setActiveSubMenu(null)} onClick={() => handleContextMenuAction('toggleUnlocked')}>
                                        {rawNodesDict[contextMenu.id]?.configs?.unlocked ? (
                                            <><span>🔒 Lock Interaction</span><span>✓</span></>
                                        ) : (
                                            <><span>🔓 Unlock Interaction</span><span></span></>
                                        )}
                                    </div>
                                    <div style={MENU_ITEM_FLEX_STYLE} onMouseEnter={() => setActiveSubMenu(null)} onClick={() => handleContextMenuAction('toggleLink')}>
                                        <span>🔗 Link Contents</span><span>{!rawNodesDict[contextMenu.id]?.configs?.unlinked ? '✓' : ''}</span>
                                    </div>
                                </>
                            )}
                            {!contextMenu.isContainer && !TEXT_NODE_PALETTE_IDS.has(rawNodesDict[contextMenu.id]?.paletteId) && (
                                <div style={MENU_ITEM_FLEX_STYLE} onMouseEnter={() => setActiveSubMenu(null)} onClick={() => handleContextMenuAction('toggleGrayscale')}>
                                    <span>⬜ Toggle Inactive</span><span>{rawNodesDict[contextMenu.id]?.inactive ? '✓' : ''}</span>
                                </div>
                            )}
                            <div style={MENU_DIVIDER_STYLE} />
                            <div style={MENU_ITEM_STYLE} onMouseEnter={() => setActiveSubMenu(null)} onClick={() => handleContextMenuAction('copy')}>📋 Copy</div>
                            {contextMenu.isContainer && (
                                <div style={{ padding: '5px 8px', cursor: clipboardRef.current ? 'pointer' : 'not-allowed', color: clipboardRef.current ? 'var(--neutral-90)' : 'var(--neutral-50)' }} onClick={() => { if (clipboardRef.current) handleContextMenuAction('paste'); }}>📋 Paste</div>
                            )}
                            <div style={{ position: 'relative' }} onMouseEnter={() => setActiveSubMenu('order')}>
                                <div style={{ padding: '5px 8px', cursor: 'pointer', color: 'var(--neutral-90)', display: 'flex', justifyContent: 'space-between', backgroundColor: activeSubMenu === 'order' ? 'var(--neutral-30)' : 'transparent' }}>
                                    <span>📑 Order</span><span>▶</span>
                                </div>
                                {activeSubMenu === 'order' && (
                                    <div style={{ ...flyoutStyle, ...FLYOUT_PANEL_STYLE, minWidth: '150px' }}>
                                        <div style={MENU_ITEM_STYLE} onClick={() => handleContextMenuAction('bringToFront')}>⏫ Bring to Front</div>
                                        <div style={MENU_ITEM_STYLE} onClick={() => handleContextMenuAction('bringForward')}>🔼 Bring Forward</div>
                                        <div style={MENU_ITEM_STYLE} onClick={() => handleContextMenuAction('sendBackward')}>🔽 Send Backward</div>
                                        <div style={MENU_ITEM_STYLE} onClick={() => handleContextMenuAction('sendToBack')}>⏬ Send to Back</div>
                                    </div>
                                )}
                            </div>
                            {validSwapItems.length > 0 && (
                                <div style={{ position: 'relative' }} onMouseEnter={() => setActiveSubMenu('swapNode')}>
                                    <div style={{ padding: '5px 8px', cursor: 'pointer', color: 'var(--neutral-90)', display: 'flex', justifyContent: 'space-between', backgroundColor: activeSubMenu === 'swapNode' ? 'var(--neutral-30)' : 'transparent' }}>
                                        <span>🔄 Swap Node</span><span>▶</span>
                                    </div>
                                    {activeSubMenu === 'swapNode' && (
                                        <div style={{ ...flyoutStyle, ...FLYOUT_PANEL_STYLE, minWidth: '150px' }}>
                                            {validSwapItems.map((targetItem: any) => (
                                                <div key={targetItem.id} style={{ padding: '5px 8px', cursor: 'pointer', color: 'var(--neutral-90)', display: 'flex', alignItems: 'center' }} onClick={() => handleNodeSwap(targetItem.id)}>
                                                    <div style={{ width: '16px', height: '16px', marginRight: '6px', display: 'flex', alignItems: 'center' }}>{targetItem.image && <SwapIcon image={targetItem.image} label={targetItem.label} />}</div>
                                                    <span>{targetItem.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}

                    {contextMenu.type === 'edge' && (
                        <>
                            <div style={MENU_ITEM_STYLE} onMouseEnter={() => setActiveSubMenu(null)} onClick={() => handleContextMenuAction('reverseEdge')}>🔄 Reverse Direction</div>
                            <div style={MENU_ITEM_STYLE} onMouseEnter={() => setActiveSubMenu(null)} onClick={() => handleContextMenuAction('toggleArrow')}>
                                {rawEdgesDict[contextMenu.id]?.arrow !== false ? '❌ Remove Arrow' : '➡️ Add Arrow'}
                            </div>
                            <div style={MENU_ITEM_STYLE} onMouseEnter={() => setActiveSubMenu(null)} onClick={() => handleContextMenuAction('toggleLabel')}>
                                {rawEdgesDict[contextMenu.id]?.showLabel === true ? '👁️ Hide Label' : '👁️ Show Label'}
                            </div>
                            <div style={MENU_ITEM_STYLE} onMouseEnter={() => setActiveSubMenu(null)} onClick={() => handleContextMenuAction('toggleDashed')}>
                                {rawEdgesDict[contextMenu.id]?.dashed ? '─── Solid Line' : '- - - Dashed Line'}
                            </div>
                            {(() => {
                                const e = rawEdgesDict[contextMenu.id];
                                const lt = e?.lineType;
                                const canClear = (!lt || lt === 'smoothstep' || lt === 'step') && e?.waypoints?.length > 0;
                                return canClear ? (
                                    <div style={MENU_ITEM_STYLE} onMouseEnter={() => setActiveSubMenu(null)} onClick={() => handleContextMenuAction('clearWaypoints')}>
                                        ⊙ Clear Path ({e.waypoints.length} pt{e.waypoints.length !== 1 ? 's' : ''})
                                    </div>
                                ) : null;
                            })()}
                            <div style={MENU_DIVIDER_STYLE} />
                            <div style={{ position: 'relative' }} onMouseEnter={() => setActiveSubMenu('lineType')}>
                                <div style={{ padding: '5px 8px', cursor: 'pointer', color: 'var(--neutral-90)', display: 'flex', justifyContent: 'space-between', backgroundColor: activeSubMenu === 'lineType' ? 'var(--neutral-30)' : 'transparent' }}>
                                    <span>〰️ Line Type</span><span>▶</span>
                                </div>
                                {activeSubMenu === 'lineType' && (
                                    <div style={{ ...flyoutStyle, ...FLYOUT_PANEL_STYLE, minWidth: '120px' }}>
                                        <div style={{ ...MENU_ITEM_FLEX_STYLE, whiteSpace: 'nowrap' }} onClick={() => handleLineTypeChange('smoothstep')}><span>〰️ Smooth</span><span>{currentLineType === 'smoothstep' ? '✓' : ''}</span></div>
                                        <div style={{ ...MENU_ITEM_FLEX_STYLE, whiteSpace: 'nowrap' }} onClick={() => handleLineTypeChange('step')}><span>🔲 Stepped</span><span>{currentLineType === 'step' ? '✓' : ''}</span></div>
                                        <div style={{ ...MENU_ITEM_FLEX_STYLE, whiteSpace: 'nowrap' }} onClick={() => handleLineTypeChange('straight')}><span>📏 Straight</span><span>{currentLineType === 'straight' ? '✓' : ''}</span></div>
                                        <div style={{ ...MENU_ITEM_FLEX_STYLE, whiteSpace: 'nowrap' }} onClick={() => handleLineTypeChange('default')}><span>➰ Bezier</span><span>{currentLineType === 'default' ? '✓' : ''}</span></div>
                                    </div>
                                )}
                            </div>
                            <div style={{ position: 'relative' }} onMouseEnter={() => setActiveSubMenu('animation')}>
                                <div style={{ padding: '5px 8px', cursor: 'pointer', color: 'var(--neutral-90)', display: 'flex', justifyContent: 'space-between', backgroundColor: activeSubMenu === 'animation' ? 'var(--neutral-30)' : 'transparent' }}>
                                    <span>✨ Animation</span><span>▶</span>
                                </div>
                                {activeSubMenu === 'animation' && (
                                    <div style={{ ...flyoutStyle, ...FLYOUT_PANEL_STYLE, minWidth: '140px' }}>
                                        <div style={{ ...MENU_ITEM_FLEX_STYLE, whiteSpace: 'nowrap' }} onClick={() => handleAnimationChange('none')}><span>🚫 None</span><span>{(rawEdgesDict[contextMenu.id]?.animation || 'none') === 'none' ? '✓' : ''}</span></div>
                                        <div style={{ ...MENU_ITEM_FLEX_STYLE, whiteSpace: 'nowrap' }} onClick={() => handleAnimationChange('forward')}><span>➡️ Forward</span><span>{rawEdgesDict[contextMenu.id]?.animation === 'forward' ? '✓' : ''}</span></div>
                                        <div style={{ ...MENU_ITEM_FLEX_STYLE, whiteSpace: 'nowrap' }} onClick={() => handleAnimationChange('bidirectional')}><span>↔️ Bidirectional</span><span>{rawEdgesDict[contextMenu.id]?.animation === 'bidirectional' ? '✓' : ''}</span></div>
                                    </div>
                                )}
                            </div>
                            <div style={{ position: 'relative' }} onMouseEnter={() => setActiveSubMenu('connectionType')}>
                                <div style={{ padding: '5px 8px', cursor: 'pointer', color: 'var(--neutral-90)', display: 'flex', justifyContent: 'space-between', backgroundColor: activeSubMenu === 'connectionType' ? 'var(--neutral-30)' : 'transparent' }}>
                                    <span>🔗 Connection</span><span>▶</span>
                                </div>
                                {activeSubMenu === 'connectionType' && (
                                    <div style={{ ...flyoutStyle, ...FLYOUT_PANEL_STYLE, minWidth: '140px' }}>
                                        {availableConnections.length === 0
                                            ? <div style={{ padding: '5px 8px', color: 'var(--neutral-60)' }}>No valid connections</div>
                                            : availableConnections.map(c => (
                                                <div key={c} style={{ padding: '5px 8px', cursor: 'pointer', color: 'var(--neutral-90)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', whiteSpace: 'nowrap', gap: '12px' }} onClick={() => handleConnectionTypeChange(c)}>
                                                    <span><span style={{ color: connectionTypes[c]?.color || 'var(--neutral-90)', marginRight: '4px' }}>●</span>{connectionTypes[c]?.label || c}</span>
                                                    <span>{currentConnectionType === c ? '✓' : ''}</span>
                                                </div>
                                            ))
                                        }
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {contextMenu.isContainer && (
                        <div style={{ padding: '5px 8px', cursor: 'pointer', color: 'var(--error)', borderTop: '1px solid var(--neutral-40)' }} onMouseEnter={() => setActiveSubMenu(null)} onClick={() => handleContextMenuAction('deleteWithContents')}>🗑️ Delete Area & Contents</div>
                    )}
                    <div style={{ padding: '5px 8px', cursor: 'pointer', color: 'var(--error)', borderTop: contextMenu.isContainer ? 'none' : '1px solid var(--neutral-40)' }} onMouseEnter={() => setActiveSubMenu(null)} onClick={() => handleContextMenuAction('delete')}>
                        {contextMenu.isContainer ? '🗑️ Delete Area Only' : '🗑️ Delete'}
                    </div>
                </>
            )}
        </div>
    );
});
