<script lang="ts" generics="T">
    import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
    import { tick } from "svelte";
    import * as Command from "#lib/components/ui/command/index.js";
    import * as Popover from "#lib/components/ui/popover/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import Spinner from "./spinner/spinner.svelte";

    interface Option {
        name: string;
        value: T;
    }

    interface Props {
        options: Option[];
        placeholder?: string;
        value?: T;
        onchange?: (option: Option) => void;
    }

    let {
        options,
        placeholder = "Bière...",
        value,
        onchange,
    }: Props = $props();

    let open = $state(false);
    let name = $state(options.find((o) => o.value == value)?.name);
    let triggerRef = $state<HTMLButtonElement>(null!);

    // We want to refocus the trigger button when the user selects
    // an item from the list so users can continue navigating the
    // rest of the form with the keyboard.
    function closeAndFocusTrigger() {
        open = false;
        tick().then(() => {
            triggerRef.focus();
        });
    }
</script>

<Popover.Root bind:open>
    <Popover.Trigger bind:ref={triggerRef}>
        {#snippet child({ props })}
            {#if options.length === 0}
                <Spinner />
            {:else}
                <Button
                    {...props}
                    variant="outline"
                    class="w-60 justify-between font-normal"
                    role="combobox"
                    aria-expanded={open}
                >
                    {#if value}
                        {name}
                    {:else}
                        <i class="text-muted-foreground">{placeholder}</i>
                    {/if}
                    <ChevronDownIcon class="text-muted-foreground" />
                </Button>
            {/if}
        {/snippet}
    </Popover.Trigger>
    <Popover.Content class="w-60 p-0">
        <Command.Root>
            <Command.Input {placeholder} />
            <Command.List>
                <Command.Empty>No items found.</Command.Empty>
                <Command.Group>
                    {#each options as option (option)}
                        <Command.Item
                            value={option.name}
                            data-checked={value === option.value}
                            onSelect={() => {
                                value = option.value;
                                name = option.name;
                                closeAndFocusTrigger();
                                onchange?.(option);
                            }}
                        >
                            {option.name}
                        </Command.Item>
                    {/each}
                </Command.Group>
            </Command.List>
        </Command.Root>
    </Popover.Content>
</Popover.Root>
