<script lang="ts">
    import * as DataTable from "#lib/components/ui/data-table/data-table.js";

    const { data } = $props();

    import {
        createColumnHelper,
        renderComponent,
        renderSnippet,
    } from "@tanstack/svelte-table";
    import type { DataTableFeatures } from "#lib/components/ui/data-table/data-table-features.js";
    import DataTableSortButton from "#lib/components/ui/data-table/data-table-sort-button.svelte";
    import CustomBreadcrumb from "#lib/components/ui/custom-breadcrumb.svelte";
    import { Input } from "#lib/components/ui/input/index.js";
    import { addZytho, editZytho } from "../remote/zytho.remote.js";
    import DatePicker from "#lib/components/ui/date-picker.svelte";
    import { parseDate } from "@internationalized/date";
    import * as ContextMenu from "#lib/components/ui/context-menu/index.js";
    import SimpleDropdown from "#lib/components/ui/simple-dropdown.svelte";
    import ExternalLink from "@lucide/svelte/icons/external-link";
    import Trash from "@lucide/svelte/icons/trash";
    import DeleteDialogMulti from "#lib/components/ui/delete-dialog-multi.svelte";

    type Zytho = (typeof data.zythos)[number];

    const columnHelper = createColumnHelper<DataTableFeatures, Zytho>();

    export const columns = columnHelper.columns([
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
            header: "Actions",
            cell: ({ row }) =>
                renderComponent(SimpleDropdown, {
                    children: menu,
                    index: row.index,
                }),
        }),
    ]);

    let processing = $state(false);
    let zythos = $state(data.zythos);
    let selectedItem: number | undefined = $state();
</script>

<CustomBreadcrumb
    path={[
        {
            name: "Zythos",
            path: "/zytho",
        },
    ]}
/>

{#snippet menu(index: number)}
    <ContextMenu.Group>
        <a href="/zytho/{zythos[index]?.id}" class="contents"
            ><ContextMenu.Item class="cursor-pointer">
                <ExternalLink /> Détails</ContextMenu.Item
            ></a
        >
        <ContextMenu.Separator />
        <ContextMenu.Item
            variant="destructive"
            class="cursor-pointer"
            onclick={() => (selectedItem = index)}
            ><Trash /> Supprimer</ContextMenu.Item
        >
    </ContextMenu.Group>
{/snippet}

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
    filterColumn="name"
    enableColumnSelection
    onAddingRowClick={async (t) => {
        processing = true;
        let row = await addZytho({});
        zythos = [...zythos, { ...row, totalBeersSold: 0 }];
        processing = false;
    }}
    {menu}
/>

<DeleteDialogMulti
    name={(row: number) => `[zytho] ${zythos[row]?.name ?? zythos[row]?.date}`}
    callback={(row: number) => {
        zythos = zythos.toSpliced(row, 1);
    }}
    {selectedItem}
/>
