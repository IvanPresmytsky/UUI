import React, { useCallback, useState } from 'react';
import sortBy from 'lodash.sortby';
import { i18n } from '../../../i18n';
import {
    DataTableState, IHasRawProps, IPresetsApi, ITablePreset, cx,
} from '@epam/uui-core';
import { AdaptiveItemProps, AdaptivePanel, ScrollBars } from '@epam/uui-components';
import css from './PresetsPanel.module.scss';
import { Button } from '../../buttons';
import { FlexCell, FlexRow } from '../../layout';
import { Dropdown, DropdownContainer, DropdownMenuButton } from '../../overlays';
import { Preset } from './Preset';
import { PresetInput } from './PresetInput';
import { ReactComponent as DeleteIcon } from '@epam/assets/icons/common/action-deleteforever-18.svg';
import { ReactComponent as addIcon } from '@epam/assets/icons/common/content-plus_bold-18.svg';

export interface PresetsPanelProps extends IPresetsApi, IHasRawProps<React.HTMLAttributes<HTMLDivElement>> {
    tableState: DataTableState;
}

type PresetAdaptiveItem = AdaptiveItemProps<{ preset?: ITablePreset }>;

export function PresetsPanel(props: PresetsPanelProps) {
    const [isAddingPreset, setIsAddingPreset] = useState(false);

    const setAddingPreset = useCallback(() => {
        setIsAddingPreset(true);
    }, []);

    const cancelAddingPreset = useCallback(() => {
        setIsAddingPreset(false);
    }, []);

    const { presets, ...presetApi } = props;

    const renderPreset = (preset: ITablePreset) => {
        return <Preset key={ preset.id } preset={ preset } addPreset={ setAddingPreset } { ...presetApi } />;
    };

    const renderAddPresetButton = useCallback(() => {
        return (
            <div key="addingPresetBlock" className={ css.addPresetContainer }>
                {!isAddingPreset ? (
                    <Button size="36" onClick={ setAddingPreset } caption={ i18n.presetPanel.addCaption } icon={ addIcon } iconPosition="left" mode="ghost" color="primary" />
                ) : (
                    <PresetInput onCancel={ cancelAddingPreset } onSuccess={ props.createNewPreset } />
                )}
            </div>
        );
    }, [isAddingPreset]);

    const onPresetDropdownSelect = (preset: PresetAdaptiveItem) => {
        props.choosePreset(preset.preset);
    };

    const renderMoreButtonDropdown = (item: PresetAdaptiveItem, hiddenItems: PresetAdaptiveItem[]) => {
        return (
            <Dropdown
                key="more"
                renderTarget={ (props) => (
                    <FlexRow>
                        <div className={ css.divider } />
                        <Button mode="ghost" color="secondary" caption={ `${hiddenItems?.length || ''} more` } { ...props } />
                    </FlexRow>
                ) }
                renderBody={ (propsBody) => (
                    <DropdownContainer cx={ cx(css.dropContainer) } width={ 230 } { ...propsBody }>
                        <ScrollBars>
                            {hiddenItems.map((hiddenItem) => (
                                <DropdownMenuButton
                                    key={ hiddenItem.preset.id }
                                    onClick={ () => onPresetDropdownSelect(hiddenItem) }
                                    caption={ hiddenItem.preset.name }
                                    icon={ !hiddenItem.preset.isReadonly && DeleteIcon }
                                    iconPosition="right"
                                    cx={ css.dropdownDeleteIcon }
                                    onIconClick={ !hiddenItem.preset.isReadonly && (() => props.deletePreset(hiddenItem.preset)) }
                                />
                            ))}
                        </ScrollBars>
                    </DropdownContainer>
                ) }
            />
        );
    };

    const getPresetPriority = (preset: ITablePreset, index: number) => {
        return preset.id === props.activePresetId ? 100499 : 1000 - index;
    };

    const getPanelItems = (): PresetAdaptiveItem[] => {
        return [
            ...sortBy(props.presets, (i) => i.order).map((preset, index) => ({
                id: preset.id.toString(),
                render: () => renderPreset(preset),
                priority: getPresetPriority(preset, index),
                preset: preset,
            })), {
                id: 'collapsedContainer', render: renderMoreButtonDropdown, priority: 100501, collapsedContainer: true,
            }, { id: 'addPreset', render: renderAddPresetButton, priority: 100501 },
        ];
    };

    return (
        <FlexCell grow={ 1 } minWidth={ 310 } rawProps={ props.rawProps }>
            <FlexRow size={ null } spacing="12" cx={ css.presetsWrapper }>
                <AdaptivePanel items={ getPanelItems() } />
            </FlexRow>
        </FlexCell>
    );
}
