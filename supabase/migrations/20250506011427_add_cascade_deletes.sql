-- profiles referencing auth.users
ALTER TABLE public.profiles DROP CONSTRAINT profiles_id_fkey;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- plans referencing profiles
ALTER TABLE public.plans DROP CONSTRAINT plans_user_id_fkey;
ALTER TABLE public.plans ADD CONSTRAINT plans_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- chat_messages referencing profiles
ALTER TABLE public.chat_messages DROP CONSTRAINT chat_messages_user_id_fkey;
ALTER TABLE public.chat_messages ADD CONSTRAINT chat_messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- micro_surveys referencing profiles
ALTER TABLE public.micro_surveys DROP CONSTRAINT micro_surveys_user_id_fkey;
ALTER TABLE public.micro_surveys ADD CONSTRAINT micro_surveys_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- logged_data referencing profiles
ALTER TABLE public.logged_data DROP CONSTRAINT logged_data_user_id_fkey;
ALTER TABLE public.logged_data ADD CONSTRAINT logged_data_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
