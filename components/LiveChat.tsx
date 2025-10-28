import React, { useState, useRef, useCallback, useEffect } from 'react';
import { connectToLiveApi } from '../services/geminiService';
import { decode, decodeAudioData, encode } from '../services/audioUtils';
import type { LiveSession, Blob } from '@google/genai';

const LiveChat: React.FC = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [transcriptions, setTranscriptions] = useState<{ user: string; model: string }[]>([]);
  const [currentTranscription, setCurrentTranscription] = useState({ user: '', model: '' });

  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const audioQueueRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const stopConversation = useCallback(() => {
    if (sessionPromiseRef.current) {
        sessionPromiseRef.current.then(session => session.close());
        sessionPromiseRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    if (scriptProcessorRef.current && mediaStreamSourceRef.current && audioContextRef.current) {
      mediaStreamSourceRef.current.disconnect();
      scriptProcessorRef.current.disconnect();
      audioContextRef.current.close();
      scriptProcessorRef.current = null;
      mediaStreamSourceRef.current = null;
      audioContextRef.current = null;
    }

    if (outputAudioContextRef.current) {
        outputAudioContextRef.current.close();
        outputAudioContextRef.current = null;
    }
    
    audioQueueRef.current.forEach(source => source.stop());
    audioQueueRef.current.clear();
    nextStartTimeRef.current = 0;

    setIsConnected(false);
    setIsConnecting(false);
  }, []);
  
  const startConversation = useCallback(async () => {
    setIsConnecting(true);
    setTranscriptions([]);
    setCurrentTranscription({ user: '', model: '' });

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextRef.current = inputAudioContext;
      
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      sessionPromiseRef.current = connectToLiveApi({
        onopen: () => {
          setIsConnecting(false);
          setIsConnected(true);
          
          const source = inputAudioContext.createMediaStreamSource(stream);
          mediaStreamSourceRef.current = source;
          const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
          scriptProcessorRef.current = scriptProcessor;

          scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
            // FIX: Use a more efficient method to create the audio blob, following Gemini API guidelines.
            const l = inputData.length;
            const int16 = new Int16Array(l);
            for (let i = 0; i < l; i++) {
              int16[i] = inputData[i] * 32768;
            }
            const pcmBlob: Blob = {
              data: encode(new Uint8Array(int16.buffer)),
              mimeType: 'audio/pcm;rate=16000',
            };
            // FIX: Per Gemini API guidelines, directly use the session promise. The non-null assertion (!) is used
            // because the script processor is disconnected before the session promise ref is nulled, making it safe.
            sessionPromiseRef.current!.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
            });
          };
          source.connect(scriptProcessor);
          scriptProcessor.connect(inputAudioContext.destination);
        },
        onmessage: async (message) => {
          if (message.serverContent?.inputTranscription) {
            setCurrentTranscription(prev => ({ ...prev, user: prev.user + message.serverContent.inputTranscription.text }));
          }
          if (message.serverContent?.outputTranscription) {
            setCurrentTranscription(prev => ({ ...prev, model: prev.model + message.serverContent.outputTranscription.text }));
          }
          
          const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (audioData && outputAudioContextRef.current) {
            const outputCtx = outputAudioContextRef.current;
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
            const audioBuffer = await decodeAudioData(decode(audioData), outputCtx, 24000, 1);
            const source = outputCtx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(outputCtx.destination);
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += audioBuffer.duration;
            audioQueueRef.current.add(source);
            source.onended = () => audioQueueRef.current.delete(source);
          }

          if (message.serverContent?.interrupted) {
            audioQueueRef.current.forEach(source => source.stop());
            audioQueueRef.current.clear();
            nextStartTimeRef.current = 0;
          }

          if (message.serverContent?.turnComplete) {
            setTranscriptions(prev => [...prev, currentTranscription]);
            setCurrentTranscription({ user: '', model: '' });
          }
        },
        onerror: (e) => {
          console.error('Live API Error:', e);
          stopConversation();
        },
        onclose: () => {
          stopConversation();
        },
      });

    } catch (error) {
      console.error('Failed to start conversation:', error);
      alert('Não foi possível acessar o microfone. Verifique as permissões.');
      setIsConnecting(false);
    }
  }, [stopConversation, currentTranscription]);

  useEffect(() => {
    return () => {
        stopConversation();
    };
  }, [stopConversation]);

  return (
    <div className="bg-base-200 p-6 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-text-primary">Assistente Conversacional</h3>
        <button
          onClick={isConnected ? stopConversation : startConversation}
          disabled={isConnecting}
          className={`px-4 py-2 rounded-full font-semibold text-brand-gray transition-all duration-300 flex items-center gap-2 ${
            isConnected ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-brand-yellow hover:bg-amber-500'
          } disabled:bg-gray-500`}
        >
          {isConnecting ? (
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-red-300' : 'bg-green-400'}`}></div>
          )}
          {isConnecting ? 'Conectando...' : isConnected ? 'Encerrar Conversa' : 'Iniciar Conversa'}
        </button>
      </div>
      <div className="h-64 bg-base-300 rounded-md p-4 overflow-y-auto space-y-4">
        {transcriptions.map((t, i) => (
          <div key={i} className="space-y-2">
            <p><span className="font-bold text-amber-400">Você: </span>{t.user}</p>
            <p><span className="font-bold text-emerald-400">Assistente: </span>{t.model}</p>
          </div>
        ))}
        {(currentTranscription.user || currentTranscription.model) && (
            <div className="space-y-2 opacity-70">
                {currentTranscription.user && <p><span className="font-bold text-amber-400">Você: </span>{currentTranscription.user}</p>}
                {currentTranscription.model && <p><span className="font-bold text-emerald-400">Assistente: </span>{currentTranscription.model}</p>}
            </div>
        )}
        {!isConnecting && !isConnected && transcriptions.length === 0 && (
            <div className="flex items-center justify-center h-full text-text-secondary">
                <p>Clique em "Iniciar Conversa" para falar com o assistente.</p>
            </div>
        )}
         {isConnected && transcriptions.length === 0 && !currentTranscription.user && !currentTranscription.model && (
            <div className="flex items-center justify-center h-full text-text-secondary">
                <p>Ouvindo...</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default LiveChat;