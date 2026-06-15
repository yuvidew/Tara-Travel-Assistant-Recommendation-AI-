"use client";

import {
  Landmark,
  Mic,
  MicOff,
  Route,
  Send,
  Trash2,
  WalletCards,
} from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type ChatComposerProps = {
  disabled: boolean;
  hasMessages: boolean;
  onClear: () => void;
  onSend: (message: string) => void;
};

type SpeechRecognitionResultEvent = Event & {
  resultIndex?: number;
  results: {
    length: number;
    [index: number]: {
      0?: {
        transcript?: string;
      };
    };
  };
};

type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  onstart: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

type VoiceLevel = {
  id: string;
  value: number;
};

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

const suggestions = [
  {
    icon: Route,
    label: "Durg to Delhi route",
    prompt: "Suggest me a Durg to Delhi tour",
  },
  {
    icon: WalletCards,
    label: "Goa under 20000 INR",
    prompt: "Plan a 5 day Goa trip under 20000 INR",
  },
  {
    icon: Landmark,
    label: "Hill stations near Delhi",
    prompt: "Best budget hill stations near Delhi",
  },
];

const voiceLevelCount = 36;
const idleVoiceLevels: VoiceLevel[] = Array.from(
  { length: voiceLevelCount },
  (_, index) => ({
    id: `voice-level-${index}`,
    value: index % 3 === 0 ? 10 : 4,
  }),
);

export function ChatComposer({
  disabled,
  hasMessages,
  onClear,
  onSend,
}: ChatComposerProps) {
  const [value, setValue] = React.useState("");
  const [isListening, setIsListening] = React.useState(false);
  const [voiceError, setVoiceError] = React.useState("");
  const [voiceLevels, setVoiceLevels] =
    React.useState<VoiceLevel[]>(idleVoiceLevels);
  const [voiceTranscript, setVoiceTranscript] = React.useState("");
  const voiceInitialValueRef = React.useRef("");
  const animationFrameRef = React.useRef<number | null>(null);
  const audioContextRef = React.useRef<AudioContext | null>(null);
  const mediaStreamRef = React.useRef<MediaStream | null>(null);
  const recognitionRef = React.useRef<SpeechRecognitionInstance | null>(null);

  function submitMessage(message: string) {
    const trimmed = message.trim();

    if (!trimmed || disabled) {
      return;
    }

    onSend(trimmed);
    setValue("");
    setVoiceError("");
    setVoiceTranscript("");
  }

  const stopVoiceWaveform = React.useCallback((resetLevels = true) => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    mediaStreamRef.current?.getTracks().forEach((track) => {
      track.stop();
    });
    mediaStreamRef.current = null;

    if (audioContextRef.current) {
      void audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (resetLevels) {
      setVoiceLevels(idleVoiceLevels);
    }
  }, []);

  async function startVoiceWaveform() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setVoiceError("Microphone visualizer is not supported in this browser.");
      return;
    }

    stopVoiceWaveform(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);

      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.72;
      const frequencyData = new Uint8Array(analyser.frequencyBinCount);
      source.connect(analyser);
      audioContextRef.current = audioContext;
      mediaStreamRef.current = stream;

      function updateLevels() {
        analyser.getByteFrequencyData(frequencyData);

        const bucketSize = Math.max(
          1,
          Math.floor(frequencyData.length / voiceLevelCount),
        );
        const nextLevels = Array.from(
          { length: voiceLevelCount },
          (_, levelIndex): VoiceLevel => {
            const start = levelIndex * bucketSize;
            const end = Math.min(start + bucketSize, frequencyData.length);
            let total = 0;

            for (let index = start; index < end; index += 1) {
              total += frequencyData[index] ?? 0;
            }

            const average = total / Math.max(1, end - start);

            return {
              id:
                idleVoiceLevels[levelIndex]?.id ?? `voice-level-${levelIndex}`,
              value: Math.max(4, Math.min(52, 4 + (average / 255) * 48)),
            };
          },
        );

        setVoiceLevels(nextLevels);
        animationFrameRef.current = requestAnimationFrame(updateLevels);
      }

      updateLevels();
    } catch {
      setVoiceError(
        "Microphone visualizer could not start. Please allow mic access.",
      );
    }
  }

  function stopVoiceInput() {
    recognitionRef.current?.stop();
    stopVoiceWaveform();
    setIsListening(false);
  }

  function startVoiceInput() {
    if (disabled) {
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;

    setVoiceTranscript("");

    if (!SpeechRecognition) {
      setVoiceError("Voice input is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    voiceInitialValueRef.current = value.trim();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-IN";

    recognition.onstart = () => {
      setVoiceError("");
      setIsListening(true);
      void startVoiceWaveform();
    };

    recognition.onend = () => {
      setIsListening(false);
      stopVoiceWaveform();
      recognitionRef.current = null;
    };

    recognition.onerror = () => {
      setIsListening(false);
      stopVoiceWaveform();
      setVoiceError("I could not hear that. Please try the mic again.");
      recognitionRef.current = null;
    };

    recognition.onresult = (event) => {
      let transcript = "";

      for (let index = 0; index < event.results.length; index += 1) {
        transcript += `${event.results[index]?.[0]?.transcript ?? ""} `;
      }

      const nextTranscript = transcript.trim();

      if (!nextTranscript) {
        return;
      }

      setVoiceTranscript(nextTranscript);
      setValue(
        voiceInitialValueRef.current
          ? `${voiceInitialValueRef.current} ${nextTranscript}`
          : nextTranscript,
      );
    };

    try {
      recognition.start();
    } catch {
      setIsListening(false);
      stopVoiceWaveform();
      setVoiceError("Voice input could not start. Please try again.");
      recognitionRef.current = null;
    }
  }

  React.useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      stopVoiceWaveform(false);
    };
  }, [stopVoiceWaveform]);

  return (
    <div className="border-t border-slate-100 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-950 md:px-6">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {suggestions.map((suggestion) => {
            const Icon = suggestion.icon;

            return (
              <Button
                className="h-8 shrink-0 rounded-full border-slate-200 bg-white px-3 text-xs text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:border-blue-900 dark:hover:bg-blue-950/40 dark:hover:text-blue-300"
                disabled={disabled}
                key={suggestion.label}
                onClick={() => submitMessage(suggestion.prompt)}
                type="button"
                variant="outline"
              >
                <Icon className="size-3.5" />
                {suggestion.label}
              </Button>
            );
          })}
        </div>
        <form
          className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 dark:border-slate-800 dark:bg-slate-950 dark:focus-within:border-blue-800 dark:focus-within:ring-blue-950/60"
          onSubmit={(event) => {
            event.preventDefault();
            submitMessage(value);
          }}
        >
          {isListening || voiceTranscript || voiceError ? (
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/70">
              <div className="overflow-hidden rounded-xl bg-slate-950 px-3 py-3 shadow-inner">
                <div className="flex h-12 items-center justify-center gap-1">
                  {voiceLevels.map((level) => (
                    <span
                      aria-hidden="true"
                      className="w-1 rounded-full bg-blue-400 transition-[height,opacity] duration-75"
                      key={level.id}
                      style={{
                        height: `${level.value}px`,
                        opacity: isListening ? 0.95 : 0.35,
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="mt-2 flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span
                  className={
                    isListening
                      ? "mt-1 size-2 shrink-0 animate-pulse rounded-full bg-blue-500"
                      : "mt-1 size-2 shrink-0 rounded-full bg-slate-300 dark:bg-slate-700"
                  }
                />
                <p className="min-w-0 flex-1 leading-5 wrap-break-word">
                  {voiceTranscript ||
                    (voiceError
                      ? voiceError
                      : "Listening... speak your travel question.")}
                </p>
              </div>
            </div>
          ) : null}
          <div className="flex items-end gap-2">
            <Textarea
              className="max-h-36 min-h-12 flex-1 resize-none rounded-xl border-transparent bg-transparent px-3 py-3 text-slate-900 shadow-none placeholder:text-slate-400 focus-visible:border-transparent focus-visible:ring-0 dark:text-slate-50 dark:placeholder:text-slate-500"
              disabled={disabled}
              onChange={(event) => {
                setValue(event.target.value);
                setVoiceError("");
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  submitMessage(value);
                }
              }}
              placeholder="Where do you want to go?"
              value={value}
            />
            {hasMessages ? (
              <Button
                aria-label="Clear chat"
                className="rounded-xl border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-700 dark:border-slate-800 dark:text-slate-500 dark:hover:bg-slate-900 dark:hover:text-slate-200"
                disabled={disabled}
                onClick={onClear}
                size="icon-lg"
                type="button"
                variant="outline"
              >
                <Trash2 className="size-4" />
              </Button>
            ) : null}
            <Button
              aria-label={
                isListening ? "Stop voice input" : "Start voice input"
              }
              className={
                isListening
                  ? " rounded-xl border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-300 dark:hover:bg-blue-950"
                  : " rounded-xl border-slate-200 text-slate-400 hover:bg-blue-50 hover:text-blue-600 dark:border-slate-800 dark:text-slate-500 dark:hover:bg-blue-950/40 dark:hover:text-blue-300"
              }
              disabled={disabled}
              onClick={isListening ? stopVoiceInput : startVoiceInput}
              size="icon-lg"
              type="button"
              variant="outline"
            >
              {isListening ? (
                <MicOff className="size-4" />
              ) : (
                <Mic className="size-4" />
              )}
            </Button>
            <Button
              aria-label="Send message"
              className="rounded-xl bg-linear-to-br from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/25 hover:from-blue-600 hover:to-blue-700 dark:shadow-blue-950/50"
              disabled={disabled || !value.trim()}
              size="icon-lg"
              type="submit"
            >
              <Send className="size-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
