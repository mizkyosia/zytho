import { getRequestEvent, form } from "$app/server";
import * as v from "valibot";
import { ADMIN_TOKEN } from "$app/env/private";
import { invalid } from "@sveltejs/kit";

export const login = form(
  v.object({ token: v.string() }),
  ({ token }, issue) => {
    const event = getRequestEvent();

    if (ADMIN_TOKEN !== token) return invalid(issue.token("Mdp invalide"));

    event.cookies.set("adminToken", ADMIN_TOKEN, {
      path: "/",
    });
  },
);
