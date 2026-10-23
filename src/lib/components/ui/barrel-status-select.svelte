<script lang="ts">
    import { editBarrel } from "../../../routes/remote/barrel.remote.js";
    import { barrelStatusLabels, type BarrelStatus } from "#lib/stats.js";
    import { type ErrorContext, setField } from "#lib/client.svelte.js";
    import { getContext } from "svelte";

    interface Props {
        row: { id: number; status: BarrelStatus; opened: string | null };
    }

    const { row }: Props = $props();

    const errorCtx = getContext<ErrorContext>("error-context");
</script>

<select
    class="border-input bg-background h-8 rounded-lg border px-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    value={row.status}
    onchange={(e) => {
        const old = row.status;
        const status = e.currentTarget.value as BarrelStatus;
        setField(row, "status", status);
        editBarrel({ id: row.id, status })
            .then((updated) => {
                // The server sets the opening date when it was missing
                if (updated) setField(row, "opened", updated.opened);
            })
            .catch(() => {
                setField(row, "status", old);
                errorCtx.message = "Erreur lors du changement de statut";
            });
    }}
>
    {#each Object.entries(barrelStatusLabels) as [value, label] (value)}
        <option {value}>{label}</option>
    {/each}
</select>
