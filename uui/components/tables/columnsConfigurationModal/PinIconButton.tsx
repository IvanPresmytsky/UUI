import * as React from 'react';
import { ReactComponent as LockIcon } from '@epam/assets/icons/common/action-lock-fill-18.svg';
import { ReactComponent as PinLeftIcon } from '../../../icons/table-group_column_left.svg';
import { ReactComponent as PinRightIcon } from '../../../icons/table-group_column_right.svg';
import { IconButton } from '../../buttons';
import { Tooltip } from '../../overlays';
import { i18n } from '../../../i18n';
import { cx, Icon } from '@epam/uui-core';
//
import css from './PinIconButton.module.scss';

type TPinPosition = 'left' | 'right' | undefined;
interface IPinIconButton {
    pinPosition: TPinPosition;
    canUnpin: boolean;
    onTogglePin: (pinPosition: TPinPosition) => void;
}

const i18nLocal = i18n.tables.columnsConfigurationModal;

export function PinIconButton(props: IPinIconButton) {
    const {
        onTogglePin, pinPosition, canUnpin,
    } = props;
    const isPinned = !!pinPosition;
    const isPinnedAlways = isPinned && !canUnpin;

    let pinUnpinNode: React.ReactNode;

    if (isPinned) {
        const unpinIcon = getUnpinIcon({ isPinnedAlways, pinPosition })!;
        const iconTooltip = isPinnedAlways ? i18nLocal.lockedColumnPinButton : i18nLocal.unPinColumnButton;
        const unpinClickHandler = isPinnedAlways ? undefined : () => onTogglePin(undefined);
        pinUnpinNode = (
            <Tooltip content={ iconTooltip } placement="bottom" color="inverted">
                <IconButton cx={ cx(!isPinnedAlways && css.unpinIcon, css.pinTogglerIcon) } icon={ unpinIcon } onClick={ unpinClickHandler } isDisabled={ isPinnedAlways } color="info" />
            </Tooltip>
        );
    } else {
        pinUnpinNode = (
            <span style={ { display: 'flex', gap: '12px' } }>
                <Tooltip content={ i18nLocal.pinColumnToTheLeftButton } placement="bottom" color="inverted">
                    <IconButton cx={ css.pinTogglerIcon } icon={ PinLeftIcon } onClick={ () => onTogglePin('left') } isDisabled={ isPinnedAlways } color={ undefined } />
                </Tooltip>
                <Tooltip content={ i18nLocal.pinColumnToTheRightButton } placement="bottom" color="inverted">
                    <IconButton cx={ css.pinTogglerIcon } icon={ PinRightIcon } onClick={ () => onTogglePin('right') } isDisabled={ isPinnedAlways } color={ undefined } />
                </Tooltip>
            </span>
        );
    }

    return (
        <span>
            { pinUnpinNode }
        </span>
    );
}

function getUnpinIcon(params: { isPinnedAlways: boolean, pinPosition: TPinPosition }): Icon | undefined {
    const { isPinnedAlways, pinPosition } = params;
    if (isPinnedAlways) {
        return LockIcon;
    }
    switch (pinPosition) {
        case 'left': {
            return PinLeftIcon;
        }
        case 'right': {
            return PinRightIcon;
        }
        default: {
            return;
        }
    }
}
