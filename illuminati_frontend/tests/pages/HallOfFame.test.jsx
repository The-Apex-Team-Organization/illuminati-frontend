import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import HallOfFame from "../../src/pages/HallOfFame";

vi.mock("../../src/components/Navbar", () => ({
  default: () => <div>Mock Navbar</div>,
}));

import * as api from "../../src/api";
vi.mock("../../src/api");

describe("HallOfFame Unit Tests", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test("renders Hall of Fame title and form", async () => {
    api.getHallOfFame.mockResolvedValueOnce({
      data: [{ id: 1, username: "Architect1" }],
    });

    render(<HallOfFame />);

    expect(screen.getByText(/Hall of Fame/i)).toBeTruthy();
    expect(screen.getByText("Mock Navbar")).toBeTruthy();

    await waitFor(() => expect(api.getHallOfFame).toHaveBeenCalledTimes(1));
  });

  test("loads architects and populates select options", async () => {
    api.getHallOfFame.mockResolvedValueOnce({
      data: [
        { id: 1, username: "Architect1" },
        { id: 2, username: "Architect2" },
      ],
    });

    render(<HallOfFame />);

    await waitFor(() => {
      expect(screen.getByText("Architect1")).toBeTruthy();
      expect(screen.getByText("Architect2")).toBeTruthy();
    });
  });

  test("sends message successfully", async () => {
    api.getHallOfFame.mockResolvedValueOnce({
      data: [{ id: 1, username: "Architect1" }],
    });
    api.sendHallOfFameMessage.mockResolvedValueOnce({});

    render(<HallOfFame />);

    await waitFor(() => screen.getByText("Architect1"));

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "1" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Write your message/i), {
      target: { value: "Hello Architect!" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Send Message/i }));

    await waitFor(() =>
      expect(api.sendHallOfFameMessage).toHaveBeenCalledWith(
        "1",
        "Hello Architect!",
      ),
    );

    await waitFor(() =>
      expect(screen.getByText(/Message sent successfully/i)).toBeTruthy(),
    );
  });

  test("shows error message when sending fails", async () => {
    api.getHallOfFame.mockResolvedValueOnce({
      data: [{ id: 1, username: "Architect1" }],
    });
    api.sendHallOfFameMessage.mockRejectedValueOnce(new Error("fail"));

    render(<HallOfFame />);

    await waitFor(() => screen.getByText("Architect1"));

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "1" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Write your message/i), {
      target: { value: "Hello Architect!" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Send Message/i }));

    await waitFor(() =>
      expect(screen.getByText(/Failed to send message/i)).toBeTruthy(),
    );
  });
});
