-- Telegram notifications via Edge Function + DB trigger
-- Replace URL if needed (project ref): wbwxhmpjxwmsybpxycog
-- Function endpoint: https://<PROJECT_REF>.functions.supabase.co/telegram-notify

create extension if not exists pg_net;

create or replace function public.notify_telegram_on_order_change()
returns trigger
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  event_name text;
  payload jsonb;
  secret text;
  headers jsonb := jsonb_build_object('Content-Type','application/json');
  url text := 'https://wbwxhmpjxwmsybpxycog.functions.supabase.co/telegram-notify';
begin
  if (tg_op = 'INSERT') then
    event_name := 'new';
  else
    if (new.status is distinct from old.status) then
      case new.status
        when 'accepted' then event_name := 'accepted';
        when 'assigned' then event_name := 'assigned';
        when 'driver_accepted' then event_name := 'driver_accepted';
        when 'picked_up' then event_name := 'picked_up';
        when 'in_progress' then event_name := 'picked_up';
        when 'delivered' then event_name := 'delivered';
        when 'cancelled' then event_name := 'cancelled';
        when 'canceled' then event_name := 'cancelled';
        when 'declined' then event_name := 'cancelled';
        else event_name := null;
      end case;
    end if;
  end if;

  if event_name is null then
    return new;
  end if;

  -- Optional secret stored in app_settings
  select value::text into secret from public.app_settings where key = 'telegram_notify_secret' limit 1;
  if secret is not null and secret <> '' then
    headers := headers || jsonb_build_object('x-telegram-secret', secret);
  end if;

  payload := jsonb_build_object('event', event_name, 'order', to_jsonb(new));
  perform net.http_post(url, payload, headers);

  return new;
end $$;

-- Ensure single trigger
 drop trigger if exists trg_notify_telegram_on_order_change on public.orders;
 create trigger trg_notify_telegram_on_order_change
 after insert or update on public.orders
 for each row execute function public.notify_telegram_on_order_change();
