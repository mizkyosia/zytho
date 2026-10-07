<script lang="ts">
    import "./layout.css";
    import AlertIcon from "@lucide/svelte/icons/circle-alert";
    import favicon from "#lib/assets/favicon.svg";
    import * as Card from "#lib/components/ui/card/index.js";
    import { Button } from "#lib/components/ui/button/index.js";
    import {
        FieldGroup,
        Field,
        FieldLabel,
        FieldDescription,
    } from "#lib/components/ui/field/index.js";
    import * as Alert from "#lib/components/ui/alert/index.js";
    import { Input } from "#lib/components/ui/input/index.js";
    import { login } from "./remote/login.remote";

    let { children, data } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<div class="w-screen h-screen flex flex-col justify-center md:p-36">
    {#if data.authorized}

        {@render children()}
    {:else}
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
    {/if}
</div>
