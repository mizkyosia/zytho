<script lang="ts" generics="TData extends RowData">
    import {
        type ColumnDef,
        type RowData,
        type SvelteTable,
        createTable,
        FlexRender,
    } from "@tanstack/svelte-table";
    import * as Table from "#lib/components/ui/table/index.js";
    import { features, type DataTableFeatures } from "./data-table-features.js";
    import { Button } from "../button/index.js";
    import { Spinner } from "../spinner/index.js";
    import Plus from "@lucide/svelte/icons/plus";
    import type { Features } from "./data-table.js";
    import { Input } from "../input/index.js";
    import * as DropdownMenu from "../dropdown-menu/index.js";

    type DataTableProps<TData extends RowData> = {
        columns: ColumnDef<DataTableFeatures, TData>[];
        data: TData[];
        onAddingRowClick?: (table: SvelteTable<Features, TData>) => void;
        processing?: boolean;
        filterColumn?: string & keyof TData;
        enableColumnSelection?: boolean;
    };

    let {
        data,
        columns,
        onAddingRowClick,
        processing = false,
        enableColumnSelection = false,
        filterColumn,
    }: DataTableProps<TData> = $props();

    const table = createTable({
        features,
        get data() {
            return data;
        },
        columns,
    });
</script>

<div>
    <div class="flex items-center py-4">
        {#if filterColumn}
            <Input
                placeholder="Chercher..."
                value={(table
                    .getColumn(filterColumn)
                    ?.getFilterValue() as string) ?? ""}
                onchange={(e) => {
                    table
                        .getColumn(filterColumn)
                        ?.setFilterValue(e.currentTarget.value);
                }}
                oninput={(e) => {
                    table
                        .getColumn(filterColumn)
                        ?.setFilterValue(e.currentTarget.value);
                }}
                class="max-w-sm"
            />
        {/if}
        <!-- {#if enableColumnSelection} -->
        <DropdownMenu.Root>
            <DropdownMenu.Trigger>
                {#snippet child({ props })}
                    <Button {...props} variant="outline" class="ms-auto"
                        >Affichage</Button
                    >
                {/snippet}
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="end">
                {#each table
                    .getAllColumns()
                    .filter((col) => col.getCanHide()) as column (column.id)}
                    <DropdownMenu.CheckboxItem
                        class="capitalize"
                        bind:checked={
                            () => column.getIsVisible(),
                            (v) => column.toggleVisibility(!!v)
                        }
                    >
                        {column.id}
                    </DropdownMenu.CheckboxItem>
                {/each}
            </DropdownMenu.Content>
        </DropdownMenu.Root>
        <!-- {/if} -->
    </div>

    <div class="rounded-md border">
        <Table.Root>
            <Table.Header>
                {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
                    <Table.Row>
                        {#each headerGroup.headers as header (header.id)}
                            <Table.Head colspan={header.colSpan}>
                                {#if !header.isPlaceholder}
                                    <FlexRender {header} />
                                {/if}
                            </Table.Head>
                        {/each}
                    </Table.Row>
                {/each}
            </Table.Header>
            <Table.Body>
                {#if table.getRowCount() > 0}
                    {#each table.getRowModel().rows as row (row.id)}
                        <Table.Row
                            data-state={row.getIsSelected() && "selected"}
                        >
                            {#each row.getVisibleCells() as cell (cell.id)}
                                <Table.Cell>
                                    <FlexRender {cell} />
                                </Table.Cell>
                            {/each}
                        </Table.Row>
                    {/each}
                    {#if onAddingRowClick}
                        <Table.Row>
                            <Table.Cell class="p-1" colspan={columns.length}>
                                <Button
                                    variant="ghost"
                                    class="w-full text-xl"
                                    disabled={processing}
                                    onclick={() => onAddingRowClick(table)}
                                >
                                    {#if processing}
                                        <Spinner />
                                    {:else}
                                        +
                                    {/if}
                                </Button>
                            </Table.Cell>
                        </Table.Row>
                    {/if}
                {:else}
                    <Table.Row>
                        <Table.Cell
                            colspan={columns.length}
                            class="h-24 text-center flex-col hover:bg-background"
                        >
                            Aucun résultat.
                            <br />
                            {#if onAddingRowClick}
                                <Button
                                    variant="ghost"
                                    disabled={processing}
                                    onclick={() => onAddingRowClick(table)}
                                    class="cursor-pointer p-2"
                                >
                                    {#if processing}
                                        <Spinner />
                                    {:else}
                                        <Plus class="w-50" />
                                    {/if}
                                </Button>
                            {/if}
                        </Table.Cell>
                    </Table.Row>
                {/if}
            </Table.Body>
            <!-- <Table.Footer>
            {#each table.getFooterGroups() as footerGroup (footerGroup.id)}
                <Table.Row>
                    {#each footerGroup.headers as header (header.id)}
                        <Table.Head colspan={header.colSpan}>
                            {#if !header.isPlaceholder}
                                <FlexRender {header} />
                            {/if}
                        </Table.Head>
                    {/each}
                </Table.Row>
            {/each}
        </Table.Footer> -->
        </Table.Root>
    </div>
</div>
