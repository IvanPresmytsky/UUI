import { withMods } from '@epam/uui-core';
import { getTextClasses, TextSettings } from '../../helpers';
import * as UuiComponents from '@epam/uui-components';
import css from './Text.module.scss';

type TextColor = 'info' | 'warning' | 'error' | 'success' | 'brand' | 'primary' | 'secondary' | 'disabled' | 'white';
type TextSize = 'none' | '18' | '24' | '30' | '36' | '42' | '48';
type TextFontStyle = 'normal' | 'italic';
type TextFontWeight = '200' | '300' | '400' | '600' | '700' | '900';

interface TextMods {
    /**
     * Represents the color of a text.
     * @default 'primary'.
     */
    color?: TextColor;
}

export type TextCoreProps = UuiComponents.TextProps & TextSettings & {
    /**
     * Defines text font weight value
     * @default '400'
     */
    fontWeight?: TextFontWeight;
    /**
     * Determines the style of the text font.
     * @default 'normal'
     */
    fontStyle?: TextFontStyle;
    /**
     * Represents the size of a text.
     * @default '36'
     */
    size?: TextSize;
};

export type TextProps = TextCoreProps & TextMods;

function applyTextMods(mods: TextProps) {
    const textClasses = getTextClasses(
        {
            size: mods.size || '36',
            lineHeight: mods.lineHeight,
            fontSize: mods.fontSize,
        },
        false,
    );

    return [
        css.root,
        'uui-text',
        `uui-color-${mods.color || 'primary'}`,
        `uui-font-weight-${mods.fontWeight || '400'}`,
        `uui-font-style-${mods.fontStyle || 'normal'}`,
        'uui-typography',
    ].concat(textClasses);
}

export const Text = withMods<UuiComponents.TextProps, TextProps>(UuiComponents.Text, applyTextMods);
