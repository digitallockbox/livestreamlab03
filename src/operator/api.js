export const OperatorAPI = {
  async get(path) {
    const token = localStorage.getItem("access_token");
    const res = await fetch(`/operator${path}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  }
};
