import { redirect } from "@sveltejs/kit";
import { ADMIN_TOKEN } from "$app/env/private";
import type { Handle } from "@sveltejs/kit/hooks";

export const handle: Handle = async ({ event, resolve }) => {
  const token = event.cookies.get("adminToken");
  event.locals.authorized = false;
  if (token !== ADMIN_TOKEN) {
    event.cookies.delete("adminToken", { path: "/" });
    if (event.route.id != "/") {
      return redirect(307, "/");
    }
  } else if (token === ADMIN_TOKEN) {
    event.locals.authorized = true;
  }

  const res = resolve(event);
  return res;
};
