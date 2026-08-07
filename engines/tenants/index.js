const express = require("express");
const app = express();
const PORT = 8093;

app.get("/", (req, res) => {
    res.send("Tenants Engine online");
});

app.listen(PORT, () => {
    console.log(`Tenants Engine running on port ${PORT}`);
});
