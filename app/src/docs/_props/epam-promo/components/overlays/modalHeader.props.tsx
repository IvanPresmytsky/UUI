import * as React from 'react';
import { DocBuilder } from '@epam/uui-docs';
import { Button, FlexRow, ModalHeader, Text } from '@epam/promo';
import { ModalHeaderProps } from '@epam/uui';
import { DefaultContext } from '../../docs';

const ModalHeaderDoc = new DocBuilder<ModalHeaderProps>({ name: 'ModalHeader', component: ModalHeader })
    .prop('title', {
        examples: ['Text', { value: 'Very long text', isDefault: true }],
        type: 'string',
    })
    .prop('borderBottom', { examples: [true, false] })
    .prop('padding', {
        examples: [
            '6', '12', '24',
        ],
    })
    .prop('onClose', { examples: (ctx) => [ctx.getCallback('onClose')] })
    .prop('children', {
        examples: [
            {
                value: (
                    <FlexRow padding="24" vPadding="12">
                        <FlexRow>
                            <Text size="30" font="sans">
                                Modal header text in children props
                            </Text>
                        </FlexRow>
                        <FlexRow>
                            <Button onClick={ () => {} } color="green" caption="Ok" />
                            <Button onClick={ () => {} } fill="none" color="gray" caption="Cancel" />
                        </FlexRow>
                    </FlexRow>
                ),
                name: 'Base',
            },
        ],
    })
    .withContexts(DefaultContext);

export default ModalHeaderDoc;
