import { useMemo } from "react";
import { useIdentity } from "@/lib/web3/identity";
import { Base44Runtime } from "@/lib/tridentRuntime";

// useTridentRuntime — binds Base44Runtime to the real wallet-signed invoke.
// Every dispatch() goes through signedInvoke("tridentProxy") → authenticated
// gateway. No mock execution, no invented results.
export function useTridentRuntime() {
  const { signedInvoke } = useIdentity();

  return useMemo(() => {
    // signedInvoke expects (functionName, payload); Base44Runtime.invoke wraps it.
    const invoke = (payload) => signedInvoke("tridentProxy", payload);
    return new Base44Runtime(invoke);
  }, [signedInvoke]);
}