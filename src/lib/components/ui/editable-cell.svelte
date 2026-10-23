<script
    lang="ts"
    generics="T extends { id: number }, K extends keyof T & string"
>
    import { Input } from "#lib/components/ui/input/index.js";
    import { type ErrorContext, setField } from "#lib/client.svelte.js";
    import { getContext } from "svelte";

    interface Props {
        row: T;
        column: K;
        /** Saves the new value, the cell is rolled back if it rejects */
        save(patch: { id: number } & Partial<T>): Promise<unknown>;
        type?: "text" | "number";
        step?: number;
        class?: string;
        placeholder?: string;
    }

    const {
        row,
        column,
        save,
        type = typeof row[column] === "number" ? "number" : "text",
        step = 0.01,
        class: cssClass = type === "number" ? "w-24" : "",
        placeholder,
    }: Props = $props();

    const errorCtx = getContext<ErrorContext>("error-context");
</script>

<Input
    {type}
    {step}
    {placeholder}
    value={row[column] as string | number}
    class={cssClass}
    onchange={(e) => {
        const oldValue = row[column];
        const value = (
            type === "number"
                ? e.currentTarget.valueAsNumber
                : e.currentTarget.value
        ) as T[K];
        if (type === "number" && Number.isNaN(value)) {
            e.currentTarget.value = String(oldValue);
            return;
        }
        setField(row, column, value);
        save({ id: row.id, [column]: value } as { id: number } & Partial<T>).catch(
            () => {
                // Rollback
                setField(row, column, oldValue);
                errorCtx.message = `Erreur lors de la modification de <pre>${column}</pre>`;
            },
        );
    }}
/>
