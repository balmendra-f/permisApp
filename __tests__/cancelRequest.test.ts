import { cancelRequest } from "../api/request/cancelRequest";
import { deleteDoc, getDoc } from "firebase/firestore";

// Mock firebase
jest.mock("firebase/firestore", () => ({
  doc: jest.fn(),
  deleteDoc: jest.fn(),
  getDoc: jest.fn(),
  getFirestore: jest.fn(),
}));

jest.mock("@/firebase", () => ({
  db: {},
}));

describe("cancelRequest", () => {
  it("should cancel a pending request", async () => {
    // Mock getDoc to return a pending request
    (getDoc as jest.Mock).mockResolvedValue({
      exists: () => true,
      data: () => ({ status: "pending" }),
    });

    await cancelRequest("req123");

    expect(deleteDoc).toHaveBeenCalled();
  });

  it("should throw error if request is already approved", async () => {
    (getDoc as jest.Mock).mockResolvedValue({
      exists: () => true,
      data: () => ({ status: "approved" }),
    });

    await expect(cancelRequest("req123")).rejects.toThrow("No se puede cancelar una solicitud ya procesada.");
  });

   it("should throw error if request does not exist", async () => {
    (getDoc as jest.Mock).mockResolvedValue({
      exists: () => false,
    });

    await expect(cancelRequest("req123")).rejects.toThrow("La solicitud no existe.");
  });
});
