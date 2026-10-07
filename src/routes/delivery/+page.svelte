<script lang="ts">
    import * as DataTable from "#lib/components/ui/data-table/data-table.js";
    import { parseDate } from "@internationalized/date";
    import {
        createColumnHelper,
        renderComponent,
        renderSnippet,
    } from "@tanstack/svelte-table";
    import { addDelivery, editDelivery } from "../remote/delivery.remote.js";
    import { Input } from "#lib/components/ui/input/index.js";
    import DatePicker from "#lib/components/ui/date-picker.svelte";
    import LinkWrapper from "#lib/components/ui/link-wrapper.svelte";
    import CustomBreadcrumb from "#lib/components/ui/custom-breadcrumb.svelte";
    import DeleteDialog from "#lib/components/ui/delete-dialog.svelte";

    const { data } = $props();

    type Delivery = (typeof data.deliveries)[number];

    const columnHelper = createColumnHelper<DataTable.Features, Delivery>();

    const columns = columnHelper.columns([
        columnHelper.display({
            id: "link",
            cell: ({ row }) =>
                renderComponent(LinkWrapper, {
                    href: "/delivery/" + row.original.id,
                }),
        }),
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
            cell: ({ row }) =>
                renderComponent(DeleteDialog, {
                    name: `[livraison] ${row.original.date}`,
                    callback: () => {},
                }),
        }),
    ]);

    let processing = $state(false);
    let deliveries = $state(data.deliveries);
</script>

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
    enableColumnSelection={true}
    onAddingRowClick={async (t) => {
        processing = true;
        let row = await addDelivery({});
        deliveries = [...deliveries, { ...row, beerCount: 0 }];
        processing = false;
    }}
/>
