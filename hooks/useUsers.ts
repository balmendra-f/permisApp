import { useState, useEffect } from 'react';
import createUserApi from '@/api/users/createUser.ts';
import updateUserApi from '@/api/users/updateUser';
import getUserByIdApi from '@/api/users/getUserById';
import getUsersApi from '@/api/users/getUser';
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase";
import { User } from '@/interfaces';

export const useCreateUser = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createUser = async (uid: string, data: any) => {
    setLoading(true);
    setError(null);
    try {
      await createUserApi(uid, data);
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { createUser, loading, error };
};

export const useUpdateUser = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateUser = async (userId: string, data: any) => {
    setLoading(true);
    setError(null);
    try {
      return await updateUserApi(userId, data);
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { updateUser, loading, error };
};

export const useGetUser = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getUser = async (userId: string) => {
        setLoading(true);
        setError(null);
        try {
            return await getUserByIdApi(userId);
        } catch (e: any) {
            setError(e.message);
            throw e;
        } finally {
            setLoading(false);
        }
    }

    return { getUser, loading, error };
}

export const useGetUsers = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            return await getUsersApi();
        } catch (e: any) {
            setError(e.message);
            throw e;
        } finally {
            setLoading(false);
        }
    }

    return { getUsers, loading, error };
}

export const useUserListener = (user: User | null) => {
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
    }, [user?.id]); // Depend on user ID

    return userData;
  };
