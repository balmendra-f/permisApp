import { app, db } from "@/firebase";
import { getAuth } from "firebase/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export const createRequest = async (solicitud: any) => {
  try {
    const auth = getAuth(app);
    const user = auth.currentUser;
    const userId = user?.uid;
    const dataToSave = {
      ...solicitud,
      userId,
      aproved: null,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "solicitudes"), dataToSave);

    return docRef.id;
  } catch (error) {
    console.error("Error adding document: ", error);
    throw error;
  }
};
