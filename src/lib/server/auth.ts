import { getRequestEvent } from "$app/server";
import { error } from "@sveltejs/kit";

/** Throws a 401 if the current request isn't authenticated */
export function requireAuth() {
  const { locals } = getRequestEvent();
  if (!locals.authorized)
    error(401, { message: "Veuillez vous authentifier" });
}
