-- 1. Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE micro_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE logged_data ENABLE ROW LEVEL SECURITY;

-- Force RLS for table owners as well (recommended)
ALTER TABLE profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE plans FORCE ROW LEVEL SECURITY;
ALTER TABLE daily_tasks FORCE ROW LEVEL SECURITY;
ALTER TABLE chat_messages FORCE ROW LEVEL SECURITY;
ALTER TABLE micro_surveys FORCE ROW LEVEL SECURITY;
ALTER TABLE logged_data FORCE ROW LEVEL SECURITY;

-- 2. RLS policies for profiles table
-- Users can view any profile (Consider if this should be restricted)
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

-- Users can only update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
  -- Note: No insert/delete policies as profile creation is handled by trigger, deletion by user deletion cascade.

-- 3. RLS policies for plans table
CREATE POLICY "Users can view their own plans"
  ON plans FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own plans"
  ON plans FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plans"
  ON plans FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Recreate delete policy for clarity and certainty
DROP POLICY IF EXISTS "Users can delete their own plans" ON plans;
CREATE POLICY "Users can delete their own plans"
  ON plans FOR DELETE USING (auth.uid() = user_id);

-- 4. RLS policies for daily_tasks table
CREATE POLICY "Users can view their own daily tasks"
  ON daily_tasks FOR SELECT USING (
    auth.uid() IN ( SELECT user_id FROM plans WHERE id = daily_tasks.plan_id )
  );

CREATE POLICY "Users can insert tasks for their own plans"
  ON daily_tasks FOR INSERT WITH CHECK (
    auth.uid() IN ( SELECT user_id FROM plans WHERE id = daily_tasks.plan_id )
  );

CREATE POLICY "Users can update tasks for their own plans"
  ON daily_tasks FOR UPDATE USING (
    auth.uid() IN ( SELECT user_id FROM plans WHERE id = daily_tasks.plan_id )
  ) WITH CHECK (
    auth.uid() IN ( SELECT user_id FROM plans WHERE id = daily_tasks.plan_id )
  );

CREATE POLICY "Users can delete tasks for their own plans"
  ON daily_tasks FOR DELETE USING (
    auth.uid() IN ( SELECT user_id FROM plans WHERE id = daily_tasks.plan_id )
  );

-- 5. RLS policies for chat_messages table
CREATE POLICY "Users can view their own chat messages"
  ON chat_messages FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat messages"
  ON chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
  -- Note: Typically no update/delete for chat messages, but can be added if needed.

-- 6. RLS policies for micro_surveys table
CREATE POLICY "Users can view their own micro surveys"
  ON micro_surveys FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own micro surveys"
  ON micro_surveys FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own micro survey responses"
  ON micro_surveys FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  -- Note: Delete might not be necessary depending on requirements.

-- 7. RLS policies for logged_data table
CREATE POLICY "Users can view their own logged data"
  ON logged_data FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own logged data"
  ON logged_data FOR INSERT WITH CHECK (auth.uid() = user_id);
  -- Note: Update/delete might not be applicable for logged data.
