import { db } from "../../firebase";
import { doc, updateDoc } from "firebase/firestore";

const updateUser = async (userId: string, data: Record<string, any>) => {
  try {
    if (!userId || typeof userId !== "string") {
      throw new Error("userId inválido");
    }

    if (!data || Object.keys(data).length === 0) {
      throw new Error("No hay datos para actualizar");
    }

    const userRef = doc(db, "users", userId);

    await updateDoc(userRef, data);

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export default updateUser;
