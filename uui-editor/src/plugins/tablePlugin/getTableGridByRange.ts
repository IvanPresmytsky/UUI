import { PlateEditor, TElementEntry, getNode, TElement, Value, findNode, getPluginType } from '@udecode/plate-common';
import { ELEMENT_TABLE, TTableElement, TTableRowElement, getCellTypes, getEmptyTableNode } from '@udecode/plate-table';
import { } from 'slate';
import { ExtendedTTableCellElement } from './types';

export interface GetTableGridByRangeOptions {
    at: Range;

    /**
     * Format of the output:
     * - table element
     * - array of cells
     */
    format?: 'table' | 'cell';
}

/**
   * Get sub table between 2 cell paths.
   */
export const getTableGridByRange = <V extends Value>(
    editor: PlateEditor<V>,
    { at, format = 'table' }: GetTableGridByRangeOptions,
): TElementEntry[] => {
    const startCellEntry = findNode(editor, {
        at: (at as any).anchor.path,
        match: { type: getCellTypes(editor) },
    });
    const endCellEntry = findNode(editor, {
        at: (at as any).focus.path,
        match: { type: getCellTypes(editor) },
    });
    const startCell = startCellEntry[0] as ExtendedTTableCellElement;
    const endCell = endCellEntry[0] as ExtendedTTableCellElement;

    // console.log('startcell', startCell, 'endCell', endCell);
    const startCellPath = (at as any).anchor.path;
    const endCellPath = (at as any).focus.path;
    const tablePath = startCellPath.slice(0, -2);

    // const _startRowIndex = startCellPath.at(-2)!;
    // const _endRowIndex = endCellPath.at(-2)!;
    // const _startColIndex = startCellPath.at(-1)!;
    // const _endColIndex = endCellPath.at(-1)!;

    const _startRowIndex = startCell.rowIndex;
    const _endRowIndex = endCell.rowIndex + endCell.rowSpan - 1;
    const _startColIndex = startCell.colIndex;
    const _endColIndex = endCell.colIndex + endCell.colSpan - 1;

    const startRowIndex = Math.min(_startRowIndex, _endRowIndex);
    const endRowIndex = Math.max(_startRowIndex, _endRowIndex);
    const startColIndex = Math.min(_startColIndex, _endColIndex);
    const endColIndex = Math.max(_startColIndex, _endColIndex);

    // console.log(
    //     'startRowIndex',
    //     startRowIndex,
    //     'endRowIndex',
    //     endRowIndex,
    //     'startColIndex',
    //     startColIndex,
    //     'endColIndex',
    //     endColIndex,
    // );

    const relativeRowIndex = endRowIndex - startRowIndex;
    const relativeColIndex = endColIndex - startColIndex;

    // console.log('relatives', relativeRowIndex + 1, relativeColIndex + 1);
    // console.log('relativeColIndex', relativeColIndex);

    const table: TTableElement = getEmptyTableNode(editor, {
        rowCount: relativeRowIndex + 1,
        colCount: relativeColIndex + 1,
        newCellChildren: [],
    });

    const tableEntry = findNode(editor, {
        at: tablePath,
        match: { type: getPluginType(editor, ELEMENT_TABLE) },
    });
    const realTable = tableEntry[0] as TTableElement;
    // console.log('realTable', realTable);

    let rowIndex = startRowIndex;
    let colIndex = startColIndex;

    const cellEntries: TElementEntry[] = [];

    while (true) {
        const cellPath = tablePath.concat([rowIndex, colIndex]);

        // console.log('current cellPath', cellPath);

        // const cell = getNode<TElement>(editor, cellPath);
        const cell = findCellByIndexes(editor, realTable, rowIndex, colIndex);

        if (!cell) {
            // console.log('breaking, cant find cell with', rowIndex, colIndex);
            break;
        }

        // console.log('cell found', cell);

        const rows = table.children[rowIndex - startRowIndex]
            .children as TElement[];

        rows[colIndex - startColIndex] = cell;

        cellEntries.push([cell, cellPath]);

        if (colIndex + 1 <= endColIndex) {
            colIndex += 1;
        } else if (rowIndex + 1 <= endRowIndex) {
            colIndex = startColIndex;
            rowIndex += 1;
        } else {
            // console.log('breaking with condition', rowIndex, colIndex, 'but', endColIndex, endRowIndex);
            break;
        }
    }

    if (format === 'cell') {
        return cellEntries;
    }

    return [[table, tablePath]];
};

const findCellByIndexes = <V extends Value>(
    editor: PlateEditor<V>,
    table: TTableElement,
    searchRowIndex: number,
    searchColIndex: number,
) => {
    const rows = table.children;
    // const rowCells = rows[searchRowIndex].children as ExtendedTTableCellElement[];

    const allCells = rows.flatMap((current) => current.children) as ExtendedTTableCellElement[];

    // console.log('allCells', allCells);

    // console.log('current search', searchRowIndex, searchColIndex);
    const foundCell = allCells.find((cell) => {
        const colIndex = cell.colIndex;
        const endColIndex = cell.colIndex + cell.colSpan - 1;
        const rowIndex = cell.rowIndex;
        const endRowIndex = cell.rowIndex + cell.rowSpan - 1;

        // console.log('current', rowIndex, endRowIndex, colIndex, endColIndex);

        // if (colIndex === searchColIndex && rowIndex === searchRowIndex) {
        //     // console.log('found real cell', cell);
        //     return true;
        // } else
        if (
            searchColIndex >= colIndex
            && searchColIndex <= endColIndex
            && searchRowIndex >= rowIndex
            && searchRowIndex <= endRowIndex
        ) {
            // console.log('found unbelievable cell', cell);
            return true;
        }

        return false;
    });

    return foundCell;
};
