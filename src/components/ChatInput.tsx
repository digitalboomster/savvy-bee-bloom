import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
}

const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');

    const response = await fetch('/transcribe', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Transcription failed: ${response.status}`);
    }

    const data = await response.json();
    return data.transcription;
  } catch (error) {
    console.error('Transcription error:', error);
    throw error;
  }
};

const ChatInput = ({ onSendMessage }: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });

      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        try {
          const transcription = await transcribeAudio(audioBlob);
          setMessage(prev => prev + ' ' + transcription);
          toast({
            title: "Voice transcribed",
            description: "Your speech was converted to text"
          });
        } catch (error) {
          toast({
            title: "Transcription failed",
            description: "Couldn't process your voice",
            variant: "destructive"
          });
        }
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast({
        title: "Recording started",
        description: "Speak clearly into your microphone"
      });

    } catch (error) {
      console.error('Recording error:', error);
      toast({
        title: "Microphone access denied",
        description: "Please enable microphone permissions",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsRecording(false);
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full">
      <div className="relative flex-1">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask Savvy Bee something..."
          className={cn(
            "pr-10 transition-all",
            isRecording && "pl-16"
          )}
        />

        <AnimatePresence>
          {isRecording && (
            <motion.div
              className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              <motion.div
                className="w-2 h-2 bg-red-500 rounded-full"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              />
              <span className="text-xs text-gray-500">
                {formatTime(recordingTime)}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Button
        type="button"
        size="icon"
        variant="ghost"
        onClick={toggleRecording}
        className={cn(
          isRecording && "text-red-500 bg-red-50"
        )}
      >
        {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
      </Button>

      <Button
        type="submit"
        size="icon"
        className="bg-amber-500 hover:bg-amber-600"
      >
        <Send size={16} />
      </Button>
    </form>
  );
};

export default ChatInput;
