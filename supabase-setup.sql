-- Exécuter dans Supabase → SQL Editor après avoir créé le bucket "photos"

-- Lecture publique
CREATE POLICY "Lecture publique des photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'Photos-mariages');

-- Upload pour les invités
CREATE POLICY "Upload invités"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'Photos-mariages');
