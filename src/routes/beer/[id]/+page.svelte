<script lang="ts">
    import Beer from "@lucide/svelte/icons/beer";
    import Receipt from "@lucide/svelte/icons/receipt-euro";
    import * as DataTable from "#lib/components/ui/data-table/data-table.js";
    import {
        createColumnHelper,
        renderComponent,
        renderSnippet,
    } from "@tanstack/svelte-table";

    type DeliveryLine = (typeof data.beer.deliveries)[number];
    type ZythoLine = (typeof data.beer.zythos)[number];

    import LinkWrapper from "#lib/components/ui/link-wrapper.svelte";
    import {
        updateDeliveryRow,
        updateZythoRow,
    } from "#lib/components/ui/utils.svelte";
    import CustomBreadcrumb from "#lib/components/ui/custom-breadcrumb.svelte";

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
            cell: ({ row }) =>
                renderComponent(LinkWrapper, {
                    text: row.original.fullDelivery!.date,
                    href: "/delivery/" + row.original.deliveryId,
                }),
        }),
        deliveryColumnHelper.accessor("count", {
            header: ({ column }) =>
                renderComponent(DataTable.SortButton, {
                    text: "Nombre",
                    onclick: column.getToggleSortingHandler(),
                }),
            cell: ({ row }) => renderSnippet(updateDeliveryRow, row.original),
        }),
    ]);

    const preparationColumnHelper = createColumnHelper<
        DataTable.Features,
        ZythoLine
    >();

    const preparationColumns = preparationColumnHelper.columns([
        preparationColumnHelper.accessor("zytho.name", {
            header: "Zytho",
            cell: ({ row }) =>
                renderComponent(LinkWrapper, {
                    text: row.original.zytho?.name ?? "Zytho",
                    href: "/zytho/" + row.original.zythoId,
                }),
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
            id: "test",
            header: ({ column }) =>
                renderComponent(DataTable.SortButton, {
                    text: "Bières vendues",
                    onclick: column.getToggleSortingHandler(),
                }),
            cell: ({ row }) =>
                row.original.countBefore - row.original.countAfter,
        }),
    ]);
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
<DataTable.Table data={data.beer.deliveries} columns={deliveryColumns} />

<h2 class="font-bold m-2 mt-8">Historique des Zythos :</h2>
<DataTable.Table data={data.beer.zythos} columns={preparationColumns} />
