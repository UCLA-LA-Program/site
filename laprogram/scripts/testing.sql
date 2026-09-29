-- Seed script: 9 test users across 3 courses
-- Run with: npx wrangler d1 execute auth_db --local --file scripts/testing.sql

-- Users
INSERT INTO user (id, name, email, emailVerified, createdAt, updatedAt) VALUES
  ('user_1', 'Alice Kim',    'pdt.laprogram+1@gmail.com', 0, strftime('%Y-%m-%dT%H:%M:%fZ','now'), strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  ('user_2', 'Bob Chen',     'pdt.laprogram+2@gmail.com', 1, strftime('%Y-%m-%dT%H:%M:%fZ','now'), strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  ('user_3', 'Carol Davis',  'pdt.laprogram+3@gmail.com', 1, strftime('%Y-%m-%dT%H:%M:%fZ','now'), strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  ('user_4', 'Dan Nguyen',   'pdt.laprogram+4@gmail.com', 1, strftime('%Y-%m-%dT%H:%M:%fZ','now'), strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  ('user_5', 'Eve Park',     'pdt.laprogram+5@gmail.com', 1, strftime('%Y-%m-%dT%H:%M:%fZ','now'), strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  ('user_6', 'Frank Lee',    'pdt.laprogram+6@gmail.com', 1, strftime('%Y-%m-%dT%H:%M:%fZ','now'), strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  ('user_7', 'Grace Wang',   'pdt.laprogram+7@gmail.com', 1, strftime('%Y-%m-%dT%H:%M:%fZ','now'), strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  ('user_8', 'Henry Zhao',   'pdt.laprogram+8@gmail.com', 1, strftime('%Y-%m-%dT%H:%M:%fZ','now'), strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  ('user_9', 'Iris Patel',   'pdt.laprogram+9@gmail.com', 1, strftime('%Y-%m-%dT%H:%M:%fZ','now'), strftime('%Y-%m-%dT%H:%M:%fZ','now'));

-- Course assignments: 3 users per course
INSERT INTO course (userId, course_name, position) VALUES
  ('user_1', 'CS 31',      'new'),
  ('user_2', 'CS 31',      'ret'),
  ('user_3', 'CS 31',      'ret'),
  ('user_9', 'CS 31',      'lcc'),
  ('user_4', 'MATH 61',    'new'),
  ('user_5', 'MATH 61',    'ret_lcc'),
  ('user_6', 'MATH 61',    'ped'),
  ('user_7', 'PHYSICS 1A', 'new'),
  ('user_8', 'PHYSICS 1A', 'ret'),
  ('user_9', 'PHYSICS 1A', 'ped_lcc');

-- Sections. day_of_week is ISO (1 = Monday); times are 'HH:MM' LA wall time.
INSERT INTO section (id, raw, course_name, section_name, day_of_week, start_time, end_time, location, ta_name, ta_email) VALUES
  ('CS31-1A', 'CS31-1A', 'CS 31',      '1A', 1, '09:00', '09:50', 'Boelter 5249',  'John Smith',    'jsmith@ucla.edu'),
  ('CS31-1B', 'CS31-1B', 'CS 31',      '1B', 2, '10:00', '10:50', 'Boelter 5249',  'John Smith',    'jsmith@ucla.edu'),
  ('CS31-1C', 'CS31-1C', 'CS 31',      '1C', 3, '11:00', '11:50', 'Boelter 5249',  'John Smith',    'jsmith@ucla.edu'),
  ('CS31-1D', 'CS31-1D', 'CS 31',      '1D', 4, '12:00', '12:50', 'Boelter 5249',  'Sarah Jones',   'sjones@ucla.edu'),
  ('MATH61-1A', 'MATH61-1A', 'MATH 61',  '1A', 1, '14:00', '14:50', 'MS 5127',       'Mike Brown',    'mbrown@ucla.edu'),
  ('MATH61-1B', 'MATH61-1B', 'MATH 61',  '1B', 3, '14:00', '14:50', 'MS 5127',       'Mike Brown',    'mbrown@ucla.edu'),
  ('MATH61-1C', 'MATH61-1C', 'MATH 61',  '1C', 5, '10:00', '10:50', 'MS 5127',       'Lisa White',    'lwhite@ucla.edu'),
  ('PHYS1A-1A', 'PHYS1A-1A', 'PHYSICS 1A','1A', 2, '08:00', '08:50', 'Knudsen 1220B', 'Tom Green',     'tgreen@ucla.edu'),
  ('PHYS1A-1B', 'PHYS1A-1B', 'PHYSICS 1A','1B', 4, '08:00', '08:50', 'Knudsen 1220B', 'Tom Green',     'tgreen@ucla.edu'),
  ('PHYS1A-1C', 'PHYS1A-1C', 'PHYSICS 1A','1C', 5, '13:00', '13:50', 'Knudsen 1220B', 'Amy Taylor',    'ataylor@ucla.edu');

-- Section assignments (which LA works which section)
INSERT INTO section_assignment (la_id, section_id) VALUES
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

