"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { getRequestsBySection } from "@/api/request/getRequestBySection";
import { getRequestsByUser } from "@/api/request/getRequestByUser";
import { useAuth } from "@/providers/AuthProvider";

const RequestsContext = createContext({
  requests: [],
  loading: true,
  refetch: () => {},
});

export const RequestsProvider = ({ children }: any) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const subscribe = () => {
    if (!user) return;

    setLoading(true);
    let unsubscribe: any;

    if (user.isAdmin === true) {
      unsubscribe = getRequestsBySection(
        user.section,
        (data: React.SetStateAction<never[]>) => {
          setRequests(data);
          setLoading(false);
        }
      );
    } else {
      unsubscribe = getRequestsByUser(
        user.id,
        (data: React.SetStateAction<never[]>) => {
          setRequests(data);
          setLoading(false);
        }
      );
    }

    return unsubscribe;
  };

  useEffect(() => {
    const unsub = subscribe();
    return () => unsub && unsub();
  }, [user]);

  return (
    <RequestsContext.Provider
      value={{
        requests,
        loading,
        refetch: () => subscribe(),
      }}
    >
      {children}
    </RequestsContext.Provider>
  );
};

export const useRequests = () => useContext(RequestsContext);
