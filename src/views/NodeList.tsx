import { Flex, Form, Grid, TextField, View, Text, ProgressCircle, Heading, Picker, Item } from '@adobe/react-spectrum';
import React, { useEffect } from 'react';
import { NodeInfo, NodeInfoMap } from '../utils/BayMeshApi';
import { Link } from 'react-router-dom';
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
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
    }),
    columnHelper.accessor('role', {
        header: 'Device Mode',
        filterFn: 'equals',
    }),
    columnHelper.accessor('hopStart', {
        header: 'Hop Start',
    }),
    columnHelper.accessor('updatedAt', {
        header: 'Last Updated',
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
        getCoreRowModel: getCoreRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
    })

    if (!nodeInfos || Object.keys(nodeInfos).length === 0 || table.getRowModel().rows.length === 0) {
        return (
            <Flex direction={"column"} justifyContent={"center"} alignItems={"center"}>
                <ProgressCircle size='L' aria-label="Loading…" isIndeterminate />
            </Flex>
        )
    } else {
        return (
            <Flex direction={"column"} gap="size-100">
                <Heading level={2}>Nodes seen in last 24 hours</Heading>
                <Picker
                    label="Role Filter"
                    defaultSelectedKey={'ALL'}
                    items={roleOptions}
                    onSelectionChange={(key) => {
                        if (key === 'ALL') {
                            setColumnFilters([])
                        } else {
                            setColumnFilters(
                                [
                                    {
                                        id: 'role',
                                        value: key.toString(),
                                    }
                                ]
                            );
                        }
                    }}
                >
                    {(item) => (
                        <Item key={item.key}>{item.label}</Item>
                    )}
                </Picker>
                <table>
                    <thead>
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </th>
                                ))}
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
