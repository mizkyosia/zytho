<script lang="ts">
    import type { Snippet } from "svelte";
    import { buttonVariants } from "./button";
    import * as DropdownMenu from "./dropdown-menu";
    import Ellipsis from "@lucide/svelte/icons/ellipsis";

    interface Props {
        children: Snippet<[number]>;
        index: number;
    }

    const { children, index }: Props = $props();
</script>

<DropdownMenu.Root>
    <DropdownMenu.Trigger class={buttonVariants({ variant: "ghost" })}
        ><Ellipsis /></DropdownMenu.Trigger
    >
    <DropdownMenu.Content class="w-40" align="start">
        {@render children(index)}
    </DropdownMenu.Content>
</DropdownMenu.Root>
