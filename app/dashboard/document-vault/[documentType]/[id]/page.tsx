"use client";
import { use } from "react";
import { DocumentVaultViewer } from "@/components/student/document-vault/DocumentVaultViewer";

export default function DocumentVaultViewerPage({
  params,
}: {
  params: Promise<{ documentType: string; id: string }>;
}) {
  const { documentType, id } = use(params);
  return <DocumentVaultViewer documentType={documentType} id={id} />;
}
