-- Seed script: 9 test users across 3 courses
-- Run with: npx wrangler d1 execute auth_db --local --file scripts/testing.sql

-- Users
INSERT INTO user (id, name, email, emailVerified, createdAt, updatedAt) VALUES
  ('user_1', 'Alice Kim',    'pdt.laprogram+1@gmail.com', 0, datetime('now'), datetime('now')),
  ('user_2', 'Bob Chen',     'pdt.laprogram+2@gmail.com', 1, datetime('now'), datetime('now')),
  ('user_3', 'Carol Davis',  'pdt.laprogram+3@gmail.com', 1, datetime('now'), datetime('now')),
  ('user_4', 'Dan Nguyen',   'pdt.laprogram+4@gmail.com', 1, datetime('now'), datetime('now')),
  ('user_5', 'Eve Park',     'pdt.laprogram+5@gmail.com', 1, datetime('now'), datetime('now')),
  ('user_6', 'Frank Lee',    'pdt.laprogram+6@gmail.com', 1, datetime('now'), datetime('now')),
  ('user_7', 'Grace Wang',   'pdt.laprogram+7@gmail.com', 1, datetime('now'), datetime('now')),
  ('user_8', 'Henry Zhao',   'pdt.laprogram+8@gmail.com', 1, datetime('now'), datetime('now')),
  ('user_9', 'Iris Patel',   'pdt.laprogram+9@gmail.com', 1, datetime('now'), datetime('now'));

-- Course assignments: 3 users per course
INSERT INTO course (userId, course_name, position) VALUES
  ('user_1', 'CS 31',      'new'),
  ('user_2', 'CS 31',      'returner'),
  ('user_3', 'CS 31',      'returner'),
  ('user_9', 'CS 31',      'lcc'),
  ('user_4', 'MATH 61',    'new'),
  ('user_5', 'MATH 61',    'returner_lcc'),
  ('user_6', 'MATH 61',    'ped'),
  ('user_7', 'PHYSICS 1A', 'new'),
  ('user_8', 'PHYSICS 1A', 'returner'),
  ('user_9', 'PHYSICS 1A', 'ped_lcc');

-- Sections
INSERT INTO section (id, course_name, section_name, day, time, location, ta_name, ta_email) VALUES
  ('CS31-1A', 'CS 31',      '1A', 'Monday', '9:00-9:50',   'Boelter 5249',  'John Smith',    'jsmith@ucla.edu'),
  ('CS31-1B', 'CS 31',      '1B', 'Tuesday', '10:00-10:50', 'Boelter 5249',  'John Smith',    'jsmith@ucla.edu'),
  ('CS31-1C', 'CS 31',      '1C', 'Wednesday', '11:00-11:50', 'Boelter 5249',  'John Smith',    'jsmith@ucla.edu'),
  ('CS31-1D', 'CS 31',      '1D', 'Thursday', '12:00-12:50', 'Boelter 5249',  'Sarah Jones',   'sjones@ucla.edu'),
  ('MATH61-1A', 'MATH 61',  '1A', 'Monday', '14:00-14:50', 'MS 5127',       'Mike Brown',    'mbrown@ucla.edu'),
  ('MATH61-1B', 'MATH 61',  '1B', 'Wednesday', '14:00-14:50', 'MS 5127',       'Mike Brown',    'mbrown@ucla.edu'),
  ('MATH61-1C', 'MATH 61',  '1C', 'Friday', '10:00-10:50', 'MS 5127',       'Lisa White',    'lwhite@ucla.edu'),
  ('PHYS1A-1A', 'PHYSICS 1A','1A', 'Tuesday', '8:00-8:50',   'Knudsen 1220B', 'Tom Green',     'tgreen@ucla.edu'),
  ('PHYS1A-1B', 'PHYSICS 1A','1B', 'Thursday', '8:00-8:50',   'Knudsen 1220B', 'Tom Green',     'tgreen@ucla.edu'),
  ('PHYS1A-1C', 'PHYSICS 1A','1C', 'Friday', '13:00-13:50', 'Knudsen 1220B', 'Amy Taylor',    'ataylor@ucla.edu');

-- Section assignments (which LA works which section)
INSERT INTO section_assignment (la_id, full_section_name) VALUES
  ('user_1', 'CS31-1A'),
  ('user_1', 'CS31-1B'),
  ('user_2', 'CS31-1C'),
  ('user_3', 'CS31-1D'),
  ('user_9', 'CS31-1A'),
  ('user_4', 'MATH61-1A'),
  ('user_5', 'MATH61-1B'),
  ('user_6', 'MATH61-1C'),
  ('user_7', 'PHYS1A-1A'),
  ('user_8', 'PHYS1A-1B'),
  ('user_9', 'PHYS1A-1C');

