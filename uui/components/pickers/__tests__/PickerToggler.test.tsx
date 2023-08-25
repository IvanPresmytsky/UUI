import React from 'react';
import { renderer } from '@epam/uui-test-utils';
import { PickerToggler } from '../PickerToggler';

describe('PickerToggler', () => {
    it('should render with minimum props', () => {
        const tree = renderer.create(<PickerToggler pickerMode="single" searchPosition="none" />).toJSON();
        expect(tree).toMatchSnapshot();
    });

    it('should render with maximum props', () => {
        const tree = renderer
            .create(
                <PickerToggler
                    pickerMode="multi"
                    onClick={ jest.fn }
                    onKeyDown={ jest.fn }
                    value={ null }
                    onValueChange={ jest.fn }
                    size="48"
                    maxItems={ 6 }
                    getName={ (item) => item }
                    selectedRowsCount={ 1 }
                    selection={ [
                        {
                            id: 'test',
                            index: 1,
                            rowKey: 'test',
                            value: 'test',
                        },
                    ] }
                    onBlur={ jest.fn }
                    onClear={ jest.fn }
                    searchPosition="none"
                />,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });
});
