import "@testing-library/jest-dom";
import PropTypes from "prop-types";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ProtectedHome from "../../src/pages/ProtectedHome";
import { describe, test, expect, vi } from "vitest";
import * as api from "../../src/api";

vi.mock("react-leaflet", () => {
  const MapContainer = ({ children }) => (
    <div data-testid="map">{children}</div>
  );
  MapContainer.propTypes = { children: PropTypes.node };

  const TileLayer = () => <div>TileLayer</div>;

  const Marker = ({ eventHandlers }) => (
    <button
      data-testid="marker"
      type="button"
      onClick={() => eventHandlers?.click?.()}
    >
      Marker
    </button>
  );
  Marker.propTypes = { eventHandlers: PropTypes.object };

  const useMapEvents = () => ({});

  return { MapContainer, TileLayer, Marker, useMapEvents };
});

vi.mock("../../src/components/Navbar", () => ({
  default: () => <div data-testid="navbar">Mock Navbar</div>,
}));

vi.mock("../../src/api", () => ({
  getAllRecords: vi.fn(() => Promise.resolve({ status: "OK", data: [] })),
  createRecord: vi.fn(),
  getRecordById: vi.fn(),
}));

vi.mock("../../src/auth", () => ({
  getUserRoles: vi.fn(() => ["GoldenMason"]),
}));

describe("ProtectedHome component", () => {
  test("renders Navbar and map", async () => {
    render(<ProtectedHome />);
    expect(await screen.findByTestId("navbar")).toBeInTheDocument();
    expect(await screen.findByTestId("map")).toBeInTheDocument();
  });

  test("fetches and displays records", async () => {
    const mockRecords = [
      { id: 1, x: 49.8, y: 24.1, name: "Record 1" },
      { id: 2, x: 49.9, y: 24.1, name: "Record 2" },
    ];
    api.getAllRecords.mockResolvedValueOnce({
      status: "OK",
      data: mockRecords,
    });

    render(<ProtectedHome />);
    await waitFor(() => expect(api.getAllRecords).toHaveBeenCalled());
  });

  test("shows form after map click if user can create", async () => {
    render(<ProtectedHome />);
    const map = await screen.findByTestId("map");

    fireEvent.click(map);
    await waitFor(() =>
      expect(screen.getByText("Create Record")).toBeInTheDocument(),
    );
  });

  test("clicking marker shows record details", async () => {
    const mockRecord = {
      id: 1,
      x: 49.8,
      y: 24.1,
      name: "Record 1",
      type: "UFO",
      description: "desc",
      additional_info: "info",
    };
    api.getAllRecords.mockResolvedValueOnce({
      status: "OK",
      data: [mockRecord],
    });
    api.getRecordById.mockResolvedValueOnce({ status: "OK", data: mockRecord });

    render(<ProtectedHome />);
    await waitFor(() => expect(api.getAllRecords).toHaveBeenCalled());

    const marker = await screen.findByTestId("marker");
    fireEvent.click(marker);

    await waitFor(() =>
      expect(screen.getByText("Record Details")).toBeInTheDocument(),
    );
    expect(screen.getByText("Record 1")).toBeInTheDocument();
  });

  test("fills and submits create record form", async () => {
    const mockRecord = { id: 1, x: 49.8, y: 24.1, name: "Record 1" };
    api.createRecord.mockResolvedValueOnce({ status: "OK", data: mockRecord });

    render(<ProtectedHome />);
    fireEvent.click(await screen.findByTestId("map"));

    fireEvent.change(screen.getByPlaceholderText("Name"), {
      target: { value: "Record 1" },
    });
    fireEvent.change(screen.getByPlaceholderText("Latitude (x)"), {
      target: { value: 49.8 },
    });
    fireEvent.change(screen.getByPlaceholderText("Longitude (y)"), {
      target: { value: 24.1 },
    });
    fireEvent.change(screen.getByPlaceholderText("Type"), {
      target: { value: "UFO" },
    });
    fireEvent.change(screen.getByPlaceholderText("Description"), {
      target: { value: "desc" },
    });
    fireEvent.change(screen.getByPlaceholderText("Additional info"), {
      target: { value: "info" },
    });

    fireEvent.submit(screen.getByRole("button", { name: /Save/i }));
    await waitFor(() => expect(api.createRecord).toHaveBeenCalled());
  });

  test("handles API error on load", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    api.getAllRecords.mockRejectedValueOnce(new Error("Network error"));

    render(<ProtectedHome />);
    await waitFor(() => expect(consoleError).toHaveBeenCalled());
    consoleError.mockRestore();
  });
});
