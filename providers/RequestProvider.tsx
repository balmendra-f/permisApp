"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { getRequestsBySection } from "@/api/request/getRequestBySection";
import { getRequestsByUser } from "@/api/request/getRequestByUser";
import { useAuth } from "@/providers/AuthProvider";

interface RequestsContextType {
  requests: any[];
  loading: boolean;
  onlyUserRequests: boolean; // NUEVO: indica si solo trae requests del user
  refetch: () => void;
}

const RequestsContext = createContext<RequestsContextType>({
  requests: [],
  loading: true,
  onlyUserRequests: false,
  refetch: () => {},
});

interface RequestsProviderProps {
  children: React.ReactNode;
  onlyUserRequests?: boolean; // flag opcional
}

export const RequestsProvider = ({
  children,
  onlyUserRequests = false,
}: RequestsProviderProps) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const subscribe = () => {
    if (!user) return;

    setLoading(true);
    let unsubscribe: any;

    if (onlyUserRequests) {
      // Siempre trae requests del usuario
      unsubscribe = getRequestsByUser(user.id, (data: any) => {
        setRequests(data);
        setLoading(false);
      });
    } else if (user.isAdmin === true) {
      unsubscribe = getRequestsBySection(user.section, (data: any) => {
        setRequests(data);
        setLoading(false);
      });
    } else {
      unsubscribe = getRequestsByUser(user.id, (data: any) => {
        setRequests(data);
        setLoading(false);
      });
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
        onlyUserRequests, // agregamos al context
        refetch: () => subscribe(),
      }}
    >
      {children}
    </RequestsContext.Provider>
  );
};

export const useRequests = () => useContext(RequestsContext);
