import * as React from 'react';
import { ColorInput } from './ColorPicker';
import { TEXT_NODE_PALETTE_IDS, sharedInputStyle, labelRowStyle, sectionTitleStyle } from './constants';

export const StyleEditorModal = ({ node, onSave, onCancel }: { node: any, onSave: (style: any, labelStyle: any, textStyle: any) => void, onCancel: () => void }) => {
    const isTextNode = TEXT_NODE_PALETTE_IDS.has(node.paletteId);
    const [compBg, setCompBg] = React.useState(node.style?.backgroundColor || node.style?.fill || '');
    const [borderWidth, setBorderWidth] = React.useState(node.style?.borderWidth || '');
    const [borderStyle, setBorderStyle] = React.useState(node.style?.borderStyle || '');
    const [borderColor, setBorderColor] = React.useState(node.style?.borderColor || '');
    const [borderRadius, setBorderRadius] = React.useState(node.style?.borderRadius || '');
    const [labelBg, setLabelBg] = React.useState(node.labelStyle?.backgroundColor || '');
    const [labelColor, setLabelColor] = React.useState(node.labelStyle?.color || '');
    const [labelFontSize, setLabelFontSize] = React.useState(node.labelStyle?.fontSize || '');
    const [iconColor, setIconColor] = React.useState(node.labelStyle?.fill || '');
    const [textColor, setTextColor] = React.useState(node.textStyle?.color || '');
    const [textFontSize, setTextFontSize] = React.useState(node.textStyle?.fontSize || '');

    const handleSave = () => {
        const newStyle: any = { ...node.style };
        if (compBg) newStyle.backgroundColor = compBg; else delete newStyle.backgroundColor;
        if (borderWidth || borderStyle || borderColor) delete newStyle.border;
        if (borderWidth) newStyle.borderWidth = borderWidth; else delete newStyle.borderWidth;
        if (borderStyle) newStyle.borderStyle = borderStyle; else delete newStyle.borderStyle;
        if (borderColor) newStyle.borderColor = borderColor; else delete newStyle.borderColor;
        if (borderRadius) newStyle.borderRadius = borderRadius; else delete newStyle.borderRadius;
        const newLabelStyle: any = { ...node.labelStyle };
        if (labelBg) newLabelStyle.backgroundColor = labelBg; else delete newLabelStyle.backgroundColor;
        if (labelColor) newLabelStyle.color = labelColor; else delete newLabelStyle.color;
        if (labelFontSize) newLabelStyle.fontSize = labelFontSize; else delete newLabelStyle.fontSize;
        if (iconColor) newLabelStyle.fill = iconColor; else delete newLabelStyle.fill;
        const newTextStyle: any = { ...node.textStyle };
        if (textColor) newTextStyle.color = textColor; else delete newTextStyle.color;
        if (textFontSize) newTextStyle.fontSize = textFontSize; else delete newTextStyle.fontSize;
        onSave(newStyle, newLabelStyle, newTextStyle);
    };

    return (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ backgroundColor: 'var(--neutral-20)', padding: '24px', borderRadius: '8px', width: '650px', border: '1px solid var(--neutral-50)', boxShadow: '0 8px 16px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: '20px' }} onClick={(e) => e.stopPropagation()}>
                <h3 style={{ margin: 0, color: 'var(--neutral-90)' }}>Edit Styles: {node.label}</h3>
                <div style={{ display: 'flex', gap: '30px' }}>
                    <div style={{ flex: 1 }}>
                        <div style={sectionTitleStyle}>Component</div>
                        <div style={labelRowStyle}><span style={{ fontSize: '12px', color: 'var(--neutral-80)' }}>Background Color</span><ColorInput value={compBg} onChange={setCompBg} placeholder="e.g. #333 or rgba()" /></div>
                        <div style={labelRowStyle}><span style={{ fontSize: '12px', color: 'var(--neutral-80)' }}>Border Color</span><ColorInput value={borderColor} onChange={setBorderColor} placeholder="e.g. #ff0000" /></div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <div style={{ ...labelRowStyle, flex: 1 }}><span style={{ fontSize: '12px', color: 'var(--neutral-80)' }}>Border Width</span><input type="text" value={borderWidth} onChange={e => setBorderWidth(e.target.value)} placeholder="e.g. 2px" style={{...sharedInputStyle, marginTop: '4px'}} /></div>
                            <div style={{ ...labelRowStyle, flex: 1 }}><span style={{ fontSize: '12px', color: 'var(--neutral-80)' }}>Border Style</span>
                                <select value={borderStyle} onChange={e => setBorderStyle(e.target.value)} style={{...sharedInputStyle, marginTop: '4px'}}>
                                    <option value="" style={{backgroundColor: 'var(--neutral-20)', color: 'var(--neutral-90)'}}>Default</option>
                                    <option value="solid" style={{backgroundColor: 'var(--neutral-20)', color: 'var(--neutral-90)'}}>Solid</option>
                                    <option value="dashed" style={{backgroundColor: 'var(--neutral-20)', color: 'var(--neutral-90)'}}>Dashed</option>
                                    <option value="dotted" style={{backgroundColor: 'var(--neutral-20)', color: 'var(--neutral-90)'}}>Dotted</option>
                                </select>
                            </div>
                        </div>
                        <div style={labelRowStyle}><span style={{ fontSize: '12px', color: 'var(--neutral-80)' }}>Border Radius</span><input type="text" value={borderRadius} onChange={e => setBorderRadius(e.target.value)} placeholder="e.g. 8px" style={{...sharedInputStyle, marginTop: '4px'}} /></div>
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={sectionTitleStyle}>Label Tab</div>
                        <div style={labelRowStyle}><span style={{ fontSize: '12px', color: 'var(--neutral-80)' }}>Background Color</span><ColorInput value={labelBg} onChange={setLabelBg} placeholder="e.g. var(--neutral-30)" /></div>
                        <div style={labelRowStyle}><span style={{ fontSize: '12px', color: 'var(--neutral-80)' }}>Text Color</span><ColorInput value={labelColor} onChange={setLabelColor} placeholder="e.g. #ffffff" /></div>
                        <div style={labelRowStyle}><span style={{ fontSize: '12px', color: 'var(--neutral-80)' }}>Icon / Gear Color</span><ColorInput value={iconColor} onChange={setIconColor} placeholder="e.g. var(--callToAction)" /></div>
                        <div style={labelRowStyle}><span style={{ fontSize: '12px', color: 'var(--neutral-80)' }}>Text Size</span><input type="text" value={labelFontSize} onChange={e => setLabelFontSize(e.target.value)} placeholder="e.g. 14px" style={{...sharedInputStyle, marginTop: '4px'}} /></div>
                    </div>
                    {isTextNode && (
                        <div style={{ flex: 1 }}>
                            <div style={sectionTitleStyle}>Text Content</div>
                            <div style={labelRowStyle}><span style={{ fontSize: '12px', color: 'var(--neutral-80)' }}>Text Color</span><ColorInput value={textColor} onChange={setTextColor} placeholder="e.g. #ffffff" /></div>
                            <div style={labelRowStyle}><span style={{ fontSize: '12px', color: 'var(--neutral-80)' }}>Text Size</span><input type="text" value={textFontSize} onChange={e => setTextFontSize(e.target.value)} placeholder="e.g. 14px" style={{...sharedInputStyle, marginTop: '4px'}} /></div>
                        </div>
                    )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                    <button onClick={onCancel} style={{ padding: '6px 12px', backgroundColor: 'var(--neutral-40)', border: 'none', borderRadius: '4px', color: 'var(--neutral-90)', cursor: 'pointer' }}>Cancel</button>
                    <button onClick={handleSave} style={{ padding: '6px 12px', backgroundColor: 'var(--callToAction)', border: 'none', borderRadius: '4px', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>Save Changes</button>
                </div>
            </div>
        </div>
    );
};
