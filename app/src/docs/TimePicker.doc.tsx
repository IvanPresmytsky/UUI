import * as React from 'react';
import {
    BaseDocsBlock, DocExample, EditableDocContent, TUuiTsDoc, UUI3, UUI4,
} from '../common';

export class TimePickerDoc extends BaseDocsBlock {
    title = 'TimePicker';

    override getUuiTsDoc = (): TUuiTsDoc => ('@epam/uui:TimePickerProps');

    getPropsDocPath() {
        return {
            [UUI3]: './app/src/docs/_props/loveship/components/inputs/timePicker.props.ts',
            [UUI4]: './app/src/docs/_props/epam-promo/components/inputs/timePicker.props.ts',
        };
    }

    renderContent() {
        return (
            <>
                <EditableDocContent fileName="timePicker-descriptions" />
                {this.renderSectionTitle('Examples')}
                <DocExample title="Basic" path="./_examples/timePicker/Basic.example.tsx" />

                <DocExample title=" 24-hour format" path="./_examples/timePicker/TimeFormat.example.tsx" />
            </>
        );
    }
}
