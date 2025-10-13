import app from "./src/app.js";

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`El servidor NeoCDT está ejecutándose en el puerto ${PORT}`);
});
