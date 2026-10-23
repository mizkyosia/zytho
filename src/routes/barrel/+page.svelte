<script lang="ts">
    import * as DataTable from "#lib/components/ui/data-table/data-table.js";
    import {
        createColumnHelper,
        renderComponent,
        renderSnippet,
    } from "@tanstack/svelte-table";
    import { parseDate } from "@internationalized/date";
    import {
        addBarrel,
        deleteBarrel,
        editBarrel,
    } from "../remote/barrel.remote.js";
    import CustomBreadcrumb from "#lib/components/ui/custom-breadcrumb.svelte";
    import * as ContextMenu from "#lib/components/ui/context-menu/index.js";
    import Trash from "@lucide/svelte/icons/trash";
    import ExternalLink from "@lucide/svelte/icons/external-link";
    import SimpleDropdown from "#lib/components/ui/simple-dropdown.svelte";
    import DeleteDialogMulti from "#lib/components/ui/delete-dialog-multi.svelte";
    import EditableCell from "#lib/components/ui/editable-cell.svelte";
    import BarrelStatusSelect from "#lib/components/ui/barrel-status-select.svelte";
    import DatePicker from "#lib/components/ui/date-picker.svelte";
    import Combobox from "#lib/components/ui/combobox.svelte";
    import { formatDate } from "#lib/format.js";
    import {
        barrelExpiry,
        barrelStatusLabels,
        daysBetween,
        today,
    } from "#lib/stats.js";

    import { type ErrorContext } from "#lib/client.svelte.js";
    import { getContext } from "svelte";
    let errorCtx = getContext<ErrorContext>("error-context");

    const { data } = $props();

    type Barrel = (typeof data.barrels)[number];

    const columnHelper = createColumnHelper<DataTable.Features, Barrel>();

    const columns = columnHelper.columns([
        columnHelper.accessor("name", {
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
        columnHelper.accessor("alcohol", {
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
        columnHelper.accessor("buyingPrice", {
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
        columnHelper.accessor("status", {
            meta: { label: "Statut" },
            header: ({ column }) =>
                renderComponent(DataTable.SortButton, {
                    text: "Statut",
                    onclick: column.getToggleSortingHandler(),
                }),
            cell: ({ row }) =>
                renderComponent(BarrelStatusSelect, { row: row.original }),
        }),
        columnHelper.accessor("opened", {
            meta: { label: "Ouverture" },
            header: ({ column }) =>
                renderComponent(DataTable.SortButton, {
                    text: "Ouverture",
                    onclick: column.getToggleSortingHandler(),
                }),
            cell: ({ row }) => renderSnippet(openedDate, row.original),
        }),
        columnHelper.accessor((row) => barrelExpiry(row.opened), {
            id: "expiry",
            meta: { label: "Péremption" },
            header: ({ column }) =>
                renderComponent(DataTable.SortButton, {
                    text: "Péremption",
                    onclick: column.getToggleSortingHandler(),
                }),
            cell: ({ row }) => renderSnippet(expiry, row.original),
        }),
        columnHelper.accessor("deliveryId", {
            meta: { label: "Livraison" },
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
                        editBarrel({
                            id: row.original.id,
                            deliveryId: o.value,
                        }).catch(() => {
                            row.original.deliveryId = old;
                            errorCtx.message =
                                "Erreur lors du changement de livraison";
                        });
                    },
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
    let barrels = $state(data.barrels);
    let selectedItem: number | undefined = $state();

    const counts = $derived(
        Object.fromEntries(
            Object.keys(barrelStatusLabels).map((s) => [
                s,
                barrels.filter((b) => b.status === s).length,
            ]),
        ),
    );
</script>

{#snippet openedDate(row: Barrel)}
    <DatePicker
        value={row.opened ? parseDate(row.opened) : undefined}
        onchange={(d) => {
            const old = row.opened;
            row.opened = d;
            editBarrel({ id: row.id, opened: d }).catch(() => {
                row.opened = old;
                errorCtx.message = "Erreur lors du changement de date";
            });
        }}
    />
{/snippet}

{#snippet expiry(row: Barrel)}
    {@const date = barrelExpiry(row.opened)}
    {#if !date || row.status === "closed"}
        <span class="text-muted-foreground">—</span>
    {:else if row.status === "emptied"}
        <span class="text-muted-foreground">{formatDate(date)}</span>
    {:else}
        {@const left = daysBetween(today(), date)}
        <span
            class={[
                left <= 7 && "text-destructive font-bold",
                left > 7 && "text-foreground",
            ]}
        >
            {formatDate(date)}
            ({left < 0 ? `périmé depuis ${-left} j` : `${left} j restants`})
        </span>
    {/if}
{/snippet}

{#snippet menu(index: number)}
    <ContextMenu.Group>
        {#if barrels[index]?.deliveryId}
            <a href="/delivery/{barrels[index].deliveryId}" class="contents"
                ><ContextMenu.Item class="cursor-pointer">
                    <ExternalLink /> Livraison</ContextMenu.Item
                ></a
            >
            <ContextMenu.Separator />
        {/if}
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
            name: "Fûts",
            path: "/barrel",
        },
    ]}
/>

<svelte:head>
    <title>Fûts</title>
</svelte:head>

<h1 class="text-4xl font-bold text-center mb-4">Fûts</h1>

<div
    class="flex flex-row flex-wrap gap-8 text-muted-foreground font-bold items-center justify-center"
>
    {#each Object.entries(barrelStatusLabels) as [status, label] (status)}
        <h3>{counts[status]} {label.toLowerCase()}{counts[status] > 1 ? "s" : ""}</h3>
    {/each}
</div>

<DataTable.Table
    data={barrels}
    {columns}
    {processing}
    filterColumn="name"
    enableColumnSelection
    onAddingRowClick={async () => {
        processing = true;
        const row = await addBarrel({});
        barrels = [...barrels, row];
        processing = false;
    }}
    {menu}
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
    bind:selectedItem
/>
