import React, { ReactNode } from 'react';
import { ArrayDataSource, AsyncDataSource } from '@epam/uui-core';
import {
    renderSnapshotWithContextAsync, setupComponentForTest, screen, within, fireEvent, delay, userEvent,
} from '@epam/uui-test-utils';
import { PickerInput } from '../PickerInput';

jest.mock('react-popper', () => ({
    ...jest.requireActual('react-popper'),
    Popper: function PopperMock({ children }: any) {
        return children({
            ref: jest.fn,
            update: jest.fn(),
            style: {},
            arrowProps: { ref: jest.fn },
            placement: 'bottom-start',
            isReferenceHidden: false,
        });
    },
}));

type TestItemType = {
    id: number;
    level: string;
};

const languageLevels: TestItemType[] = [
    { id: 2, level: 'A1' },
    { id: 3, level: 'A1+' },
    { id: 4, level: 'A2' },
    { id: 5, level: 'A2+' },
    { id: 6, level: 'B1' },
    { id: 7, level: 'B1+' },
    { id: 8, level: 'B2' },
    { id: 9, level: 'B2+' },
    { id: 10, level: 'C1' },
    { id: 11, level: 'C1+' },
    { id: 12, level: 'C2' },
];

const mockDataSource = new ArrayDataSource({
    items: languageLevels,
});

const mockDataSourceAsync = new AsyncDataSource({
    api: async () => {
        await delay(100);
        return languageLevels;
    },
});

type PickerInputComponentProps = React.ComponentProps<typeof PickerInput<TestItemType, number>>;

async function setupPickerInputForTest(params: Partial<PickerInputComponentProps>) {
    const { result, mocks } = await setupComponentForTest<PickerInputComponentProps>(
        (context): PickerInputComponentProps => {
            if (params.selectionMode === 'single') {
                return {
                    value: params.value as number,
                    selectionMode: params.selectionMode,
                    onValueChange: jest.fn().mockImplementation((newValue) => context.current.setProperty('value', newValue)),
                    dataSource: mockDataSourceAsync,
                    disableClear: false,
                    searchPosition: params.searchPosition,
                    getName: (item) => item.level,
                };
            }
            return {
                value: params.value as number[],
                selectionMode: params.selectionMode,
                onValueChange: jest.fn().mockImplementation((newValue) => context.current.setProperty('value', newValue)),
                dataSource: mockDataSourceAsync,
                disableClear: false,
                searchPosition: params.searchPosition,
                getName: (item) => item.level,
            };
        },
        (props) => <PickerInput { ...props } />,
    );
    const input = screen.queryByRole('textbox');

    return {
        result,
        mocks,
        dom: { input },
    };
}

describe('PickerInput', () => {
    it('should render with minimum props', async () => {
        const tree = await renderSnapshotWithContextAsync(
            <PickerInput value={ null } onValueChange={ jest.fn } selectionMode="single" dataSource={ mockDataSource } disableClear searchPosition="input" />,
        );
        expect(tree).toMatchSnapshot();
    });

    it('should render with maximum props', async () => {
        const tree = await renderSnapshotWithContextAsync(
            <PickerInput
                value={ [2, 3] }
                onValueChange={ jest.fn }
                selectionMode="multi"
                dataSource={ mockDataSource }
                size="48"
                maxItems={ 20 }
                editMode="modal"
                valueType="id"
                getName={ (item) => item.level }
                autoFocus
                placeholder="Test placeholder"
                filter={ (item: any) => item.level === 'A1' }
                sorting={ { direction: 'desc', field: 'level' } }
                searchPosition="body"
                minBodyWidth={ 900 }
                renderNotFound={ () => null }
                renderFooter={ (props) => <div>{props as unknown as ReactNode}</div> }
                cascadeSelection
                dropdownHeight={ 48 }
                minCharsToSearch={ 4 }
            />,
        );
        expect(tree).toMatchSnapshot();
    });

    it('[selectionMode multi] should select & clear several options', async () => {
        const { dom, mocks } = await setupPickerInputForTest({
            value: undefined,
            selectionMode: 'multi',
            searchPosition: 'input',
        });
        expect(dom.input.getAttribute('placeholder').trim()).toEqual('Please select');
        fireEvent.click(dom.input);
        expect(screen.getByRole('dialog')).toBeInTheDocument();

        const optionC2 = await screen.findByText('C2');
        expect(optionC2).toBeInTheDocument();

        const [cb1, cb2] = await within(screen.getByRole('dialog')).findAllByRole('checkbox');

        fireEvent.click(cb1);
        expect(mocks.onValueChange).toHaveBeenLastCalledWith([2]);
        fireEvent.click(cb2);
        expect(mocks.onValueChange).toHaveBeenLastCalledWith([2, 3]);
        expect(cb1).toBeChecked();
        expect(cb2).toBeChecked();
        fireEvent.click(window.document.body);
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(screen.queryAllByRole('button')).toHaveLength(3); // 2 tags and 1 clear button
        const a1 = screen.getByText('A1');
        const a1Clear = a1.nextElementSibling;
        const a1plus = screen.getByText('A1+');
        const a1plusClear = a1plus.nextElementSibling;
        fireEvent.click(a1Clear);
        expect(screen.queryAllByRole('button')).toHaveLength(2); // 1 tag and 1 clear button
        fireEvent.click(a1plusClear);
        expect(screen.queryAllByRole('button')).toHaveLength(0);
    });

    it('[selectionMode single] should select & clear option', async () => {
        const { dom, mocks } = await setupPickerInputForTest({
            value: undefined,
            selectionMode: 'single',
        });
        expect(dom.input.getAttribute('placeholder').trim()).toEqual('Please select');
        fireEvent.click(dom.input);
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        const optionC2 = await screen.findByText('C2');
        fireEvent.click(optionC2);
        expect(mocks.onValueChange).toHaveBeenLastCalledWith(12);
        fireEvent.click(window.document.body);
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(screen.getByPlaceholderText('C2')).toBeInTheDocument();
        const clear = screen.getByRole('button');
        fireEvent.click(clear);
        expect(screen.queryByText('C2')).not.toBeInTheDocument();
    });

    describe('keyboard navigation', () => {
        let btn;
        function addFocusableElementBefore() {
            const btnEl = document.createElement('button');
            document.body.prepend(btnEl);
            return btnEl;
        }

        beforeAll(() => {
            btn = addFocusableElementBefore();
        });

        const testInputFocus = async (selectionMode, searchPosition?) => {
            const user = userEvent.setup();
            const { dom } = await setupPickerInputForTest({
                value: undefined,
                selectionMode,
                searchPosition,
            });

            // click the button just before PickerInput
            await user.click(btn);
            // move to PickerInput by Tab key
            await user.tab();

            expect(dom.input).not.toHaveAttribute('readOnly');
            expect(dom.input).toEqual(document.activeElement);

            return user;
        };

        it('[selectionMode single] should focus input on Tab', async () => await testInputFocus('single'));

        it('[selectionMode multi] should focus input on Tab', async () => await testInputFocus('multi', 'input'));

        it('[selectionMode single] should open dropdown when start typing', async () => {
            const user = await testInputFocus('single');
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

            await user.keyboard('a');
            expect(await screen.findByRole('dialog')).toBeInTheDocument();
        });
    });
});
