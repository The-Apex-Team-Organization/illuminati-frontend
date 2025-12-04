import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RecordsBackupRestore from "../../src/pages/RecordsBackupRestore";
import { vi } from "vitest";

vi.mock("../../src/components/Navbar", () => ({
  default: () => <div>Mock Navbar</div>,
}));

import * as api from "../../src/api";
vi.mock("../../src/api");

describe("RecordsBackupRestore Unit Tests", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    globalThis.URL.createObjectURL = vi.fn(() => "mock-url");
    globalThis.URL.revokeObjectURL = vi.fn();
  });

  test("renders text 'Backup your sensitive data'", () => {
    render(<RecordsBackupRestore />);
    expect(screen.getByText(/Backup your sensitive data/i)).toBeTruthy();
  });
});

test("downloads backup and shows success message", async () => {
  api.downloadRecordsBackup.mockResolvedValueOnce("fake-blob");

  render(<RecordsBackupRestore />);
  fireEvent.click(screen.getByText(/Download Backup/i));

  await waitFor(() =>
    expect(screen.getByText(/Backup downloaded successfully/i)).toBeTruthy(),
  );
});
