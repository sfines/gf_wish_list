create or replace function update_item_image(item_id uuid, selected_image_url text)
returns void as $$
  update public.items
  set image_url = selected_image_url
  where id = item_id;
$$ language sql;
