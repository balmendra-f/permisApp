import { db } from "@/firebase";
import { doc, deleteDoc, getDoc } from "firebase/firestore";

export const cancelRequest = async (requestId: string) => {
  try {
    const docRef = doc(db, "solicitudes", requestId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error("La solicitud no existe.");
    }

    const data = docSnap.data();
    if (data.status !== "pending") {
      throw new Error("No se puede cancelar una solicitud ya procesada.");
    }

    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Error cancelling request: ", error);
    throw error;
  }
};
