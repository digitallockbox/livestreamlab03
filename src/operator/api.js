const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://api.livestreamlab.live";

export const OperatorAPI = {
  async get(path) {
    const token = localStorage.getItem("access_token");
    const res = await fetch(`${API_BASE_URL}/operator${path}`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json"
      }
    });
    if (!res.ok) {
      throw new Error(`Operator API request failed with status ${res.status}`);
    }
    return res.json();
  }
};
