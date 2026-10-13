<script lang="ts">
    import Calendar from "@lucide/svelte/icons/calendar";
    import * as DataTable from "#lib/components/ui/data-table/data-table.js";
    import {
        createColumnHelper,
        renderComponent,
        renderSnippet,
    } from "@tanstack/svelte-table";

    import { type ErrorContext } from "#lib/client.svelte.js";
    import { getContext } from "svelte";
    let errorCtx = getContext<ErrorContext>("error-context");

    type DeliveryLine = (typeof data.delivery.lines)[number];

    import { updateDeliveryRow } from "#lib/components/ui/utils.svelte";
    import {
        addDeliveryLine,
        deleteDeliveryLine,
        editDeliveryLine,
    } from "../../remote/delivery.remote.js";
    import CustomBreadcrumb from "#lib/components/ui/custom-breadcrumb.svelte";
    import Combobox from "#lib/components/ui/combobox.svelte";
    import { DateFormatter } from "@internationalized/date";
    import DeleteDialogMulti from "#lib/components/ui/delete-dialog-multi.svelte";
    import SimpleDropdown from "#lib/components/ui/simple-dropdown.svelte";
    import * as ContextMenu from "#lib/components/ui/context-menu/index.js";
    import ExternalLink from "@lucide/svelte/icons/external-link";
    import Trash from "@lucide/svelte/icons/trash";

    const { data } = $props();

    const deliveryColumnHelper = createColumnHelper<
        DataTable.Features,
        DeliveryLine
    >();

    const deliveryColumns = deliveryColumnHelper.columns([
        deliveryColumnHelper.accessor("id", {
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
                        editDeliveryLine({
                            id: row.original.id,
                            beerId: o.value,
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
            cell: ({ row }) => renderSnippet(updateDeliveryRow, row.original),
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

    let processing = $state(false);

    const df = new DateFormatter("fr-FR", {
        dateStyle: "medium",
    });
    let selectedItem: number | undefined = $state();
    let lines = $state(data.delivery.lines);
</script>

{#snippet menu(index: number)}
    <ContextMenu.Group>
        <a href="/beer/{lines[index].beerId}" class="contents"
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

<svelte:head>
    <title>Livraisons - {data.delivery.date}</title>
</svelte:head>

<CustomBreadcrumb
    path={[
        {
            name: "Livraisons",
            path: "/delivery",
        },
        [
            {
                name: df.format(new Date(data.delivery.date)),
                path: "/delivery/" + data.delivery.id,
            },
            ...data.deliveries.map((d) => ({
                name: df.format(new Date(d.date)),
                path: "/delivery/" + d.id,
            })),
        ],
    ]}
/>

<h1 class="text-4xl font-bold text-center mb-4">
    Livraison du {data.delivery.date}
</h1>

<div
    class="flex flex-row gap-8 text-muted-foreground font-bold items-center justify-center"
>
    <h3 class="flex flex-row gap-1">
        <Calendar />{df.format(new Date(data.delivery.date))}
    </h3>
</div>

<div
    class="flex flex-row gap-8 text-muted-foreground font-bold items-center justify-center"
></div>

<h2 class="font-bold m-2">Bières :</h2>
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

<DeleteDialogMulti
    name={(row: number) => `[ligne livraison] ${lines[row].id}`}
    callback={(row: number) => {
        const tmp = lines[row];
        lines = lines.toSpliced(row, 1);
        deleteDeliveryLine(tmp.id).catch((e) => {
            errorCtx.message = `Erreur lors de la suppression de <pre>[ligne livraison] ${lines[row].id}</pre>`;
        });
    }}
    bind:selectedItem
/>
