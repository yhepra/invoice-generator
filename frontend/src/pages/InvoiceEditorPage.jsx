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

  return (
    <InvoiceEditor
      {...invoiceApi}
      user={user}
      onSave={onSave}
      onDownload={onDownload}
    />
  );
}
