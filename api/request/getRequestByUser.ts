import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase";

export const getRequestsByUser = (userId: any, callback: any) => {
  const q = query(collection(db, "solicitudes"), where("userId", "==", userId));

  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
};
