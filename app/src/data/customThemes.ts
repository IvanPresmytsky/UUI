import { TPropEditorTypeOverride } from '@epam/uui-docs';
import { Theme } from './themes';

const THEME_MANIFEST_FILE = 'theme-manifest.json';

export interface CustomThemeManifest extends Theme {
    css: string[];
    propsOverride?: TPropEditorTypeOverride;
}

interface TUuiCustomThemesLsItem {
    customThemes: string[],
}

function getCustomThemesConfigFromLs() {
    const KEY_CUSTOM_THEMES = 'uui-custom-themes';
    const customThemes = localStorage.getItem(KEY_CUSTOM_THEMES);
    if (typeof customThemes === 'string') {
        try {
            return JSON.parse(customThemes) as TUuiCustomThemesLsItem;
        } catch (err) {
            console.error(`Unable to parse item from localStorage (key="${KEY_CUSTOM_THEMES}")`, err);
        }
    }
}

let cache: Promise<CustomThemeManifest[]>;
export async function loadCustomThemes(): Promise<CustomThemeManifest[]> {
    if (!cache) {
        cache = loadCustomThemesInternal();
    }
    return cache;
}
async function loadCustomThemesInternal() {
    const { customThemes = [] } = getCustomThemesConfigFromLs() || {};
    const ctManifestArr: CustomThemeManifest[] = [];
    if (customThemes.length > 0) {
        await Promise.all(
            customThemes.map(async (themeUrl) => {
                const themeManifestUrl = `${themeUrl}/${THEME_MANIFEST_FILE}`;
                return fetch(themeManifestUrl)
                    .then(async (r) => {
                        const manifest: CustomThemeManifest = await r.json();
                        await loadCssArr(manifest.css.map((cssRel) => convertRelCssUrlToAbs(cssRel, themeUrl)));
                        ctManifestArr.push(manifest);
                    })
                    .catch((err) => {
                        console.error(`Unable to load custom theme from "${themeUrl}"`, err);
                    });
            }),
        );
    }
    return ctManifestArr;
}

async function loadCssArr(urlArr: string[]): Promise<void> {
    await Promise.all(
        urlArr.map(async (url) => loadCss(url)),
    );
}
function loadCss(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = url;
        link.onload = () => {
            resolve();
        };
        link.onerror = (event) => {
            console.error(`Unable to load CSS from "${url}"`);
            reject(event);
            link.remove();
        };
        document.head.appendChild(link);
    });
}

function convertRelCssUrlToAbs(themeRelativeUrl: string, themeAbsoluteUrl: string) {
    const DEL = '/';
    let urlRelativeToManifestNorm = themeRelativeUrl;
    if (urlRelativeToManifestNorm.indexOf('./') === 0) {
        urlRelativeToManifestNorm = urlRelativeToManifestNorm.substring(2);
    }
    return `${themeAbsoluteUrl}${DEL}${urlRelativeToManifestNorm}`;
}
