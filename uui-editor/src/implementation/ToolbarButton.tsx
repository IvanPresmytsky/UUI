import { Button } from '@epam/uui-components';
import { IHasCX, Icon, cx } from '@epam/uui-core';
import * as React from 'react';
import { Editor } from 'slate';
import css from './ToolbarButton.module.scss';

export interface ToolbarButtonProps extends IHasCX {
    isActive?: boolean;
    onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
    icon?: Icon;
    iconColor?: 'red' | 'green' | 'amber' | 'blue' | 'gray60';
    editor?: Editor;
    isDisabled?: boolean;
    caption?: string;
}

export const ToolbarButton = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, ToolbarButtonProps>((props, ref) => (
    <Button
        onClick={ (e) => {
            props.onClick(e);
        } }
        icon={ props.icon }
        caption={ props.caption }
        forwardedRef={ ref }
        cx={ cx(css.toolbarButton, css['color-' + props.iconColor], css[props.isActive ? 'gray90' : 'gray80'], props.cx) }
        isDisabled={ props.isDisabled }
    />
));
