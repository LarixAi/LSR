-- Update the document types to show proper file extensions instead of generic "PDF"
UPDATE documents 
SET type = 
  CASE 
    WHEN file_path LIKE '%.pdf' THEN 'PDF'
    WHEN file_path LIKE '%.doc%' THEN 'DOC'  
    WHEN file_path LIKE '%.xls%' THEN 'XLS'
    ELSE type
  END,
-- Also update the file_path to be accessible from public directory
file_path = 
  CASE
    WHEN file_path LIKE '/forms/%' THEN '/forms/' || SUBSTRING(file_path FROM '/forms/(.*)$')
    ELSE file_path
  END
WHERE organization_id = '00000000-0000-0000-0000-000000000001';