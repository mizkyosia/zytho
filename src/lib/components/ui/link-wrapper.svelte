<script lang="ts">
    import type { HTMLAnchorAttributes } from "svelte/elements";
    import ExternalLink from "@lucide/svelte/icons/external-link";

    const {
        text,
        class: cssClass,
        ...props
    }: HTMLAnchorAttributes & { text?: string } = $props();
</script>

<a
    class="block hover:text-shadow-accent text-shadow-sm hover:bg-input transition-colors rounded-md p-1 px-2 w-fit {cssClass}"
    {...props}
>
    <span class="flex flex-row gap-1 border-b-2 border-dashed border-b-current">
        <ExternalLink class="w-4" />
        {text}
    </span>
</a>
