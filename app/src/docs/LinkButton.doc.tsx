import * as React from 'react';
import {
    EditableDocContent, DocExample, BaseDocsBlock, UUI4, UUI3, UUI, TDocsGenType,
} from '../common';

export class LinkButtonDoc extends BaseDocsBlock {
    title = 'Link Button';

    override getDocsGenType = (): TDocsGenType => ('@epam/uui:LinkButtonProps');

    getPropsDocPath() {
        return {
            [UUI3]: './app/src/docs/_props/loveship/components/buttons/linkButton.props.tsx',
            [UUI4]: './app/src/docs/_props/epam-promo/components/buttons/linkButton.props.tsx',
            [UUI]: './app/src/docs/_props/uui/components/buttons/linkButton.props.tsx',
        };
    }

    renderContent() {
        return (
            <>
                <EditableDocContent fileName="link-button-descriptions" />
                {this.renderSectionTitle('Overview')}
                <DocExample title="Link Button" path="./_examples/linkButton/Default.example.tsx" />

                <DocExample title="Sizes" path="./_examples/linkButton/Size.example.tsx" />

                <DocExample title="Icon Positions" path="./_examples/linkButton/IconPosition.example.tsx" />

                {this.renderSectionTitle('Examples')}
                <DocExample title="Secondary action in small footer" path="./_examples/common/Card.example.tsx" />

                <DocExample title="Sorting" path="./_examples/linkButton/Sorting.example.tsx" />
            </>
        );
    }
}
