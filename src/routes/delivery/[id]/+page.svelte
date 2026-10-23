<script lang="ts">
    import Calendar from "@lucide/svelte/icons/calendar";
    import Receipt from "@lucide/svelte/icons/receipt-euro";
    import * as DataTable from "#lib/components/ui/data-table/data-table.js";
    import {
        createColumnHelper,
        renderComponent,
    } from "@tanstack/svelte-table";
    import { parseDate } from "@internationalized/date";

    import { type ErrorContext } from "#lib/client.svelte.js";
    import { getContext } from "svelte";
    let errorCtx = getContext<ErrorContext>("error-context");

    type DeliveryLine = (typeof data.delivery.lines)[number];
    type Barrel = (typeof data.delivery.barrels)[number];
    type ReturnedBarrel = (typeof data.delivery.returnedBarrels)[number];

    import {
        addDeliveryLine,
        deleteDeliveryLine,
        editDelivery,
        editDeliveryLine,
    } from "../../remote/delivery.remote.js";
    import {
        addBarrel,
        deleteBarrel,
        editBarrel,
    } from "../../remote/barrel.remote.js";
    import CustomBreadcrumb from "#lib/components/ui/custom-breadcrumb.svelte";
    import Combobox from "#lib/components/ui/combobox.svelte";
    import DatePicker from "#lib/components/ui/date-picker.svelte";
    import EditableCell from "#lib/components/ui/editable-cell.svelte";
    import BarrelStatusSelect from "#lib/components/ui/barrel-status-select.svelte";
    import BarChart from "#lib/components/charts/bar-chart.svelte";
    import DeleteDialogMulti from "#lib/components/ui/delete-dialog-multi.svelte";
    import SimpleDropdown from "#lib/components/ui/simple-dropdown.svelte";
    import * as ContextMenu from "#lib/components/ui/context-menu/index.js";
    import ExternalLink from "@lucide/svelte/icons/external-link";
    import Trash from "@lucide/svelte/icons/trash";
    import Undo from "@lucide/svelte/icons/undo-2";
    import { formatDate, formatPrice } from "#lib/format.js";

    const { data } = $props();

    const deliveryColumnHelper = createColumnHelper<
        DataTable.Features,
        DeliveryLine
    >();

    const deliveryColumns = deliveryColumnHelper.columns([
        deliveryColumnHelper.accessor("beerId", {
            header: ({ column }) =>
                renderComponent(DataTable.SortButton, {
                    text: "Bière",
                    onclick: column.getToggleSortingHandler(),
                }),
            cell: ({ row }) =>
                renderComponent(Combobox<number>, {
                    options: data.options,
                    value: row.original.beerId ?? undefined,
                    onchange: (o) => {
                        const old = row.original.beerId;
                        row.original.beerId = o.value;
                        editDeliveryLine({
                            id: row.original.id,
                            beerId: o.value,
                        }).catch(() => {
                            row.original.beerId = old;
                            errorCtx.message =
                                "Erreur lors de la modification de la bière";
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
                    children: menu,
                    index: row.index,
                }),
        }),
    ]);

    const barrelColumnHelper = createColumnHelper<DataTable.Features, Barrel>();

    const barrelColumns = barrelColumnHelper.columns([
        barrelColumnHelper.accessor("name", {
            meta: { label: "Nom" },
            header: ({ column }) =>
                renderComponent(DataTable.SortButton, {
                    text: "Nom",
                    onclick: column.getToggleSortingHandler(),
                }),
            cell: ({ row }) =>
                renderComponent(EditableCell<Barrel, "name">, {
                    row: row.original,
                    column: "name",
                    save: editBarrel,
                }),
        }),
        barrelColumnHelper.accessor("alcohol", {
            meta: { label: "Alcool" },
            header: ({ column }) =>
                renderComponent(DataTable.SortButton, {
                    text: "Alcool (°)",
                    onclick: column.getToggleSortingHandler(),
                }),
            cell: ({ row }) =>
                renderComponent(EditableCell<Barrel, "alcohol">, {
                    row: row.original,
                    column: "alcohol",
                    step: 0.1,
                    save: editBarrel,
                }),
        }),
        barrelColumnHelper.accessor("buyingPrice", {
            meta: { label: "Prix d'achat" },
            header: ({ column }) =>
                renderComponent(DataTable.SortButton, {
                    text: "Prix d'achat (€)",
                    onclick: column.getToggleSortingHandler(),
                }),
            cell: ({ row }) =>
                renderComponent(EditableCell<Barrel, "buyingPrice">, {
                    row: row.original,
                    column: "buyingPrice",
                    save: editBarrel,
                }),
        }),
        barrelColumnHelper.accessor("status", {
            meta: { label: "Statut" },
            header: ({ column }) =>
                renderComponent(DataTable.SortButton, {
                    text: "Statut",
                    onclick: column.getToggleSortingHandler(),
                }),
            cell: ({ row }) =>
                renderComponent(BarrelStatusSelect, { row: row.original }),
        }),
        barrelColumnHelper.display({
            id: "actions",
            header: "Actions",
            cell: ({ row }) =>
                renderComponent(SimpleDropdown, {
                    children: barrelMenu,
                    index: row.index,
                }),
        }),
    ]);

    const returnedColumnHelper = createColumnHelper<
        DataTable.Features,
        ReturnedBarrel
    >();

    const returnedColumns = returnedColumnHelper.columns([
        returnedColumnHelper.accessor("name", {
            header: "Fût",
        }),
        returnedColumnHelper.accessor("opened", {
            header: "Ouvert le",
            cell: ({ row }) => formatDate(row.original.opened),
        }),
        returnedColumnHelper.display({
            id: "actions",
            header: "Actions",
            cell: ({ row }) =>
                renderComponent(SimpleDropdown, {
                    children: returnedMenu,
                    index: row.index,
                }),
        }),
    ]);

    let processing = $state(false);
    let barrelsProcessing = $state(false);

    let selectedItem: number | undefined = $state();
    let selectedBarrel: number | undefined = $state();
    let lines = $state(data.delivery.lines);
    let barrels = $state(data.delivery.barrels);
    let returned = $state(data.delivery.returnedBarrels);
    let returnable = $state(data.returnable);
    let date = $state(data.delivery.date);

    const beerById = $derived(new Map(data.options.map((o) => [o.value, o])));

    // Quantities delivered per beer type
    const perBeer = $derived.by(() => {
        const counts = new Map<string, number>();
        for (const l of lines) {
            const name =
                (l.beerId && beerById.get(l.beerId)?.name) || "Non renseignée";
            counts.set(name, (counts.get(name) ?? 0) + l.count);
        }
        return [...counts.entries()].sort((a, b) => b[1] - a[1]);
    });

    const theoreticalCost = $derived(
        lines.reduce(
            (a, l) =>
                a +
                l.count * ((l.beerId && beerById.get(l.beerId)?.buyingPrice) || 0),
            0,
        ) + barrels.reduce((a, b) => a + b.buyingPrice, 0),
    );

    function giveBack(barrelId: number) {
        const b = returnable.find((r) => r.value === barrelId);
        if (!b) return;
        returnable = returnable.filter((r) => r.value !== barrelId);
        returned = [...returned, { id: b.value, name: b.name, opened: b.opened }];
        editBarrel({ id: barrelId, returnDeliveryId: data.delivery.id }).catch(
            () => {
                errorCtx.message = "Erreur lors du retour du fût";
            },
        );
    }

    function cancelGiveBack(index: number) {
        const b = returned[index];
        returned = returned.toSpliced(index, 1);
        returnable = [
            ...returnable,
            { value: b.id, name: b.name, opened: b.opened },
        ];
        editBarrel({ id: b.id, returnDeliveryId: null }).catch(() => {
            errorCtx.message = "Erreur lors de l'annulation du retour du fût";
        });
    }
</script>

{#snippet menu(index: number)}
    <ContextMenu.Group>
        <a href="/beer/{lines[index]?.beerId}" class="contents"
            ><ContextMenu.Item class="cursor-pointer">
                <ExternalLink />Détails</ContextMenu.Item
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

{#snippet barrelMenu(index: number)}
    <ContextMenu.Group>
        <a href="/barrel" class="contents"
            ><ContextMenu.Item class="cursor-pointer">
                <ExternalLink />Tous les fûts</ContextMenu.Item
            ></a
        >
        <ContextMenu.Separator />
        <ContextMenu.Item
            variant="destructive"
            class="cursor-pointer"
            onclick={() => (selectedBarrel = index)}
            ><Trash /> Supprimer</ContextMenu.Item
        >
    </ContextMenu.Group>
{/snippet}

{#snippet returnedMenu(index: number)}
    <ContextMenu.Group>
        <ContextMenu.Item
            class="cursor-pointer"
            onclick={() => cancelGiveBack(index)}
            ><Undo /> Annuler le retour</ContextMenu.Item
        >
    </ContextMenu.Group>
{/snippet}

<svelte:head>
    <title>Livraisons - {formatDate(date)}</title>
</svelte:head>

<CustomBreadcrumb
    path={[
        {
            name: "Livraisons",
            path: "/delivery",
        },
        [
            {
                name: formatDate(date),
                path: "/delivery/" + data.delivery.id,
            },
            ...data.deliveries.map((d) => ({
                name: formatDate(d.date),
                path: "/delivery/" + d.id,
            })),
        ],
    ]}
/>

<h1 class="text-4xl font-bold text-center mb-4">
    Livraison du {formatDate(date)}
</h1>

<div
    class="flex flex-row flex-wrap gap-8 text-muted-foreground font-bold items-center justify-center"
>
    <span class="flex flex-row gap-2 items-center">
        <Calendar />
        <DatePicker
            value={parseDate(date)}
            onchange={(d) => {
                const old = date;
                date = d;
                editDelivery({ id: data.delivery.id, date: d }).catch(() => {
                    date = old;
                    errorCtx.message = "Erreur lors du changement de date";
                });
            }}
        />
    </span>
    <h3 class="flex flex-row gap-1" title="Bières + fûts, au prix d'achat">
        <Receipt />
        Coût théorique : {formatPrice(theoreticalCost)}
    </h3>
</div>

<h2 class="font-bold m-2 mt-8">Bières livrées :</h2>
<BarChart
    categories={perBeer.map(([name]) => name)}
    series={[
        {
            name: "Bières livrées",
            color: "var(--chart-3)",
            values: perBeer.map(([, count]) => count),
        },
    ]}
    empty="Aucune bière dans cette livraison"
/>

<DataTable.Table
    data={lines}
    columns={deliveryColumns}
    {processing}
    onAddingRowClick={async () => {
        processing = true;
        let row = await addDeliveryLine({
            deliveryId: data.delivery.id,
        });
        lines = [...lines, row];
        processing = false;
    }}
    {menu}
/>

<h2 class="font-bold m-2 mt-8">Fûts livrés :</h2>
<DataTable.Table
    data={barrels}
    columns={barrelColumns}
    processing={barrelsProcessing}
    enableColumnSelection
    onAddingRowClick={async () => {
        barrelsProcessing = true;
        const row = await addBarrel({ deliveryId: data.delivery.id });
        barrels = [...barrels, row];
        barrelsProcessing = false;
    }}
    menu={barrelMenu}
/>

<h2 class="font-bold m-2 mt-8">Fûts vides rendus :</h2>
<div class="flex flex-row gap-2 items-center">
    {#if returnable.length > 0}
        {#key returned.length}
            <Combobox
                options={returnable}
                placeholder="Rendre un fût vidé..."
                onchange={(o) => giveBack(o.value)}
            />
        {/key}
    {:else}
        <p class="text-muted-foreground italic text-sm">
            Aucun fût vidé en attente de retour
        </p>
    {/if}
</div>
<DataTable.Table data={returned} columns={returnedColumns} menu={returnedMenu} />

<DeleteDialogMulti
    name={(row: number) => `[ligne livraison] ${lines[row]?.id}`}
    callback={(row: number) => {
        const tmp = lines[row];
        lines = lines.toSpliced(row, 1);
        deleteDeliveryLine(tmp.id).catch((e) => {
            errorCtx.message = `Erreur lors de la suppression de <pre>[ligne livraison] ${tmp.id}</pre>`;
        });
    }}
    bind:selectedItem
/>

<DeleteDialogMulti
    name={(row: number) => `[fût] ${barrels[row]?.name}`}
    callback={(row: number) => {
        const tmp = barrels[row];
        barrels = barrels.toSpliced(row, 1);
        deleteBarrel(tmp.id).catch((e) => {
            errorCtx.message = `Erreur lors de la suppression de <pre>[fût] ${tmp.name}</pre>`;
        });
    }}
    bind:selectedItem={selectedBarrel}
/>
