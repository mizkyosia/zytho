<script lang="ts">
    import Beer from "@lucide/svelte/icons/beer";
    import Receipt from "@lucide/svelte/icons/receipt-euro";
    import Package from "@lucide/svelte/icons/package";
    import Truck from "@lucide/svelte/icons/truck";
    import * as DataTable from "#lib/components/ui/data-table/data-table.js";
    import {
        createColumnHelper,
        renderComponent,
    } from "@tanstack/svelte-table";
    import Combobox from "#lib/components/ui/combobox.svelte";
    import EditableCell from "#lib/components/ui/editable-cell.svelte";
    import LineChart from "#lib/components/charts/line-chart.svelte";
    import { formatDate, formatPrice, zythoName } from "#lib/format.js";
    import { sold } from "#lib/stats.js";

    import { type ErrorContext } from "#lib/client.svelte.js";
    import { getContext } from "svelte";
    let errorCtx = getContext<ErrorContext>("error-context");

    type DeliveryLine = (typeof data.beer.deliveries)[number];
    type ZythoLine = (typeof data.beer.zythos)[number];

    import SimpleDropdown from "#lib/components/ui/simple-dropdown.svelte";
    import CustomBreadcrumb from "#lib/components/ui/custom-breadcrumb.svelte";
    import DeleteDialogMulti from "#lib/components/ui/delete-dialog-multi.svelte";
    import {
        addZythoLine,
        deleteZythoLine,
        editZythoLine,
    } from "../../remote/zytho.remote.js";
    import * as ContextMenu from "#lib/components/ui/context-menu/index.js";
    import ExternalLink from "@lucide/svelte/icons/external-link";
    import Trash from "@lucide/svelte/icons/trash";
    import {
        addDeliveryLine,
        deleteDeliveryLine,
        editDeliveryLine,
    } from "../../remote/delivery.remote.js";

    const { data } = $props();

    const deliveryColumnHelper = createColumnHelper<
        DataTable.Features,
        DeliveryLine
    >();

    const deliveryColumns = deliveryColumnHelper.columns([
        deliveryColumnHelper.accessor("fullDelivery.date", {
            header: ({ column }) =>
                renderComponent(DataTable.SortButton, {
                    text: "Livraison",
                    onclick: column.getToggleSortingHandler(),
                }),
            cell: ({ row }) =>
                renderComponent(Combobox<number>, {
                    options: data.deliveries,
                    placeholder: "Livraison...",
                    value: row.original.deliveryId ?? undefined,
                    onchange: (o) => {
                        const old = row.original.deliveryId;
                        row.original.deliveryId = o.value;
                        row.original.fullDelivery = {
                            date:
                                data.deliveries.find((d) => d.value === o.value)
                                    ?.date ?? "",
                        };
                        editDeliveryLine({
                            id: row.original.id,
                            deliveryId: o.value,
                        }).catch(() => {
                            row.original.deliveryId = old;
                            errorCtx.message =
                                "Erreur lors de la modification de la livraison";
                        });
                    },
                }),
        }),
        deliveryColumnHelper.accessor("count", {
            header: ({ column }) =>
                renderComponent(DataTable.SortButton, {
                    text: "Nombre",
                    onclick: column.getToggleSortingHandler(),
                }),
            cell: ({ row }) =>
                renderComponent(EditableCell<DeliveryLine, "count">, {
                    row: row.original,
                    column: "count",
                    step: 1,
                    save: editDeliveryLine,
                }),
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
            meta: { label: "Zytho" },
            header: ({ column }) =>
                renderComponent(DataTable.SortButton, {
                    text: "Zytho",
                    onclick: column.getToggleSortingHandler(),
                }),
            cell: ({ row }) =>
                renderComponent(Combobox<number>, {
                    options: data.zythos,
                    placeholder: "Zytho...",
                    value: row.original.zythoId ?? undefined,
                    onchange: (o) => {
                        const old = row.original.zythoId;
                        row.original.zythoId = o.value;
                        row.original.zytho =
                            data.zythos.find((z) => z.value === o.value)
                                ?.zytho ?? null;
                        editZythoLine({
                            id: row.original.id,
                            zythoId: o.value,
                        }).catch(() => {
                            row.original.zythoId = old;
                            errorCtx.message =
                                "Erreur lors de la modification du zytho";
                        });
                    },
                }),
        }),
        preparationColumnHelper.accessor("zytho.date", {
            meta: { label: "Date" },
            header: ({ column }) =>
                renderComponent(DataTable.SortButton, {
                    text: "Date",
                    onclick: column.getToggleSortingHandler(),
                }),
            cell: ({ row }) => formatDate(row.original.zytho?.date),
        }),
        preparationColumnHelper.accessor("countBefore", {
            meta: { label: "Bières sorties" },
            header: ({ column }) =>
                renderComponent(DataTable.SortButton, {
                    text: "Bières sorties",
                    onclick: column.getToggleSortingHandler(),
                }),
            cell: ({ row }) =>
                renderComponent(EditableCell<ZythoLine, "countBefore">, {
                    row: row.original,
                    column: "countBefore",
                    step: 1,
                    save: editZythoLine,
                }),
        }),
        preparationColumnHelper.accessor("countAfter", {
            meta: { label: "Bières rentrées" },
            header: ({ column }) =>
                renderComponent(DataTable.SortButton, {
                    text: "Bières rentrées",
                    onclick: column.getToggleSortingHandler(),
                }),
            cell: ({ row }) =>
                renderComponent(EditableCell<ZythoLine, "countAfter">, {
                    row: row.original,
                    column: "countAfter",
                    step: 1,
                    save: editZythoLine,
                }),
        }),
        preparationColumnHelper.accessor((row) => sold(row), {
            id: "soldBeers",
            meta: { label: "Bières vendues" },
            header: ({ column }) =>
                renderComponent(DataTable.SortButton, {
                    text: "Bières vendues",
                    onclick: column.getToggleSortingHandler(),
                }),
            cell: ({ row }) => sold(row.original),
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
    let zythosProcessing = $state(false);

    let selectedDelivery: number | undefined = $state();
    let deliveries = $state(data.beer.deliveries);
    let deliveriesProcessing = $state(false);

    // Theoretical sales along the zythos, in chronological order
    const history = $derived(
        zythos
            .filter((z) => z.zytho)
            .toSorted((a, b) => a.zytho!.date.localeCompare(b.zytho!.date)),
    );

    const delivered = $derived(deliveries.reduce((a, d) => a + d.count, 0));
    const totalSold = $derived(zythos.reduce((a, z) => a + sold(z), 0));
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
                name: b.name || "Sans nom (" + b.id + ")",
                path: "/beer/" + b.id,
            })),
        ],
    ]}
/>

{#snippet deliveryMenu(index: number)}
    <ContextMenu.Group>
        <a href="/delivery/{deliveries[index]?.deliveryId}" class="contents"
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
        <a href="/zytho/{zythos[index]?.zythoId}" class="contents"
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

<h1 class="text-4xl font-bold text-center mb-4">
    {data.beer.name || "Sans nom"}
</h1>

<div
    class="flex flex-row flex-wrap gap-8 text-muted-foreground font-bold items-center justify-center"
>
    <h3 class="flex flex-row gap-1"><Beer />{data.beer.alcohol}°</h3>
    <h3 class="flex flex-row gap-1">
        <Receipt />
        {formatPrice(data.beer.buyingPrice)}
    </h3>
    <h3 class="flex flex-row gap-1" title="Livrées - vendues">
        <Package />
        {delivered - totalSold} en stock
    </h3>
    <h3 class="flex flex-row gap-1">
        <Truck />
        Dernière livraison : {formatDate(data.stock?.lastDelivery)}
    </h3>
</div>

<h2 class="font-bold m-2 mt-8">Ventes au fil des Zythos :</h2>
<LineChart
    categories={history.map((z) => zythoName(z.zytho!))}
    series={[
        {
            name: "Bières sorties",
            color: "var(--chart-1)",
            values: history.map((z) => z.countBefore),
        },
        {
            name: "Bières vendues",
            color: "var(--chart-3)",
            values: history.map((z) => sold(z)),
        },
    ]}
    empty="Cette bière n'a encore été vendue à aucun zytho"
/>

<h2 class="font-bold m-2 mt-8">Historique des Zythos :</h2>
<DataTable.Table
    data={zythos}
    columns={preparationColumns}
    menu={zythoMenu}
    enableColumnSelection
    processing={zythosProcessing}
    onAddingRowClick={async () => {
        zythosProcessing = true;
        const row = await addZythoLine({
            beerId: data.beer.id,
            zythoId: data.zythos[0]?.value,
        });
        zythos = [
            ...zythos,
            {
                ...row,
                zytho:
                    data.zythos.find((z) => z.value === row.zythoId)?.zytho ??
                    null,
            },
        ];
        zythosProcessing = false;
    }}
/>

<h2 class="font-bold m-2 mt-8">Historique des livraisons :</h2>
<DataTable.Table
    data={deliveries}
    columns={deliveryColumns}
    menu={deliveryMenu}
    processing={deliveriesProcessing}
    onAddingRowClick={async () => {
        deliveriesProcessing = true;
        const row = await addDeliveryLine({
            beerId: data.beer.id,
            deliveryId: data.deliveries[0]?.value,
        });
        const d = data.deliveries.find((d) => d.value === row.deliveryId);
        deliveries = [
            ...deliveries,
            { ...row, fullDelivery: d ? { date: d.date } : null },
        ];
        deliveriesProcessing = false;
    }}
/>

<DeleteDialogMulti
    name={(row: number) =>
        `[ligne zytho] ${zythos[row]?.id} (${zythos[row]?.zytho ? zythoName(zythos[row].zytho) : "?"})`}
    callback={(row: number) => {
        const tmp = zythos[row];
        zythos = zythos.toSpliced(row, 1);
        deleteZythoLine(tmp.id).catch((e) => {
            errorCtx.message = `Erreur lors de la suppression de <pre>[ligne zytho] ${tmp.id}</pre>`;
        });
    }}
    bind:selectedItem={selectedZytho}
/>

<DeleteDialogMulti
    name={(row: number) =>
        `[ligne livraison] ${deliveries[row]?.id} (${formatDate(deliveries[row]?.fullDelivery?.date)})`}
    callback={(row: number) => {
        const tmp = deliveries[row];
        deliveries = deliveries.toSpliced(row, 1);
        deleteDeliveryLine(tmp.id).catch((e) => {
            errorCtx.message = `Erreur lors de la suppression de <pre>[ligne livraison] ${tmp.id}</pre>`;
        });
    }}
    bind:selectedItem={selectedDelivery}
/>
