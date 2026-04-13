import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import InvoiceEditor from "./Home";

export default function InvoiceEditorPage({
  invoiceApi,
  onLoadInvoice,
  onResetInvoice,
  user,
  onSave,
  onDownload,
  onSendEmail,
  isSaving,
}) {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      onLoadInvoice(id).catch((err) => {
        console.error(err);
        navigate("/create");
      });
    } else {
      onResetInvoice();
    }
  }, [id, onLoadInvoice, onResetInvoice, navigate]);

  useEffect(() => {
    const onKeyDown = (e) => {
      const key = String(e.key || "").toLowerCase();
      if (key !== "s") return;
      if (!e.ctrlKey && !e.metaKey) return;
      if (e.altKey) return;

      e.preventDefault();
      if (e.repeat) return;
      if (isSaving) return;
      if (typeof onSave !== "function") return;

      onSave(true);
    };

    window.addEventListener("keydown", onKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", onKeyDown, { capture: true });
  }, [onSave, isSaving]);

  return (
    <InvoiceEditor
      {...invoiceApi}
      user={user}
      onSave={onSave}
      onDownload={onDownload}
      onSendEmail={onSendEmail}
      isSaving={isSaving}
    />
  );
}
