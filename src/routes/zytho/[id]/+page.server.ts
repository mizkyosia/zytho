import { db } from "#lib/server/db/index.js";
import { beer } from "#lib/server/db/schema.js";
import { error } from "@sveltejs/kit";

export const load = async ({ params }) => {
  const id = parseInt(params.id);
  if (isNaN(id)) {
    return error(400, "ID inexistante");
  }

  const zytho = await db.query.zytho.findFirst({
    where: {
      id: id,
    },
    with: {
      lines: true,
    },
  });

  if (!zytho) return error(400, "ID inexistante");

  const options = (
    await db.select({ value: beer.id, name: beer.name }).from(beer)
  ).map((o) => ({ value: o.value, name: o.name || "Sans nom" }));

  return { zytho, options };
};
