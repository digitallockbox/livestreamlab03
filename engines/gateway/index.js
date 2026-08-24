const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const fs = require("fs");
const axios = require("axios");
const app = express();
const PORT = 8081;

const routingMap = JSON.parse(fs.readFileSync("./routing-map.json", "utf8"));

function buildProxy(engineName) {
    const engine = routingMap[engineName];
    return createProxyMiddleware({
        target: `http://host.docker.internal:${engine.port}`,
        pathRewrite: { [`^/${engineName}`]: "/" },
        changeOrigin: true
    });
}

Object.keys(routingMap).forEach(engine => {
    app.use(`/${engine}`, buildProxy(engine));
});

app.get("/health", async (req, res) => {
    const results = {};

    for (const engine of Object.keys(routingMap)) {
        const port = routingMap[engine].port;

        try {
            const response = await axios.get(`http://host.docker.internal:${port}`, {
                timeout: 2000
            });
            results[engine] = response.status === 200 ? "online" : "offline";
        } catch (err) {
            results[engine] = "offline";
        }
    }

    res.json(results);
});

app.get("/", (req, res) => {
    res.send("TridentOS Gateway online - dynamic routing active");
});

app.listen(PORT, () => {
    console.log(`Gateway Engine running on port ${PORT}`);
});
