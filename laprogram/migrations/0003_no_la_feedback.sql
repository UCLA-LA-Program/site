-- Migration number: 0003 	 2026-04-09T01:30:33.187Z
INSERT INTO user (id, name, email, emailVerified, createdAt, updatedAt, role)
VALUES ('no_user_id', 'No LA', 'pdt.laprogram+dummy@gmail.com', 1, datetime('now'), datetime('now'), 'user');