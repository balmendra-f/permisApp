"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { getRequestsBySection } from "@/api/request/getRequestBySection";
import { useAuth } from "@/providers/AuthProvider";

export interface Request {
  updatedAt: any;
  id: string;
  userId: string;
  section: string;
  tipoPermiso: string;
  motivo: string;
  fechaInicio: any;
  fechaFin: any;
  isPending: boolean;
  aproved: boolean | null;
  createdAt: any;
  documento: any;
  username: string;
}

interface RequestsContextType {
  requests: Request[];
  loading: boolean;
  refetch: () => void; 
}

const RequestsContext = createContext<RequestsContextType>({
  requests: [],
  loading: true,
  refetch: () => {},
});

export const RequestsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user } = useAuth();
  const section = user?.section;

  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);


  const subscribe = () => {
    if (!section) return;
    setLoading(true);

    const unsubscribe = getRequestsBySection(section, (data) => {
      setRequests(data);
      setLoading(false);
    });

    return unsubscribe;
  };

  useEffect(() => {
    let unsubscribe: any;

    if (section) {
      unsubscribe = subscribe();
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [section]); 

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
