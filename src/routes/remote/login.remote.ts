import { getRequestEvent, form } from "$app/server";
import * as v from "valibot";
import { env } from '$env/dynamic/private';
import { invalid } from "@sveltejs/kit";

export const login = form(
  v.object({ token: v.string() }),
  ({ token }, issue) => {
    const event = getRequestEvent();

    if (env.ADMIN_TOKEN !== token) return invalid(issue.token("Mdp invalide"));

    event.cookies.set("adminToken", env.ADMIN_TOKEN, {
      path: "/",
    });
  },
);
