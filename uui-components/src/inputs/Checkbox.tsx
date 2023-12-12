import * as React from 'react';
import { cx, IHasTabIndex, uuiMarkers } from '@epam/uui-core';
import css from './Checkbox.module.scss';
import {
    Icon, uuiMod, uuiElement, isEventTargetInsideClickable, CheckboxCoreProps, UuiContexts, UuiContext,
} from '@epam/uui-core';
import { IconContainer } from '../layout/IconContainer';

export interface CheckboxProps extends CheckboxCoreProps, IHasTabIndex {
    /** Render callback for checkbox label.
     * If omitted, 'label' prop value will be rendered.
     */
    renderLabel?(): React.ReactNode;

    /** ID provided to the 'input' node */
    id?: string;

    /** Check icon.
     * Usually it has a default implementation in skins, so providing this is only necessary if you want to replace the default icon
     */

    icon?: Icon;
    /** Indeterminate state icon.
     * Usually it has a default implementation in skins, so providing this is only necessary if you want to replace the default icon
     *  */
    indeterminateIcon?: Icon;
}

export class Checkbox extends React.Component<CheckboxProps> {
    static contextType = UuiContext;
    context: UuiContexts;

    handleChange = (e: React.SyntheticEvent<HTMLInputElement>) => {
        !isEventTargetInsideClickable(e) && this.props.onValueChange(!this.props.value);

        if (this.props.getValueChangeAnalyticsEvent) {
            const event = this.props.getValueChangeAnalyticsEvent(!this.props.value, this.props.value);
            this.context.uuiAnalytics.sendEvent(event);
        }
    };

    handleAriaCheckedValue = (indeterminate: boolean, value: boolean): boolean | 'mixed' => {
        if (indeterminate) {
            return 'mixed';
        }

        return value == null ? false : value;
    };

    render() {
        let label = this.props.label;
        if (this.props.renderLabel) {
            label = this.props.renderLabel();
        }
        const ariaCheckedValue = this.handleAriaCheckedValue(this.props.indeterminate, this.props.value);

        return (
            <label
                className={ cx(
                    css.container,
                    uuiElement.checkboxContainer,
                    this.props.cx,
                    this.props.isDisabled && uuiMod.disabled,
                    this.props.isReadonly && uuiMod.readonly,
                    this.props.isInvalid && uuiMod.invalid,
                    !this.props.isReadonly && !this.props.isDisabled && uuiMarkers.clickable,
                ) }
                ref={ this.props.forwardedRef }
                { ...this.props.rawProps }
            >
                <div
                    className={ cx(uuiElement.checkbox, (this.props.value || this.props.indeterminate) && uuiMod.checked) }
                    onFocus={ this.props.onFocus }
                    onBlur={ this.props.onBlur }
                >
                    <input
                        type="checkbox"
                        onChange={ !this.props.isReadonly ? this.handleChange : undefined }
                        disabled={ this.props.isDisabled }
                        aria-disabled={ this.props.isDisabled || undefined }
                        readOnly={ this.props.isReadonly }
                        aria-readonly={ this.props.isReadonly || undefined }
                        checked={ this.props.value || false }
                        aria-checked={ ariaCheckedValue }
                        required={ this.props.isRequired }
                        aria-required={ this.props.isRequired || undefined }
                        tabIndex={ this.props.tabIndex || this.props.isReadonly || this.props.isDisabled ? -1 : 0 }
                        id={ this.props.id }
                    />
                    { this.props.value && !this.props.indeterminate && <IconContainer icon={ this.props.icon } /> }
                    { this.props.indeterminate && <IconContainer icon={ this.props.indeterminateIcon } /> }
                </div>
                { label && <div className={ uuiElement.inputLabel }>{ label }</div> }
            </label>
        );
    }
}
