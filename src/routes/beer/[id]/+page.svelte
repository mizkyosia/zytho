<script lang="ts">
    import Beer from "@lucide/svelte/icons/beer";
    import Receipt from "@lucide/svelte/icons/receipt-euro";
    import * as DataTable from "#lib/components/ui/data-table/data-table.js";
    import {
        createColumnHelper,
        renderComponent,
        renderSnippet,
    } from "@tanstack/svelte-table";

    import { type ErrorContext } from "#lib/client.svelte.js";
    import { getContext } from "svelte";
    let errorCtx = getContext<ErrorContext>("error-context");

    type DeliveryLine = (typeof data.beer.deliveries)[number];
    type ZythoLine = (typeof data.beer.zythos)[number];

    import SimpleDropdown from "#lib/components/ui/simple-dropdown.svelte";
    import {
        updateDeliveryRow,
        updateZythoRow,
    } from "#lib/components/ui/utils.svelte";
    import CustomBreadcrumb from "#lib/components/ui/custom-breadcrumb.svelte";
    import DeleteDialogMulti from "#lib/components/ui/delete-dialog-multi.svelte";
    import { deleteZythoLine } from "../../remote/zytho.remote.js";
    import * as ContextMenu from "#lib/components/ui/context-menu/index.js";
    import ExternalLink from "@lucide/svelte/icons/external-link";
    import Trash from "@lucide/svelte/icons/trash";
    import { deleteDeliveryLine } from "../../remote/delivery.remote.js";

    const { data } = $props();

    const deliveryColumnHelper = createColumnHelper<
        DataTable.Features,
        DeliveryLine
    >();

    const deliveryColumns = deliveryColumnHelper.columns([
        deliveryColumnHelper.accessor("fullDelivery.date", {
            header: ({ column }) =>
                renderComponent(DataTable.SortButton, {
                    text: "Date",
                    onclick: column.getToggleSortingHandler(),
                }),
            cell: ({ row }) => row.original.fullDelivery?.date,
        }),
        deliveryColumnHelper.accessor("count", {
            header: ({ column }) =>
                renderComponent(DataTable.SortButton, {
                    text: "Nombre",
                    onclick: column.getToggleSortingHandler(),
                }),
            cell: ({ row }) => renderSnippet(updateDeliveryRow, row.original),
        }),
        deliveryColumnHelper.display({
            id: "actions",
            header: "Actions",
            cell: ({ row }) =>
                renderComponent(SimpleDropdown, {
                    children: deliveryMenu,
                    index: row.index,
                }),
        }),
    ]);

    const preparationColumnHelper = createColumnHelper<
        DataTable.Features,
        ZythoLine
    >();

    const preparationColumns = preparationColumnHelper.columns([
        preparationColumnHelper.accessor("zytho.name", {
            header: ({ column }) =>
                renderComponent(DataTable.SortButton, {
                    text: "Zytho",
                    onclick: column.getToggleSortingHandler(),
                }),
            cell: ({ row }) => row.original.zytho?.name ?? "Zytho",
        }),
        preparationColumnHelper.accessor("zytho.date", {
            header: ({ column }) =>
                renderComponent(DataTable.SortButton, {
                    text: "Date",
                    onclick: column.getToggleSortingHandler(),
                }),
        }),
        preparationColumnHelper.accessor("countBefore", {
            header: ({ column }) =>
                renderComponent(DataTable.SortButton, {
                    text: "Bières préparées",
                    onclick: column.getToggleSortingHandler(),
                }),
            cell: ({ row }) =>
                renderSnippet(updateZythoRow<ZythoLine>, {
                    column: "countBefore",
                    row: row.original,
                }),
        }),
        preparationColumnHelper.accessor("countAfter", {
            header: ({ column }) =>
                renderComponent(DataTable.SortButton, {
                    text: "Bières non vendues",
                    onclick: column.getToggleSortingHandler(),
                }),
            cell: ({ row }) =>
                renderSnippet(updateZythoRow<ZythoLine>, {
                    column: "countAfter",
                    row: row.original,
                }),
        }),
        preparationColumnHelper.display({
            id: "soldBeers",
            header: ({ column }) =>
                renderComponent(DataTable.SortButton, {
                    text: "Bières vendues",
                    onclick: column.getToggleSortingHandler(),
                }),
            cell: ({ row }) =>
                row.original.countBefore - row.original.countAfter,
        }),
        preparationColumnHelper.display({
            id: "actions",
            header: "Actions",
            cell: ({ row }) =>
                renderComponent(SimpleDropdown, {
                    children: zythoMenu,
                    index: row.index,
                }),
        }),
    ]);

    let selectedZytho: number | undefined = $state();
    let zythos = $state(data.beer.zythos);

    let selectedDelivery: number | undefined = $state();
    let deliveries = $state(data.beer.deliveries);
</script>

<CustomBreadcrumb
    path={[
        {
            name: "Bières",
            path: "/beer",
        },
        [
            {
                name: data.beer.name || "Sans nom",
                path: "/beer/" + data.beer.id,
            },
            ...data.beers.map((b) => ({
                name: b.name ?? "Sans nom (" + b.id + ")",
                path: "/beer/" + b.id,
            })),
        ],
    ]}
/>

{#snippet deliveryMenu(index: number)}
    <ContextMenu.Group>
        <a href="/delivery/{deliveries[index].deliveryId}" class="contents"
            ><ContextMenu.Item class="cursor-pointer">
                <ExternalLink />Détails</ContextMenu.Item
            ></a
        >
        <ContextMenu.Separator />
        <ContextMenu.Item
            variant="destructive"
            class="cursor-pointer"
            onclick={() => (selectedDelivery = index)}
            ><Trash /> Supprimer</ContextMenu.Item
        >
    </ContextMenu.Group>
{/snippet}

{#snippet zythoMenu(index: number)}
    <ContextMenu.Group>
        <a href="/zytho/{zythos[index].zythoId}" class="contents"
            ><ContextMenu.Item class="cursor-pointer">
                <ExternalLink />Détails</ContextMenu.Item
            ></a
        >
        <ContextMenu.Separator />
        <ContextMenu.Item
            variant="destructive"
            class="cursor-pointer"
            onclick={() => (selectedZytho = index)}
            ><Trash /> Supprimer</ContextMenu.Item
        >
    </ContextMenu.Group>
{/snippet}

<svelte:head>
    <title>Bières - {data.beer.name}</title>
</svelte:head>

<h1 class="text-4xl font-bold text-center mb-4">{data.beer.name}</h1>

<div
    class="flex flex-row gap-8 text-muted-foreground font-bold items-center justify-center"
>
    <h3 class="flex flex-row gap-1"><Beer />{data.beer.alcohol}°</h3>
    <h3 class="flex flex-row gap-1">
        <Receipt />
        {data.beer.buyingPrice}€ - {data.beer.sellingPrice}€
    </h3>
</div>

<h2 class="font-bold m-2">Historique des livraisons :</h2>
<DataTable.Table
    data={deliveries}
    columns={deliveryColumns}
    menu={deliveryMenu}
/>

<h2 class="font-bold m-2 mt-8">Historique des Zythos :</h2>
<DataTable.Table data={zythos} columns={preparationColumns} menu={zythoMenu} />

<DeleteDialogMulti
    name={(row: number) =>
        `[ligne zytho] ${zythos[row].id} (${zythos[row].zytho?.name ?? zythos[row].zytho?.date ?? "Test"})`}
    callback={(row: number) => {
        const tmp = zythos[row];
        zythos = zythos.toSpliced(row, 1);
        deleteZythoLine(tmp.id).catch((e) => {
            errorCtx.message = `Erreur lors de la suppression de <pre>[ligne zytho] ${zythos[row].id} (${zythos[row].zytho?.name ?? zythos[row].zytho?.date})</pre>`;
        });
    }}
    bind:selectedItem={selectedZytho}
/>

<DeleteDialogMulti
    name={(row: number) =>
        `[ligne livraisonI] ${deliveries[row].id} (${deliveries[row].fullDelivery?.date})`}
    callback={(row: number) => {
        const tmp = deliveries[row];
        deliveries = deliveries.toSpliced(row, 1);
        deleteDeliveryLine(tmp.id).catch((e) => {
            errorCtx.message = `Erreur lors de la suppression de <pre>[ligne livraison] ${deliveries[row].id} (${deliveries[row].fullDelivery?.date})</pre>`;
        });
    }}
    bind:selectedItem={selectedDelivery}
/>
