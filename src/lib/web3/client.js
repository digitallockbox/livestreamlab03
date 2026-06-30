import { base44 } from "@/api/base44Client";

export async function invoke(name, payload = {}) {
  const res = await base44.functions.invoke(name, payload);
  return res.data;
}