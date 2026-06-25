import express,{ type Request, type Response } from "express";

const app = express();

app.use(express.json());

const PORT = 3000

app.get("/", (req: Request, res: Response) => {

res.send("Testing...")

})

app.listen(PORT, () => {
    console.log(`App is running on ${PORT}`);
})