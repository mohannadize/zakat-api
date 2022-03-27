require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3010;
const Zakat = require("./Zakat");

const handler = async (req, res) => {
  const zakat = await new Zakat(req.params.currency || "EGP");

  const result = await zakat.getZakat();

  res.json(result);
};

app.get("/", handler);

app.get("/currency/:currency", handler);

app.use(async (_, res) => {
  res.status(404);
  return res.json({
    message: "Page not found",
    code: 404,
  });
});

app.listen(PORT, () => {
  console.log(`Listening at http://localhost:${PORT}`);
});
