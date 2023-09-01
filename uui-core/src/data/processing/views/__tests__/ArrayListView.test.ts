import { ArrayListView, ArrayListViewProps } from '../ArrayListView';
import { ArrayDataSource } from '../../ArrayDataSource';
import { CascadeSelection, DataSourceState, SortDirection } from '../../../../types';

interface TItem {
    id: number;
    level: string;
    parentId?: number;
}

type View = ArrayListView<TItem, number, any>;

const testItems: TItem[] = [
    { id: 2, level: 'A1' },
    { id: 5, level: 'A2+' },
    { id: 1, level: 'A0' },
    { id: 3, level: 'A1+' },
    { id: 4, level: 'A2' },
    { id: 6, level: 'B' },
    { id: 7, level: 'B1+', parentId: 6 },
    { id: 8, level: 'B2', parentId: 6 },
    { id: 9, level: 'B2+', parentId: 6 },
    { id: 10, level: 'C1' },
    { id: 11, level: 'C1+' },
    { id: 12, level: 'C2' },
];

interface Country {
    id: string;
    name: string;
}

const countries: Country[] = [
    { id: 'CN', name: 'China' },
    { id: 'ES', name: 'Spain' },
    { id: 'FI', name: 'Finland' },
    { id: 'GB', name: 'United Kingdom' },
    { id: 'NC', name: 'Nicaragua' },
    { id: 'GN', name: 'Guinea' },
    { id: 'GW', name: 'Guinea-Bissau' },
];

const totalRowsCount = 12;
const rootNodesCount = 9;

let dataSource: ArrayDataSource<{ id: number; level: string }, number, any>;
let view: View;

let onValueChange: (newValue: DataSourceState<any, number>) => any;
const initialValue: DataSourceState = { topIndex: 0, visibleCount: totalRowsCount };
let viewProps: ArrayListViewProps<TItem, number, any>;

describe('ArrayListView', () => {
    beforeEach(() => {
        onValueChange = jest.fn();

        dataSource = new ArrayDataSource<TItem, number>({
            items: testItems,
            getId: (i) => i.id,
            getParentId: (i) => i.parentId,
        });

        viewProps = {
            getId: (i) => i.id,
            getSearchFields: (item) => [item.level],
            getRowOptions: () => ({
                checkbox: {
                    isVisible: true,
                },
                isSelectable: true,
            }),
        };
        view = dataSource.getView(initialValue, onValueChange, viewProps) as View;
        jest.clearAllMocks();
    });

    it('should create visibleRows on constructor', () => {
        expect(view['rows']).toHaveLength(rootNodesCount);
    });

    describe('setValue logic', () => {
        it('should set new value and update rows', () => {
            const rebuildRowsSpy = jest.spyOn(view, 'rebuildRows' as any);

            view.update({ value: { filter: {} }, onValueChange }, viewProps);

            expect(view.value).toStrictEqual({ filter: {} });
            expect(rebuildRowsSpy).toHaveBeenCalled();
        });

        it('should not update nodes when setValue called with the same value', () => {
            const rebuildRowsSpy = jest.spyOn(view, 'rebuildRows' as any);

            view.update({ value: initialValue, onValueChange }, viewProps);

            expect(rebuildRowsSpy).toHaveBeenCalledTimes(0);
        });

        it('should update focused item if only focusedIndex changed in value', () => {
            const updateFocusedItemSpy = jest.spyOn(view, 'updateFocusedItem' as any);

            view.update({ value: { ...initialValue, focusedIndex: 1 }, onValueChange }, viewProps);

            expect(updateFocusedItemSpy).toHaveBeenCalledTimes(1);
        });
    });

    it('should return item by ID', () => {
        const row = view.getById(testItems[1].id, 1);
        expect(row).toHaveProperty('id', testItems[1].id);
        expect(row).toHaveProperty('value', testItems[1]);
        expect(row).toHaveProperty('index', 1);
    });

    it('should return rows', () => {
        const topIndex = 2;
        view.update({ value: { ...initialValue, topIndex, visibleCount: 15 }, onValueChange }, viewProps);
        const rows = view.getVisibleRows();
        const rootTestItems = testItems.filter((i) => i.parentId == null).slice(topIndex);
        expect(rows).toMatchObject(rootTestItems.map((i) => ({ id: i.id, value: i })));
        expect(view.getVisibleRows()).toHaveLength(rootTestItems.length);
    });

    it('should return all nodes, if isFoldedByDefault is false', () => {
        view = dataSource.getView(initialValue, () => {}, {
            getId: (i) => i.id,
            isFoldedByDefault: () => false,
        }) as View;
        const rows = view.getVisibleRows();
        expect(rows).toMatchObject(testItems.map((i) => ({ id: i.id, value: i })));
        expect(view.getVisibleRows()).toHaveLength(testItems.length);
    });

    describe('sorting', () => {
        it('should return rows in default order, if sorting do not passed', () => {
            view.update({ value: { ...initialValue, topIndex: 0, visibleCount: 20 }, onValueChange }, viewProps);
            const rows = view.getVisibleRows();
            expect(rows[0].id).toEqual(2);
            expect(rows[4].id).toEqual(4);
        });

        it('should sort rows if set sorting to value', () => {
            view.update({
                value: {
                    ...initialValue, sorting: [{ field: 'id', direction: 'asc' }], topIndex: 0, visibleCount: 20,
                },
                onValueChange,
            }, viewProps);
            const rows = view.getVisibleRows();
            expect(rows[0].id).toEqual(1);
            expect(rows[4].id).toEqual(5);
        });
    });

    describe('search', () => {
        let countriesDataSource: ArrayDataSource<Country, string>;
        let countriesViewProps: ArrayListViewProps<Country, string, any>;
        let countriesView: ArrayListView<Country, string, any>;
        let countriesOnValueChange: (newValue: DataSourceState<Country, string>) => any;

        beforeEach(() => {
            countriesOnValueChange = jest.fn();

            countriesDataSource = new ArrayDataSource<Country, string>({
                items: countries,
                getId: (i) => i.id,
                getSearchFields: (item) => [item.name],
            });

            countriesViewProps = {
                getId: (i) => i.id,
                getSearchFields: (item) => [item.name],
                getRowOptions: () => ({
                    checkbox: {
                        isVisible: true,
                    },
                    isSelectable: true,
                }),
            };
            countriesView = countriesDataSource.getView(initialValue, countriesOnValueChange, countriesViewProps) as ArrayListView<Country, string, any>;
            jest.clearAllMocks();
        });

        it('should search items', () => {
            countriesView.update({
                value: { ...initialValue, search: 'ea', topIndex: 0, visibleCount: 20 },
                onValueChange: countriesOnValueChange,
            }, countriesViewProps);
            const rows = countriesView.getVisibleRows();
            const rowsIds = rows.map((i) => i.id);

            expect(rows).toHaveLength(2);
            expect(rowsIds).toEqual(['GN', 'GW']);
        });

        it('should search items by group of tokens', () => {
            countriesView.update({
                value: { ...initialValue, search: 'ea bi', topIndex: 0, visibleCount: 20 },
                onValueChange: countriesOnValueChange,
            }, countriesViewProps);
            const rows = countriesView.getVisibleRows();
            const rowsIds = rows.map((i) => i.id);

            expect(rows).toHaveLength(1);
            expect(rowsIds).toEqual(['GW']);
        });

        it('should sort items in order of search relevance', () => {
            countriesView.update({
                value: { ...initialValue, search: 'gu', topIndex: 0, visibleCount: 20 },
                onValueChange: countriesOnValueChange,
            }, countriesViewProps);
            const rows = countriesView.getVisibleRows();
            const rowsIds = rows.map((i) => i.id);

            expect(rows).toHaveLength(3);
            expect(rowsIds).toEqual(['GN', 'GW', 'NC']);
        });

        it('should not sort items in order of search relevance if sortSearchByRelevance = false', () => {
            const props: ArrayListViewProps<Country, string, any> = { ...countriesViewProps, sortSearchByRelevance: false };
            countriesView = countriesDataSource.getView(initialValue, countriesOnValueChange, props) as ArrayListView<Country, string, any>;

            countriesView.update({
                value: { ...initialValue, search: 'gu', topIndex: 0, visibleCount: 20 },
                onValueChange: countriesOnValueChange,
            }, props);
            const rows = countriesView.getVisibleRows();
            const rowsIds = rows.map((i) => i.id);

            expect(rows).toHaveLength(3);
            expect(rowsIds).toEqual(['NC', 'GN', 'GW']);
        });

        it('should not return items if group was not matched', () => {
            countriesView.update({
                value: { ...initialValue, search: 'wa bx', topIndex: 0, visibleCount: 20 },
                onValueChange: countriesOnValueChange,
            }, countriesViewProps);
            const rows = countriesView.getVisibleRows();
            const rowsIds = rows.map((i) => i.id);

            expect(rows).toHaveLength(0);
            expect(rowsIds).toEqual([]);
        });
    });

    describe('updateTree', () => {
        const getFilter = (filter) => (item) => filter(item);
        const filter = (item) => item.parentId === 6;

        let value: View['value'] = initialValue;
        const onValueChangeFn = (newValue: typeof value) => {
            value = newValue;
        };

        it('should update tree if filter was changed', () => {
            const realView = dataSource.getView(value, onValueChangeFn, viewProps) as View;
            realView.update({
                value: {
                    ...value, topIndex: 0, visibleCount: 20, filter,
                },
                onValueChange: onValueChangeFn,
            }, { ...viewProps, getFilter });
            const rows = realView.getVisibleRows();
            const rowsIds = rows.map((i) => i.id);

            expect(rows).toHaveLength(1);
            expect(rowsIds).toEqual([6]);

            const [row] = rows;
            row.onFold?.(row);
            realView.update({
                value: {
                    ...value, topIndex: 0, visibleCount: 20, filter,
                },
                onValueChange: onValueChangeFn,
            }, { ...viewProps, getFilter });

            const unfoldedRows = realView.getVisibleRows();
            const unfoldedRowsIds = unfoldedRows.map((i) => i.id);
            expect(unfoldedRows).toHaveLength(4);
            expect(unfoldedRowsIds).toEqual([
                6, 7, 8, 9,
            ]);
        });

        it('should update tree if filter and search was changed', () => {
            const realView = dataSource.getView(value, onValueChangeFn, viewProps) as View;
            const dataSourceState = {
                ...value, topIndex: 0, visibleCount: 20, filter, search: 'B1',
            };
            realView.update({ value: dataSourceState, onValueChange: onValueChangeFn }, { ...viewProps, getFilter });
            const rows = realView.getVisibleRows();
            const rowsIds = rows.map((i) => i.id);

            expect(rows).toHaveLength(2);
            expect(rowsIds).toEqual([6, 7]);
        });

        it('should update tree if filter, search and sorting was changed', () => {
            const realView = dataSource.getView(value, onValueChangeFn, viewProps) as View;
            const dataSourceState = {
                ...value,
                topIndex: 0,
                visibleCount: 20,
                filter,
                search: 'B',
                sorting: [{ field: 'level', direction: 'desc' as SortDirection }],
            };
            realView.update({ value: dataSourceState, onValueChange: onValueChangeFn }, { ...viewProps, getFilter });
            const rows = realView.getVisibleRows();
            const rowsIds = rows.map((i) => i.id);

            expect(rows).toHaveLength(4);
            expect(rowsIds).toEqual([
                6, 9, 8, 7,
            ]);
        });
    });

    describe('rows check', () => {
        describe('cascadeSelection = false', () => {
            it('should select item in single mode', () => {
                const row = view.getById(6, 6);
                row.onSelect?.(row);

                expect(onValueChange).toBeCalledWith({ ...initialValue, selectedId: 6 });
            });

            it('onCheck handler should set id to checked array in value', async () => {
                const row1 = view.getById(6, 6);
                row1.onCheck?.(row1);
                expect(onValueChange).toHaveBeenCalledWith({ ...initialValue, checked: [6] });

                view.update({ value: { ...initialValue, checked: [6] }, onValueChange }, viewProps);

                const row2 = view.getById(7, 7);
                row2.onCheck?.(row2);

                expect(onValueChange).toHaveBeenCalledWith({ ...initialValue, checked: [6, 7] });
            });
        });

        describe("cascadeSelection = true | cascadeSelection = 'explicit'", () => {
            it.each<[CascadeSelection]>([[true], ['explicit']])('should check all children when parent checked with cascadeSelection = %s', (cascadeSelection) => {
                view = dataSource.getView(initialValue, onValueChange, {
                    getId: (i) => i.id,
                    cascadeSelection,
                    getRowOptions: () => ({
                        checkbox: { isVisible: true },
                    }),
                }) as View;

                const row1 = view.getById(6, 6);
                row1.onCheck?.(row1);

                expect(onValueChange).toBeCalledWith({
                    ...initialValue,
                    checked: [
                        6, 7, 8, 9,
                    ],
                });
            });

            it.each<[CascadeSelection]>([[true], ['explicit']])('should check parent if all siblings checked with cascadeSelection = %s', (cascadeSelection) => {
                view = dataSource.getView({ ...initialValue, checked: [7, 8] }, onValueChange, {
                    getId: (i) => i.id,
                    cascadeSelection,
                    getRowOptions: () => ({
                        checkbox: { isVisible: true },
                    }),
                }) as View;

                const row = view.getById(9, 9);
                row.onCheck?.(row);

                expect(onValueChange).toBeCalledWith({
                    ...initialValue,
                    checked: [
                        7, 8, 9, 6,
                    ],
                });
            });

            it.each<[CascadeSelection]>([[true], ['explicit']])(
                'should not update internal state itself on onCheck call but only on update call with cascadeSelection = %s',
                (cascadeSelection) => {
                    view = dataSource.getView({ ...initialValue, checked: [] }, onValueChange, {
                        getId: (i) => i.id,
                        cascadeSelection,
                        getRowOptions: () => ({
                            checkbox: { isVisible: true },
                        }),
                    }) as View;

                    const row = view.getById(9, 9);
                    row.onCheck?.(row);

                    expect(onValueChange).toBeCalledWith({ ...initialValue, checked: [9] });
                    expect(view['checkedByKey']).toEqual({});

                    view.update({ value: { ...initialValue, checked: [9] }, onValueChange }, viewProps);
                    expect(onValueChange).toBeCalledWith({ ...initialValue, checked: [9] });

                    expect(view['checkedByKey']).toEqual({ 9: true });
                },
            );

            it.each<[CascadeSelection]>([[true], ['explicit']])('should select all top items with cascadeSelection = %s', (cascadeSelection) => {
                view = dataSource.getView({ ...initialValue, checked: [7, 8] }, onValueChange, {
                    getId: (i) => i.id,
                    cascadeSelection,
                    getRowOptions: () => ({
                        checkbox: { isVisible: true },
                    }),
                }) as View;

                const selectAll = view.selectAll;
                selectAll?.onValueChange(true);

                expect(onValueChange).toBeCalledWith({
                    ...initialValue,
                    checked: [
                        7, 8, 2, 5, 1, 3, 4, 6, 9, 10, 11, 12,
                    ],
                });
            });
        });

        describe("cascadeSelection = 'implicit'", () => {
            it('should check only parent when parent checked with cascadeSelection = implicit', () => {
                view = dataSource.getView(initialValue, onValueChange, {
                    getId: (i) => i.id,
                    cascadeSelection: 'implicit',
                    getRowOptions: () => ({
                        checkbox: { isVisible: true },
                    }),
                }) as View;

                const row1 = view.getById(6, 6);
                row1.onCheck?.(row1);

                expect(onValueChange).toBeCalledWith({ ...initialValue, checked: [6] });
            });

            it('should check parent if all siblings checked with cascadeSelection = implicit', () => {
                view = dataSource.getView({ ...initialValue, checked: [7, 8] }, onValueChange, {
                    getId: (i) => i.id,
                    cascadeSelection: 'implicit',
                    getRowOptions: () => ({
                        checkbox: { isVisible: true },
                    }),
                }) as View;

                const row = view.getById(9, 9);
                row.onCheck?.(row);

                expect(onValueChange).toBeCalledWith({ ...initialValue, checked: [6] });
            });

            it('should select all top items with cascadeSelection = implicit', () => {
                view = dataSource.getView({ ...initialValue, checked: [7, 8] }, onValueChange, {
                    getId: (i) => i.id,
                    cascadeSelection: 'implicit',
                    getRowOptions: () => ({
                        checkbox: { isVisible: true },
                    }),
                }) as View;

                const selectAll = view.selectAll;
                selectAll?.onValueChange(true);

                expect(onValueChange).toBeCalledWith({
                    ...initialValue,
                    checked: [
                        2, 5, 1, 3, 4, 6, 10, 11, 12,
                    ],
                });
            });
        });
    });

    it('should set focusedItem', () => {
        const row = view.getById(6, 6);
        row.onFocus?.(row.index);

        expect(onValueChange).toBeCalledWith({ ...initialValue, focusedIndex: row.index });
    });

    it('should fold/unfold item', () => {
        const row = view.getVisibleRows()[5];
        row.onFold?.(row);

        expect(onValueChange).toBeCalledWith({ ...initialValue, folded: { [row.id]: !row.isFolded } });
    });

    it('should return selected rows in selection order', () => {
        view.update({ value: { ...initialValue, checked: [6, 5, 4] }, onValueChange }, viewProps);

        const selectedRows = view.getSelectedRows();
        expect(selectedRows.map(({ id }) => id)).toEqual([
            6, 5, 4,
        ]);
    });
});
