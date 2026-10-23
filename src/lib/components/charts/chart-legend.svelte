<script lang="ts">
    import type { Series } from "./chart-utils.js";

    const { series }: { series: Pick<Series, "name" | "color">[] } = $props();
</script>

<div class="flex flex-row flex-wrap gap-4 justify-center text-sm text-muted-foreground">
    {#each series as s (s.name)}
        <span class="flex flex-row items-center gap-1.5">
            <span class="size-3 rounded-sm" style:background={s.color}></span>
            {s.name}
        </span>
    {/each}
</div>
