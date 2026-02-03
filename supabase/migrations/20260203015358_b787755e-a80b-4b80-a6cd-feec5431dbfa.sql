-- Create site_settings table for storing configurable site options
CREATE TABLE public.site_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value text,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can view settings (for public display like hero image)
CREATE POLICY "Anyone can view site settings"
  ON public.site_settings
  FOR SELECT
  USING (true);

-- Only admins can manage settings
CREATE POLICY "Admins can manage site settings"
  ON public.site_settings
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default hero image setting
INSERT INTO public.site_settings (key, value)
VALUES ('hero_image', NULL);

-- Create storage bucket for site assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for site-assets bucket
CREATE POLICY "Anyone can view site assets"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'site-assets');

CREATE POLICY "Admins can upload site assets"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'site-assets' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update site assets"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'site-assets' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete site assets"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'site-assets' AND has_role(auth.uid(), 'admin'::app_role));