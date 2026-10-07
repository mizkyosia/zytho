<script lang="ts">
    import * as DataTable from "#lib/components/ui/data-table/data-table.js";
    import DeleteDialog from "#lib/components/ui/delete-dialog.svelte";
    import {
        createColumnHelper,
        renderComponent,
        renderSnippet,
    } from "@tanstack/svelte-table";
    import { Input } from "#lib/components/ui/input/index.js";
    import { addBeer, allBeers, editBeer } from "../remote/beer.remote.js";
    import LinkWrapper from "#lib/components/ui/link-wrapper.svelte";
    import CustomBreadcrumb from "#lib/components/ui/custom-breadcrumb.svelte";
    import Trash from "@lucide/svelte/icons/trash";

    const { data } = $props();

    type Beer = (typeof data.beers)[number];

    const columnHelper = createColumnHelper<DataTable.Features, Beer>();

    const columns = columnHelper.columns([
        columnHelper.display({
            id: "link",
            cell: ({ row }) =>
                renderComponent(LinkWrapper, {
                    href: "/beer/" + row.original.id,
                    text: "",
                }),
        }),
        columnHelper.accessor("name", {
            header: ({ column }) =>
                renderComponent(DataTable.SortButton, {
                    text: "Nom",
                    onclick: column.getToggleSortingHandler(),
                }),
            cell: ({ row }) =>
                renderSnippet(updateBeerRow, {
                    column: "name",
                    row: row.original,
                    small: false,
                }),
        }),
        columnHelper.accessor("alcohol", {
            header: ({ column }) =>
                renderComponent(DataTable.SortButton, {
                    text: "Alcool",
                    onclick: column.getToggleSortingHandler(),
                }),
            cell: ({ row }) =>
                renderSnippet(updateBeerRow, {
                    column: "alcohol",
                    row: row.original,
                }),
        }),
        columnHelper.accessor("buyingPrice", {
            header: ({ column }) =>
                renderComponent(DataTable.SortButton, {
                    text: "Prix achat",
                    onclick: column.getToggleSortingHandler(),
                }),
            cell: ({ row }) =>
                renderSnippet(updateBeerRow, {
                    column: "buyingPrice",
                    row: row.original,
                }),
        }),
        columnHelper.accessor("sellingPrice", {
            header: ({ column }) =>
                renderComponent(DataTable.SortButton, {
                    text: "Prix vente",
                    onclick: column.getToggleSortingHandler(),
                }),
            cell: ({ row }) =>
                renderSnippet(updateBeerRow, {
                    column: "sellingPrice",
                    row: row.original,
                }),
        }),
        columnHelper.display({
            id: "actions",
            cell: ({ row }) =>
                renderComponent(DeleteDialog, {
                    name: `[biere] ${row.original.name}`,
                    callback: () => {},
                }),
        }),
    ]);

    let processing = $state(false);
    let beers = $state(data.beers);
</script>

{#snippet updateBeerRow({
    column,
    row,
    small = true,
}: {
    column: keyof Beer;
    row: Beer;
    small?: boolean;
})}
    <Input
        type={typeof row[column]}
        value={row[column]}
        class={{ "w-20": small }}
        step={0.1}
        onchange={(e) => {
            let oldValue = row[column];
            if (typeof row[column] === "number")
                row[column] = e.currentTarget.valueAsNumber;
            else row[column] = e.currentTarget.value;
            editBeer({
                id: row.id,
                [column]: row[column],
            }).catch((e) => {
                // Rollback
                row[column] = oldValue;
            });
        }}
    />
{/snippet}

<CustomBreadcrumb
    path={[
        {
            name: "Bières",
            path: "/beer",
        },
    ]}
/>

<svelte:head>
    <title>Bières</title>
</svelte:head>

<h1 class="text-4xl font-bold text-center mb-4">Liste des bières</h1>

<DataTable.Table
    data={beers}
    {columns}
    {processing}
    filterColumn={"name"}
    onAddingRowClick={async (t) => {
        processing = true;
        let row = await addBeer({});
        beers = [...beers, row];
        processing = false;
    }}
/>
