-- 1. Create the daily_tasks table
CREATE TABLE daily_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID REFERENCES plans(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'skipped')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX idx_daily_tasks_plan_id ON daily_tasks(plan_id);
CREATE INDEX idx_daily_tasks_status ON daily_tasks(status);
CREATE INDEX idx_daily_tasks_due_date ON daily_tasks(due_date);

-- 2. Create the chat_messages table
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  content TEXT NOT NULL,
  is_from_assistant BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);

-- 3. Create the micro_surveys table
CREATE TABLE micro_surveys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  question TEXT NOT NULL,
  response TEXT,
  response_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX idx_micro_surveys_user_id ON micro_surveys(user_id);

-- 4. Create the logged_data table
CREATE TABLE logged_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  data_type TEXT NOT NULL,
  data_value JSONB NOT NULL,
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX idx_logged_data_user_id ON logged_data(user_id);
CREATE INDEX idx_logged_data_data_type ON logged_data(data_type);
CREATE INDEX idx_logged_data_logged_at ON logged_data(logged_at);

-- 5. Add updated_at trigger for daily_tasks
-- Assuming the update_modified_column function already exists from the previous migration
CREATE TRIGGER update_daily_tasks_modtime
  BEFORE UPDATE ON daily_tasks
  FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- Note: The original task details didn't explicitly include triggers for chat_messages, micro_surveys, or logged_data.
-- If updated_at timestamps are needed for those, similar triggers should be added.
-- For now, only the trigger for daily_tasks is included as specified.
