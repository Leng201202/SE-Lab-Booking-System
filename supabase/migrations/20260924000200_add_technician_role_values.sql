alter type public.app_role add value if not exists 'technician' after 'student';
alter type public.booking_status add value if not exists 'pending_technician' before 'pending_advisor';
