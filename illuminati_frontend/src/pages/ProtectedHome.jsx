import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Navbar from "../components/Navbar";
import { getUserRoles } from "../auth";
import {
  getAllRecords,
  createRecord,
  getRecordById,
  likeRecord,
  unlikeRecord,
} from "../api";

export default function ProtectedHome() {
  const [records, setRecords] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    x: "",
    y: "",
    type: "",
    description: "",
    additional_info: "",
    img_file: null,
  });
  const [showForm, setShowForm] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);

  const userRoles = getUserRoles();
  const canCreate = ["GoldMason", "SilverMason", "Architect"].some((role) =>
    userRoles.includes(role),
  );

  useEffect(() => {
    async function loadRecords() {
      try {
        const res = await getAllRecords();
        if (res.status === "OK") {
          setRecords(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch records:", err);
      }
    }
    loadRecords();
  }, []);

  function handleMapClick(latlng) {
    if (!canCreate) return;
    setFormData((prev) => ({ ...prev, x: latlng.lat, y: latlng.lng }));
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const form = new FormData();
    form.append("name", formData.name);
    form.append("x", formData.x);
    form.append("y", formData.y);
    form.append("type", formData.type);
    form.append("description", formData.description);
    form.append("additional_info", formData.additional_info);
    if (formData.img_file) form.append("img", formData.img_file);

    try {
      const res = await createRecord(form);
      if (res.status === "OK") {
        setRecords((prev) => [...prev, res.data]);
        setShowForm(false);
        alert("Record created successfully!");
      } else {
        alert(res.notification || "Failed to create record");
      }
    } catch (err) {
      console.error(err);
      alert("Error creating record");
    }
  }

  function MapClickHandler() {
    useMapEvents({
      click(e) {
        handleMapClick(e.latlng);
      },
    });
    return null;
  }

  async function handleMarkerClick(id) {
    try {
      const res = await getRecordById(id);
      if (res.status === "OK") {
        setSelectedRecord(res.data);
        setShowDetailPanel(true);
      } else {
        alert(res.notification || "Failed to fetch record details");
      }
    } catch (err) {
      console.error(err);
      alert("Error fetching record details");
    }
  }

  return (
    <div className="page-home">
      <Navbar />
      <div className="map-card">
        <div
          className={`map-wrapper ${showForm || showDetailPanel ? "dimmed" : ""}`}
        >
          <MapContainer
            center={[49.8397, 24.0297]}
            zoom={13}
            scrollWheelZoom={true}
            className="map"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapClickHandler />
            {records.map((r) => (
              <Marker
                key={r.id}
                position={[r.x, r.y]}
                eventHandlers={{
                  click: () => handleMarkerClick(r.id),
                }}
              />
            ))}
          </MapContainer>

          <div
            className={`record-panel details-panel ${
              showDetailPanel ? "show" : ""
            }`}
            aria-hidden={!showDetailPanel}
          >
            <h2>Record Details</h2>

            {selectedRecord ? (
              <>
                <div className="record-details">
                  <div className="record-field">
                    <span className="label">Name:</span>
                    <span className="value">{selectedRecord.name}</span>
                  </div>

                  <div className="record-field">
                    <span className="label">Coordinates:</span>
                    <span className="value">
                      {selectedRecord.x}, {selectedRecord.y}
                    </span>
                  </div>

                  <div className="record-field">
                    <span className="label">Type:</span>
                    <span className="value">{selectedRecord.type}</span>
                  </div>

                  <div className="record-field">
                    <span className="label">Description:</span>
                    <p className="value">{selectedRecord.description}</p>
                  </div>

                  {selectedRecord.img_path && (
                    <div className="record-image">
                      <img
                        src={selectedRecord.img_path}
                        alt={selectedRecord.name}
                        className="details-image"
                      />
                    </div>
                  )}

                  <div className="record-field">
                    <span className="label">Additional info:</span>
                    <p className="value">{selectedRecord.additional_info}</p>
                  </div>
                  <div className="record-field likes">
                    <span className="label">Likes:</span>
                    <span className="value" style={{ marginRight: 8 }}>
                      {selectedRecord.likes_count ?? 0}
                    </span>

                    <button
                      className={`btn like-btn ${selectedRecord.liked_by_user ? "liked" : ""}`}
                      onClick={async () => {
                        try {
                          if (selectedRecord.liked_by_user) {
                            const res = await unlikeRecord(selectedRecord.id);
                            if (res.status === "OK") {
                              setSelectedRecord((prev) => ({
                                ...prev,
                                liked_by_user: false,
                                likes_count: res.data.likes_count,
                              }));
                              setRecords((prev) =>
                                prev.map((r) =>
                                  r.id === selectedRecord.id
                                    ? {
                                        ...r,
                                        likes_count: res.data.likes_count,
                                      }
                                    : r,
                                ),
                              );
                            } else {
                              alert(res.notification || "Failed to unlike");
                            }
                          } else {
                            const res = await likeRecord(selectedRecord.id);
                            if (res.status === "OK") {
                              setSelectedRecord((prev) => ({
                                ...prev,
                                liked_by_user: true,
                                likes_count: res.data.likes_count,
                              }));
                              setRecords((prev) =>
                                prev.map((r) =>
                                  r.id === selectedRecord.id
                                    ? {
                                        ...r,
                                        likes_count: res.data.likes_count,
                                      }
                                    : r,
                                ),
                              );
                            } else {
                              alert(res.notification || "Failed to like");
                            }
                          }
                        } catch (err) {
                          console.error(err);
                          alert("Network error while updating like");
                        }
                      }}
                    >
                      {selectedRecord.liked_by_user ? "Liked" : "Like"}
                    </button>
                  </div>
                </div>

                <button
                  className="btn btn-secondary close-btn"
                  onClick={() => setShowDetailPanel(false)}
                >
                  Close
                </button>
              </>
            ) : (
              <p>Loading details...</p>
            )}
          </div>

          <div className={`record-panel ${showForm ? "show" : ""}`}>
            <h2>Create Record</h2>
            <form className="form" onSubmit={handleSubmit}>
              <input
                placeholder="Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />

              <div className="coord-inputs">
                <input
                  type="number"
                  step="0.000001"
                  placeholder="Latitude (x)"
                  value={formData.x}
                  onChange={(e) =>
                    setFormData({ ...formData, x: e.target.value })
                  }
                  required
                />
                <input
                  type="number"
                  step="0.000001"
                  placeholder="Longitude (y)"
                  value={formData.y}
                  onChange={(e) =>
                    setFormData({ ...formData, y: e.target.value })
                  }
                  required
                />
              </div>

              <input
                list="types"
                placeholder="Type"
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                required
              />
              <datalist id="types">
                <option value="UFO" />
                <option value="BIGFOOT" />
                <option value="Ghost" />
                <option value="Other" />
              </datalist>

              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />

              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setFormData({ ...formData, img_file: e.target.files[0] })
                }
                required
              />

              <input
                placeholder="Additional info"
                value={formData.additional_info}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    additional_info: e.target.value,
                  })
                }
              />

              <div style={{ marginTop: "10px", display: "flex", gap: "8px" }}>
                <button type="submit" className="btn btn-success">
                  Save
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
