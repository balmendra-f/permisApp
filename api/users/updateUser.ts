import { db } from "../../firebase";
import { doc, updateDoc } from "firebase/firestore";

const updateUser = async (userId: string, data: Record<string, any>) => {
  try {
    console.log("=== Iniciando actualización de usuario ===");
    console.log("userId:", userId);
    console.log("data a actualizar:", JSON.stringify(data, null, 2));

    if (!userId || typeof userId !== "string") {
      throw new Error("userId inválido");
    }

    if (!data || Object.keys(data).length === 0) {
      throw new Error("No hay datos para actualizar");
    }

    const userRef = doc(db, "users", userId);
    console.log("Referencia creada:", userRef.path);

    await updateDoc(userRef, data);

    console.log("✅ Usuario actualizado correctamente");
    console.log("=== Fin actualización ===");
    return true;
  } catch (error) {
    console.error("❌ Error al actualizar el usuario:");
    console.error("Tipo de error:", error?.constructor?.name);
    //console.error("Mensaje:", error?.message || error);
    //console.error("Stack:", error?.stack);
    return false;
  }
};

export default updateUser;
