import express, { application, type Request, type Response } from "express";
import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
import { Annotation, MemorySaver, MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { TavilySearch } from "@langchain/tavily";

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

// LangGraph

//state where we store the prompt 

// const state = Annotation.Root({

//     prompt: Annotation,
//     aiMessage: Annotation,

// });

// function for the agent node 

//create tool using tevily search

const tool = new TavilySearch({
  maxResults: 5,
  topic: "general",
});

//To save data in the memory

const memory = new MemorySaver();

//Creating tool node for the conditional other service search 

const tools: any = [tool];

const toolNode = new ToolNode(tools);


const llm = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    temperature: 0, // by default 0.7,
    maxRetries: 2,//by default 6
}).bindTools(tools)

const callLLM = async (state: any) => {

    console.log("state", state)

    const response = await llm.invoke([
        { role: "system", content: "You are personal assistant jarvis greet every time i ask something" },
   ...state.messages
    ]);

    return { messages: [response] }

};


const shouldContinue = async (state: any) => {
    const lastMessage = state.messages[state.messages.length - 1]
    if (lastMessage.tool_calls.length > 0) {
        return "tool"
    } else {
        return "__end__"
    }
}

// create a graph so that we can create nodes and edges 

const graph = new StateGraph(MessagesAnnotation)
    .addNode("agent", callLLM)
    .addNode("tool", toolNode)
    .addEdge("__start__", "agent")
    .addEdge("tool", "agent")
    .addConditionalEdges("agent", shouldContinue)
    .addEdge("tool", "agent")
    .compile({checkpointer:memory})



app.post("/generate", async (req: Request, res: Response) => {

    const { input } = req.body;

    const response = await graph.invoke({
        messages: [{
            role: "user",
            content: input
        }]
    },
{configurable:{thread_id:"user_123"}}
);

    console.log(response);

    return res.status(200).json({
        success: true,
        data: response.messages[response.messages.length - 1]?.content
    })
})
//with langChain 

// app.post("/langchain/generate", async (req: Request, res: Response) => {

//     const { input } = req.body;

//     const llm = new ChatGoogleGenerativeAI({
//         model: "gemini-2.5-flash",
//         temperature: 0, // by default 0.7,
//         maxRetries: 2,//by default 6
//     })

//     const response = await llm.invoke([
//         { role: "system", content: "You are personal assistant jarvis greet every time i ask something" },
//         { role: "human", content: input }
//     ])

//     console.log(response.content)

//     return res.status(200).json({
//         success: true,
//         data: response.content
//     })

// })

app.listen(PORT, () => {
    console.log(`App is running on ${PORT}`);
})