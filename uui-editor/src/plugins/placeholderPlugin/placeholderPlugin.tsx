import { Dropdown } from '@epam/uui-components';
import React from 'react';

import { isPluginActive, isTextSelected } from '../../helpers';
import { ToolbarButton } from '../../implementation/ToolbarButton';
import { PlaceholderBlock } from './PlaceholderBlock';

import { PlateEditor, createPluginFactory, getPluginOptions, insertElements } from '@udecode/plate-common';
import css from './PlaceholderPlugin.module.scss';

const KEY = 'placeholder';

export interface PlaceholderPluginParams {
    items: {
        name: string;
        [key: string]: any;
    }[];
}

export const placeholderPlugin = (params: PlaceholderPluginParams) => {
    const createPlaceholderPlugin = createPluginFactory({
        key: KEY,
        isElement: true,
        isInline: true,
        isVoid: true,
        options: {
            params,
        },
        component: PlaceholderBlock,
    });

    return createPlaceholderPlugin();
};

interface IPlaceholderButton {
    editor: PlateEditor;
}

export function PlaceholderButton({ editor }: IPlaceholderButton): any {
    if (!isPluginActive(KEY)) return null;
    const { params }: { params: PlaceholderPluginParams } = getPluginOptions(editor, KEY);

    const renderDropdownBody = () => {
        return (
            <div className={ css.dropdownContainer }>
                { params.items.map((i) => (
                    <div
                        className={ css.dropdownItem }
                        key={ i.name }
                        onMouseDown={ (event) => {
                            event.preventDefault();
                            insertElements(
                                editor,
                                {
                                    data: i,
                                    type: 'placeholder',
                                    children: [{ text: '' }],
                                },
                            );
                        } }
                    >
                        { i.name }
                    </div>
                )) }
            </div>
        );
    };

    return (
        <Dropdown
            renderTarget={ (props) => (
                <ToolbarButton
                    caption={ <div style={ { height: 42, display: 'flex', alignItems: 'center' } }>Insert Placeholder</div> }
                    isDisabled={ isTextSelected(editor, true) }
                    { ...props }
                />
            ) }
            renderBody={ renderDropdownBody }
            placement="top-start"
            modifiers={ [{ name: 'offset', options: { offset: [0, 3] } }] }
        />
    );
}
