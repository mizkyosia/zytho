<script lang="ts">
    import * as DataTable from "#lib/components/ui/data-table/data-table.js";
    import { parseDate } from "@internationalized/date";
    import {
        createColumnHelper,
        renderComponent,
        renderSnippet,
    } from "@tanstack/svelte-table";
    import {
        addDelivery,
        deleteDelivery,
        editDelivery,
    } from "../remote/delivery.remote.js";
    import { Input } from "#lib/components/ui/input/index.js";
    import DatePicker from "#lib/components/ui/date-picker.svelte";
    import CustomBreadcrumb from "#lib/components/ui/custom-breadcrumb.svelte";
    import * as ContextMenu from "#lib/components/ui/context-menu/index.js";
    import ExternalLink from "@lucide/svelte/icons/external-link";
    import Trash from "@lucide/svelte/icons/trash";
    import DeleteDialogMulti from "#lib/components/ui/delete-dialog-multi.svelte";
    import SimpleDropdown from "#lib/components/ui/simple-dropdown.svelte";

    import { type ErrorContext } from "#lib/client.svelte.js";
    import { getContext } from "svelte";
    let errorCtx = getContext<ErrorContext>("error-context");

    const { data } = $props();

    type Delivery = (typeof data.deliveries)[number];

    const columnHelper = createColumnHelper<DataTable.Features, Delivery>();

    const columns = columnHelper.columns([
        columnHelper.accessor("date", {
            header: ({ column }) =>
                renderComponent(DataTable.SortButton, {
                    text: "Date",
                    onclick: column.getToggleSortingHandler(),
                }),
            cell: ({ row }) => renderSnippet(updateDeliveryDate, row.original),
        }),
        columnHelper.accessor("price", {
            header: ({ column }) =>
                renderComponent(DataTable.SortButton, {
                    text: "Coût",
                    onclick: column.getToggleSortingHandler(),
                }),
            cell: ({ row }) => renderSnippet(updateDeliveryPrice, row.original),
        }),
        columnHelper.accessor("beerCount", {
            header: ({ column }) =>
                renderComponent(DataTable.SortButton, {
                    text: "Bières",
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
    let deliveries = $state(data.deliveries);
    let selectedItem: number | undefined = $state();
</script>

{#snippet menu(index: number)}
    <ContextMenu.Group>
        <a href="/delivery/{deliveries[index]?.id}" class="contents"
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

{#snippet updateDeliveryPrice(row: Delivery)}
    <Input
        type="number"
        value={row.price}
        class="w-20"
        onchange={(e) => {
            let oldValue = row.price;
            row.price = e.currentTarget.valueAsNumber;
            editDelivery({
                id: row.id,
                price: row.price,
            }).catch((e) => {
                // Rollback
                row.price = oldValue;
            });
        }}
    />
{/snippet}

{#snippet updateDeliveryDate(row: Delivery)}
    <DatePicker
        value={parseDate(row.date)}
        icon={true}
        onchange={(d) => {
            let oldValue = row.date;
            row.date = d;
            editDelivery({
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
    <title>Livraisons</title>
</svelte:head>

<CustomBreadcrumb
    path={[
        {
            name: "Livraisons",
            path: "/delivery",
        },
    ]}
/>

<h1 class="text-4xl font-bold text-center mb-4">Livraisons</h1>

<DataTable.Table
    data={deliveries}
    {columns}
    {processing}
    enableColumnSelection
    onAddingRowClick={async (t) => {
        processing = true;
        let row = await addDelivery({});
        deliveries = [...deliveries, { ...row, beerCount: 0 }];
        processing = false;
    }}
    {menu}
/>

<DeleteDialogMulti
    name={(row: number) => `[zytho] ${deliveries[row]?.date}`}
    callback={(row: number) => {
        const tmp = deliveries[row];
        deliveries = deliveries.toSpliced(row, 1);
        deleteDelivery(tmp.id).catch((e) => {
            errorCtx.message = `Erreur lors de la suppression de <pre>[biere] ${deliveries[row].name}</pre>`;
        });
    }}
    bind:selectedItem
/>
