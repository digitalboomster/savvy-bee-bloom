import { toast } from "@/hooks/use-toast";

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  try {
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");

    const response = await fetch(`${import.meta.env.VITE_API_URL}/transcribe`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Transcription failed: ${errorText}`);
    }

    const data = await response.json();
    return data.transcription;
  } catch (error) {
    toast({
      title: "Transcription Error",
      description: "Could not transcribe your voice. Try again.",
      variant: "destructive",
    });
    return "Sorry, couldn't understand your voice.";
  }
}
