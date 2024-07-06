import { Flex, ProgressCircle, Heading, Picker, Item } from '@adobe/react-spectrum';
import React, { useEffect } from 'react';
import { NodeInfo, NodeInfoMap } from '../utils/BayMeshApi';
import { Link } from 'react-router-dom';
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getFacetedMinMaxValues,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getSortedRowModel,
    ColumnFiltersState,
    SortingState,
} from '@tanstack/react-table'
import humanizeString from 'humanize-string';

import './NodeList.css';

const columnHelper = createColumnHelper<NodeInfo>();

const curTime = (new Date()).getTime();

const columns = [
    columnHelper.accessor('id', {
        header: 'Hex Id',
        cell: hexId => <Link to={`/node/${hexId.getValue()}`}>{hexId.getValue()}</Link>,
    }),
    columnHelper.accessor('shortName', {
        header: () => 'Short Name',
        cell: info => info.renderValue(),
    }),
    columnHelper.accessor('longName', {
        header: () => <span>Long Name</span>,
    }),
    columnHelper.accessor('hwModel', {
        header: () => <span>Device Model</span>,
        filterFn: 'equals',
    }),
    columnHelper.accessor('role', {
        header: 'Device Mode',
        filterFn: 'equals',
    }),
    columnHelper.accessor('hopStart', {
        header: 'Hop Start',
        sortUndefined: 'last',
        sortDescFirst: false,
        filterFn: 'weakEquals',
    }),
    columnHelper.accessor('updatedAt', {
        header: 'Last Updated',
        sortUndefined: 'last',
        sortDescFirst: false,
        cell: updatedAt => {
            const timeDiff = Math.floor((curTime - new Date(updatedAt.getValue()).getTime()) / (1000 * 60));
            const hours = Math.floor(timeDiff / 60);
            const minutes = timeDiff % 60;
            return <span>{hours > 0 ? `${hours} hours, ` : ''}{minutes} mins ago</span>
        }
    })
]

export default function NodeList({ nodeInfos }: { nodeInfos: NodeInfoMap }) {
    const [data, setData] = React.useState<NodeInfo[]>([]);
    const [roleOptions, setRoleOptions] = React.useState<any[]>([]);
    const [sorting, setSorting] = React.useState<SortingState>([{
        id: 'updatedAt',
        desc: true,
    }]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
    )

    useEffect(() => {
        setData(Object.keys(nodeInfos)
            .map((key) => nodeInfos[key])
            .filter(nodeInfo => nodeInfo.updatedAt > 0)
            .map((nodeInfo: NodeInfo) => {
                if (!nodeInfo.role) {
                    nodeInfo.role = "CLIENT";
                }
                return nodeInfo;
            }));

        const rolestmp = Array.from(new Set(Object.keys(nodeInfos)
            .map((key) => nodeInfos[key].role)))
            .filter(role => !!role)
            .map((role) => {
                return { key: role, label: humanizeString(role) }
            });
        setRoleOptions([{ key: 'ALL', label: "Show All Roles" }].concat(rolestmp));
    }, [nodeInfos]);

    const table = useReactTable({
        data,
        columns,
        filterFns: {},
        state: {
            columnFilters,
            sorting,
        },
        getFacetedRowModel: getFacetedRowModel(), // client-side faceting
        getFacetedUniqueValues: getFacetedUniqueValues(), // generate unique values for select filter/autocomplete
        getFacetedMinMaxValues: getFacetedMinMaxValues(), // generate min/max values for range filter
        getCoreRowModel: getCoreRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
    })

    if (!nodeInfos || Object.keys(nodeInfos).length === 0 || table.getRowModel().rows.length === 0) {
        return (
            <Flex direction={"column"} justifyContent={"center"} alignItems={"center"}>
                <ProgressCircle size='L' aria-label="Loading…" isIndeterminate />
            </Flex>
        )
    } else {

        const columFilter = (columnId: string, label: string) => {
            const columnFacets = table.getHeaderGroups()[0]?.headers.find((h) => h.id === columnId)?.column.getFacetedUniqueValues();
            const pickerOptions = columnFacets ? [{ key: 'ALL', label: 'Show All' }].concat(Array.from(columnFacets.entries()).sort((a, b) => {
                return b[1] - a[1];
            }).map((value) => {
                return { key: value[0], label: `${typeof value[0] === 'string' ? humanizeString(value[0]) : value[0]} (${value[1]})` };
            })) : [{ key: 'ALL', label: 'Show All' }];

            return (<Picker
                label={`${label} Filter`}
                defaultSelectedKey={'ALL'}
                items={pickerOptions}
                onSelectionChange={(key) => {
                    if (key === 'ALL') {
                        setColumnFilters([])
                    } else {
                        setColumnFilters(
                            columnFilters.filter((n) => n.id !== columnId).concat([
                                {
                                    id: columnId,
                                    value: key.toString(),
                                }
                            ])
                        );
                    }
                }}
            >
                {(item) => (
                    <Item key={item.key}>{item.label}</Item>
                )}
            </Picker>)
        };

        return (
            <Flex direction={"column"} gap="size-100">
                <Heading level={2}>Nodes in cache</Heading>
                <Flex direction={"row"} gap="size-100" marginBottom={10}>
                    {columFilter('role', 'Role')}
                    {columFilter('hwModel', 'Device Model')}
                    {columFilter('hopStart', 'Hop Start')}
                </Flex>
                <table>
                    <thead>
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => {
                                    return (
                                        <th key={header.id} colSpan={header.colSpan}>
                                            {header.isPlaceholder ? null : (
                                                <div
                                                    className={
                                                        header.column.getCanSort()
                                                            ? 'cursor-pointer select-none'
                                                            : ''
                                                    }
                                                    onClick={header.column.getToggleSortingHandler()}
                                                    title={
                                                        header.column.getCanSort()
                                                            ? header.column.getNextSortingOrder() === 'asc'
                                                                ? 'Sort ascending'
                                                                : header.column.getNextSortingOrder() === 'desc'
                                                                    ? 'Sort descending'
                                                                    : 'Clear sort'
                                                            : undefined
                                                    }
                                                >
                                                    {flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                                    {{
                                                        asc: ' 🔼',
                                                        desc: ' 🔽',
                                                    }[header.column.getIsSorted() as string] ?? null}
                                                </div>
                                            )}
                                        </th>
                                    )
                                })}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.map(row => (
                            <tr key={row.id}>
                                {row.getVisibleCells().map(cell => (
                                    <td key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Flex>
        );

    }
};
