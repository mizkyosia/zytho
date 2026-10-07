<script lang="ts">
    import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
    import DotIcon from "@lucide/svelte/icons/dot";
    import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
    import House from "@lucide/svelte/icons/house";

    interface PathDetails {
        path: string;
        name: string;
    }
    type Path = PathDetails[] | PathDetails;

    const { path }: { path?: Path[] } = $props();
</script>

<Breadcrumb.Root class="absolute top-8 left-8">
    <Breadcrumb.List>
        <Breadcrumb.Item>
            <Breadcrumb.Link href="/"><House class="w-4" /></Breadcrumb.Link>
        </Breadcrumb.Item>
        {#each path as part, i}
            <Breadcrumb.Separator />
            <Breadcrumb.Item>
                {#if "path" in part}
                    {#if i === path!.length - 1}
                        <Breadcrumb.Page>{part.name}</Breadcrumb.Page>
                    {:else}
                        <Breadcrumb.Link href={part.path}
                            >{part.name}</Breadcrumb.Link
                        >
                    {/if}
                {:else}
                    {@const currentPage = i === path!.length - 1}
                    {#if !currentPage}
                        <Breadcrumb.Link href={part[0].path}
                            >{part[0].name}</Breadcrumb.Link
                        >
                    {/if}
                    <DropdownMenu.Root>
                        <DropdownMenu.Trigger class="flex items-center gap-1">
                            {#if currentPage}
                                <Breadcrumb.Page>{part[0].name}</Breadcrumb.Page
                                >
                            {/if}
                            <ChevronDownIcon
                                data-icon="inline-end"
                                class="size-3.5"
                            />
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Content align="start">
                            <DropdownMenu.Group>
                                {#each part.slice(1) as subpart}
                                    <DropdownMenu.Item
                                        ><a href={subpart.path}
                                            >{subpart.name}</a
                                        ></DropdownMenu.Item
                                    >
                                {/each}
                            </DropdownMenu.Group>
                        </DropdownMenu.Content>
                    </DropdownMenu.Root>
                {/if}
            </Breadcrumb.Item>
        {/each}
    </Breadcrumb.List>
</Breadcrumb.Root>
