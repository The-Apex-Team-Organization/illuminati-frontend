import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import axios from "axios";

vi.mock("axios");
vi.mock("../src/auth", () => ({
  getAuthToken: vi.fn(),
}));

describe("API Client", () => {
  let mockAxiosInstance;

  beforeEach(async () => {
    mockAxiosInstance = {
      get: vi.fn(),
      post: vi.fn(),
    };

    axios.create.mockReturnValue(mockAxiosInstance);

    vi.resetModules();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("verifyEntryPassword", () => {
    it("should verify entry password successfully", async () => {
      const { verifyEntryPassword } = await import("../src/api");
      const mockResponse = { data: { success: true } };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await verifyEntryPassword("test-password");

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        "/api/authentific/entry/",
        { password: "test-password" },
      );
      expect(result).toEqual(mockResponse.data);
    });

    it("should handle verification failure", async () => {
      const { verifyEntryPassword } = await import("../src/api");
      mockAxiosInstance.post.mockRejectedValue(new Error("Invalid password"));

      await expect(verifyEntryPassword("wrong-password")).rejects.toThrow(
        "Invalid password",
      );
    });
  });

  describe("login", () => {
    it("should login user successfully", async () => {
      const { login } = await import("../src/api");
      const mockResponse = { data: { token: "abc123", user: { id: 1 } } };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await login("user@example.com", "password123");

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        "/api/authentific/login/",
        { email: "user@example.com", password: "password123" },
      );
      expect(result).toEqual(mockResponse.data);
    });

    it("should handle login error", async () => {
      const { login } = await import("../src/api");
      mockAxiosInstance.post.mockRejectedValue(new Error("Unauthorized"));

      await expect(login("user@example.com", "wrong")).rejects.toThrow(
        "Unauthorized",
      );
    });
  });

  describe("register", () => {
    it("should register user successfully", async () => {
      const { register } = await import("../src/api");
      const mockResponse = { data: { success: true, userId: 1 } };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await register("testuser", "test@example.com", "pass123");

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        "/api/authentific/register/",
        {
          username: "testuser",
          email: "test@example.com",
          password: "pass123",
        },
      );
      expect(result).toEqual(mockResponse.data);
    });

    it("should handle registration error", async () => {
      const { register } = await import("../src/api");
      mockAxiosInstance.post.mockRejectedValue(
        new Error("Email already exists"),
      );

      await expect(
        register("user", "test@example.com", "pass"),
      ).rejects.toThrow("Email already exists");
    });
  });

  describe("getAllRecords", () => {
    it("should fetch all records successfully", async () => {
      const { getAllRecords } = await import("../src/api");
      const mockRecords = { data: [{ id: 1 }, { id: 2 }] };
      mockAxiosInstance.get.mockResolvedValue(mockRecords);

      const result = await getAllRecords();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith("/api/records/all");
      expect(result).toEqual(mockRecords.data);
    });

    it("should handle fetch error", async () => {
      const { getAllRecords } = await import("../src/api");
      mockAxiosInstance.get.mockRejectedValue(new Error("Network error"));

      await expect(getAllRecords()).rejects.toThrow("Network error");
    });
  });

  describe("createRecord", () => {
    it("should create record with multipart form data", async () => {
      const { createRecord } = await import("../src/api");
      const mockResponse = { data: { id: 1, success: true } };
      const formData = { title: "Test", file: new Blob() };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await createRecord(formData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        "/api/records/create",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      expect(result).toEqual(mockResponse.data);
    });

    it("should handle creation error", async () => {
      const { createRecord } = await import("../src/api");
      mockAxiosInstance.post.mockRejectedValue(new Error("Validation failed"));

      await expect(createRecord({})).rejects.toThrow("Validation failed");
    });
  });

  describe("getRecordById", () => {
    it("should fetch record with auth token", async () => {
      const auth = await import("../src/auth");
      auth.getAuthToken.mockReturnValue("token123");

      const { getRecordById } = await import("../src/api");
      const mockResponse = { data: { id: 1, title: "Test" } };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await getRecordById(1);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith("/api/records/1", {
        headers: { Authorization: "Bearer token123" },
      });
      expect(result).toEqual(mockResponse.data);
    });

    it("should fetch record without auth token", async () => {
      const auth = await import("../src/auth");
      auth.getAuthToken.mockReturnValue(null);

      const { getRecordById } = await import("../src/api");
      const mockResponse = { data: { id: 1, title: "Public" } };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await getRecordById(1);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith("/api/records/1", {
        headers: {},
      });
      expect(result).toEqual(mockResponse.data);
    });

    it("should handle fetch error", async () => {
      const auth = await import("../src/auth");
      auth.getAuthToken.mockReturnValue("token123");

      const { getRecordById } = await import("../src/api");
      mockAxiosInstance.get.mockRejectedValue(new Error("Not found"));

      await expect(getRecordById(999)).rejects.toThrow("Not found");
    });
  });

  describe("likeRecord", () => {
    it("should like a record successfully", async () => {
      const auth = await import("../src/auth");
      auth.getAuthToken.mockReturnValue("token123");

      const { likeRecord } = await import("../src/api");
      const mockResponse = { data: { liked: true } };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await likeRecord(1);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        "/api/records/1/like/",
        {},
        { headers: { Authorization: "Bearer token123" } },
      );
      expect(result).toEqual(mockResponse.data);
    });

    it("should handle like error", async () => {
      const auth = await import("../src/auth");
      auth.getAuthToken.mockReturnValue("token123");

      const { likeRecord } = await import("../src/api");
      mockAxiosInstance.post.mockRejectedValue(new Error("Already liked"));

      await expect(likeRecord(1)).rejects.toThrow("Already liked");
    });
  });

  describe("unlikeRecord", () => {
    it("should unlike a record successfully", async () => {
      const auth = await import("../src/auth");
      auth.getAuthToken.mockReturnValue("token123");

      const { unlikeRecord } = await import("../src/api");
      const mockResponse = { data: { liked: false } };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await unlikeRecord(1);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        "/api/records/1/unlike/",
        {},
        { headers: { Authorization: "Bearer token123" } },
      );
      expect(result).toEqual(mockResponse.data);
    });

    it("should handle unlike error", async () => {
      const auth = await import("../src/auth");
      auth.getAuthToken.mockReturnValue("token123");

      const { unlikeRecord } = await import("../src/api");
      mockAxiosInstance.post.mockRejectedValue(new Error("Not liked"));

      await expect(unlikeRecord(1)).rejects.toThrow("Not liked");
    });
  });

  describe("eraseAllRecords", () => {
    it("should erase all records successfully", async () => {
      const auth = await import("../src/auth");
      auth.getAuthToken.mockReturnValue("token123");

      const { eraseAllRecords } = await import("../src/api");
      const mockResponse = { data: { deleted: 10 } };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await eraseAllRecords();

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        "/api/records/erase",
        {},
        { headers: { Authorization: "Bearer token123" } },
      );
      expect(result).toEqual(mockResponse.data);
    });

    it("should handle erase error", async () => {
      const auth = await import("../src/auth");
      auth.getAuthToken.mockReturnValue("token123");

      const { eraseAllRecords } = await import("../src/api");
      mockAxiosInstance.post.mockRejectedValue(new Error("Forbidden"));

      await expect(eraseAllRecords()).rejects.toThrow("Forbidden");
    });
  });

  describe("downloadRecordsBackup", () => {
    it("should download backup as blob", async () => {
      const { downloadRecordsBackup } = await import("../src/api");
      const mockBlob = new Blob(["backup data"]);
      const mockResponse = { data: mockBlob };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await downloadRecordsBackup();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        "/api/snapshot/download/",
        { responseType: "blob" },
      );
      expect(result).toBe(mockBlob);
    });

    it("should handle download error", async () => {
      const { downloadRecordsBackup } = await import("../src/api");
      mockAxiosInstance.get.mockRejectedValue(new Error("Server error"));

      await expect(downloadRecordsBackup()).rejects.toThrow("Server error");
    });
  });

  describe("restoreRecordsBackup", () => {
    it("should restore backup successfully", async () => {
      const { restoreRecordsBackup } = await import("../src/api");
      const mockResponse = { data: { restored: true, count: 5 } };
      const backupData = new FormData();
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await restoreRecordsBackup(backupData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        "/api/snapshot/upload/",
        backupData,
      );
      expect(result).toEqual(mockResponse.data);
    });

    it("should handle restore error", async () => {
      const { restoreRecordsBackup } = await import("../src/api");
      mockAxiosInstance.post.mockRejectedValue(new Error("Invalid backup"));

      await expect(restoreRecordsBackup(new FormData())).rejects.toThrow(
        "Invalid backup",
      );
    });
  });

  describe("axios client configuration", () => {
    it("should create axios instance with correct config", async () => {
      await import("../src/api");

      expect(axios.create).toHaveBeenCalledWith({
        baseURL: "http://localhost:8000",
        timeout: 5000,
      });
    });
  });
});
