<script lang="ts">
    import * as DataTable from "#lib/components/ui/data-table/data-table.js";
    import {
        createColumnHelper,
        renderComponent,
        renderSnippet,
    } from "@tanstack/svelte-table";
    import { Input } from "#lib/components/ui/input/index.js";
    import {
        addBeer,
        allBeers,
        deleteBeer,
        editBeer,
    } from "../remote/beer.remote.js";
    import CustomBreadcrumb from "#lib/components/ui/custom-breadcrumb.svelte";
    import * as ContextMenu from "#lib/components/ui/context-menu/index.js";
    import Trash from "@lucide/svelte/icons/trash";
    import ExternalLink from "@lucide/svelte/icons/external-link";
    import SimpleDropdown from "#lib/components/ui/simple-dropdown.svelte";
    import DeleteDialogMulti from "#lib/components/ui/delete-dialog-multi.svelte";
    import { getContext } from "svelte";

    const { data } = $props();

    type Beer = (typeof data.beers)[number];

    const columnHelper = createColumnHelper<DataTable.Features, Beer>();

    const columns = columnHelper.columns([
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
            header: "Actions",
            cell: ({ row }) =>
                renderComponent(SimpleDropdown, {
                    children: menu,
                    index: row.index,
                }),
        }),
    ]);

    import { type ErrorContext } from "#lib/client.svelte.js";
    let errorCtx = getContext<ErrorContext>("error-context");

    let processing = $state(false);
    let beers = $state(data.beers);
    let selectedItem: number | undefined = $state();
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

{#snippet menu(index: number)}
    <ContextMenu.Group>
        <a href="/beer/{beers[index].id}" class="contents"
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

<CustomBreadcrumb
    path={[
        {
            name: "Bières",
            path: "/beer",
        },
    ]}
/>

<DeleteDialogMulti
    name={(row: number) => `[biere] ${beers[row].name}`}
    callback={(row: number) => {
        const tmp = beers[row];
        beers = beers.toSpliced(row, 1);
        deleteBeer(tmp.id).catch((e) => {
            errorCtx.message = `Erreur lors de la suppression de <pre>[biere] ${beers[row].name}</pre>`;
        });
    }}
    bind:selectedItem
/>

<svelte:head>
    <title>Bières</title>
</svelte:head>

<h1 class="text-4xl font-bold text-center mb-4">Liste des bières</h1>

<DataTable.Table
    data={beers}
    {columns}
    {processing}
    filterColumn="name"
    enableColumnSelection
    onAddingRowClick={async (t) => {
        processing = true;
        let row = await addBeer({});
        beers = [...beers, row];
        processing = false;
    }}
    {menu}
/>
