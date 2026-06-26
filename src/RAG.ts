import express, {type Request, type Response } from "express";
import "dotenv/config";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai"

const app = express();

app.use(express.json());

const PORT = 3000

const llm = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    temperature: 0, // by default 0.7,
    maxRetries: 2,//by default 6
})

app.post("/generate", async (req: Request, res: Response) => {

    const { input } = req.body;

    const response = await llm.invoke([
          {
            role: "user",
            content: input
        }
    ]
);

    console.log(response);

    return res.status(200).json({
        success: true,
        data: response.content
    })
})

app.listen(PORT, () => {
    console.log(`App is running on ${PORT}`);
})