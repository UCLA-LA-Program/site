import { getAuth } from "@/lib/auth";
import { IMAGE_SIZE } from "@/lib/constants";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { headers } from "next/headers";
import { v7 as uuidv7 } from "uuid";

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(request: Request) {
  try {
    const { env } = getCloudflareContext();

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

    if (file.type != "image/png") {
      return new Response("Uploaded file not properly transformed to .png", {
        status: 400,
      });
    }

    if (file.size > MAX_SIZE) {
      return new Response("Cropped image must be under 5MB", { status: 400 });
    }

    const transformedImage = (
      await env.IMAGES?.input(file.stream())
        .transform({ width: IMAGE_SIZE, height: IMAGE_SIZE, fit: "cover" })
        .output({ format: "image/webp" })
    )?.response();

    if (!transformedImage) throw Error();

    const fileName = `avatars/${process.env.NODE_ENV === "development" ? "development/" : ""}${session.user.id}/${uuidv7()}.webp`;
    await env.storage?.put(fileName, await transformedImage.blob(), {
      httpMetadata: { contentType: "image/webp" },
    });

    return Response.json({
      url: process.env.NEXT_PUBLIC_BUCKET_URL + "/" + fileName,
    });
  } catch {
    return new Response("Upload failed.", { status: 500 });
  }
}
