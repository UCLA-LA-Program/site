import { getAuth } from "@/lib/auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { headers } from "next/headers";
import { v7 as uuidv7 } from "uuid";

const MAX_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request) {
  const auth = await getAuth();
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return new Response("Unauthenticated user.", { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return new Response("No file provided.", { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return new Response("File must be JPEG, PNG, or WebP.", { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return new Response("File must be under 2 MB.", { status: 400 });
  }

  try {
    const { env } = getCloudflareContext();

    const transformedImage = (
      await env.IMAGES?.input(file.stream())
        .transform({ width: 300, height: 300, fit: "cover" })
        .output({ format: "image/webp" })
    )?.response();

    if (!transformedImage) throw Error();

    const fileName = `avatars/${process.env.NODE_ENV === "development" && "development/"}${session.user.id}/${uuidv7()}.webp`;
    await env.storage?.put(fileName, await transformedImage.blob(), {
      httpMetadata: { contentType: "image/webp" },
    });

    return Response.json({
      url: process.env.NEXT_PUBLIC_BUCKET_URL + fileName,
    });
  } catch (e) {
    return new Response("Upload failed.", { status: 500 });
  }
}
