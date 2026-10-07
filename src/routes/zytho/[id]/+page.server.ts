import { db } from "#lib/server/db/index.js";
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

  return { zytho };
};
