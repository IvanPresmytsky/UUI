import * as React from 'react';
import cx from 'classnames';
import {
    BaseRangeDatePickerProps, IDropdownBodyProps, RangeDatePickerInputType, uuiMod,
} from '@epam/uui-core';
import { BaseRangeDatePicker } from '@epam/uui-components';
import { FlexRow, FlexSpacer, FlexCell } from '../layout';
import { LinkButton } from '../buttons';
import { TextInput } from '../inputs';
import { RangeDatePickerBody } from '../datePickers';
import { i18n } from '../../i18n';
import { systemIcons } from '../../icons/icons';
import css from './FilterRangeDatePickerBody.module.scss';

export interface RangeDatePickerProps extends BaseRangeDatePickerProps, IDropdownBodyProps {}

export class FilterRangeDatePickerBody extends BaseRangeDatePicker<RangeDatePickerProps> {
    state = {
        ...super.getInitialState(),
        inFocus: 'from' as RangeDatePickerInputType,
    };

    changeIsOpen = (open: boolean) => {
        this.toggleOpening(open);
        this.props.onClose();
    };

    renderBody() {
        return (
            <>
                <FlexRow borderBottom={ true }>
                    <RangeDatePickerBody
                        value={ this.getValue() }
                        onValueChange={ this.onRangeChange }
                        filter={ this.props.filter }
                        focusPart={ this.state.inFocus }
                        changeIsOpen={ this.changeIsOpen }
                        presets={ this.props.presets }
                    />
                </FlexRow>
                <FlexCell alignSelf="stretch">
                    <FlexRow padding="24" vPadding="12">
                        <div className={ cx(css.dateInputGroup, this.state.inFocus && uuiMod.focus) }>
                            <TextInput
                                icon={ systemIcons.calendar }
                                cx={ cx(css.dateInput, css['size-30'], this.state.inFocus === 'from' && uuiMod.focus) }
                                size="30"
                                placeholder={ i18n.rangeDatePicker.pickerPlaceholderFrom }
                                value={ this.state.inputValue.from }
                                onValueChange={ this.getChangeHandler('from') }
                                onFocus={ (event) => this.handleFocus(event, 'from') }
                                onBlur={ (event) => this.handleBlur(event, 'from') }
                            />
                            <div className={ css.separator } />
                            <TextInput
                                cx={ cx(css.dateInput, css['size-30'], this.state.inFocus === 'to' && uuiMod.focus) }
                                placeholder={ i18n.rangeDatePicker.pickerPlaceholderTo }
                                size="30"
                                value={ this.state.inputValue.to }
                                onCancel={ this.state.inputValue.from && this.state.inputValue.to && this.handleCancel }
                                onValueChange={ this.getChangeHandler('to') }
                                onFocus={ (event) => this.handleFocus(event, 'to') }
                                onBlur={ (event) => this.handleBlur(event, 'to') }
                            />
                        </div>
                        <FlexSpacer />
                        <LinkButton
                            isDisabled={ !this.state.inputValue.from && !this.state.inputValue.to }
                            caption={ i18n.pickerModal.clearAllButton }
                            onClick={ this.handleCancel }
                        />
                    </FlexRow>
                </FlexCell>
            </>
        );
    }

    renderInput = (): any => {
        return null;
    };

    render() {
        return this.renderBody();
    }
}
