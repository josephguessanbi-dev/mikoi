-- Add unique constraint on payment_reference to prevent duplicate processing
CREATE UNIQUE INDEX IF NOT EXISTS idx_points_transactions_payment_reference 
ON public.points_transactions(payment_reference) 
WHERE payment_reference IS NOT NULL;

-- Fix storage policy: restrict uploads to user's own folder and validate file extensions
DROP POLICY IF EXISTS "Authenticated users can upload property images" ON storage.objects;

CREATE POLICY "Authenticated users can upload property images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'property-images' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND lower(storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'gif', 'webp')
);

-- Also ensure users can only update/delete their own files
DROP POLICY IF EXISTS "Authenticated users can update their own images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete their own images" ON storage.objects;

CREATE POLICY "Authenticated users can update their own images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'property-images' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Authenticated users can delete their own images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'property-images' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);