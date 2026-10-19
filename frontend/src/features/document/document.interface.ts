export interface PdfDocument {
  id: string;
  name: string;
  filename: string;
  description: string;
  pages: number;
  page: number;
  date: string;
  size: string;
  color: string;
  analyzed: boolean;
  deleted: boolean;
  sessionIds: string[];
}
