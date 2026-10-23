<script lang="ts">
    import * as DataTable from "#lib/components/ui/data-table/data-table.js";
    import EditableCell from "#lib/components/ui/editable-cell.svelte";
    import DatePicker from "#lib/components/ui/date-picker.svelte";
    import { Input } from "#lib/components/ui/input/index.js";
    import BarChart from "#lib/components/charts/bar-chart.svelte";
    import { parseDate } from "@internationalized/date";
    import { formatDate, zythoName } from "#lib/format.js";
    import { sold } from "#lib/stats.js";
    import {
        createColumnHelper,
        renderComponent,
    } from "@tanstack/svelte-table";
    import {
        addZythoLine,
        deleteZythoLine,
        editZytho,
        editZythoLine,
    } from "../../remote/zytho.remote.js";
    import Combobox from "#lib/components/ui/combobox.svelte";
    import CustomBreadcrumb from "#lib/components/ui/custom-breadcrumb.svelte";

    import { type ErrorContext } from "#lib/client.svelte.js";
    import { getContext } from "svelte";
    import DeleteDialogMulti from "#lib/components/ui/delete-dialog-multi.svelte";
    import SimpleDropdown from "#lib/components/ui/simple-dropdown.svelte";
    import * as ContextMenu from "#lib/components/ui/context-menu/index.js";
    import Trash from "@lucide/svelte/icons/trash";
    import ExternalLink from "@lucide/svelte/icons/external-link";
    let errorCtx = getContext<ErrorContext>("error-context");

    const { data } = $props();

    type ZythoLine = (typeof data.zytho.lines)[number];

    const columnHelper = createColumnHelper<DataTable.Features, ZythoLine>();

    const beforeColumns = columnHelper.columns([
        columnHelper.accessor("beerId", {
            header: ({ column }) =>
                renderComponent(DataTable.SortButton, {
                    text: "Bière",
                    onclick: column.getToggleSortingHandler(),
                }),
            cell: ({ row }) =>
                renderComponent(Combobox<number>, {
                    options: data.options,
                    placeholder: "Bière...",
                    value: row.original.beerId ?? undefined,
                    onchange: (o) => {
                        const old = row.original.beerId;
                        row.original.beerId = o.value;
                        editZythoLine({
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
        columnHelper.accessor("countBefore", {
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
        columnHelper.accessor("countAfter", {
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
        columnHelper.accessor((row) => sold(row), {
            id: "sold",
            header: ({ column }) =>
                renderComponent(DataTable.SortButton, {
                    text: "Bières vendues",
                    onclick: column.getToggleSortingHandler(),
                }),
            cell: ({ row }) => sold(row.original),
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
    let zythoLines = $state(data.zytho.lines);
    let selectedItem: number | undefined = $state();
    let name = $state(data.zytho.name);
    let date = $state(data.zytho.date);

    const beerById = $derived(new Map(data.options.map((o) => [o.value, o])));
    const perBeer = $derived(
        zythoLines.map((l) => ({
            name:
                (l.beerId && beerById.get(l.beerId)?.name) || "Non renseignée",
            sold: sold(l),
            unsold: l.countAfter,
        })),
    );
    const totals = $derived(
        zythoLines.reduce(
            (a, l) => ({
                before: a.before + l.countBefore,
                after: a.after + l.countAfter,
            }),
            { before: 0, after: 0 },
        ),
    );
    const title = $derived(zythoName({ name, date }));
</script>

{#snippet menu(index: number)}
    <ContextMenu.Group>
        <a href="/beer/{zythoLines[index]?.beerId}" class="contents"
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
    <title>Zythos - {title}</title>
</svelte:head>

<CustomBreadcrumb
    path={[
        {
            name: "Zythos",
            path: "/zytho",
        },
        [
            {
                name: title,
                path: "/zytho/" + data.zytho.id,
            },
            ...data.zythos.map((z) => ({
                name: zythoName(z),
                path: "/zytho/" + z.id,
            })),
        ],
    ]}
/>

<h1 class="text-4xl font-bold text-center mb-4">{title}</h1>

<div class="flex flex-row flex-wrap gap-4 items-center justify-center">
    <Input
        class="w-60"
        value={name ?? ""}
        placeholder={"Zytho du " + formatDate(date)}
        onchange={(e) => {
            const old = name;
            name = e.currentTarget.value || null;
            editZytho({ id: data.zytho.id, name: e.currentTarget.value }).catch(
                () => {
                    name = old;
                    errorCtx.message = "Erreur lors du changement de nom";
                },
            );
        }}
    />
    <DatePicker
        value={parseDate(date)}
        icon={true}
        onchange={(d) => {
            const old = date;
            date = d;
            editZytho({ id: data.zytho.id, date: d }).catch(() => {
                date = old;
                errorCtx.message = "Erreur lors du changement de date";
            });
        }}
    />
</div>

<div
    class="flex flex-row flex-wrap gap-8 text-muted-foreground font-bold items-center justify-center mt-4"
>
    <h3>{totals.before} sorties</h3>
    <h3>{totals.after} rentrées</h3>
    <h3>{totals.before - totals.after} vendues</h3>
</div>

<h2 class="font-bold m-2 mt-8">Ventes par bière :</h2>
<BarChart
    stacked
    categories={perBeer.map((b) => b.name)}
    series={[
        {
            name: "Bières vendues",
            color: "var(--chart-3)",
            values: perBeer.map((b) => b.sold),
        },
        {
            name: "Bières non vendues",
            color: "var(--chart-1)",
            values: perBeer.map((b) => b.unsold),
        },
    ]}
    empty="Aucune bière sortie pour ce zytho"
/>

<h2 class="font-bold m-2 mt-8">Bières :</h2>
<DataTable.Table
    data={zythoLines}
    columns={beforeColumns}
    {processing}
    onAddingRowClick={async () => {
        processing = true;
        let row = await addZythoLine({
            zythoId: data.zytho.id,
        });
        zythoLines = [...zythoLines, row];

        processing = false;
    }}
    {menu}
/>

<DeleteDialogMulti
    name={(row: number) => `[ligne zytho] ${zythoLines[row]?.id}`}
    callback={(row: number) => {
        const tmp = zythoLines[row];
        zythoLines = zythoLines.toSpliced(row, 1);
        deleteZythoLine(tmp.id).catch((e) => {
            errorCtx.message = `Erreur lors de la suppression de <pre>[ligne zytho] ${tmp.id}</pre>`;
        });
    }}
    bind:selectedItem
/>
