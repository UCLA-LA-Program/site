import { getCloudflareContext } from "@opennextjs/cloudflare";


export interface AirtableRecord {
  id: string;
  fields: {
    Name: string;
    Email: string | string[];
    Course: string[];
    Position: string[];
    "Assigned Sections (click or mouseover to see all info)": string | string[];
  };
}

export async function fetchCourseMap(): Promise<Map<string, { course: string; lcc: string }>> {
  const { env } = await getCloudflareContext({ async: true });

  const params = new URLSearchParams();
  params.append("fields[]", "Course on AirTable");
  params.append("fields[]", "LCC");

  const response = await fetch(
    `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/List of Courses?${params}`,
    { headers: { Authorization: `Bearer ${env.AIRTABLE_API_KEY}` } }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch course map: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as {
    records: { id: string; fields: Record<string, string> }[];
  };

  return new Map(
    data.records.map((r) => [
      r.id,
      {
        course: r.fields["Course on AirTable"],
        lcc: r.fields["LCC"],
      },
    ])
  );
}

export async function fetchPositionCoursePairs(
  name: string,
  courses: string[],
  positions: string[],
  assignedSection: string
): Promise<[string, string][]> {
  const courseMap = await fetchCourseMap();
  const nonLCCPositions = positions.filter((p) => p !== "LCC");
  const positionCoursePairs: [string, string][] = [];
  const assignedCourse = assignedSection ? assignedSection.split(":")[0] : "";

  for (const courseId of courses) {
    const courseData = courseMap.get(courseId);
    if (!courseData) {
      throw new Error(`Course ID ${courseId} not found in course map`);
    }

    const courseName = courseData.course;
    const courseLCC = Array.isArray(courseData.lcc) ? courseData.lcc[0] : courseData.lcc;

    if (name === courseLCC) {
      positionCoursePairs.push([courseName, "LCC"]);
    }

    if (courseName === assignedCourse) {
      for (const position of nonLCCPositions) {
        positionCoursePairs.push([courseName, position]);
      }
    }
  }

  return positionCoursePairs;
}
