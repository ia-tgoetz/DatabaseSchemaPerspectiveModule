import DOMPurify from 'dompurify';

/**
 * Tightly-scoped DOMPurify config for user-supplied SVG icons.
 *
 * USE_PROFILES.svg    — allowlist-only: only known-safe SVG tags/attributes
 *                       are permitted. All on* event handlers, <script>,
 *                       <iframe>, <object>, and <embed> are stripped automatically.
 * FORBID_TAGS         — defense-in-depth block of executable/external-loading
 *                       elements (already not in the SVG allowlist).
 * FORBID_ATTR         — removes href and xlink:href from every element, blocking
 *                       external resource fetches and data exfiltration via
 *                       <image href>, <use xlink:href>, <a href>, etc.
 *
 * NOTE: <style> is intentionally NOT forbidden. SVGs exported from Illustrator,
 * Inkscape, and most design tools use <style> blocks with class-based fills.
 * DOMPurify's SVG profile processes <style> content and removes dangerous CSS
 * constructs. CSS class collisions between multiple inline SVGs are handled
 * separately via scopeSvgStyles().
 */
const SVG_CONFIG: DOMPurify.Config = {
    USE_PROFILES: { svg: true, svgFilters: true },
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'link', 'base', 'meta'],
    FORBID_ATTR: ['href', 'xlink:href'],
};

let _scopeCounter = 0;
/** Returns a stable, unique DOM-safe ID for scoping one SVG's styles. */
export function nextSvgScopeId(): string {
    return `svgi${++_scopeCounter}`;
}

const _sanitizeCache = new Map<string, string>();
const _SANITIZE_CACHE_MAX = 100;

/** Sanitize a raw SVG markup string and return clean SVG markup. Results are cached by input string (LRU, max 100 entries). */
export function sanitizeSvg(raw: string): string {
    const cached = _sanitizeCache.get(raw);
    if (cached !== undefined) return cached;
    const result = DOMPurify.sanitize(raw, SVG_CONFIG) as string;
    if (_sanitizeCache.size >= _SANITIZE_CACHE_MAX) {
        _sanitizeCache.delete(_sanitizeCache.keys().next().value as string);
    }
    _sanitizeCache.set(raw, result);
    return result;
}

/**
 * Scope class-selector rules inside <style> blocks to a container ID so that
 * multiple inline SVGs with identical class names (e.g. .cls-1 from Illustrator)
 * do not interfere with each other.
 *
 * Only simple class selectors (`.foo`, `.foo, .bar`) are prefixed; element
 * selectors, pseudo-classes, and @-rules are left untouched.
 */
function scopeSvgStyles(markup: string, scopeId: string): string {
    return markup.replace(
        /(<style[^>]*>)([\s\S]*?)(<\/style>)/gi,
        (_, open, css, close) => {
            const scoped = css.replace(
                /(\.[\w-]+(?:\s*,\s*\.[\w-]+)*)\s*\{/g,
                (_, selectors: string) => {
                    const prefixed = selectors.trim()
                        .split(',')
                        .map((s: string) => `#${scopeId} ${s.trim()}`)
                        .join(', ');
                    return `${prefixed} {`;
                }
            );
            return `${open}${scoped}${close}`;
        }
    );
}

/**
 * Force the root <svg> element to fill its container (width/height → 100%).
 * The viewBox is preserved so aspect ratio is maintained automatically.
 */
function makeSvgResponsive(markup: string): string {
    return markup
        .replace(/(<svg\b[^>]*?)\swidth="[^"]*"/i, '$1')
        .replace(/(<svg\b[^>]*?)\sheight="[^"]*"/i, '$1')
        .replace(/(<svg\b)/i, '$1 width="100%" height="100%"');
}

/**
 * Decode any supported SVG value, sanitize it (with caching), scope its styles,
 * and return clean SVG markup ready for inline rendering via dangerouslySetInnerHTML.
 *
 * Accepted inputs:
 *   - Raw SVG markup:            "<svg ...>...</svg>"  → rendered inline
 *   - Base64 data URI:           "data:image/svg+xml;base64,<b64>"  → cache-warmed, returns null (use <img>)
 *   - URL-encoded data URI:      "data:image/svg+xml,<encoded>"     → cache-warmed, returns null (use <img>)
 *
 * Base64 and URL-encoded inputs are decoded and run through DOMPurify to prime
 * the sanitization cache, but return null so callers fall back to <img> rendering.
 * This avoids inline SVG rendering issues with complex clipPath/filter SVGs while
 * still benefiting from the cache when the same content arrives as raw markup.
 *
 * Always returns null on any error — never throws.
 */
export function extractSvgMarkup(value: string, scopeId?: string): string | null {
    if (!value) return null;
    try {
        if (value.startsWith('data:image/svg+xml;base64,')) {
            const b64 = value.slice('data:image/svg+xml;base64,'.length);
            sanitizeSvg(decodeURIComponent(escape(atob(b64))));
            return null;
        }
        if (value.startsWith('data:image/svg+xml,')) {
            sanitizeSvg(decodeURIComponent(value.slice('data:image/svg+xml,'.length)));
            return null;
        }
        if (!/^\s*</.test(value)) return null;

        let clean = sanitizeSvg(value);
        if (!clean) return null;

        clean = makeSvgResponsive(clean);
        if (scopeId) clean = scopeSvgStyles(clean, scopeId);

        return clean || null;
    } catch {
        return null;
    }
}

/**
 * Return a safe data URI for use in <img src> or as a drag-ghost source.
 * Raw SVG markup is sanitized before encoding. Non-SVG data URIs pass through.
 * Returns null for unrecognised or empty values.
 *
 * Use this only where a URL is required (drag ghost images).
 * For normal rendering, prefer extractSvgMarkup() + dangerouslySetInnerHTML.
 */
export function toSafeDataUri(value: string): string | null {
    if (!value) return null;

    // Non-SVG data URIs (PNG, JPEG, GIF …) carry no executable markup.
    if (value.startsWith('data:')) return value;

    // Raw SVG markup
    if (/^\s*</.test(value)) {
        const clean = sanitizeSvg(value);
        return clean ? `data:image/svg+xml,${encodeURIComponent(clean)}` : null;
    }

    return null;
}
