<script lang="ts">
    import { page } from "$app/state";
    import { cn } from "#lib/utils.js";
    import { buttonVariants } from "#lib/components/ui/button/index.js";
    import Beer from "@lucide/svelte/icons/beer";
    import Cylinder from "@lucide/svelte/icons/cylinder";
    import PartyPopper from "@lucide/svelte/icons/party-popper";
    import Truck from "@lucide/svelte/icons/truck";

    const links = [
        { href: "/zytho", name: "Zythos", icon: PartyPopper },
        { href: "/beer", name: "Bières", icon: Beer },
        { href: "/barrel", name: "Fûts", icon: Cylinder },
        { href: "/delivery", name: "Livraisons", icon: Truck },
    ];

    const isActive = (href: string) =>
        page.url.pathname === href || page.url.pathname.startsWith(href + "/");
</script>

<header
    class="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur"
>
    <div
        class="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4 md:px-8"
    >
        <a href="/" class="mr-auto text-lg font-bold tracking-tight">Zytho</a>
        <nav class="flex flex-row gap-1">
            {#each links as link (link.href)}
                <a
                    href={link.href}
                    aria-current={isActive(link.href) ? "page" : undefined}
                    title={link.name}
                    class={cn(
                        buttonVariants({ variant: "ghost" }),
                        "text-muted-foreground",
                        isActive(link.href) && "bg-accent text-foreground",
                    )}
                >
                    <link.icon />
                    <span class="hidden sm:inline">{link.name}</span>
                </a>
            {/each}
        </nav>
    </div>
</header>
