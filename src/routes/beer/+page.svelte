<script lang="ts">
    import * as DataTable from "#lib/components/ui/data-table/data-table.js";
    import {
        createColumnHelper,
        renderComponent,
    } from "@tanstack/svelte-table";
    import { addBeer, deleteBeer, editBeer } from "../remote/beer.remote.js";
    import CustomBreadcrumb from "#lib/components/ui/custom-breadcrumb.svelte";
    import * as ContextMenu from "#lib/components/ui/context-menu/index.js";
    import Trash from "@lucide/svelte/icons/trash";
    import ExternalLink from "@lucide/svelte/icons/external-link";
    import SimpleDropdown from "#lib/components/ui/simple-dropdown.svelte";
    import DeleteDialogMulti from "#lib/components/ui/delete-dialog-multi.svelte";
    import EditableCell from "#lib/components/ui/editable-cell.svelte";
    import { formatDate } from "#lib/format.js";
    import { getContext } from "svelte";

    const { data } = $props();

    type Beer = (typeof data.beers)[number];

    const columnHelper = createColumnHelper<DataTable.Features, Beer>();

    const columns = columnHelper.columns([
        columnHelper.accessor("name", {
            meta: { label: "Nom" },
            header: ({ column }) =>
                renderComponent(DataTable.SortButton, {
                    text: "Nom",
                    onclick: column.getToggleSortingHandler(),
                }),
            cell: ({ row }) =>
                renderComponent(EditableCell<Beer, "name">, {
                    row: row.original,
                    column: "name",
                    type: "text",
                    save: editBeer,
                }),
        }),
        columnHelper.accessor("alcohol", {
            meta: { label: "Alcool" },
            header: ({ column }) =>
                renderComponent(DataTable.SortButton, {
                    text: "Alcool (°)",
                    onclick: column.getToggleSortingHandler(),
                }),
            cell: ({ row }) =>
                renderComponent(EditableCell<Beer, "alcohol">, {
                    row: row.original,
                    column: "alcohol",
                    step: 0.1,
                    save: editBeer,
                }),
        }),
        columnHelper.accessor("buyingPrice", {
            meta: { label: "Prix d'achat" },
            header: ({ column }) =>
                renderComponent(DataTable.SortButton, {
                    text: "Prix d'achat (€)",
                    onclick: column.getToggleSortingHandler(),
                }),
            cell: ({ row }) =>
                renderComponent(EditableCell<Beer, "buyingPrice">, {
                    row: row.original,
                    column: "buyingPrice",
                    save: editBeer,
                }),
        }),
        columnHelper.accessor("stock", {
            meta: { label: "En stock" },
            header: ({ column }) =>
                renderComponent(DataTable.SortButton, {
                    text: "En stock",
                    onclick: column.getToggleSortingHandler(),
                }),
        }),
        columnHelper.accessor("lastDelivery", {
            meta: { label: "Dernière livraison" },
            header: ({ column }) =>
                renderComponent(DataTable.SortButton, {
                    text: "Dernière livraison",
                    onclick: column.getToggleSortingHandler(),
                }),
            cell: ({ row }) => formatDate(row.original.lastDelivery),
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

{#snippet menu(index: number)}
    <ContextMenu.Group>
        <a href="/beer/{beers[index]?.id}" class="contents"
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
    name={(row: number) => `[biere] ${beers[row]?.name}`}
    callback={(row: number) => {
        const tmp = beers[row];
        beers = beers.toSpliced(row, 1);
        deleteBeer(tmp.id).catch((e) => {
            errorCtx.message = `Erreur lors de la suppression de <pre>[biere] ${tmp.name}</pre>`;
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
        beers = [
            ...beers,
            { ...row, delivered: 0, sold: 0, stock: 0, lastDelivery: null },
        ];
        processing = false;
    }}
    {menu}
/>
