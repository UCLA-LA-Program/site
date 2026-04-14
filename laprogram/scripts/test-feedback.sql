-- Play feedback data for test users. Run with:
--   npx wrangler d1 execute data --local --file scripts/test-feedback.sql
-- Then log in as play@test.com and visit /feedback/view.

-- Create test users (idempotent via INSERT OR IGNORE)
INSERT OR IGNORE INTO user
  (id, name, email, emailVerified, createdAt, updatedAt)
VALUES
  ('play_user',    'Play PedLcc', 'play@test.com',         1, datetime('now'), datetime('now')),
  ('fb_new_user',  'Play New',    'play+new@test.com',     1, datetime('now'), datetime('now')),
  ('fb_ret_user',  'Play Ret',    'play+ret@test.com',     1, datetime('now'), datetime('now')),
  ('fb_ped_user',  'Play Ped',    'play+ped@test.com',     1, datetime('now'), datetime('now')),
  ('fb_lcc_user',  'Play Lcc',    'play+lcc@test.com',     1, datetime('now'), datetime('now')),
  ('fb_rlcc_user', 'Play RetLcc', 'play+ret_lcc@test.com', 1, datetime('now'), datetime('now'));

-- Course positions
INSERT OR IGNORE INTO course (userId, course_name, position) VALUES
  ('play_user',    'TEST 99', 'ped_lcc'),
  ('fb_new_user',  'TEST 99', 'new'),
  ('fb_ret_user',  'TEST 99', 'ret'),
  ('fb_ped_user',  'TEST 99', 'ped'),
  ('fb_lcc_user',  'TEST 99', 'lcc'),
  ('fb_rlcc_user', 'TEST 99', 'ret_lcc');

DELETE FROM feedback WHERE id LIKE 'fb_%';


-- ==========================================================================
-- Play PedLcc (play_user) — ped_lcc
-- ==========================================================================

-- Mid-quarter (10 rows, varied AGREEMENT responses)
INSERT INTO feedback (id, recipientId, feedback) VALUES
('fb_mq_1','play_user','{"feedback_type":"mid_quarter","activities":["discussion"],"hours":"3","mq_approachable":"strongly_agree","mq_helpful":"strongly_agree","mq_familiar":"agree","mq_engagement":"agree","mq_questioning":"agree","mq_supportive":"strongly_agree","mq_name":"agree","mq_belonging":"strongly_agree","mq_checkin":"agree","mq_small_groups":"strongly_agree","mq_strengths":"Very patient.","mq_improve":"Keep going!"}'),
('fb_mq_2','play_user','{"feedback_type":"mid_quarter","activities":["discussion","office_hours"],"hours":"4","mq_approachable":"strongly_agree","mq_helpful":"agree","mq_familiar":"strongly_agree","mq_engagement":"agree","mq_questioning":"strongly_agree","mq_supportive":"agree","mq_name":"disagree","mq_belonging":"agree","mq_checkin":"strongly_agree","mq_small_groups":"agree","mq_strengths":"Great explanations.","mq_improve":"Learn names."}'),
('fb_mq_3','play_user','{"feedback_type":"mid_quarter","activities":["discussion"],"hours":"2","mq_approachable":"agree","mq_helpful":"agree","mq_familiar":"agree","mq_engagement":"disagree","mq_questioning":"disagree","mq_supportive":"agree","mq_name":"na","mq_belonging":"agree","mq_checkin":"agree","mq_small_groups":"strongly_agree","mq_strengths":"Friendly.","mq_improve":"More group work."}'),
('fb_mq_4','play_user','{"feedback_type":"mid_quarter","activities":["discussion"],"hours":"3","mq_approachable":"strongly_agree","mq_helpful":"strongly_agree","mq_familiar":"strongly_agree","mq_engagement":"strongly_agree","mq_questioning":"agree","mq_supportive":"strongly_agree","mq_name":"strongly_agree","mq_belonging":"strongly_agree","mq_checkin":"strongly_agree","mq_small_groups":"strongly_agree","mq_strengths":"Excellent all around.","mq_improve":"Nothing."}'),
('fb_mq_5','play_user','{"feedback_type":"mid_quarter","activities":["lecture","discussion"],"hours":"5","mq_approachable":"agree","mq_helpful":"strongly_disagree","mq_familiar":"disagree","mq_engagement":"disagree","mq_questioning":"strongly_disagree","mq_supportive":"disagree","mq_name":"disagree","mq_belonging":"disagree","mq_checkin":"disagree","mq_small_groups":"agree","mq_strengths":"Tries.","mq_improve":"Be more prepared."}'),
('fb_mq_6','play_user','{"feedback_type":"mid_quarter","activities":["discussion","study_session"],"hours":"4","mq_approachable":"strongly_agree","mq_helpful":"strongly_agree","mq_familiar":"agree","mq_engagement":"strongly_agree","mq_questioning":"strongly_agree","mq_supportive":"strongly_agree","mq_name":"agree","mq_belonging":"strongly_agree","mq_checkin":"strongly_agree","mq_small_groups":"strongly_agree","mq_strengths":"Amazing!","mq_improve":"N/A"}'),
('fb_mq_7','play_user','{"feedback_type":"mid_quarter","activities":["discussion"],"hours":"3","mq_approachable":"agree","mq_helpful":"agree","mq_familiar":"na","mq_engagement":"agree","mq_questioning":"agree","mq_supportive":"agree","mq_name":"agree","mq_belonging":"na","mq_checkin":"agree","mq_small_groups":"agree","mq_strengths":"Solid.","mq_improve":"Small things."}'),
('fb_mq_8','play_user','{"feedback_type":"mid_quarter","activities":["discussion","office_hours"],"hours":"6","mq_approachable":"strongly_agree","mq_helpful":"strongly_agree","mq_familiar":"strongly_agree","mq_engagement":"agree","mq_questioning":"agree","mq_supportive":"strongly_agree","mq_name":"strongly_agree","mq_belonging":"agree","mq_checkin":"strongly_agree","mq_small_groups":"strongly_agree","mq_strengths":"Goes above and beyond.","mq_improve":"Nothing much."}'),
('fb_mq_9','play_user','{"feedback_type":"mid_quarter","activities":["discussion"],"hours":"2","mq_approachable":"disagree","mq_helpful":"disagree","mq_familiar":"agree","mq_engagement":"disagree","mq_questioning":"disagree","mq_supportive":"disagree","mq_name":"strongly_disagree","mq_belonging":"disagree","mq_checkin":"disagree","mq_small_groups":"agree","mq_strengths":"Knows material.","mq_improve":"Engage more."}'),
('fb_mq_10','play_user','{"feedback_type":"mid_quarter","activities":["discussion"],"hours":"3","mq_approachable":"strongly_agree","mq_helpful":"agree","mq_familiar":"agree","mq_engagement":"agree","mq_questioning":"strongly_agree","mq_supportive":"strongly_agree","mq_name":"agree","mq_belonging":"strongly_agree","mq_checkin":"agree","mq_small_groups":"strongly_agree","mq_strengths":"Encouraging.","mq_improve":"More examples."}');

-- End-of-quarter (6 rows)
INSERT INTO feedback (id, recipientId, feedback) VALUES
('fb_eq_1','play_user','{"feedback_type":"end_of_quarter","activities":["discussion"],"hours":"3","eq_approachability":"big_improvement","eq_helpfulness":"big_improvement","eq_familiarity":"little_improvement","eq_engagement":"no_change","eq_questioning":"little_improvement","eq_supportiveness":"big_improvement","eq_name_use":"little_improvement","eq_belonging_stem":"big_improvement","eq_comments":"Really grew this quarter."}'),
('fb_eq_2','play_user','{"feedback_type":"end_of_quarter","activities":["discussion"],"hours":"4","eq_approachability":"no_room_for_improvement","eq_helpfulness":"no_room_for_improvement","eq_familiarity":"big_improvement","eq_engagement":"little_improvement","eq_questioning":"big_improvement","eq_supportiveness":"no_room_for_improvement","eq_name_use":"no_change","eq_belonging_stem":"big_improvement","eq_comments":"Consistent."}'),
('fb_eq_3','play_user','{"feedback_type":"end_of_quarter","activities":["discussion","office_hours"],"hours":"5","eq_approachability":"big_improvement","eq_helpfulness":"little_improvement","eq_familiarity":"no_change","eq_engagement":"no_change","eq_questioning":"no_change","eq_supportiveness":"little_improvement","eq_name_use":"na","eq_belonging_stem":"little_improvement","eq_comments":"Modest growth."}'),
('fb_eq_4','play_user','{"feedback_type":"end_of_quarter","activities":["discussion"],"hours":"3","eq_approachability":"no_room_for_improvement","eq_helpfulness":"big_improvement","eq_familiarity":"big_improvement","eq_engagement":"big_improvement","eq_questioning":"big_improvement","eq_supportiveness":"big_improvement","eq_name_use":"big_improvement","eq_belonging_stem":"no_room_for_improvement","eq_comments":"Huge improvement."}'),
('fb_eq_5','play_user','{"feedback_type":"end_of_quarter","activities":["discussion"],"hours":"2","eq_approachability":"little_improvement","eq_helpfulness":"little_improvement","eq_familiarity":"little_improvement","eq_engagement":"little_improvement","eq_questioning":"no_change","eq_supportiveness":"little_improvement","eq_name_use":"no_change","eq_belonging_stem":"little_improvement","eq_comments":"Some progress."}'),
('fb_eq_6','play_user','{"feedback_type":"end_of_quarter","activities":["discussion","study_session"],"hours":"4","eq_approachability":"big_improvement","eq_helpfulness":"big_improvement","eq_familiarity":"big_improvement","eq_engagement":"big_improvement","eq_questioning":"little_improvement","eq_supportiveness":"big_improvement","eq_name_use":"little_improvement","eq_belonging_stem":"big_improvement","eq_comments":"Great quarter."}');

-- LA Observation (5 rows)
INSERT INTO feedback (id, recipientId, feedback) VALUES
('fb_ob_1','play_user','{"feedback_type":"la_observation","obs_empathized":"always","obs_redirected":"most_instructor","obs_wait_time":"most_missed","obs_open_closed":"sometimes","obs_closed_check":"always","obs_peer_names":"sometimes","obs_growth_mindset":"most_instructor","obs_circulated":"always","obs_environment":"most_instructor","obs_familiarity":"always","obs_devoted":"always","obs_strengths":"Warm.","obs_improve":"Wait longer.","obs_comments":"Nice session."}'),
('fb_ob_2','play_user','{"feedback_type":"la_observation","obs_empathized":"most_instructor","obs_redirected":"always","obs_wait_time":"sometimes","obs_open_closed":"most_instructor","obs_closed_check":"most_instructor","obs_peer_names":"most_missed","obs_growth_mindset":"always","obs_circulated":"always","obs_environment":"always","obs_familiarity":"most_instructor","obs_devoted":"always","obs_strengths":"Great energy.","obs_improve":"Use names.","obs_comments":""}'),
('fb_ob_3','play_user','{"feedback_type":"la_observation","obs_empathized":"always","obs_redirected":"most_missed","obs_wait_time":"almost_never","obs_open_closed":"almost_never","obs_closed_check":"sometimes","obs_peer_names":"almost_never","obs_growth_mindset":"sometimes","obs_circulated":"most_instructor","obs_environment":"sometimes","obs_familiarity":"most_instructor","obs_devoted":"most_instructor","obs_strengths":"Kind.","obs_improve":"Ask more questions.","obs_comments":""}'),
('fb_ob_4','play_user','{"feedback_type":"la_observation","obs_empathized":"always","obs_redirected":"always","obs_wait_time":"most_instructor","obs_open_closed":"always","obs_closed_check":"always","obs_peer_names":"most_instructor","obs_growth_mindset":"always","obs_circulated":"always","obs_environment":"always","obs_familiarity":"always","obs_devoted":"always","obs_strengths":"Exemplary.","obs_improve":"None.","obs_comments":"Model observation."}'),
('fb_ob_5','play_user','{"feedback_type":"la_observation","obs_empathized":"most_instructor","obs_redirected":"sometimes","obs_wait_time":"sometimes","obs_open_closed":"most_missed","obs_closed_check":"sometimes","obs_peer_names":"sometimes","obs_growth_mindset":"most_instructor","obs_circulated":"most_instructor","obs_environment":"most_instructor","obs_familiarity":"most_instructor","obs_devoted":"most_instructor","obs_strengths":"Organized.","obs_improve":"Push deeper.","obs_comments":""}');

-- Head LA feedback (4 rows — mix of ped + lcc fields)
INSERT INTO feedback (id, recipientId, feedback) VALUES
('fb_hl_1','play_user','{"feedback_type":"la_head_la","la_ped_seminars":"strongly_agree","la_ped_applies":"agree","la_ped_discusses":"strongly_agree","la_ped_feedback":"agree","la_ped_content_meeting":"strongly_agree","la_lcc_emails":"agree","la_lcc_comfortable":"strongly_agree","la_lcc_answers":"strongly_agree","la_lcc_announcements":"agree","la_lcc_expectations":"strongly_agree","la_head_strengths":"Very organized and supportive.","la_head_improve":"Nothing comes to mind."}'),
('fb_hl_2','play_user','{"feedback_type":"la_head_la","la_ped_seminars":"agree","la_ped_applies":"agree","la_ped_discusses":"agree","la_ped_feedback":"disagree","la_ped_content_meeting":"agree","la_lcc_emails":"strongly_agree","la_lcc_comfortable":"agree","la_lcc_answers":"agree","la_lcc_announcements":"strongly_agree","la_lcc_expectations":"agree","la_head_strengths":"Good communicator.","la_head_improve":"Give more direct feedback."}'),
('fb_hl_3','play_user','{"feedback_type":"la_head_la","la_ped_seminars":"strongly_agree","la_ped_applies":"strongly_agree","la_ped_discusses":"strongly_agree","la_ped_feedback":"strongly_agree","la_ped_content_meeting":"strongly_agree","la_lcc_emails":"strongly_agree","la_lcc_comfortable":"strongly_agree","la_lcc_answers":"strongly_agree","la_lcc_announcements":"strongly_agree","la_lcc_expectations":"strongly_agree","la_head_strengths":"Amazing Head LA overall.","la_head_improve":"Honestly nothing."}'),
('fb_hl_4','play_user','{"feedback_type":"la_head_la","la_ped_seminars":"disagree","la_ped_applies":"agree","la_ped_discusses":"agree","la_ped_feedback":"agree","la_ped_content_meeting":"disagree","la_lcc_emails":"agree","la_lcc_comfortable":"agree","la_lcc_answers":"disagree","la_lcc_announcements":"agree","la_lcc_expectations":"agree","la_head_strengths":"Approachable.","la_head_improve":"Better seminar facilitation."}');

-- TA feedback (4 rows)
INSERT INTO feedback (id, recipientId, feedback) VALUES
('fb_ta_1','play_user','{"role":"ta","ta_comfortable":"strongly_agree","ta_circulates":"agree","ta_peer_names":"strongly_agree","ta_devotes":"agree","ta_empathizes":"agree","ta_redirects":"strongly_agree","ta_waits":"agree","ta_checks":"strongly_agree","ta_encourages":"strongly_agree","ta_creates":"agree","ta_strengths":"Great teammate.","ta_improve":"Nothing.","ta_comments":""}'),
('fb_ta_2','play_user','{"role":"ta","ta_comfortable":"agree","ta_circulates":"strongly_agree","ta_peer_names":"strongly_agree","ta_devotes":"strongly_agree","ta_empathizes":"strongly_agree","ta_redirects":"agree","ta_waits":"strongly_agree","ta_checks":"agree","ta_encourages":"strongly_agree","ta_creates":"strongly_agree","ta_strengths":"Attentive.","ta_improve":"None.","ta_comments":""}'),
('fb_ta_3','play_user','{"role":"ta","ta_comfortable":"disagree","ta_circulates":"agree","ta_peer_names":"agree","ta_devotes":"disagree","ta_empathizes":"agree","ta_redirects":"agree","ta_waits":"agree","ta_checks":"disagree","ta_encourages":"agree","ta_creates":"agree","ta_strengths":"Shows up.","ta_improve":"Prep more.","ta_comments":""}'),
('fb_ta_4','play_user','{"role":"ta","ta_comfortable":"strongly_agree","ta_circulates":"strongly_agree","ta_peer_names":"strongly_agree","ta_devotes":"strongly_agree","ta_empathizes":"strongly_agree","ta_redirects":"strongly_agree","ta_waits":"strongly_agree","ta_checks":"strongly_agree","ta_encourages":"strongly_agree","ta_creates":"strongly_agree","ta_strengths":"Top tier.","ta_improve":"Nothing.","ta_comments":""}');

-- ==========================================================================
-- Play New (fb_new_user) — new LA
-- ==========================================================================

-- Mid-quarter (3 rows)
INSERT INTO feedback (id, recipientId, feedback) VALUES
('fb_new_mq_1','fb_new_user','{"feedback_type":"mid_quarter","activities":["discussion"],"hours":"2","mq_approachable":"agree","mq_helpful":"agree","mq_familiar":"disagree","mq_engagement":"agree","mq_questioning":"agree","mq_supportive":"agree","mq_name":"disagree","mq_belonging":"agree","mq_checkin":"agree","mq_small_groups":"agree","mq_strengths":"Enthusiastic first-timer.","mq_improve":"Get to know students better."}'),
('fb_new_mq_2','fb_new_user','{"feedback_type":"mid_quarter","activities":["discussion","office_hours"],"hours":"3","mq_approachable":"strongly_agree","mq_helpful":"agree","mq_familiar":"agree","mq_engagement":"agree","mq_questioning":"disagree","mq_supportive":"strongly_agree","mq_name":"agree","mq_belonging":"strongly_agree","mq_checkin":"agree","mq_small_groups":"agree","mq_strengths":"Really friendly.","mq_improve":"Ask more probing questions."}'),
('fb_new_mq_3','fb_new_user','{"feedback_type":"mid_quarter","activities":["discussion"],"hours":"2","mq_approachable":"strongly_agree","mq_helpful":"strongly_agree","mq_familiar":"agree","mq_engagement":"strongly_agree","mq_questioning":"agree","mq_supportive":"strongly_agree","mq_name":"agree","mq_belonging":"strongly_agree","mq_checkin":"strongly_agree","mq_small_groups":"strongly_agree","mq_strengths":"Natural teacher.","mq_improve":"Nothing yet."}');

-- End-of-quarter (2 rows)
INSERT INTO feedback (id, recipientId, feedback) VALUES
('fb_new_eq_1','fb_new_user','{"feedback_type":"end_of_quarter","activities":["discussion"],"hours":"3","eq_approachability":"big_improvement","eq_helpfulness":"big_improvement","eq_familiarity":"big_improvement","eq_engagement":"little_improvement","eq_questioning":"big_improvement","eq_supportiveness":"big_improvement","eq_name_use":"big_improvement","eq_belonging_stem":"big_improvement","eq_comments":"Huge growth for a new LA."}'),
('fb_new_eq_2','fb_new_user','{"feedback_type":"end_of_quarter","activities":["discussion","office_hours"],"hours":"4","eq_approachability":"little_improvement","eq_helpfulness":"little_improvement","eq_familiarity":"no_change","eq_engagement":"little_improvement","eq_questioning":"little_improvement","eq_supportiveness":"little_improvement","eq_name_use":"little_improvement","eq_belonging_stem":"little_improvement","eq_comments":"Steady progress."}');

-- Observation (2 rows)
INSERT INTO feedback (id, recipientId, feedback) VALUES
('fb_new_ob_1','fb_new_user','{"feedback_type":"la_observation","obs_empathized":"most_instructor","obs_redirected":"sometimes","obs_wait_time":"sometimes","obs_open_closed":"sometimes","obs_closed_check":"most_missed","obs_peer_names":"almost_never","obs_growth_mindset":"sometimes","obs_circulated":"most_instructor","obs_environment":"sometimes","obs_familiarity":"most_instructor","obs_devoted":"always","obs_strengths":"Great energy for a new LA.","obs_improve":"Learn student names.","obs_comments":"First observation."}'),
('fb_new_ob_2','fb_new_user','{"feedback_type":"la_observation","obs_empathized":"always","obs_redirected":"most_instructor","obs_wait_time":"most_instructor","obs_open_closed":"most_instructor","obs_closed_check":"most_instructor","obs_peer_names":"sometimes","obs_growth_mindset":"most_instructor","obs_circulated":"always","obs_environment":"most_instructor","obs_familiarity":"always","obs_devoted":"always","obs_strengths":"Improved a lot since last time.","obs_improve":"Keep working on equity.","obs_comments":"Clear growth."}');

-- TA (2 rows)
INSERT INTO feedback (id, recipientId, feedback) VALUES
('fb_new_ta_1','fb_new_user','{"role":"ta","ta_comfortable":"agree","ta_circulates":"agree","ta_peer_names":"agree","ta_devotes":"strongly_agree","ta_empathizes":"agree","ta_redirects":"agree","ta_waits":"agree","ta_checks":"agree","ta_encourages":"strongly_agree","ta_creates":"agree","ta_strengths":"Eager to learn.","ta_improve":"More initiative.","ta_comments":""}'),
('fb_new_ta_2','fb_new_user','{"role":"ta","ta_comfortable":"strongly_agree","ta_circulates":"strongly_agree","ta_peer_names":"agree","ta_devotes":"strongly_agree","ta_empathizes":"strongly_agree","ta_redirects":"strongly_agree","ta_waits":"agree","ta_checks":"strongly_agree","ta_encourages":"strongly_agree","ta_creates":"strongly_agree","ta_strengths":"Reliable and punctual.","ta_improve":"Nothing major.","ta_comments":""}');

-- ==========================================================================
-- Play Ret (fb_ret_user) — returner
-- ==========================================================================

-- Mid-quarter (4 rows)
INSERT INTO feedback (id, recipientId, feedback) VALUES
('fb_ret_mq_1','fb_ret_user','{"feedback_type":"mid_quarter","activities":["discussion"],"hours":"3","mq_approachable":"strongly_agree","mq_helpful":"strongly_agree","mq_familiar":"strongly_agree","mq_engagement":"agree","mq_questioning":"strongly_agree","mq_supportive":"strongly_agree","mq_name":"strongly_agree","mq_belonging":"strongly_agree","mq_checkin":"agree","mq_small_groups":"strongly_agree","mq_strengths":"Knows the material cold.","mq_improve":"Could be more energetic."}'),
('fb_ret_mq_2','fb_ret_user','{"feedback_type":"mid_quarter","activities":["discussion","study_session"],"hours":"5","mq_approachable":"strongly_agree","mq_helpful":"strongly_agree","mq_familiar":"agree","mq_engagement":"strongly_agree","mq_questioning":"agree","mq_supportive":"strongly_agree","mq_name":"agree","mq_belonging":"agree","mq_checkin":"strongly_agree","mq_small_groups":"strongly_agree","mq_strengths":"Very experienced.","mq_improve":"Nothing."}'),
('fb_ret_mq_3','fb_ret_user','{"feedback_type":"mid_quarter","activities":["discussion"],"hours":"3","mq_approachable":"agree","mq_helpful":"agree","mq_familiar":"strongly_agree","mq_engagement":"agree","mq_questioning":"agree","mq_supportive":"agree","mq_name":"strongly_agree","mq_belonging":"agree","mq_checkin":"agree","mq_small_groups":"agree","mq_strengths":"Consistent.","mq_improve":"Vary teaching methods."}'),
('fb_ret_mq_4','fb_ret_user','{"feedback_type":"mid_quarter","activities":["discussion","office_hours"],"hours":"4","mq_approachable":"strongly_agree","mq_helpful":"agree","mq_familiar":"strongly_agree","mq_engagement":"disagree","mq_questioning":"agree","mq_supportive":"agree","mq_name":"strongly_agree","mq_belonging":"strongly_agree","mq_checkin":"agree","mq_small_groups":"agree","mq_strengths":"Dependable.","mq_improve":"More interactive activities."}');

-- End-of-quarter (3 rows)
INSERT INTO feedback (id, recipientId, feedback) VALUES
('fb_ret_eq_1','fb_ret_user','{"feedback_type":"end_of_quarter","activities":["discussion"],"hours":"3","eq_approachability":"no_room_for_improvement","eq_helpfulness":"no_room_for_improvement","eq_familiarity":"no_room_for_improvement","eq_engagement":"little_improvement","eq_questioning":"no_room_for_improvement","eq_supportiveness":"no_room_for_improvement","eq_name_use":"no_room_for_improvement","eq_belonging_stem":"no_room_for_improvement","eq_comments":"Already great from the start."}'),
('fb_ret_eq_2','fb_ret_user','{"feedback_type":"end_of_quarter","activities":["discussion"],"hours":"4","eq_approachability":"no_room_for_improvement","eq_helpfulness":"big_improvement","eq_familiarity":"no_change","eq_engagement":"big_improvement","eq_questioning":"little_improvement","eq_supportiveness":"no_room_for_improvement","eq_name_use":"no_change","eq_belonging_stem":"little_improvement","eq_comments":"Got more engaging over time."}'),
('fb_ret_eq_3','fb_ret_user','{"feedback_type":"end_of_quarter","activities":["discussion","study_session"],"hours":"5","eq_approachability":"no_room_for_improvement","eq_helpfulness":"no_room_for_improvement","eq_familiarity":"no_room_for_improvement","eq_engagement":"little_improvement","eq_questioning":"big_improvement","eq_supportiveness":"no_room_for_improvement","eq_name_use":"no_room_for_improvement","eq_belonging_stem":"no_room_for_improvement","eq_comments":"Solid returner."}');

-- Observation (2 rows)
INSERT INTO feedback (id, recipientId, feedback) VALUES
('fb_ret_ob_1','fb_ret_user','{"feedback_type":"la_observation","obs_empathized":"always","obs_redirected":"always","obs_wait_time":"most_instructor","obs_open_closed":"most_instructor","obs_closed_check":"always","obs_peer_names":"always","obs_growth_mindset":"always","obs_circulated":"always","obs_environment":"always","obs_familiarity":"always","obs_devoted":"always","obs_strengths":"Very polished.","obs_improve":"Try new questioning techniques.","obs_comments":"Experienced LA."}'),
('fb_ret_ob_2','fb_ret_user','{"feedback_type":"la_observation","obs_empathized":"always","obs_redirected":"most_instructor","obs_wait_time":"always","obs_open_closed":"always","obs_closed_check":"most_instructor","obs_peer_names":"always","obs_growth_mindset":"most_instructor","obs_circulated":"always","obs_environment":"most_instructor","obs_familiarity":"always","obs_devoted":"always","obs_strengths":"Confident facilitation.","obs_improve":"Mix up group formats.","obs_comments":""}');

-- TA (2 rows)
INSERT INTO feedback (id, recipientId, feedback) VALUES
('fb_ret_ta_1','fb_ret_user','{"role":"ta","ta_comfortable":"strongly_agree","ta_circulates":"strongly_agree","ta_peer_names":"strongly_agree","ta_devotes":"strongly_agree","ta_empathizes":"strongly_agree","ta_redirects":"strongly_agree","ta_waits":"strongly_agree","ta_checks":"strongly_agree","ta_encourages":"strongly_agree","ta_creates":"agree","ta_strengths":"Veteran presence.","ta_improve":"Nothing.","ta_comments":""}'),
('fb_ret_ta_2','fb_ret_user','{"role":"ta","ta_comfortable":"strongly_agree","ta_circulates":"agree","ta_peer_names":"strongly_agree","ta_devotes":"agree","ta_empathizes":"strongly_agree","ta_redirects":"agree","ta_waits":"strongly_agree","ta_checks":"agree","ta_encourages":"strongly_agree","ta_creates":"agree","ta_strengths":"Knows the ropes.","ta_improve":"Could mentor new LAs more.","ta_comments":""}');

-- ==========================================================================
-- Play Ped (fb_ped_user) — ped head LA
-- ==========================================================================

-- Mid-quarter (3 rows)
INSERT INTO feedback (id, recipientId, feedback) VALUES
('fb_ped_mq_1','fb_ped_user','{"feedback_type":"mid_quarter","activities":["discussion","lecture"],"hours":"4","mq_approachable":"strongly_agree","mq_helpful":"strongly_agree","mq_familiar":"strongly_agree","mq_engagement":"strongly_agree","mq_questioning":"strongly_agree","mq_supportive":"strongly_agree","mq_name":"strongly_agree","mq_belonging":"strongly_agree","mq_checkin":"strongly_agree","mq_small_groups":"strongly_agree","mq_strengths":"Incredible pedagogy knowledge.","mq_improve":"Nothing."}'),
('fb_ped_mq_2','fb_ped_user','{"feedback_type":"mid_quarter","activities":["discussion"],"hours":"3","mq_approachable":"strongly_agree","mq_helpful":"agree","mq_familiar":"agree","mq_engagement":"agree","mq_questioning":"strongly_agree","mq_supportive":"strongly_agree","mq_name":"agree","mq_belonging":"strongly_agree","mq_checkin":"agree","mq_small_groups":"strongly_agree","mq_strengths":"Models great questioning.","mq_improve":"More one-on-one time."}'),
('fb_ped_mq_3','fb_ped_user','{"feedback_type":"mid_quarter","activities":["discussion"],"hours":"3","mq_approachable":"agree","mq_helpful":"strongly_agree","mq_familiar":"strongly_agree","mq_engagement":"strongly_agree","mq_questioning":"agree","mq_supportive":"agree","mq_name":"strongly_agree","mq_belonging":"agree","mq_checkin":"strongly_agree","mq_small_groups":"agree","mq_strengths":"Makes everyone feel welcome.","mq_improve":"Slow down sometimes."}');

-- Head LA ped-only (3 rows)
INSERT INTO feedback (id, recipientId, feedback) VALUES
('fb_ped_hl_1','fb_ped_user','{"feedback_type":"la_head_la","la_ped_seminars":"strongly_agree","la_ped_applies":"strongly_agree","la_ped_discusses":"strongly_agree","la_ped_feedback":"strongly_agree","la_ped_content_meeting":"strongly_agree","la_head_strengths":"Best ped seminars I have attended.","la_head_improve":"Nothing."}'),
('fb_ped_hl_2','fb_ped_user','{"feedback_type":"la_head_la","la_ped_seminars":"agree","la_ped_applies":"strongly_agree","la_ped_discusses":"strongly_agree","la_ped_feedback":"agree","la_ped_content_meeting":"agree","la_head_strengths":"Applies theory well to our course.","la_head_improve":"Could be more structured in seminars."}'),
('fb_ped_hl_3','fb_ped_user','{"feedback_type":"la_head_la","la_ped_seminars":"strongly_agree","la_ped_applies":"agree","la_ped_discusses":"agree","la_ped_feedback":"strongly_agree","la_ped_content_meeting":"strongly_agree","la_head_strengths":"Always available to talk pedagogy.","la_head_improve":"More hands-on activities in seminar."}');

-- Observation (2 rows)
INSERT INTO feedback (id, recipientId, feedback) VALUES
('fb_ped_ob_1','fb_ped_user','{"feedback_type":"la_observation","obs_empathized":"always","obs_redirected":"always","obs_wait_time":"always","obs_open_closed":"always","obs_closed_check":"always","obs_peer_names":"always","obs_growth_mindset":"always","obs_circulated":"always","obs_environment":"always","obs_familiarity":"always","obs_devoted":"always","obs_strengths":"Textbook facilitation.","obs_improve":"Literally nothing.","obs_comments":"Outstanding."}'),
('fb_ped_ob_2','fb_ped_user','{"feedback_type":"la_observation","obs_empathized":"always","obs_redirected":"most_instructor","obs_wait_time":"most_instructor","obs_open_closed":"always","obs_closed_check":"most_instructor","obs_peer_names":"always","obs_growth_mindset":"always","obs_circulated":"always","obs_environment":"always","obs_familiarity":"always","obs_devoted":"always","obs_strengths":"Strong wait time.","obs_improve":"Engage quieter students.","obs_comments":"Near perfect."}');

-- TA (2 rows)
INSERT INTO feedback (id, recipientId, feedback) VALUES
('fb_ped_ta_1','fb_ped_user','{"role":"ta","ta_comfortable":"strongly_agree","ta_circulates":"strongly_agree","ta_peer_names":"strongly_agree","ta_devotes":"strongly_agree","ta_empathizes":"strongly_agree","ta_redirects":"strongly_agree","ta_waits":"strongly_agree","ta_checks":"strongly_agree","ta_encourages":"strongly_agree","ta_creates":"strongly_agree","ta_strengths":"Leadership material.","ta_improve":"Nothing.","ta_comments":""}'),
('fb_ped_ta_2','fb_ped_user','{"role":"ta","ta_comfortable":"strongly_agree","ta_circulates":"strongly_agree","ta_peer_names":"agree","ta_devotes":"strongly_agree","ta_empathizes":"strongly_agree","ta_redirects":"strongly_agree","ta_waits":"agree","ta_checks":"strongly_agree","ta_encourages":"strongly_agree","ta_creates":"strongly_agree","ta_strengths":"Great role model.","ta_improve":"Communicate more with TA.","ta_comments":""}');

-- ==========================================================================
-- Play Lcc (fb_lcc_user) — lcc head LA
-- ==========================================================================

-- Mid-quarter (3 rows)
INSERT INTO feedback (id, recipientId, feedback) VALUES
('fb_lcc_mq_1','fb_lcc_user','{"feedback_type":"mid_quarter","activities":["discussion"],"hours":"3","mq_approachable":"strongly_agree","mq_helpful":"agree","mq_familiar":"agree","mq_engagement":"agree","mq_questioning":"agree","mq_supportive":"strongly_agree","mq_name":"agree","mq_belonging":"agree","mq_checkin":"strongly_agree","mq_small_groups":"agree","mq_strengths":"Very organized.","mq_improve":"More engaging discussions."}'),
('fb_lcc_mq_2','fb_lcc_user','{"feedback_type":"mid_quarter","activities":["discussion","office_hours"],"hours":"4","mq_approachable":"agree","mq_helpful":"strongly_agree","mq_familiar":"strongly_agree","mq_engagement":"agree","mq_questioning":"agree","mq_supportive":"agree","mq_name":"strongly_agree","mq_belonging":"strongly_agree","mq_checkin":"agree","mq_small_groups":"strongly_agree","mq_strengths":"Knows logistics inside out.","mq_improve":"Try new activities."}'),
('fb_lcc_mq_3','fb_lcc_user','{"feedback_type":"mid_quarter","activities":["discussion"],"hours":"2","mq_approachable":"strongly_agree","mq_helpful":"strongly_agree","mq_familiar":"agree","mq_engagement":"strongly_agree","mq_questioning":"strongly_agree","mq_supportive":"strongly_agree","mq_name":"agree","mq_belonging":"strongly_agree","mq_checkin":"strongly_agree","mq_small_groups":"strongly_agree","mq_strengths":"Super helpful.","mq_improve":"Nothing."}');

-- Head LA lcc-only (3 rows)
INSERT INTO feedback (id, recipientId, feedback) VALUES
('fb_lcc_hl_1','fb_lcc_user','{"feedback_type":"la_head_la","la_lcc_emails":"strongly_agree","la_lcc_comfortable":"strongly_agree","la_lcc_answers":"strongly_agree","la_lcc_announcements":"strongly_agree","la_lcc_expectations":"strongly_agree","la_head_strengths":"Fastest email responses ever.","la_head_improve":"Nothing."}'),
('fb_lcc_hl_2','fb_lcc_user','{"feedback_type":"la_head_la","la_lcc_emails":"agree","la_lcc_comfortable":"strongly_agree","la_lcc_answers":"agree","la_lcc_announcements":"agree","la_lcc_expectations":"strongly_agree","la_head_strengths":"Makes expectations crystal clear.","la_head_improve":"Longer announcements sometimes."}'),
('fb_lcc_hl_3','fb_lcc_user','{"feedback_type":"la_head_la","la_lcc_emails":"strongly_agree","la_lcc_comfortable":"agree","la_lcc_answers":"strongly_agree","la_lcc_announcements":"strongly_agree","la_lcc_expectations":"agree","la_head_strengths":"Always knows the answer.","la_head_improve":"Be more approachable in meetings."}');

-- Observation (2 rows)
INSERT INTO feedback (id, recipientId, feedback) VALUES
('fb_lcc_ob_1','fb_lcc_user','{"feedback_type":"la_observation","obs_empathized":"most_instructor","obs_redirected":"most_instructor","obs_wait_time":"most_instructor","obs_open_closed":"most_instructor","obs_closed_check":"always","obs_peer_names":"most_instructor","obs_growth_mindset":"most_instructor","obs_circulated":"always","obs_environment":"most_instructor","obs_familiarity":"always","obs_devoted":"always","obs_strengths":"Well-organized section.","obs_improve":"More student-centered questioning.","obs_comments":"Good logistics awareness."}'),
('fb_lcc_ob_2','fb_lcc_user','{"feedback_type":"la_observation","obs_empathized":"always","obs_redirected":"sometimes","obs_wait_time":"sometimes","obs_open_closed":"most_instructor","obs_closed_check":"most_instructor","obs_peer_names":"always","obs_growth_mindset":"most_instructor","obs_circulated":"most_instructor","obs_environment":"always","obs_familiarity":"always","obs_devoted":"always","obs_strengths":"Students feel comfortable.","obs_improve":"Wait time before answering.","obs_comments":""}');

-- TA (2 rows)
INSERT INTO feedback (id, recipientId, feedback) VALUES
('fb_lcc_ta_1','fb_lcc_user','{"role":"ta","ta_comfortable":"strongly_agree","ta_circulates":"agree","ta_peer_names":"strongly_agree","ta_devotes":"strongly_agree","ta_empathizes":"agree","ta_redirects":"agree","ta_waits":"strongly_agree","ta_checks":"agree","ta_encourages":"strongly_agree","ta_creates":"agree","ta_strengths":"Great communicator with TA.","ta_improve":"More proactive.","ta_comments":""}'),
('fb_lcc_ta_2','fb_lcc_user','{"role":"ta","ta_comfortable":"agree","ta_circulates":"strongly_agree","ta_peer_names":"strongly_agree","ta_devotes":"strongly_agree","ta_empathizes":"strongly_agree","ta_redirects":"strongly_agree","ta_waits":"agree","ta_checks":"strongly_agree","ta_encourages":"strongly_agree","ta_creates":"strongly_agree","ta_strengths":"Always on top of logistics.","ta_improve":"Nothing.","ta_comments":""}');

-- ==========================================================================
-- Play RetLcc (fb_rlcc_user) — ret_lcc
-- ==========================================================================

-- Mid-quarter (3 rows)
INSERT INTO feedback (id, recipientId, feedback) VALUES
('fb_rlcc_mq_1','fb_rlcc_user','{"feedback_type":"mid_quarter","activities":["discussion","study_session"],"hours":"5","mq_approachable":"strongly_agree","mq_helpful":"strongly_agree","mq_familiar":"strongly_agree","mq_engagement":"strongly_agree","mq_questioning":"strongly_agree","mq_supportive":"strongly_agree","mq_name":"strongly_agree","mq_belonging":"strongly_agree","mq_checkin":"strongly_agree","mq_small_groups":"strongly_agree","mq_strengths":"Does it all.","mq_improve":"Nothing to improve."}'),
('fb_rlcc_mq_2','fb_rlcc_user','{"feedback_type":"mid_quarter","activities":["discussion"],"hours":"3","mq_approachable":"strongly_agree","mq_helpful":"agree","mq_familiar":"strongly_agree","mq_engagement":"agree","mq_questioning":"agree","mq_supportive":"strongly_agree","mq_name":"strongly_agree","mq_belonging":"agree","mq_checkin":"agree","mq_small_groups":"strongly_agree","mq_strengths":"Experienced and approachable.","mq_improve":"More variety in activities."}'),
('fb_rlcc_mq_3','fb_rlcc_user','{"feedback_type":"mid_quarter","activities":["discussion","office_hours"],"hours":"4","mq_approachable":"agree","mq_helpful":"strongly_agree","mq_familiar":"agree","mq_engagement":"strongly_agree","mq_questioning":"strongly_agree","mq_supportive":"agree","mq_name":"agree","mq_belonging":"strongly_agree","mq_checkin":"strongly_agree","mq_small_groups":"agree","mq_strengths":"Balances logistics and teaching.","mq_improve":"Could delegate more."}');

-- End-of-quarter (2 rows)
INSERT INTO feedback (id, recipientId, feedback) VALUES
('fb_rlcc_eq_1','fb_rlcc_user','{"feedback_type":"end_of_quarter","activities":["discussion","study_session"],"hours":"5","eq_approachability":"no_room_for_improvement","eq_helpfulness":"no_room_for_improvement","eq_familiarity":"no_room_for_improvement","eq_engagement":"big_improvement","eq_questioning":"no_room_for_improvement","eq_supportiveness":"no_room_for_improvement","eq_name_use":"no_room_for_improvement","eq_belonging_stem":"no_room_for_improvement","eq_comments":"Amazing from day one."}'),
('fb_rlcc_eq_2','fb_rlcc_user','{"feedback_type":"end_of_quarter","activities":["discussion"],"hours":"3","eq_approachability":"no_room_for_improvement","eq_helpfulness":"big_improvement","eq_familiarity":"no_change","eq_engagement":"little_improvement","eq_questioning":"big_improvement","eq_supportiveness":"no_room_for_improvement","eq_name_use":"no_change","eq_belonging_stem":"big_improvement","eq_comments":"Grew even more this quarter."}');

-- Head LA lcc-only (3 rows — ret_lcc gets LCC feedback)
INSERT INTO feedback (id, recipientId, feedback) VALUES
('fb_rlcc_hl_1','fb_rlcc_user','{"feedback_type":"la_head_la","la_lcc_emails":"strongly_agree","la_lcc_comfortable":"strongly_agree","la_lcc_answers":"strongly_agree","la_lcc_announcements":"agree","la_lcc_expectations":"strongly_agree","la_head_strengths":"Handles everything smoothly.","la_head_improve":"Nothing."}'),
('fb_rlcc_hl_2','fb_rlcc_user','{"feedback_type":"la_head_la","la_lcc_emails":"agree","la_lcc_comfortable":"strongly_agree","la_lcc_answers":"strongly_agree","la_lcc_announcements":"strongly_agree","la_lcc_expectations":"strongly_agree","la_head_strengths":"Great at keeping us informed.","la_head_improve":"Sometimes slow on email."}'),
('fb_rlcc_hl_3','fb_rlcc_user','{"feedback_type":"la_head_la","la_lcc_emails":"strongly_agree","la_lcc_comfortable":"agree","la_lcc_answers":"agree","la_lcc_announcements":"strongly_agree","la_lcc_expectations":"agree","la_head_strengths":"Clear expectations.","la_head_improve":"More check-ins."}');

-- Observation (2 rows)
INSERT INTO feedback (id, recipientId, feedback) VALUES
('fb_rlcc_ob_1','fb_rlcc_user','{"feedback_type":"la_observation","obs_empathized":"always","obs_redirected":"always","obs_wait_time":"always","obs_open_closed":"always","obs_closed_check":"always","obs_peer_names":"always","obs_growth_mindset":"always","obs_circulated":"always","obs_environment":"always","obs_familiarity":"always","obs_devoted":"always","obs_strengths":"Perfect session.","obs_improve":"Nothing.","obs_comments":"Exemplary."}'),
('fb_rlcc_ob_2','fb_rlcc_user','{"feedback_type":"la_observation","obs_empathized":"always","obs_redirected":"most_instructor","obs_wait_time":"most_instructor","obs_open_closed":"most_instructor","obs_closed_check":"always","obs_peer_names":"most_instructor","obs_growth_mindset":"always","obs_circulated":"always","obs_environment":"always","obs_familiarity":"always","obs_devoted":"always","obs_strengths":"Strong presence.","obs_improve":"Push deeper on questioning.","obs_comments":"Veteran skill."}');

-- TA (2 rows)
INSERT INTO feedback (id, recipientId, feedback) VALUES
('fb_rlcc_ta_1','fb_rlcc_user','{"role":"ta","ta_comfortable":"strongly_agree","ta_circulates":"strongly_agree","ta_peer_names":"strongly_agree","ta_devotes":"strongly_agree","ta_empathizes":"strongly_agree","ta_redirects":"strongly_agree","ta_waits":"strongly_agree","ta_checks":"strongly_agree","ta_encourages":"strongly_agree","ta_creates":"strongly_agree","ta_strengths":"Best LA on the team.","ta_improve":"Nothing.","ta_comments":""}'),
('fb_rlcc_ta_2','fb_rlcc_user','{"role":"ta","ta_comfortable":"strongly_agree","ta_circulates":"agree","ta_peer_names":"strongly_agree","ta_devotes":"strongly_agree","ta_empathizes":"agree","ta_redirects":"strongly_agree","ta_waits":"strongly_agree","ta_checks":"agree","ta_encourages":"strongly_agree","ta_creates":"agree","ta_strengths":"Handles dual role well.","ta_improve":"Could share more with team.","ta_comments":""}');
