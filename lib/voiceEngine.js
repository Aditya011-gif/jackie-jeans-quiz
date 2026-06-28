/**
 * Voice Engine — Web Speech API wrapper for STT + TTS
 * Handles browser compatibility, provides clean event-driven interface
 */

class VoiceEngine {
  constructor() {
    this.recognition = null;
    this.synthesis = typeof window !== "undefined" ? window.speechSynthesis : null;
    this.isListening = false;
    this.isSpeaking = false;
    this.supported = false;
    this.onResult = null;
    this.onInterim = null;
    this.onError = null;
    this.onListeningChange = null;
    this.onSpeakingChange = null;
    this.audioElement = null;
    this.useServerTTS = true;

    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = "en-US";
        this.recognition.maxAlternatives = 3;
        this.supported = true;

        this.recognition.onresult = (event) => {
          let finalTranscript = "";
          let interimTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }

          if (interimTranscript && this.onInterim) {
            this.onInterim(interimTranscript);
          }

          if (finalTranscript && this.onResult) {
            this.onResult(finalTranscript.trim());
          }
        };

        this.recognition.onerror = (event) => {
          if (event.error !== "aborted" && event.error !== "no-speech") {
            if (this.onError) this.onError(event.error);
          }
          this._setListening(false);
        };

        this.recognition.onend = () => {
          this._setListening(false);
        };
      }
    }
  }

  _setListening(value) {
    this.isListening = value;
    if (this.onListeningChange) this.onListeningChange(value);
  }

  _setSpeaking(value) {
    this.isSpeaking = value;
    if (this.onSpeakingChange) this.onSpeakingChange(value);
  }

  startListening() {
    if (!this.recognition) return false;
    try {
      // Cancel any ongoing speech before listening
      if (this.synthesis) {
        this.synthesis.cancel();
        this._setSpeaking(false);
      }
      this.recognition.start();
      this._setListening(true);
      return true;
    } catch (e) {
      // Recognition might already be running
      return false;
    }
  }

  stopListening() {
    if (!this.recognition) return;
    try {
      this.recognition.stop();
      this._setListening(false);
    } catch (e) {
      // Ignore
    }
  }

  speak(text) {
    return new Promise(async (resolve) => {
      // 1. Try Edge TTS via /api/tts proxy first if enabled
      if (this.useServerTTS) {
        try {
          if (this.audioElement) {
            this.audioElement.pause();
            this.audioElement = null;
          }
          if (this.synthesis) {
            this.synthesis.cancel();
          }

          const response = await fetch("/api/tts", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ text }),
          });

          if (response.ok) {
            const blob = await response.blob();
            const audioUrl = URL.createObjectURL(blob);
            const audio = new Audio(audioUrl);
            this.audioElement = audio;

            audio.onplay = () => this._setSpeaking(true);
            audio.onended = () => {
              this._setSpeaking(false);
              URL.revokeObjectURL(audioUrl);
              this.audioElement = null;
              resolve();
            };
            audio.onerror = () => {
              this._setSpeaking(false);
              URL.revokeObjectURL(audioUrl);
              this.audioElement = null;
              // Fallback to synthesis on playback error
              this._speakFallback(text).then(resolve);
            };

            await audio.play();
            return;
          } else {
            console.warn(`Server Edge TTS returned status ${response.status}. Switching to native speech synthesis.`);
            this.useServerTTS = false;
          }
        } catch (err) {
          console.warn("Server Edge TTS failed, switching to native speech synthesis:", err);
          this.useServerTTS = false;
        }
      }

      // 2. Fallback to native Web Speech API
      this._speakFallback(text).then(resolve);
    });
  }

  _speakFallback(text) {
    return new Promise((resolve) => {
      if (!this.synthesis) {
        resolve();
        return;
      }

      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      const voices = this.synthesis.getVoices();
      
      // Prioritize premium Microsoft Edge Neural/Natural Online voices (Edge TTS quality)
      let preferredVoice = voices.find(
        (v) =>
          v.lang.startsWith("en") &&
          v.name.includes("Microsoft") &&
          (v.name.includes("Natural") || v.name.includes("Neural"))
      );
      
      // Fallback 1: Google Natural online voices
      if (!preferredVoice) {
        preferredVoice = voices.find(
          (v) =>
            v.lang.startsWith("en") &&
            v.name.includes("Google") &&
            v.name.includes("US English")
        );
      }
      
      // Fallback 2: Any English Natural/Neural voice
      if (!preferredVoice) {
        preferredVoice = voices.find(
          (v) =>
            v.lang.startsWith("en") &&
            (v.name.includes("Natural") || v.name.includes("Neural"))
        );
      }
      
      // Fallback 3: Standard English female voice
      if (!preferredVoice) {
        preferredVoice = voices.find(
          (v) =>
            v.lang.startsWith("en") &&
            (v.name.includes("Samantha") || v.name.includes("Female") || v.name.includes("Zira"))
        );
      }

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => this._setSpeaking(true);
      utterance.onend = () => {
        this._setSpeaking(false);
        resolve();
      };
      utterance.onerror = () => {
        this._setSpeaking(false);
        resolve();
      };

      this.synthesis.speak(utterance);
    });
  }

  cancelSpeech() {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement = null;
    }
    if (this.synthesis) {
      this.synthesis.cancel();
    }
    this._setSpeaking(false);
  }

  destroy() {
    this.stopListening();
    this.cancelSpeech();
    this.onResult = null;
    this.onInterim = null;
    this.onError = null;
    this.onListeningChange = null;
    this.onSpeakingChange = null;
  }
}

// Singleton
let instance = null;
export function getVoiceEngine() {
  if (!instance) {
    instance = new VoiceEngine();
  }
  return instance;
}

export default VoiceEngine;
