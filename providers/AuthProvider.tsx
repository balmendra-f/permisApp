import {
  createContext,
  FC,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import getUserById from "../api/users/getUserById";
import { ActivityIndicator, View, Text } from "react-native";

const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log("👀 onAuthStateChanged:", currentUser?.uid);
      setIsLoading(true);

      if (!currentUser) {
        console.log("🚫 No hay usuario logueado");
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        const fetchedUser = await getUserById(currentUser.uid);
        console.log("🧠 Usuario obtenido:", fetchedUser);

        if (!fetchedUser) {
          console.warn(
            "⚠️ No se encontró el usuario en Firestore. Cerrando sesión..."
          );
          await auth.signOut();
          setUser(null);
          setIsAuthenticated(false);
        } else {
          setUser(fetchedUser as User);
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error("❌ Error obteniendo usuario:", err);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
        }}
      >
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10, color: "#666" }}>Cargando sesión...</Text>
      </View>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        isAuthenticated,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

function useAuth() {
  return useContext(AuthContext);
}

interface Context {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: User | null;
}

const initialContext = {
  isLoading: false,
  isAuthenticated: false,
  user: null,
};

const AuthContext = createContext<Context>(initialContext);

export { useAuth };

export default AuthProvider;
