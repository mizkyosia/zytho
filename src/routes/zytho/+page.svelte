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
    import {
        addZytho,
        deleteZytho,
        editZytho,
    } from "../remote/zytho.remote.js";
    import DatePicker from "#lib/components/ui/date-picker.svelte";
    import BarChart from "#lib/components/charts/bar-chart.svelte";
    import { zythoName } from "#lib/format.js";
    import { parseDate } from "@internationalized/date";
    import * as ContextMenu from "#lib/components/ui/context-menu/index.js";
    import SimpleDropdown from "#lib/components/ui/simple-dropdown.svelte";
    import ExternalLink from "@lucide/svelte/icons/external-link";
    import Trash from "@lucide/svelte/icons/trash";
    import DeleteDialogMulti from "#lib/components/ui/delete-dialog-multi.svelte";

    import { type ErrorContext } from "#lib/client.svelte.js";
    import { getContext } from "svelte";
    let errorCtx = getContext<ErrorContext>("error-context");

    type Zytho = (typeof data.zythos)[number];

    const columnHelper = createColumnHelper<DataTableFeatures, Zytho>();

    const columns = columnHelper.columns([
        columnHelper.accessor("name", {
            meta: { label: "Nom" },
            header: ({ column }) =>
                renderComponent(DataTableSortButton, {
                    text: "Nom",
                    onclick: column.getToggleSortingHandler(),
                }),
            cell: ({ row }) => renderSnippet(updateZythoName, row.original),
        }),
        columnHelper.accessor("date", {
            meta: { label: "Date" },
            header: ({ column }) =>
                renderComponent(DataTableSortButton, {
                    text: "Date",
                    onclick: column.getToggleSortingHandler(),
                }),
            cell: ({ row }) => renderSnippet(updateZythoDate, row.original),
        }),
        columnHelper.accessor("countBefore", {
            meta: { label: "Bières sorties" },
            header: ({ column }) =>
                renderComponent(DataTableSortButton, {
                    text: "Bières sorties",
                    onclick: column.getToggleSortingHandler(),
                }),
        }),
        columnHelper.accessor("countAfter", {
            meta: { label: "Bières rentrées" },
            header: ({ column }) =>
                renderComponent(DataTableSortButton, {
                    text: "Bières rentrées",
                    onclick: column.getToggleSortingHandler(),
                }),
        }),
        columnHelper.accessor("sold", {
            meta: { label: "Bières vendues" },
            header: ({ column }) =>
                renderComponent(DataTableSortButton, {
                    text: "Bières vendues",
                    onclick: column.getToggleSortingHandler(),
                }),
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

    const chronological = $derived(
        zythos.toSorted((a, b) => a.date.localeCompare(b.date)),
    );
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
        placeholder={zythoName({ name: null, date: row.date })}
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

<BarChart
    stacked
    categories={chronological.map((z) => zythoName(z))}
    series={[
        {
            name: "Bières vendues",
            color: "var(--chart-3)",
            values: chronological.map((z) => z.sold),
        },
        {
            name: "Bières non vendues",
            color: "var(--chart-1)",
            values: chronological.map((z) => z.countAfter),
        },
    ]}
    empty="Aucun zytho pour l'instant"
/>

<DataTable.Table
    {columns}
    data={zythos}
    {processing}
    filterColumn="name"
    enableColumnSelection
    onAddingRowClick={async (t) => {
        processing = true;
        let row = await addZytho({});
        zythos = [
            { ...row, countBefore: 0, countAfter: 0, sold: 0 },
            ...zythos,
        ];
        processing = false;
    }}
    {menu}
/>

<DeleteDialogMulti
    name={(row: number) => `[zytho] ${zythos[row] ? zythoName(zythos[row]) : ""}`}
    callback={(row: number) => {
        const tmp = zythos[row];
        zythos = zythos.toSpliced(row, 1);
        deleteZytho(tmp.id).catch((e) => {
            errorCtx.message = `Erreur lors de la suppression de <pre>[zytho] ${zythoName(tmp)}</pre>`;
        });
    }}
    bind:selectedItem
/>
