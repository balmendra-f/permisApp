import { app, db } from "@/firebase";
import { getAuth } from "firebase/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export const createRequest = async (solicitud: any) => {
  try {
    const auth = getAuth(app);
    const user = auth.currentUser;
    const userId = user?.uid;

    // 🔍 Debug para ver qué datos recibe la función
    console.log("📌 solicitud recibida:", solicitud);
    console.log("📌 userId:", userId);

    const dataToSave = {
      ...solicitud,
      userId,
      aproved: null,
      createdAt: serverTimestamp(),
    };

    // 🔍 Debug para ver EXACTAMENTE lo que se guardará en Firestore
    console.log("📌 datos finales que se guardan:", dataToSave);

    const docRef = await addDoc(collection(db, "solicitudes"), dataToSave);

    return docRef.id;
  } catch (error) {
    console.error("Error adding document: ", error);
    throw error;
  }
};
