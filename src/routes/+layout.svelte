<script lang="ts">
    import "./layout.css";
    import AlertIcon from "@lucide/svelte/icons/circle-alert";
    import * as Card from "#lib/components/ui/card/index.js";
    import { Button, buttonVariants } from "#lib/components/ui/button/index.js";
    import {
        FieldGroup,
        Field,
        FieldLabel,
    } from "#lib/components/ui/field/index.js";
    import * as Alert from "#lib/components/ui/alert/index.js";
    import { Input } from "#lib/components/ui/input/index.js";
    import { login } from "./remote/login.remote";

    import * as Dialog from "#lib/components/ui/dialog/index.js";
    import { setContext } from "svelte";
    import { page } from "$app/state";
    import Header from "#lib/components/header.svelte";
    import { type ErrorContext } from "#lib/client.svelte.js";

    const errorCtx = $state<ErrorContext>({
        set message(value: string | undefined) {
            this._innerMsg = value;
            this._show = !!value;
        },
        get message() {
            return this._innerMsg;
        },
        _innerMsg: undefined,
        _show: false,
    });

    setContext<ErrorContext>("error-context", errorCtx);

    let { children, data } = $props();
</script>

{#if data.authorized}
    <Header />
    <main class="mx-auto w-full max-w-6xl p-4 pb-16 md:px-8">
        <!-- Pages copy their data into local state : remount them on navigation -->
        {#key page.url.pathname}
            {@render children()}
        {/key}
    </main>
{:else}
    <div class="w-full min-h-screen flex flex-col justify-center p-4">
        <Card.Root class="mx-auto w-full max-w-sm">
            <Card.Header>
                <Card.Title class="text-2xl">Authentification</Card.Title>
                <Card.Description
                    >Enter your email below to login to your account</Card.Description
                >
            </Card.Header>
            <Card.Content>
                <form {...login}>
                    <FieldGroup>
                        <Field>
                            <div class="flex items-center">
                                <FieldLabel for={"adminToken"}
                                    >Mdp admin :
                                </FieldLabel>
                            </div>
                            <Input
                                id="adminToken"
                                {...login.fields.token.as("password")}
                            />
                        </Field>
                        {#each login.fields.allIssues() as issue}
                            <Alert.Root variant="destructive" class="max-w-md">
                                <AlertIcon />
                                <Alert.Title>Erreur</Alert.Title>
                                <Alert.Description>
                                    {issue.message}
                                </Alert.Description>
                            </Alert.Root>
                        {/each}
                        <Field>
                            <Button type="submit" class="w-full">Login</Button>
                        </Field>
                    </FieldGroup>
                </form>
            </Card.Content>
        </Card.Root>
    </div>
{/if}

<Dialog.Root bind:open={errorCtx._show}>
    <Dialog.Content class="w-xs">
        <Dialog.Header class="text-destructive text-shadow-destructive">
            <Dialog.Title>Erreur</Dialog.Title>
            <Dialog.Description>{@html errorCtx._innerMsg}</Dialog.Description>
        </Dialog.Header>
        <Dialog.Close
            class={[buttonVariants({ variant: "default" }), "w-12 ml-auto"]}
            >OK</Dialog.Close
        >
    </Dialog.Content>
</Dialog.Root>
