
-- mode enum
DO $$ BEGIN
  CREATE TYPE public.use_mode AS ENUM ('onsite', 'remote');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- drop old section constraints
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_computer_id_booking_date_section_start_key;
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_unique_slot;

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS start_hour integer,
  ADD COLUMN IF NOT EXISTS end_hour integer,
  ADD COLUMN IF NOT EXISTS mode public.use_mode NOT NULL DEFAULT 'onsite';

UPDATE public.bookings SET start_hour = COALESCE(start_hour, section_start), end_hour = COALESCE(end_hour, section_start + 2);

ALTER TABLE public.bookings ALTER COLUMN start_hour SET NOT NULL;
ALTER TABLE public.bookings ALTER COLUMN end_hour SET NOT NULL;
ALTER TABLE public.bookings DROP COLUMN IF EXISTS section_start;

ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_hours_valid;
ALTER TABLE public.bookings ADD CONSTRAINT bookings_hours_valid
  CHECK (start_hour >= 9 AND end_hour <= 20 AND end_hour > start_hour);

ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_computer_range;
ALTER TABLE public.bookings ADD CONSTRAINT bookings_computer_range
  CHECK (computer_id BETWEEN 1 AND 10);

-- prevent overlapping bookings on the same computer/day
CREATE OR REPLACE FUNCTION public.prevent_booking_overlap()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.computer_id = NEW.computer_id
      AND b.booking_date = NEW.booking_date
      AND b.id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND NEW.start_hour < b.end_hour
      AND NEW.end_hour > b.start_hour
  ) THEN
    RAISE EXCEPTION 'This computer is already booked during part of that time range';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS bookings_no_overlap ON public.bookings;
CREATE TRIGGER bookings_no_overlap
BEFORE INSERT OR UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.prevent_booking_overlap();

-- public read access to the timetable
GRANT SELECT ON public.bookings TO anon;
GRANT SELECT ON public.profiles TO anon;

DROP POLICY IF EXISTS "Bookings are viewable by signed-in users" ON public.bookings;
CREATE POLICY "Bookings are viewable by everyone" ON public.bookings
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Profiles are viewable by signed-in users" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
  FOR SELECT TO anon, authenticated USING (true);
