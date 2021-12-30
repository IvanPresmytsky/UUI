import { withMods } from '@epam/uui';
import { Checkbox as uuiCheckbox, CheckboxProps } from '@epam/uui-components';
import * as css from './Checkbox.scss';
import * as check_12 from '../../icons/check-12.svg';
import * as check_18 from '../../icons/check-18.svg';
import * as partlySelect_12 from '../../icons/partly-select-12.svg';
import * as partlySelect_18 from '../../icons/partly-select-18.svg';
import '../../assets/styles/variables/inputs/checkbox.scss';

export interface CheckboxMods {
    size?: '12' | '18';
    theme?: 'light' | 'dark';
}

export function applyCheckboxMods(mods: CheckboxMods & CheckboxProps) {
    return [
        'checkbox-vars',
        css.root,
        css['size-' + (mods.size || '18')],
    ];
}

export const Checkbox = withMods<CheckboxProps, CheckboxMods>(uuiCheckbox, applyCheckboxMods, (props) => ({
    icon: (props.size === '12') ? check_12 : check_18,
    indeterminateIcon: (props.size === '12') ? partlySelect_12 : partlySelect_18,
}));