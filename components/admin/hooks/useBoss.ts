import { useState } from "react";
import { getBossBySection } from "@/api/request/getBossBySection";

export const useBoss = (section?: string) => {
  const [chief, setChief] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const loadChief = async () => {
    if (!section) return;
    if (chief) return;
    try {
      setLoading(true);
      const data = await getBossBySection(section);
      setChief(data);
    } catch (error) {
      console.log("Error loading chief:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    chief,
    loading,
    loadChief,
  };
};
