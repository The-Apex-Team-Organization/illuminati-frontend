import "@testing-library/jest-dom";
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import Vote from "../../src/pages/Vote";
import * as api from "../../src/api";

vi.mock("../../src/components/Navbar", () => ({
  default: () => <div data-testid="navbar">Mock Navbar</div>,
}));

vi.mock("../../src/auth", () => ({
  getAuthToken: vi.fn(() => "mockToken"),
}));

vi.mock("../../src/api", () => ({
  getVotes: vi.fn(),
  sendVote: vi.fn(),
  checkPromotePermission: vi.fn(),
  checkBanPermission: vi.fn(),
  promoteUser: vi.fn(),
  banUser: vi.fn(),
}));

describe("Vote component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("handles API error during vote fetching", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    api.getVotes.mockRejectedValueOnce(new Error("Network error"));
    api.checkPromotePermission.mockResolvedValueOnce({ status: "FAIL" });
    api.checkBanPermission.mockResolvedValueOnce({ status: "FAIL" });

    render(<Vote />);
    expect(
      await screen.findByText("Failed to fetch votes"),
    ).toBeInTheDocument();
    consoleError.mockRestore();
  });

  test("calls sendVote when Agree button clicked", async () => {
    const mockVotes = [{ id: 1, name: "Vote 1", percent: 10 }];
    api.getVotes.mockResolvedValueOnce({ status: "OK", data: mockVotes });
    api.checkPromotePermission.mockResolvedValueOnce({ status: "FAIL" });
    api.checkBanPermission.mockResolvedValueOnce({ status: "FAIL" });
    api.sendVote.mockResolvedValueOnce({ status: "OK" });

    render(<Vote />);

    const agreeBtn = await screen.findByText("Agree");
    fireEvent.click(agreeBtn);

    await waitFor(() => {
      expect(api.sendVote).toHaveBeenCalledWith("mockToken", {
        id: 1,
        name: "Vote 1",
        choice: "AGREE",
      });
    });
  });

  test("shows error message when sendVote fails", async () => {
    const mockVotes = [{ id: 1, name: "Vote 1", percent: 10 }];
    api.getVotes.mockResolvedValueOnce({ status: "OK", data: mockVotes });
    api.checkPromotePermission.mockResolvedValueOnce({ status: "FAIL" });
    api.checkBanPermission.mockResolvedValueOnce({ status: "FAIL" });
    api.sendVote.mockResolvedValueOnce({
      status: "FAIL",
      notification: "Server issue",
    });

    render(<Vote />);

    const disagreeBtn = await screen.findByText("Disagree");
    fireEvent.click(disagreeBtn);

    expect(await screen.findByText(/Server error/i)).toBeInTheDocument();
  });

  test("calls promoteUser when Promote button clicked", async () => {
    api.getVotes.mockResolvedValueOnce({ status: "OK", data: [] });
    api.checkPromotePermission.mockResolvedValueOnce({ status: "OK" });
    api.checkBanPermission.mockResolvedValueOnce({ status: "FAIL" });
    api.promoteUser.mockResolvedValueOnce({ status: "OK" });

    render(<Vote />);

    const promoteBtn = await screen.findByText("Promote");
    fireEvent.click(promoteBtn);

    await waitFor(() => {
      expect(api.promoteUser).toHaveBeenCalled();
    });
  });

  test("shows message when Ban clicked without selecting user", async () => {
    api.getVotes.mockResolvedValueOnce({ status: "OK", data: [] });
    api.checkPromotePermission.mockResolvedValueOnce({ status: "FAIL" });
    api.checkBanPermission.mockResolvedValueOnce({
      status: "OK",
      data: [{ user_id: 1, username: "Alice" }],
    });

    render(<Vote />);

    const banBtn = await screen.findByText("Ban User");
    fireEvent.click(banBtn);

    expect(
      await screen.findByText("Please select a user to ban."),
    ).toBeInTheDocument();
  });
});
