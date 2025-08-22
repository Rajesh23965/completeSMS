import app from "./app.js";
import dotenv from "dotenv";
dotenv.config();

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Access it here http://localhost:${PORT}`);
})
