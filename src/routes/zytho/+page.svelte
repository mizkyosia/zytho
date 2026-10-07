<script lang="ts">
    import * as DataTable from "#lib/components/ui/data-table/data-table.js";
    import DeleteDialog from "#lib/components/ui/delete-dialog.svelte";

    const { data } = $props();

    import {
        createColumnHelper,
        renderComponent,
        renderSnippet,
    } from "@tanstack/svelte-table";
    import type { DataTableFeatures } from "#lib/components/ui/data-table/data-table-features.js";
    import DataTableSortButton from "#lib/components/ui/data-table/data-table-sort-button.svelte";
    import LinkWrapper from "#lib/components/ui/link-wrapper.svelte";
    import CustomBreadcrumb from "#lib/components/ui/custom-breadcrumb.svelte";
    import { Input } from "#lib/components/ui/input/index.js";
    import { addZytho, editZytho } from "../remote/zytho.remote.js";
    import DatePicker from "#lib/components/ui/date-picker.svelte";
    import { parseDate } from "@internationalized/date";

    type Zytho = (typeof data.zythos)[number];

    const columnHelper = createColumnHelper<DataTableFeatures, Zytho>();

    export const columns = columnHelper.columns([
        columnHelper.display({
            id: "link",

            cell: ({ row }) =>
                renderComponent(LinkWrapper, {
                    href: "/zytho/" + row.original.id,
                }),
        }),
        columnHelper.accessor("name", {
            header: ({ column }) =>
                renderComponent(DataTableSortButton, {
                    text: "Nom",
                    onclick: column.getToggleSortingHandler(),
                }),
            cell: ({ row }) => renderSnippet(updateZythoName, row.original),
        }),
        columnHelper.accessor("date", {
            header: ({ column }) =>
                renderComponent(DataTableSortButton, {
                    text: "Date",
                    onclick: column.getToggleSortingHandler(),
                }),
            cell: ({ row }) => renderSnippet(updateZythoDate, row.original),
        }),
        columnHelper.accessor("totalBeersSold", {
            header: ({ column }) =>
                renderComponent(DataTableSortButton, {
                    text: "Bières vendues",
                    onclick: column.getToggleSortingHandler(),
                }),
            cell: ({ row }) => row.original.totalBeersSold,
        }),
        columnHelper.display({
            id: "actions",
            cell: ({ row }) =>
                renderComponent(DeleteDialog, {
                    name: `[zytho] ${row.original.name}`,
                    callback: () => {},
                }),
        }),
    ]);

    let processing = $state(false);
    let zythos = $state(data.zythos);
</script>

<CustomBreadcrumb
    path={[
        {
            name: "Zythos",
            path: "/zytho",
        },
    ]}
/>

{#snippet updateZythoName(row: Zytho)}
    <Input
        value={row.name}
        onchange={(e) => {
            let oldValue = row.name;
            row.name = e.currentTarget.value;
            editZytho({
                id: row.id,
                name: row.name,
            }).catch((e) => {
                // Rollback
                row.name = oldValue;
            });
        }}
    />
{/snippet}

{#snippet updateZythoDate(row: Zytho)}
    <DatePicker
        value={parseDate(row.date)}
        icon={true}
        onchange={(d) => {
            let oldValue = row.date;
            row.date = d;
            editZytho({
                id: row.id,
                date: row.date,
            }).catch((e) => {
                // Rollback
                row.date = oldValue;
            });
        }}
    />
{/snippet}

<svelte:head>
    <title>Zythos</title>
</svelte:head>

<h1 class="text-4xl font-bold text-center mb-4">Zythos & Events</h1>

<DataTable.Table
    {columns}
    data={zythos}
    {processing}
    onAddingRowClick={async (t) => {
        processing = true;
        let row = await addZytho({});
        zythos = [...zythos, { ...row, totalBeersSold: 0 }];
        processing = false;
    }}
/>
