import { useState, useCallback } from 'react';
import { createRequest as createRequestApi } from '@/api/request/createRequest';
import { updateRequestById as updateRequestByIdApi } from '@/api/request/updateById';
import { cancelRequest as cancelRequestApi } from '@/api/request/cancelRequest';
import { getBossBySection as getBossBySectionApi } from '@/api/request/getBossBySection';
import { listenRequestsByUser as listenRequestsByUserApi } from '@/api/request/requestsService';
import { getRequestsByUser as getRequestsByUserApi } from '@/api/request/getRequestByUser';
import { getRequestsBySection as getRequestsBySectionApi } from '@/api/request/getRequestBySection';
import { getRequest as getRequestApi } from '@/api/request/getRequest';

export const useCreateRequest = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createRequest = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      await createRequestApi(data);
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { createRequest, loading, error };
};

export const useUpdateRequest = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateRequest = async (id: string, data: any) => {
    setLoading(true);
    setError(null);
    try {
      await updateRequestByIdApi(id, data);
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { updateRequest, loading, error };
};

export const useCancelRequest = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancelRequest = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await cancelRequestApi(id);
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { cancelRequest, loading, error };
};

export const useBossBySection = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getBoss = async (section: string) => {
    setLoading(true);
    setError(null);
    try {
      return await getBossBySectionApi(section);
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { getBoss, loading, error };
};

// For listeners, we usually want to use useEffect inside the component,
// but we can expose a hook that sets it up.
export const useRequestsListener = () => {
   // This might be tricky because the existing API returns an unsubscribe function
   // and takes a callback.
   // We can provide a wrapper.
   return {
     listenRequestsByUser: listenRequestsByUserApi,
     getRequestsByUser: getRequestsByUserApi,
     getRequestsBySection: getRequestsBySectionApi,
     getAllRequests: getRequestApi
   };
};
