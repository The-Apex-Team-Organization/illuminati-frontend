import React, { useState } from "react";
import Navbar from "../components/Navbar";
import { downloadRecordsBackup, restoreRecordsBackup } from "../api";

export default function RecordsBackupRestore() {
  const [message, setMessage] = useState("");

  const handleDownload = async () => {
    try {
      const blob = await downloadRecordsBackup();
      const url = globalThis.URL.createObjectURL(new Blob([blob]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "records_backup.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      globalThis.URL.revokeObjectURL(url);
      setMessage("Backup downloaded successfully");
    } catch (error) {
      setMessage(`Download error: ${error.message}`);
    }
  };

  const handleRestore = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const result = await restoreRecordsBackup(data);
      setMessage(`Success: ${result.count} records restored`);
    } catch (error) {
      setMessage(`Restore error: ${error.message}`);
    }
  };

  return (
    <div className="page-backup">
      <Navbar />

      <div
        className="content"
        style={{ paddingTop: "80px", textAlign: "center" }}
      >
        <p style={{ fontSize: "18px", marginBottom: "20px" }}>
          Backup your sensitive data
        </p>

        <button onClick={handleDownload} className="nav-btn">
          Download Backup
        </button>

        <div style={{ marginTop: "30px" }}>
          <p style={{ fontSize: "18px", marginBottom: "10px" }}>
            Select a backup file to restore your data:
          </p>

          <label htmlFor="file-upload" className="nav-btn">
            Upload Backup
          </label>

          <input
            id="file-upload"
            type="file"
            onChange={handleRestore}
            style={{ display: "none" }}
          />
        </div>

        {message && <p style={{ marginTop: "15px" }}>{message}</p>}
      </div>
    </div>
  );
}
