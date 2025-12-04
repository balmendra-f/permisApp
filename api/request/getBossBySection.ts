import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/firebase";

export const getBossBySection = async (section: string) => {
  try {
    const q = query(
      collection(db, "users"),
      where("section", "==", section),
      where("isAdmin", "==", true)
    );

    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      return snapshot.docs[0].data();
    }

    return null;
  } catch (error) {
    console.error("Error fetching chief:", error);
    throw error;
  }
};
