import { notFound } from "next/navigation";

function getMapping(slug: string): string | null {
  // replace with Dyanmo lookup
  switch (slug) {
    case "syllabus":
      return "https://docs.google.com/document/d/1ynJSRhLkGigDWusufc7HGjG-T-gWBAreWKcoyhlA9Sc/edit?usp=sharing";
    case "google":
      return "https://www.google.com";
    default:
      return null;
  }
}

export async function GET(_: Request, { params }: RouteContext<"/[slug]">) {
  const { slug } = await params;
  const mapping = getMapping(slug);

  if (!mapping) {
    notFound();
  }

  return new Response(null, {
    status: 302,
    headers: {
      Location: mapping,
    },
  });
}
