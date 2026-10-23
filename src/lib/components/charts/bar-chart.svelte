<script lang="ts">
    import ChartLegend from "./chart-legend.svelte";
    import { niceTicks, type Series } from "./chart-utils.js";

    interface Props {
        categories: string[];
        series: Series[];
        /** Stack the series on top of each other instead of side by side */
        stacked?: boolean;
        height?: number;
        empty?: string;
    }

    const {
        categories,
        series,
        stacked = false,
        height = 260,
        empty = "Pas de données",
    }: Props = $props();

    const margin = { top: 12, right: 12, bottom: 48, left: 40 };

    let width = $state(600);

    const max = $derived(
        Math.max(
            0,
            ...categories.map((_, i) =>
                stacked
                    ? series.reduce((a, s) => a + (s.values[i] ?? 0), 0)
                    : Math.max(0, ...series.map((s) => s.values[i] ?? 0)),
            ),
        ),
    );
    const ticks = $derived(niceTicks(max));
    const top = $derived(ticks[ticks.length - 1]);

    const innerW = $derived(Math.max(0, width - margin.left - margin.right));
    const innerH = $derived(height - margin.top - margin.bottom);
    const band = $derived(categories.length ? innerW / categories.length : 0);
    const barW = $derived(
        Math.min(56, band * 0.7) / (stacked ? 1 : Math.max(1, series.length)),
    );

    const y = (v: number) => innerH - (v / top) * innerH;

    const bars = $derived(
        categories.flatMap((category, i) => {
            let offset = 0;
            const groupW = barW * (stacked ? 1 : series.length);
            const start = i * band + (band - groupW) / 2;
            return series.map((s, j) => {
                const value = s.values[i] ?? 0;
                const base = stacked ? offset : 0;
                if (stacked) offset += value;
                return {
                    key: `${i}-${j}`,
                    x: start + (stacked ? 0 : j * barW),
                    y: y(base + value),
                    h: y(base) - y(base + value),
                    color: s.color,
                    title: `${category} — ${s.name} : ${value}`,
                };
            });
        }),
    );
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
                {#each bars as bar (bar.key)}
                    <rect
                        x={bar.x}
                        y={bar.y}
                        width={barW}
                        height={Math.max(0, bar.h)}
                        fill={bar.color}
                        rx="2"
                        class="transition-all hover:opacity-80"
                    >
                        <title>{bar.title}</title>
                    </rect>
                {/each}
                {#each categories as category, i (i)}
                    <text
                        x={i * band + band / 2}
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
