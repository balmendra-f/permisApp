import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase";

export function useUserRealtime(user: User | null) {
  const [userData, setUserData] = useState<User | null>(user);

  useEffect(() => {
    if (!user) return;

    const ref = doc(db, "users", user.id);

    const unsubscribe = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setUserData(snap.data() as User);
      }
    });

    return () => unsubscribe();
  }, [user]);

  return userData;
}
