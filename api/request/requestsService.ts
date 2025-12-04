import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase";

export const listenRequestsByUser = (
  userId: string,
  callback: (data: any[]) => void
) => {
  const q = query(collection(db, "solicitudes"), where("userId", "==", userId));

  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(data);
  });
};
