import { useState, useEffect } from "react";
import { web3Profile } from "@/lib/web3/web3Profile";

export function useCreator() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = () =>
    web3Profile
      .me()
      .then((res) => setProfile(res.profile))
      .catch((e) => setError(e.message));

  useEffect(() => {
    let active = true;
    web3Profile
      .me()
      .then((res) => active && setProfile(res.profile))
      .catch((e) => active && setError(e.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return { profile, loading, error, refresh };
}