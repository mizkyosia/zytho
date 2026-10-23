<script lang="ts">
    import ChartLegend from "./chart-legend.svelte";
    import { niceTicks, type Series } from "./chart-utils.js";

    interface Props {
        categories: string[];
        series: Series[];
        height?: number;
        empty?: string;
    }

    const {
        categories,
        series,
        height = 260,
        empty = "Pas de données",
    }: Props = $props();

    const margin = { top: 12, right: 24, bottom: 48, left: 40 };

    let width = $state(600);

    const max = $derived(Math.max(0, ...series.flatMap((s) => s.values)));
    const ticks = $derived(niceTicks(max));
    const top = $derived(ticks[ticks.length - 1]);

    const innerW = $derived(Math.max(0, width - margin.left - margin.right));
    const innerH = $derived(height - margin.top - margin.bottom);

    const x = (i: number) =>
        categories.length > 1
            ? (i / (categories.length - 1)) * innerW
            : innerW / 2;
    const y = (v: number) => innerH - (v / top) * innerH;
</script>

<div class="w-full flex flex-col gap-2" bind:clientWidth={width}>
    {#if categories.length === 0}
        <p class="text-center text-muted-foreground italic py-8">{empty}</p>
    {:else}
        <svg {width} {height} role="img" class="overflow-visible">
            <g transform="translate({margin.left},{margin.top})">
                {#each ticks as t (t)}
                    <line
                        x1="0"
                        x2={innerW}
                        y1={y(t)}
                        y2={y(t)}
                        class="stroke-border"
                    />
                    <text
                        x="-8"
                        y={y(t)}
                        dy="0.32em"
                        text-anchor="end"
                        class="fill-muted-foreground text-xs">{t}</text
                    >
                {/each}
                {#each series as s (s.name)}
                    <polyline
                        fill="none"
                        stroke={s.color}
                        stroke-width="2"
                        points={s.values.map((v, i) => `${x(i)},${y(v)}`).join(" ")}
                    />
                    {#each s.values as v, i (i)}
                        <circle cx={x(i)} cy={y(v)} r="4" fill={s.color}>
                            <title>{categories[i]} — {s.name} : {v}</title>
                        </circle>
                    {/each}
                {/each}
                {#each categories as category, i (i)}
                    <text
                        x={x(i)}
                        y={innerH + 16}
                        text-anchor="middle"
                        class="fill-muted-foreground text-xs"
                        >{category.length > 18
                            ? category.slice(0, 17) + "…"
                            : category}<title>{category}</title></text
                    >
                {/each}
            </g>
        </svg>
        {#if series.length > 1}
            <ChartLegend {series} />
        {/if}
    {/if}
</div>
