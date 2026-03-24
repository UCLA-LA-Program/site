-- Seed script: 9 test users across 3 courses
-- Run with: npx wrangler d1 execute auth_db --local --file scripts/testing.sql

-- Users
INSERT INTO user (id, name, email, emailVerified, createdAt, updatedAt) VALUES
  ('user_1', 'Alice Kim',    'pdt.laprogram+1@gmail.com', 1, datetime('now'), datetime('now')),
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
