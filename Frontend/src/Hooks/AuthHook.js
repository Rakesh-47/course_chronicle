import { useState, useCallback, useEffect } from "react";

let logoutTimer;

const useAuth = () => {
   
  const [token, setToken] = useState(null);
  const [tokenExpirationDate, setTokenExpirationDate] = useState(null);
  const [userId, setUserId] = useState(null);
  const [credit, setCredit] = useState(null);
  const [refCode, setRefCode] = useState(null);

  const login = useCallback((uid, token, currentCredit, refCode, expirationDate) => {
    setToken(token);
    setUserId(uid);
    setCredit(currentCredit);
    setRefCode(refCode);

    const tokenExpiry =
      expirationDate || new Date(new Date().getTime() + 1000 * 60 * 60);
    setTokenExpirationDate(tokenExpiry);

    // Save all user data (including refCode) to localStorage.
    localStorage.setItem(
      "userData",
      JSON.stringify({
        userId: uid,
        token: token,
        expiration: tokenExpiry.toISOString(),
        credit: currentCredit,
        refCode: refCode
      })
    );

    console.log("User logged in:", { uid, token, currentCredit, refCode, tokenExpiry });
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setTokenExpirationDate(null);
    setUserId(null);
    setCredit(null);
    setRefCode(null);
    localStorage.removeItem("userData");

    console.log("User logged out");
  }, []);

  const updateCredit = useCallback((newCredit) => {
    setCredit(newCredit);
    const storedData = JSON.parse(localStorage.getItem("userData"));
    if (storedData) {
      storedData.credit = newCredit;
      localStorage.setItem("userData", JSON.stringify(storedData));
      console.log("Updated Local Storage:", storedData);
    }
  }, []);

  useEffect(() => {
    if (token && tokenExpirationDate) {
      const remainingTime =
        tokenExpirationDate.getTime() - new Date().getTime();
      logoutTimer = setTimeout(logout, remainingTime);
      console.log("Auto logout set for:", remainingTime / 1000, "seconds");
    } else {
      clearTimeout(logoutTimer);
    }
  }, [token, logout, tokenExpirationDate]);

  
  // This effect retrieves userData from localStorage and logs the user in if the token is still valid.
  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("userData"));
    if (
      storedData &&
      storedData.token &&
      new Date(storedData.expiration) > new Date()
    ) {
      login(
        storedData.userId,
        storedData.token,
        storedData.credit,
        storedData.refCode,
        new Date(storedData.expiration)
      );
    }
  }, [login]);

  return { token, login, logout, userId, credit, updateCredit, refCode };
};

export default useAuth;
