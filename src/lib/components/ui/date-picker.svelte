<script lang="ts" module>
    import { DateFormatter } from "@internationalized/date";

    const df = new DateFormatter("fr-FR", {
        dateStyle: "medium",
    });
</script>

<script lang="ts">
    import CalendarIcon from "@lucide/svelte/icons/calendar";
    import { type DateValue, getLocalTimeZone } from "@internationalized/date";
    import { cn } from "#lib/utils.js";
    import { Button } from "#lib/components/ui/button/index.js";
    import { Calendar } from "./calendar/index.js";
    import * as Popover from "./popover/index.js";

    interface Props {
        value: DateValue;
        onchange: (d: string) => void;
        icon?: boolean;
    }

    let { value = $bindable(), onchange, icon = false }: Props = $props();
</script>

<Popover.Root>
    <Popover.Trigger>
        {#snippet child({ props })}
            <Button
                variant="outline"
                class={cn(
                    "w-70 justify-start text-start font-normal",
                    !value && "text-muted-foreground",
                )}
                {...props}
            >
                {#if icon}
                    <CalendarIcon class="me-2 size-4" />
                {/if}
                {value
                    ? df.format(value.toDate(getLocalTimeZone()))
                    : "Select a date"}
            </Button>
        {/snippet}
    </Popover.Trigger>
    <Popover.Content class="w-auto p-0">
        <Calendar
            bind:value
            onValueChange={(v) => {
                if (v) onchange(v.toString());
            }}
            type="single"
            initialFocus
            captionLayout="dropdown"
        />
    </Popover.Content>
</Popover.Root>
