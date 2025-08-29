
import { useMemo } from 'react';

interface Document {
  id: string;
  category?: string;
}

export const useDocumentFolders = (documents: Document[]) => {
  const folders = useMemo(() => {
    const folderSet = new Set<string>();
    documents.forEach(doc => {
      if (doc.category) {
        const folderName = doc.category.split(' - ')[0];
        if (folderName && folderName !== 'General') {
          folderSet.add(folderName);
        }
      }
    });
    return Array.from(folderSet).sort();
  }, [documents]);

  const documentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    documents.forEach(doc => {
      const folderName = doc.category?.split(' - ')[0] || 'General';
      counts[folderName] = (counts[folderName] || 0) + 1;
    });
    return counts;
  }, [documents]);

  return { folders, documentCounts };
};
