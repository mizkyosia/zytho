<script lang="ts">
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import { buttonVariants } from "$lib/components/ui/button/index.js";
    import type { Snippet } from "svelte";
    import Trash from "@lucide/svelte/icons/trash";

    interface Props {
        name: string;
        callback: () => void;
    }

    const { name, callback }: Props = $props();
</script>

<Dialog.Root>
    <Dialog.Trigger
        class={[buttonVariants({ variant: "destructive" }), "cursor-pointer"]}
    >
        <Trash />
    </Dialog.Trigger>
    <Dialog.Content class="sm:max-w-md">
        <Dialog.Header>
            <Dialog.Title>T'es sûr ?</Dialog.Title>
            <Dialog.Description
                >Suppression de <span
                    class="font-mono bg-accent border-border border p-1 rounded-md"
                    >{name}</span
                >. Cette action est irréversible</Dialog.Description
            >
        </Dialog.Header>
        <Dialog.Close
            type="submit"
            onkeydown={(e) => {
                if (e.key === "Enter") callback();
            }}
            class={[
                buttonVariants({ variant: "destructive" }),
                "md:max-w-48 m-auto",
            ]}
            onclick={callback}>Oui, supprimer</Dialog.Close
        >
    </Dialog.Content>
</Dialog.Root>
