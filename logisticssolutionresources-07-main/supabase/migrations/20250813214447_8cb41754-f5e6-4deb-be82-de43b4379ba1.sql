-- Remove mock/demo documents from the documents table
DELETE FROM documents 
WHERE 
  file_path LIKE 'demo/%' 
  OR file_path = '' 
  OR file_path IS NULL
  OR (name = 'Document' AND category = 'policy')
  OR description IS NULL;