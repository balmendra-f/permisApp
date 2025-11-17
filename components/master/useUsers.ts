import { useEffect, useState } from "react";
import { Alert } from "react-native";
import getUsers from "@/api/users/getUser";
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
    const fetchUsers = async () => {
      try {
        const data = await getUsers();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const toggleAdmin = async (userId: string, currentValue?: boolean) => {
    try {
      setProcessingIds((prev) => new Set(prev).add(userId));
      await updateUser(userId, { isAdmin: !currentValue });

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, isAdmin: !currentValue } : u
        )
      );

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
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
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
