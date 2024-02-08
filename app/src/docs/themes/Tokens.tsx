import React from 'react';
import { BaseDocsBlock, EditableDocContent } from '../../common';
import { TokenGroups } from './implementation/TokenGroups';

export class Tokens extends BaseDocsBlock {
    title = 'Tokens';

    renderContent() {
        return (
            <>
                <EditableDocContent fileName="Tokens-intro" />
                <TokenGroups />
            </>
        );
    }
}
