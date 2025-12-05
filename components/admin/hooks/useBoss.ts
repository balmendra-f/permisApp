import { useState } from "react";
import { useBossBySection } from "@/hooks/useRequests";

export const useBoss = (section?: string) => {
  const [chief, setChief] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { getBoss } = useBossBySection();

  const loadChief = async () => {
    if (!section) return;
    if (chief) return;
    try {
      setLoading(true);
      const data = await getBoss(section);
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
