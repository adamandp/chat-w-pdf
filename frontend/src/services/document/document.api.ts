import { axiosInstance as http } from "@/lib/axios";
import { endpoints as e } from "../endpoints";
import type { PdfDocument } from "@/features/document/document.interface";

export const documentApi = {
  documents: async (deleted = false) =>
    (await http.get<PdfDocument[]>(e.documents, { params: { deleted } })).data,
  sessionDocuments: async (id: string) =>
    (await http.get<PdfDocument[]>(`${e.sessions}/${id}/documents`)).data,
};
