import * as React from 'react';
import { EditableDocContent, DocExample, BaseDocsBlock, UUI3, UUI4 } from '../common';

export class DropdownDoc extends BaseDocsBlock {
    title = 'Dropdown';

    getPropsDocPath() {
        return {
            [UUI3]: './app/src/docProps/loveship/components/overlays/dropdown.doc.tsx',
            [UUI4]: './app/src/docProps/epam-promo/components/overlays/dropdown.doc.tsx',
        };
    }

    renderContent() {
        return (
            <>
                <EditableDocContent fileName='dropdown-descriptions' />
                { this.renderSectionTitle('Examples') }
                <DocExample
                    title='Basic'
                    path='./examples/dropdown/Basic.example.tsx'
                />

                <DocExample
                    title='Dropdown Open/Close modifiers'
                    path='./examples/dropdown/CloseOpenModifiers.example.tsx'
                />

                <DocExample
                    title='Set delay for dropdown body opening or closing'
                    path='./examples/dropdown/DelayForOpenAndClose.example.tsx'
                />

                <DocExample
                    title='Handle dropdown state by yourself'
                    path='./examples/dropdown/HandleStateByYourself.example.tsx'
                />

                <DocExample
                    title='Close dropdown from body'
                    path='./examples/dropdown/CloseFromBody.example.tsx'
                />
            </>
        );
    }
}
