import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  authApi,
  clearAuthStorage,
  tokenStorage,
  userStorage,
} from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => userStorage.get());
  const [token, setToken] = useState(() => tokenStorage.get());
  const [loading, setLoading] = useState(true);

  const isAuthenticated = Boolean(token);

  /* ------------------------------------------------------------------------ */
  /* Normalize API response                                                   */
  /* ------------------------------------------------------------------------ */

  const extractAuthData = useCallback((response) => {
    const responseData = response?.data || response;

    const nestedData = responseData?.data || responseData;

    const receivedToken =
      responseData?.token ||
      responseData?.accessToken ||
      nestedData?.token ||
      nestedData?.accessToken ||
      response?.token ||
      response?.accessToken;

    const receivedUser =
      responseData?.user ||
      nestedData?.user ||
      response?.user ||
      null;

    return {
      token: receivedToken,
      user: receivedUser,
    };
  }, []);

  /* ------------------------------------------------------------------------ */
  /* Restore existing session                                                  */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    let mounted = true;

    const restoreSession = async () => {
      const storedToken = tokenStorage.get();
      const storedUser = userStorage.get();

      if (!storedToken) {
        if (mounted) {
          setLoading(false);
        }
        return;
      }

      try {
        /*
         * If your backend has /auth/me, this verifies the stored token.
         * If /auth/me does not exist, the stored user will be used.
         */
        const response = await authApi.me();

        const responseData = response?.data || response;
        const currentUser =
          responseData?.user ||
          responseData?.data?.user ||
          responseData?.data ||
          responseData;

        if (mounted) {
          setToken(storedToken);

          if (currentUser && typeof currentUser === "object") {
            setUser(currentUser);
            userStorage.set(currentUser);
          } else if (storedUser) {
            setUser(storedUser);
          }
        }
      } catch (error) {
        // A 401 during session restoration is expected when a saved token expires.
        // Avoid logging the Axios error object because it can contain request headers.
        if (error?.response?.status !== 401 && import.meta.env.DEV) {
          console.warn("Unable to verify the saved ProblemLens session.");
        }

        /*
         * If token verification fails, clear the invalid session.
         */
        if (error.response?.status === 401) {
          clearAuthStorage();

          if (mounted) {
            setToken(null);
            setUser(null);
          }
        } else if (mounted) {
          /*
           * Keep the session if the backend is temporarily unavailable.
           */
          setToken(storedToken);
          setUser(storedUser);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      mounted = false;
    };
  }, []);

  /* ------------------------------------------------------------------------ */
  /* Login                                                                    */
  /* ------------------------------------------------------------------------ */

  const login = useCallback(
    async (credentials) => {
      const response = await authApi.login(credentials);

      const { token: receivedToken, user: receivedUser } =
        extractAuthData(response);

      if (!receivedToken) {
        throw new Error(
          "Login succeeded but no authentication token was returned by the server."
        );
      }

      tokenStorage.set(receivedToken);

      if (receivedUser) {
        userStorage.set(receivedUser);
      }

      setToken(receivedToken);
      setUser(receivedUser || null);

      return {
        token: receivedToken,
        user: receivedUser,
        response,
      };
    },
    [extractAuthData]
  );

  /* ------------------------------------------------------------------------ */
  /* Register                                                                  */
  /* ------------------------------------------------------------------------ */

  const register = useCallback(
    async (payload) => {
      const response = await authApi.register(payload);

      const { token: receivedToken, user: receivedUser } =
        extractAuthData(response);

      /*
       * Some backends register the user without automatically logging them in.
       */
      if (receivedToken) {
        tokenStorage.set(receivedToken);
        setToken(receivedToken);
      }

      if (receivedUser) {
        userStorage.set(receivedUser);
        setUser(receivedUser);
      }

      return {
        token: receivedToken,
        user: receivedUser,
        response,
      };
    },
    [extractAuthData]
  );

  /* ------------------------------------------------------------------------ */
  /* Logout                                                                   */
  /* ------------------------------------------------------------------------ */

  const logout = useCallback(async () => {
    try {
      if (tokenStorage.get()) {
        await authApi.logout();
      }
    } catch {
      // Local logout must still complete if the server is unreachable.
      if (import.meta.env.DEV) {
        console.warn("The logout endpoint was unavailable; local session was cleared.");
      }
    } finally {
      clearAuthStorage();
      setToken(null);
      setUser(null);
    }
  }, []);

  /* ------------------------------------------------------------------------ */
  /* Update user                                                               */
  /* ------------------------------------------------------------------------ */

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    userStorage.set(updatedUser);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated,
      login,
      register,
      logout,
      updateUser,
    }),
    [
      user,
      token,
      loading,
      isAuthenticated,
      login,
      register,
      logout,
      updateUser,
    ]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }

  return context;
};

export default AuthContext;