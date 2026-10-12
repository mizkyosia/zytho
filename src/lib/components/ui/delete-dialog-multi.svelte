<script lang="ts" generics="T">
    import * as Dialog from "#lib/components/ui/dialog/index.js";
    import { buttonVariants } from "#lib/components/ui/button/index.js";
    import { untrack } from "svelte";

    interface Props {
        name: (item: T) => string;
        callback: (item: T) => void;
        selectedItem: T | undefined;
    }

    let { name, callback, selectedItem = $bindable() }: Props = $props();

    let open = $state(false);

    $effect(() => {
        let tmp = selectedItem !== undefined;
        untrack(() => (open = tmp));
    });
</script>

<Dialog.Root bind:open onOpenChangeComplete={() => (selectedItem = undefined)}>
    <Dialog.Content class="sm:max-w-md">
        <Dialog.Header>
            <Dialog.Title>T'es sûr ?</Dialog.Title>
            <Dialog.Description
                >Suppression de <span
                    class="font-mono bg-accent border-border border p-1 rounded-md"
                    >{selectedItem !== undefined
                        ? name(selectedItem)
                        : ""}</span
                >. Cette action est irréversible</Dialog.Description
            >
        </Dialog.Header>
        <Dialog.Close
            type="submit"
            onkeydown={(e) => {
                if (e.key === "Enter") {
                    if (selectedItem !== undefined) callback(selectedItem);
                }
            }}
            class={[
                buttonVariants({ variant: "destructive" }),
                "md:max-w-48 m-auto",
            ]}
            onclick={() => {
                if (selectedItem !== undefined) callback(selectedItem!);
            }}>Oui, supprimer</Dialog.Close
        >
    </Dialog.Content>
</Dialog.Root>
