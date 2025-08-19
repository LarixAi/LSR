-- Ensure unique constraint on app_settings.user_id for upsert
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.app_settings'::regclass
      AND contype = 'u'
      AND conname = 'app_settings_user_id_key'
  ) THEN
    ALTER TABLE public.app_settings
      ADD CONSTRAINT app_settings_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- Ensure updated_at is maintained automatically on updates
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgrelid = 'public.app_settings'::regclass
      AND tgname = 'trg_app_settings_updated_at'
  ) THEN
    CREATE TRIGGER trg_app_settings_updated_at
    BEFORE UPDATE ON public.app_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Create trigger to auto-create profile rows with role on new auth users (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_user();