
CREATE TABLE IF NOT EXISTS public.product_images (
    product_id              uuid references public.product(id) on delete cascade not null,
    description       text,
    image_path        text NOT NULL,
    image_public_url  text NOT NULL,
    created_at        timestamp with time zone DEFAULT now() NOT NULL,
    constraint product_images_pkey primary key (product_id, image_path)
);

ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;


create policy "Enable read access for all users"
on public.product_images as permissive
for select
to public
using (true);

create policy "Enable insert for authenticated users only"
on public.product_images as permissive
for insert
to authenticated
with check (
      public.has_role_for_product(product_id, 'owner'::account_role) = true
);

create policy "Enable delete only for owners"
on public.product_images as permissive
for delete
to public
using (
      public.has_role_for_product(product_id, 'owner'::account_role) = true
);

CREATE POLICY "Give owners access to product images folder" ON storage.objects 
as permissive
for all
to authenticated
USING (
    bucket_id = 'product-images'
    AND (public.has_role_for_product((storage.foldername(name))[1]::uuid, 'owner'::account_role) = true)
); 

INSERT INTO storage.buckets ("id", "name", "public", "allowed_mime_types") VALUES
	('product-images', 'product-images', true, '{image/*}');

