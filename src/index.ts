import express,{ type Request, type Response } from "express";
import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

const ai = new GoogleGenAI({apiKey:process.env.GEMINI_API_KEY as string});

const app = express();

app.use(express.json());

const PORT = 3000

app.post("/generate", async (req: Request, res: Response) => {

const{input} = req.body ; 

try{

const response = await ai.models.generateContent({
    model:"gemini-2.5-flash",
   contents:input,
   config:{
    systemInstruction:"you are a assistant and your name is jarvis , don't give wrong answer if you don't know the right answer just say i don't know "
}}) 
console.log(response.text) ;

return res.status(200).json({
    message:"success",
    data:response.text
})
}catch(error){
    console.log(error)
}

})

app.listen(PORT, () => {
    console.log(`App is running on ${PORT}`);
})