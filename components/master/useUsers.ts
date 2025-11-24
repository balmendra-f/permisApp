import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { db } from "@/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import updateUser from "@/api/users/updateUser";

interface User {
  id: string;
  name?: string;
  email?: string;
  section?: string;
  isAdmin?: boolean;
}

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // 🔥 Listener en tiempo real
    const unsubscribe = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as User[];

        setUsers(data);
        setLoading(false);
      },
      (error) => {
        console.error("Error al escuchar usuarios:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const toggleAdmin = async (userId: string, currentValue?: boolean) => {
    try {
      setProcessingIds((prev) => new Set(prev).add(userId));
      await updateUser(userId, { isAdmin: !currentValue });

      Alert.alert(
        "Actualizado",
        !currentValue
          ? "Este usuario ahora es administrador."
          : "Este usuario ya no es administrador."
      );
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      Alert.alert("Error", "No se pudo actualizar el usuario.");
    } finally {
      setProcessingIds((prev) => {
        const n = new Set(prev);
        n.delete(userId);
        return n;
      });
    }
  };

  return {
    users,
    loading,
    processingIds,
    toggleAdmin,
  };
};
