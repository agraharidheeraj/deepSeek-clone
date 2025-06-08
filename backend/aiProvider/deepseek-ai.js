const { model } = require('mongoose');
const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey:process.env.OPENAI_API_KEY
});


const DEFAULT_SYSTEM_MESSAGE =
  "You are DeepSeek, a helpful AI assistant. You provide accurate, informative, and friendly responses. Always be respectful, helpful, and concise in your responses. After your first message, also include a suitable chat title (in 3-8 words) in the format: [TITLE: Your generated title here]."

async function generateStreamResponse(message,onChunk){
    try {
        if(!message.some((msg) => msg.role === 'system')){
            message= [{role:"system", content:DEFAULT_SYSTEM_MESSAGE},...message]
        }
        const formattedMessage = message.map((msg) =>({
            role:msg.role,
            content:msg.content
        }));

        const stream = await openai.chat.completions.create({
            model:"gpt-4o-mini",
            messages:formattedMessage,
            stream:true
        });


        let fullResponse = "";
        for await (const chunk of stream){
            const content = chunk.choices[0]?.delta?.content || "";
            if(content){
                fullResponse += content;
                if(onChunk){
                   onChunk(content)
                }
            }
        }
        
        return fullResponse;
    } catch (error) {
        console.error("Error in deepseek ai provider",error)
        throw new Error(error)
    }
}


module.exports={generateStreamResponse}