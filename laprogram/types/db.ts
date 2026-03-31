export type Id = {
  id: string;
};

export type LA = {
  name: string;
  course: string; 
  position: string;
  image: string;
};

export type Position = {
  course_name: string;
  position: string;
};

export type Availability = {
  id: string;
  la_name: string;
  la_email: string;
  course_name: string;
  section_name: string;
  location: string;
  week: string;
  day: string;
  time: string;
};
