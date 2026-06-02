import * as React from 'react';
import { STANDARD_PALETTE, sharedInputStyle } from './constants';

export const ColorInput = ({ value, onChange, placeholder }: { value: string, onChange: (val: string) => void, placeholder: string }) => {
    const [pickerOpen, setPickerOpen] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState<'palette' | 'custom'>('palette');

    let currentHex = '#000000';
    let currentAlpha = 1;

    if (value.startsWith('#')) {
        if (value.length === 7) currentHex = value;
        else if (value.length === 9) { currentHex = value.substring(0, 7); currentAlpha = Math.round((parseInt(value.substring(7, 9), 16) / 255) * 100) / 100; }
        else if (value.length === 4) { currentHex = '#' + value[1]+value[1] + value[2]+value[2] + value[3]+value[3]; }
    } else if (value.startsWith('rgba')) {
        const parts = value.match(/[\d.]+/g);
        if (parts && parts.length >= 4) { const r = parseInt(parts[0], 10), g = parseInt(parts[1], 10), b = parseInt(parts[2], 10); currentAlpha = parseFloat(parts[3]); currentHex = '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1); }
    } else if (value.startsWith('rgb')) {
        const parts = value.match(/[\d.]+/g);
        if (parts && parts.length >= 3) { const r = parseInt(parts[0], 10), g = parseInt(parts[1], 10), b = parseInt(parts[2], 10); currentHex = '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1); }
    }

    const handleColorChange = (newHex: string) => {
        const r = parseInt(newHex.slice(1, 3), 16), g = parseInt(newHex.slice(3, 5), 16), b = parseInt(newHex.slice(5, 7), 16);
        onChange(currentAlpha < 1 ? `rgba(${r}, ${g}, ${b}, ${currentAlpha})` : newHex);
    };
    const handleAlphaChange = (newAlpha: number) => {
        const r = parseInt(currentHex.slice(1, 3), 16), g = parseInt(currentHex.slice(3, 5), 16), b = parseInt(currentHex.slice(5, 7), 16);
        onChange(newAlpha === 1 ? currentHex : `rgba(${r}, ${g}, ${b}, ${newAlpha})`);
    };

    return (
        <div style={{ position: 'relative', display: 'flex', gap: '6px', marginTop: '4px' }}>
            <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ ...sharedInputStyle, marginTop: 0, flex: 1 }} />
            <div onClick={() => setPickerOpen(!pickerOpen)} style={{ width: '28px', height: '28px', borderRadius: '4px', border: '1px solid var(--neutral-40)', backgroundColor: value || '#000000', cursor: 'pointer', flexShrink: 0 }} title="Open color picker" />
            {pickerOpen && (
                <>
                    <div onClick={() => setPickerOpen(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1001 }} />
                    <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', zIndex: 1002, backgroundColor: 'var(--neutral-10)', border: '1px solid var(--neutral-50)', borderRadius: '6px', padding: '12px', width: '220px', boxShadow: '0 8px 16px rgba(0,0,0,0.5)' }}>
                        <div style={{ display: 'flex', borderBottom: '1px solid var(--neutral-40)', marginBottom: '10px' }}>
                            <div onClick={() => setActiveTab('palette')} style={{ padding: '4px 10px', fontSize: '11px', cursor: 'pointer', borderBottom: activeTab === 'palette' ? '2px solid var(--callToAction)' : '2px solid transparent', color: activeTab === 'palette' ? 'var(--neutral-90)' : 'var(--neutral-60)', fontWeight: activeTab === 'palette' ? 'bold' : 'normal' }}>Palette</div>
                            <div onClick={() => setActiveTab('custom')} style={{ padding: '4px 10px', fontSize: '11px', cursor: 'pointer', borderBottom: activeTab === 'custom' ? '2px solid var(--callToAction)' : '2px solid transparent', color: activeTab === 'custom' ? 'var(--neutral-90)' : 'var(--neutral-60)', fontWeight: activeTab === 'custom' ? 'bold' : 'normal' }}>Custom</div>
                        </div>
                        {activeTab === 'palette' && (
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
                                {STANDARD_PALETTE.map(swatch => (
                                    <div key={`popover-palette-${swatch}`} onClick={() => { onChange(swatch); setPickerOpen(false); }} style={{ width: '18px', height: '18px', backgroundColor: swatch, border: '1px solid rgba(0,0,0,0.2)', borderRadius: '2px', cursor: 'pointer' }} title={swatch} />
                                ))}
                            </div>
                        )}
                        {activeTab === 'custom' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '5px 0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '11px', color: 'var(--neutral-80)' }}>Base Color:</span>
                                    <div style={{ width: '100%', maxWidth: '100px', height: '24px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--neutral-40)', position: 'relative' }}>
                                        <input type="color" value={currentHex} onChange={e => handleColorChange(e.target.value)} style={{ position: 'absolute', top: '-10px', left: '-10px', width: '150px', height: '50px', padding: 0, border: 'none', cursor: 'pointer' }} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '11px', color: 'var(--neutral-80)', width: '40px' }}>Alpha:</span>
                                    <input type="range" min="0" max="1" step="0.01" value={currentAlpha} onChange={e => handleAlphaChange(parseFloat(e.target.value))} style={{ flex: 1, cursor: 'pointer', height: '4px' }} />
                                    <span style={{ fontSize: '11px', color: 'var(--neutral-80)', width: '30px', textAlign: 'right' }}>{Math.round(currentAlpha * 100)}%</span>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};
