<script lang="ts">
    import * as DataTable from "#lib/components/ui/data-table/data-table.js";
    import LinkWrapper from "#lib/components/ui/link-wrapper.svelte";
    import { updateZythoRow } from "#lib/components/ui/utils.svelte";
    import {
        createColumnHelper,
        renderComponent,
        renderSnippet,
    } from "@tanstack/svelte-table";
    import { addZythoLine, editZythoLine } from "../../remote/zytho.remote.js";
    import { allBeers } from "../../remote/beer.remote.js";
    import Combobox from "#lib/components/ui/combobox.svelte";
    import CustomBreadcrumb from "#lib/components/ui/custom-breadcrumb.svelte";
    import DeleteDialog from "#lib/components/ui/delete-dialog.svelte";

    const { data } = $props();

    type ZythoLine = (typeof data.zytho.lines)[number];

    const columnHelper = createColumnHelper<DataTable.Features, ZythoLine>();

    const beforeColumns = columnHelper.columns([
        columnHelper.display({
            id: "link",
            cell: ({ row }) =>
                renderComponent(LinkWrapper, {
                    href: "/beer/" + row.original.id,
                    text: "",
                }),
        }),
        columnHelper.accessor("beerId", {
            header: ({ column }) =>
                renderComponent(DataTable.SortButton, {
                    text: "Bière",
                    onclick: column.getToggleSortingHandler(),
                }),
            cell: ({ row }) =>
                renderComponent(Combobox<number>, {
                    options: optionsList ?? [],
                    placeholder: "Bière...",
                    value: row.original.beerId,
                    onchange: (o) => {
                        editZythoLine({ id: row.original.id, beerId: o.value });
                    },
                }),
        }),
        columnHelper.accessor("countBefore", {
            header: ({ column }) =>
                renderComponent(DataTable.SortButton, {
                    text: "Nombre",
                    onclick: column.getToggleSortingHandler(),
                }),
            cell: ({ row }) =>
                renderSnippet(updateZythoRow<ZythoLine>, {
                    column: "countBefore",
                    row: row.original,
                }),
        }),
        columnHelper.accessor("countAfter", {
            header: ({ column }) =>
                renderComponent(DataTable.SortButton, {
                    text: "Nombre",
                    onclick: column.getToggleSortingHandler(),
                }),
            cell: ({ row }) =>
                renderSnippet(updateZythoRow<ZythoLine>, {
                    column: "countAfter",
                    row: row.original,
                }),
        }),
        columnHelper.display({
            id: "actions",
            cell: ({ row }) =>
                renderComponent(DeleteDialog, {
                    name: `[ligne zytho] ${data.zytho.date} ${optionsList.find(o => o.value === row.original.beerId)?.name ?? "Sans nomi"}`,
                    callback: () => {},
                }),
        }),
    ]);

    let processing = $state(false);
    let zythoLines = $state(data.zytho.lines);

    const beerList = allBeers();

    let optionsList = $derived(
        beerList.current
            ?.filter((a) => a.name)
            ?.map((b) => ({
                value: b.id,
                name: b.name ?? "",
            })) ?? [],
    );
</script>

<svelte:head>
    <title>Zythos - {data.zytho.name ?? "Zytho"}</title>
</svelte:head>

<CustomBreadcrumb
    path={[
        {
            name: "Zythos",
            path: "/zytho",
        },
        {
            name: data.zytho.name || "Sans nom",
            path: "/zytho/" + data.zytho.id,
        },
    ]}
/>

<h1 class="text-4xl font-bold text-center">{data.zytho.name ?? "Zytho"}</h1>

<h2 class="font-bold m-2">Bières :</h2>
<DataTable.Table
    data={zythoLines}
    columns={beforeColumns}
    {processing}
    onAddingRowClick={async () => {
        processing = true;
        let row = await addZythoLine({
            beerName: "",
            countAfter: 0,
            countBefore: 0,
            zythoId: data.zytho.id,
        });
        zythoLines = [...zythoLines, row];

        processing = false;
    }}
/>
