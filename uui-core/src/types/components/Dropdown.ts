import React from 'react';
import { Modifier } from 'react-popper';
import { Placement, Boundary } from '@popperjs/core';
import { IDropdownBodyProps, IDropdownToggler, IEditable } from '../props';

export interface DropdownBodyProps extends IDropdownBodyProps {}

export type DropdownPlacement = Placement;

export interface DropdownProps extends Partial<IEditable<boolean>> {
    /** Render callback fo the dropdown target.
     Note, that it's required to pass 'props' parameters to the target component.
     */
    renderTarget: (props: IDropdownToggler) => React.ReactNode;
    /** Render callback for the dropdown body */
    renderBody: (props: DropdownBodyProps) => React.ReactNode;
    /** Called when dropdown was closed */
    onClose?: () => void;
    /** Disable dropdown opening */
    isNotUnfoldable?: boolean;
    /** zIndex for dropdown body
     * By default used value received by LayoutContext
     * */
    zIndex?: number;
    /** Defines dropdown body placement relative to target */
    placement?: DropdownPlacement;
    /** Original popper.js modifiers. See [Popper docs]{@link https://popper.js.org/docs/v2/modifiers/} */
    modifiers?: Modifier<any>[];
    /** Defines how much 'ms' user should hold mouse over target to open the dropdown
     * This prop work only with openOnHover={true}
     * @default 0
     * */
    openDelay?: number;
    /** Defines after which delay dropdown will be closed, if user leave mouse from target.
     * This prop work only with openOnHover={true}
     * @default 0
     * */
    closeDelay?: number;
    /** If true, dropdown will be opened by click on toggler.
     * @default true
     * */
    openOnClick?: boolean;
    /** If true, dropdown will be opened by hover on toggler.
     * @default false
     * */
    openOnHover?: boolean;
    /** If true, clicks on target will toggle dropdown open state.
     * If false, click on target will only open dropdown and won't close it.
     * @default true
     * */
    closeOnTargetClick?: boolean;
    /** If true, dropdown will be closed on click outside body or toggler.
     * @default true
     * */
    closeOnClickOutside?: boolean;
    /** Defined when to close dropdown in case of openOnHover={ true }
     * toggler — dropdown will be closed when a mouse leaves the target component
     * boundary — will not to close the dropdown when a mouse is on target or in 30px around target area
     * false — will not close dropdown by mouse move event
     * @default 'toggler'
     * */
    closeOnMouseLeave?: 'toggler' | 'boundary' | false;
    /**
     * Node of portal target, where to render the dropdown body.
     * By default, will be used global portal node.
     * */
    portalTarget?: HTMLElement;
    /**
     * Element relative to which dropdown will calculate position
     * */
    boundaryElement?: Boundary;
    /** Pass false, if you do not want to close the dropdown in case Toggler move out of viewport.
     * @default true
     * */
    closeBodyOnTogglerHidden?: boolean; // default: true;
}
