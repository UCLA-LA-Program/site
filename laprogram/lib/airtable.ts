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

export async function fetchCourseMap(): Promise<
  Map<string, { course: string; lcc: string }>
> {
  const params = new URLSearchParams();
  params.append("fields[]", "Course on AirTable");
  params.append("fields[]", "LCC");

  const response = await fetch(
    `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/List of Courses?${params}`,
    { headers: { Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}` } },
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch course map: ${response.status} ${response.statusText}`,
    );
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
    ]),
  );
}

function airtablePositionToAppPosition(position: string): string {
  switch (position) {
    case "New":
      return "new";
    case "Returner":
      return "ret";
    case "PED":
      return "ped";
    case "LCC":
      return "lcc";
  }

  throw new Error(`Unexpected Airtable position name: ${position}`);
}

export async function fetchPositionCoursePairs(
  name: string,
  courses: string[],
  positions: string[],
  assignedSection: string,
  courseMap: Map<string, { course: string; lcc: string }>,
): Promise<[string, string][]> {
  // map to local strings (i.e. "new" instead of "New" and "ret" instead of "Returner")
  positions = positions.map(airtablePositionToAppPosition);

  // for this LA, figure out what non-lcc positions they hold
  const nonLCCPositions = positions.filter((p) => p !== "lcc");

  // no one can have more than two positions
  if (nonLCCPositions.length > 1) {
    throw new Error(`LA with more than one non-LCC position detected: ${name}`);
  }

  // grab their assigned sections (if it exists) and use it as a proxy for what course they're a new/ret/ped for
  // (in contrast to lcc only)
  const assignedCourse = assignedSection ? assignedSection.split(":")[0] : "";

  // return one pair per course
  const positionCoursePairs: [string, string][] = [];

  for (const courseId of courses) {
    const courseData = courseMap.get(courseId);
    if (!courseData) {
      throw new Error(`Course ID ${courseId} not found in course map`);
    }

    const positionList = [];

    // if there are no assigned sections, just assume every course includes the non-lcc role if it exists
    // else, assign the non-lcc role to only the course that has an assigned section
    if (!assignedCourse || courseData.course === assignedCourse) {
      for (const position of nonLCCPositions) {
        positionList.push(position);
      }
    }

    // is the current LA an lcc check
    if (
      name ===
      (Array.isArray(courseData.lcc) ? courseData.lcc[0] : courseData.lcc)
    ) {
      positionList.push("lcc");
    }

    if (positionList.length === 0) {
      throw new Error(
        `Could not generate position course pair for ${name} in ${courseData.course}; ensure LA record is consistent in Airtable`,
      );
    }
    positionCoursePairs.push([courseData.course, positionList.join("_")]);
  }

  return positionCoursePairs;
}
