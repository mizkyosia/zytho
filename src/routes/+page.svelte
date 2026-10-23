<script lang="ts">
    import * as Card from "#lib/components/ui/card/index.js";
    import BarChart from "#lib/components/charts/bar-chart.svelte";
    import { formatDate, zythoName } from "#lib/format.js";
    import { BARREL_LIFETIME_DAYS } from "#lib/stats.js";

    const { data } = $props();

    const stocks = $derived(
        data.dashboard?.stocks.toSorted((a, b) => b.stock - a.stock) ?? [],
    );
    const sales = $derived(
        data.dashboard?.sales.zythos.toSorted((a, b) =>
            a.date.localeCompare(b.date),
        ) ?? [],
    );
</script>

<svelte:head>
    <title>Zytho</title>
</svelte:head>

<h1 class="text-4xl font-bold text-center mb-6">Tableau de bord</h1>

{#if data.dashboard}
    {@const { delivery, barrels, year } = data.dashboard}
    <div class="grid gap-4 md:grid-cols-2">
        <Card.Root class="md:row-span-2">
            <Card.Header>
                <Card.Title>Stocks</Card.Title>
                <Card.Description>
                    Bières livrées - bières vendues
                </Card.Description>
            </Card.Header>
            <Card.Content>
                <ul class="flex flex-col divide-y">
                    {#each stocks as beer (beer.id)}
                        <li>
                            <a
                                href="/beer/{beer.id}"
                                class="flex flex-row justify-between py-1.5 px-1 hover:bg-accent rounded-md"
                            >
                                <span>{beer.name || "Sans nom"}</span>
                                <span
                                    class={[
                                        "font-bold tabular-nums",
                                        beer.stock <= 0 && "text-destructive",
                                    ]}>{beer.stock}</span
                                >
                            </a>
                        </li>
                    {:else}
                        <li class="text-muted-foreground italic">
                            Aucune bière
                        </li>
                    {/each}
                </ul>
            </Card.Content>
        </Card.Root>

        <Card.Root>
            <Card.Header>
                <Card.Title>Dernière livraison</Card.Title>
                {#if delivery}
                    <Card.Description>
                        <a href="/delivery/{delivery.id}" class="underline">
                            {formatDate(delivery.date)}
                        </a>
                    </Card.Description>
                {/if}
            </Card.Header>
            <Card.Content>
                {#if !delivery}
                    <p class="text-muted-foreground italic">
                        Aucune livraison
                    </p>
                {:else if delivery.lines.length === 0}
                    <p class="text-muted-foreground italic">
                        Aucune bière dans cette livraison
                    </p>
                {:else}
                    <ul class="flex flex-col gap-1">
                        {#each delivery.lines as line, i (i)}
                            <li class="flex flex-row justify-between">
                                <span>{line.beer?.name || "Non renseignée"}</span>
                                <span class="font-bold tabular-nums"
                                    >{line.count}</span
                                >
                            </li>
                        {/each}
                    </ul>
                {/if}
            </Card.Content>
        </Card.Root>

        <Card.Root>
            <Card.Header>
                <Card.Title>Fûts ouverts</Card.Title>
                <Card.Description>
                    À finir dans les {BARREL_LIFETIME_DAYS} jours après ouverture
                </Card.Description>
            </Card.Header>
            <Card.Content>
                {#if barrels.length === 0}
                    <p class="text-muted-foreground italic">
                        Aucun fût ouvert
                    </p>
                {:else}
                    <ul class="flex flex-col gap-1">
                        {#each barrels as barrel (barrel.id)}
                            <li class="flex flex-row justify-between">
                                <a href="/barrel" class="hover:underline"
                                    >{barrel.name || "Sans nom"}</a
                                >
                                <span
                                    class={[
                                        "tabular-nums",
                                        barrel.daysLeft <= 7 &&
                                            "text-destructive font-bold",
                                    ]}
                                >
                                    {formatDate(barrel.expiry)}
                                    ({barrel.daysLeft < 0
                                        ? `périmé depuis ${-barrel.daysLeft} j`
                                        : `${barrel.daysLeft} j`})
                                </span>
                            </li>
                        {/each}
                    </ul>
                {/if}
            </Card.Content>
        </Card.Root>

        <Card.Root class="md:col-span-2">
            <Card.Header>
                <Card.Title>Ventes {year}</Card.Title>
                <Card.Description>
                    {data.dashboard.sales.total} bières vendues sur {sales.length}
                    zytho{sales.length > 1 ? "s" : ""}
                </Card.Description>
            </Card.Header>
            <Card.Content>
                <BarChart
                    categories={sales.map((z) => zythoName(z))}
                    series={[
                        {
                            name: "Bières vendues",
                            color: "var(--chart-3)",
                            values: sales.map((z) => z.sold),
                        },
                    ]}
                    empty="Aucun zytho cette année"
                />
            </Card.Content>
        </Card.Root>
    </div>
{/if}
