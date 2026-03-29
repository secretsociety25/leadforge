import type { Metadata } from "next";

import { CsvUploadFlow } from "@/components/dashboard/csv-upload-flow";

export const metadata: Metadata = {
  title: "Upload CSV — LeadForge",
  description: "Map columns and import leads for AI email generation.",
};

export default function UploadPage() {
  return <CsvUploadFlow />;
}
