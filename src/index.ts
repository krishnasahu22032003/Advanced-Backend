import express, { type Request, type Response } from "express";
import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai"

const app = express();

app.use(express.json());

const PORT = 3000

//Without langChain raw llm calling 

// const ai = new GoogleGenAI({apiKey:process.env.GEMINI_API_KEY as string});

// app.post("/generate", async (req: Request, res: Response) => {

// const{input} = req.body ; 

// try{

// const response = await ai.models.generateContent({
//     model:"gemini-2.5-flash",
//    contents:input,
//    config:{
//     systemInstruction:"you are a assistant and your name is jarvis , don't give wrong answer if you don't know the right answer just say i don't know "
// }}) 
// console.log(response.text) ;

// return res.status(200).json({
//     message:"success",
//     data:response.text
// })
// }catch(error){
//     console.log(error)
// }

// })

//with langChain 

app.post("/langchain/generate", async (req: Request, res: Response) => {

    const { input } = req.body;

    const llm = new ChatGoogleGenerativeAI({
        model: "gemini-2.5-flash",
        temperature: 0, // by default 0.7,
        maxRetries: 2,//by default 6
    })

    const response = await llm.invoke([
        { role: "system", content: "You are personal assistant jarvis greet every time i ask something" },
        { role: "human", content: input }
    ])

    console.log(response.content)

    return res.status(200).json({
        success: true,
        data: response.content
    })

})

app.listen(PORT, () => {
    console.log(`App is running on ${PORT}`);
})