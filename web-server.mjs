import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = 8088;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uiPath = "C:/Docker/TridentNode/engines/runtime";

app.use(express.static(uiPath));

app.get("/", (req, res) => {
  res.sendFile(path.join(uiPath, "dashboard.html"));
});

app.listen(PORT, () => {
  console.log(`TridentOS Dashboard running at http://localhost:${PORT}`);
});
