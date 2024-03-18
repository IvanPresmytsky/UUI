import * as React from 'react';
import { IDemoApi } from './demoApi';
import { Icon } from '@epam/uui-core';

export interface DemoComponentProps<TProps = PropDocPropsUnknown> {
    DemoComponent: React.ComponentType<TProps> | React.NamedExoticComponent<TProps>;
    props: TProps;
}

export interface IComponentDocs<TProps> {
    name: string;
    component?: React.ComponentType<TProps> | React.NamedExoticComponent<TProps>;
    props?: PropDoc<TProps, keyof TProps>[];
    contexts?: DemoContext<TProps>[];
}

export interface DemoContext<TProps> {
    context: React.ComponentType<TProps>;
    name: string;
}

export interface IPropSamplesCreationContext<TProps = PropDocPropsUnknown> {
    getChangeHandler(name: string): (newValue: unknown) => void;
    getSelectedProps(): TProps;
    demoApi: IDemoApi;
    forceUpdate: () => void;

    /**
     * Currently, the "uui-docs" module is built using Rollup
     * and therefore can't use webpack-specific API (require.context)
     * to collect all icons from the epam-assets module. So it's a workaround.     *
     */
    getIconList?: () => IconBase<Icon>[];
}

export type PropExampleObject<TProp> = {
    id?: string;
    name?: string;
    value: TProp;
    isDefault?: boolean;
};

export type PropExample<TProp> = PropExampleObject<TProp> | TProp;

export interface IPropDocEditor<TProp> {
    name: string;
    value: TProp;
    exampleId: string | undefined;
    examples: PropExampleObject<TProp>[];
    onValueChange(newValue: TProp): void;
    onExampleIdChange(newExampleId: string | undefined): void;
}

export type TSharedPropEditorType =
    'CssClassEditor' |
    'JsonEditor' |
    'JsonView' |
    'LinkEditor' |
    'NumEditor' |
    'StringEditor' |
    'StringWithExamplesEditor' |
    'MultiUnknownEditor' |
    'SingleUnknownEditor' |
    'IconEditor' |
    'CantResolve'
    ;

export type TPropDocEditorType = React.FC<IPropDocEditor<any>> | TSharedPropEditorType;

export interface PropDoc<TProps, TProp extends keyof TProps> {
    name: Extract<keyof TProps, string>;
    description?: string;
    isRequired: boolean;
    defaultValue?: TProps[TProp];
    examples?: PropExample<TProps[TProp]>[] | ((ctx: IPropSamplesCreationContext<TProps>) => PropExample<TProps[TProp]>[]);
    editorType?: TPropDocEditorType;
    remountOnChange?: boolean;
}

export type PropDocPropsUnknown = Record<string, unknown>;
export type PropDocUnknown = PropDoc<PropDocPropsUnknown, string>;

export enum TSkin {
    UUI = 'uui',
    Electric = 'electric',
    Loveship = 'loveship',
    Promo = 'promo'
}

export enum TDocContext {
    Default = 'Default',
    FlexRow = 'FlexRow',
    Form = 'Form',
    PagePanel = 'PagePanel',
    RelativePanel = 'RelativePanel',
    Resizable = 'Resizable',
    TabButton = 'TabButton',
    Table = 'Table',
    VerticalTabButton = 'VerticalTabButton'
}

export type TDocsGenExportedType = Autogenerated_TDocsGenExportedTypeRef;

export type IconBase<TIcon> = {
    id: string;
    icon: TIcon;
    name: string;
    path: string;
};
