import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export type RosterUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  courses: { course_name: string; position: string }[];
};

type RosterRow = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  course_name: string | null;
  position: string | null;
};

export async function GET() {
  const auth = await getAuth();
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    return new Response("Unauthorized", { status: 403 });
  }

  const { env } = await getCloudflareContext({ async: true });

  const result = await env.data
    ?.prepare(
      `SELECT user.id, user.name, user.email, user.image,
              course.course_name, course.position
       FROM user
       LEFT JOIN course ON course.userId = user.id
       ORDER BY user.name COLLATE NOCASE`,
    )
    .run<RosterRow>();

  if (!result) {
    return new Response("Database error", { status: 500 });
  }

  // Group courses by user
  const usersMap = new Map<string, RosterUser>();
  for (const row of result.results) {
    let user = usersMap.get(row.id);
    if (!user) {
      user = {
        id: row.id,
        name: row.name,
        email: row.email,
        image: row.image,
        courses: [],
      };
      usersMap.set(row.id, user);
    }
    if (row.course_name && row.position) {
      user.courses.push({
        course_name: row.course_name,
        position: row.position,
      });
    }
  }

  return Response.json([...usersMap.values()]);
}
