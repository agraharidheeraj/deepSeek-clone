import { useEffect, useState } from "react"


const useSpeechRecognition = (isActive:boolean) =>{
    const [transcript,setTranscript] = useState<string>("");
    const [isListening, setIsListening] = useState<boolean>(false);
    const [error,setError] = useState<string>("")

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;

        if(!SpeechRecognition){
            setError("sepeech recognition is not supported in this brower")
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.interimResult = true;
        recognition.lang= "en-US";
        recognition.continuous = true;

        recognition.onresult= (event:any) =>{
            console.log(event)
            const lastResult = event.results[event.results.length -1];
            if(lastResult && lastResult.isFinal){
                setTranscript(lastResult[0].transcript);
            }
        }
       //added a comment
        recognition.onerror= (event:any)=>{
            setError(event.error)
        }
        recognition.onstart = () =>{
            setIsListening(true)
        }

        recognition.onend= () => {
            setIsListening(false)
        }

        if(isActive){
            recognition.start();
        }else{
            recognition.stop();
        }


        return () =>{
            recognition.stop();
        }
        
    },[isActive])
    return {transcript,isListening,error}
}

export default useSpeechRecognition;