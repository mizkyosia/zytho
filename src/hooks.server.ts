import { redirect, type Handle } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";

export const handle: Handle = async ({ event, resolve }) => {
  const token = event.cookies.get("adminToken");
  event.locals.authorized = false;
  if (token !== env.ADMIN_TOKEN && event.route.id != "/") {
    return redirect(307, "/");
  } else if (token === env.ADMIN_TOKEN) {
    event.locals.authorized = true;
  }

  const res = resolve(event);
  return res;
};
