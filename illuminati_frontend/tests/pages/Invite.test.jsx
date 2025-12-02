import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Invite from "../../src/pages/Invite";
import { vi } from "vitest";

vi.mock("../../src/components/Navbar", () => ({
  default: () => <div>Mock Navbar</div>,
}));

import * as api from "../../src/api";
vi.mock("../../src/api");

import * as auth from "../../src/auth";
vi.mock("../../src/auth");

describe("Invite Page Unit Tests", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    auth.getAuthToken.mockReturnValue("fake-token");
  });

  test("renders the invite form", () => {
    render(<Invite />);
    expect(screen.getByText(/Send Invitation/i)).toBeTruthy();
    expect(screen.getByPlaceholderText("user@example.com")).toBeTruthy();
    expect(screen.getByText(/Send Invite/i)).toBeTruthy();
  });

  test("updates email input value", () => {
    render(<Invite />);
    const input = screen.getByPlaceholderText("user@example.com");
    fireEvent.change(input, { target: { value: "test@example.com" } });
    expect(input.value).toBe("test@example.com");
  });

  test("disables submit button when email is empty or loading", async () => {
    render(<Invite />);
    const input = screen.getByPlaceholderText("user@example.com");
    const button = screen.getByText(/Send Invite/i);

    expect(button.disabled).toBe(true);

    fireEvent.change(input, { target: { value: "test@example.com" } });
    expect(button.disabled).toBe(false);

    api.sendInvite.mockImplementation(() => new Promise(() => {}));
    fireEvent.click(button);
    expect(button.disabled).toBe(true);

    expect(button.textContent).toBe("Sending...");
  });

  test("shows success message after successful invitation", async () => {
    api.sendInvite.mockResolvedValueOnce({});
    render(<Invite />);
    const input = screen.getByPlaceholderText("user@example.com");
    fireEvent.change(input, { target: { value: "test@example.com" } });

    fireEvent.click(screen.getByText(/Send Invite/i));

    await waitFor(() =>
      expect(
        screen.getByText(
          /If this person can be invited, they’ll receive an email shortly./i,
        ),
      ).toBeTruthy(),
    );
  });

  test("handles 409 status as success", async () => {
    api.sendInvite.mockRejectedValueOnce({ response: { status: 409 } });
    render(<Invite />);
    const input = screen.getByPlaceholderText("user@example.com");
    fireEvent.change(input, { target: { value: "test@example.com" } });

    fireEvent.click(screen.getByText(/Send Invite/i));

    await waitFor(() =>
      expect(
        screen.getByText(
          /If this person can be invited, they’ll receive an email shortly./i,
        ),
      ).toBeTruthy(),
    );
  });

  test("shows error message for other failures", async () => {
    api.sendInvite.mockRejectedValueOnce({ response: { status: 500 } });
    render(<Invite />);
    const input = screen.getByPlaceholderText("user@example.com");
    fireEvent.change(input, { target: { value: "test@example.com" } });

    fireEvent.click(screen.getByText(/Send Invite/i));

    await waitFor(() =>
      expect(
        screen.getByText(
          /Invitation could not be processed at this time. Please try again later./i,
        ),
      ).toBeTruthy(),
    );
  });
});
