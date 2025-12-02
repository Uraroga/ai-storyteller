import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Story, GeneratedScene, PlayerState } from '../types';
import { generateSceneContent, generateSceneImage } from '../services/gemini';

interface PlayerProps {
  story: Story;
  onBack: () => void;
}

const Player: React.FC<PlayerProps> = ({ story, onBack }) => {
  const [state, setState] = useState<PlayerState>({
    isPlaying: false,
    isInfinite: false,
    isGenerating: false,
    currentChapterIndex: 0,
    error: null,
  });

  const [scene, setScene] = useState<GeneratedScene | null>(null);
  
  // Refs are crucial for accessing current state inside asynchronous callbacks (like TTS onend)
  const isPlayingRef = useRef(state.isPlaying);
  const stateRef = useRef(state);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Wake Lock Ref
  const wakeLockRef = useRef<any>(null);

  // Sync refs with state
  useEffect(() => {
    isPlayingRef.current = state.isPlaying;
    stateRef.current = state;
  }, [state]);

  // --- WAKE LOCK IMPLEMENTATION START ---
  const requestWakeLock = useCallback(async () => {
    try {
      // Check if feature exists
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        console.log('Screen Wake Lock active');
      }
    } catch (err) {
      console.warn('Wake Lock not supported or rejected:', err);
    }
  }, []);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
        console.log('Screen Wake Lock released');
      } catch (err) {
        console.warn('Wake Lock release error:', err);
      }
    }
  }, []);

  // Sync WakeLock with isPlaying state
  useEffect(() => {
    if (state.isPlaying) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }
    // Cleanup on unmount
    return () => {
      releaseWakeLock();
    };
  }, [state.isPlaying, requestWakeLock, releaseWakeLock]);

  // Re-acquire lock if tab visibility changes (browsers often drop lock when tab is hidden)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && state.isPlaying) {
        requestWakeLock();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [state.isPlaying, requestWakeLock]);
  // --- WAKE LOCK IMPLEMENTATION END ---


  // Helper to safely update state
  const updateState = (updates: Partial<PlayerState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const handleNext = useCallback(() => {
    const currentState = stateRef.current;
    let nextIndex = currentState.currentChapterIndex + 1;
    
    // Check if we reached the end
    if (nextIndex >= story.chapters.length) {
      if (currentState.isInfinite) {
        nextIndex = 0; // Loop story
      } else {
        // End of story
        updateState({ isPlaying: false });
        return; 
      }
    }

    updateState({ currentChapterIndex: nextIndex });
    // Trigger generation for next index
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    generateScene(nextIndex);
  }, [story.chapters.length]);

  const handleManualNext = () => {
    // If manually skipping, ensure we cancel any current speech to avoid overlap
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    handleNext();
  };

  const speakText = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any previous speech safely

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'it-IT';
      utterance.pitch = 1.0; 
      utterance.rate = 1.0;  
      
      const voices = window.speechSynthesis.getVoices();
      const itVoice = voices.find(v => v.lang.includes('it'));
      if (itVoice) utterance.voice = itVoice;

      utterance.onend = () => {
        // CRITICAL: Check the REF, not the state variable directly, to avoid stale closures
        if (isPlayingRef.current) {
             timeoutRef.current = setTimeout(() => {
                handleNext();
             }, 1500); // 1.5s pause between chapters
        }
      };

      utterance.onerror = (e) => {
        console.error("TTS Error", e);
        // If error, try to move on anyway if playing
        if (isPlayingRef.current) {
            timeoutRef.current = setTimeout(() => handleNext(), 2000);
        }
      };

      window.speechSynthesis.speak(utterance);
    } else {
        // Fallback if no TTS, just auto advance
        if (isPlayingRef.current) {
            timeoutRef.current = setTimeout(() => handleNext(), 5000);
        }
    }
  }, [handleNext]);

  const generateScene = useCallback(async (index: number) => {
    updateState({ isGenerating: true, error: null });
    
    try {
      const { narrative, imagePrompt } = await generateSceneContent(story, index);
      const imageBase64 = await generateSceneImage(imagePrompt);
      
      const newScene: GeneratedScene = {
        chapterIndex: index,
        narrative,
        imageBase64,
        timestamp: Date.now()
      };
      
      setScene(newScene);
      updateState({ isGenerating: false });
      
      // Auto-play TTS only if we are still in playing mode
      if (isPlayingRef.current) {
        speakText(narrative);
      }
      
    } catch (err) {
      console.error(err);
      updateState({ 
        isGenerating: false, 
        error: "Si è verificato un errore durante la generazione. Riprova.",
        isPlaying: false 
      });
    }
  }, [story, speakText]);

  // Handle Play/Stop Toggle
  const togglePlay = () => {
    if (state.isPlaying) {
        // STOPPING
        updateState({ isPlaying: false });
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        window.speechSynthesis.cancel();
    } else {
        // STARTING
        updateState({ isPlaying: true });
        // If we have a scene loaded, read it, otherwise generate current index
        if (scene && scene.chapterIndex === state.currentChapterIndex) {
            speakText(scene.narrative);
        } else {
            generateScene(state.currentChapterIndex);
        }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        window.speechSynthesis.cancel();
    };
  }, []);

  // Initial load (generate first scene without playing)
  useEffect(() => {
    if (!scene && !state.isGenerating) {
        generateScene(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isLastChapter = state.currentChapterIndex >= story.chapters.length - 1;
  const canGoNext = !isLastChapter || state.isInfinite;

  return (
    <div className="flex flex-col h-full gap-8 w-full">
      
      {/* Top Bar / Timeline */}
      <div className="flex flex-col gap-2">
         <div className="flex justify-between items-center text-sm text-slate-400 font-medium">
            <span>{story.title}</span>
            <span>{state.currentChapterIndex + 1} / {story.chapters.length}</span>
         </div>
         <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden flex">
            {story.chapters.map((_, idx) => (
                <div
                    key={idx}
                    className={`h-full flex-1 transition-all border-r border-slate-900 last:border-0 ${
                        idx < state.currentChapterIndex ? 'bg-indigo-500' :
                        idx === state.currentChapterIndex ? 'bg-white animate-pulse' : 'bg-slate-700'
                    }`}
                />
            ))}
         </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-20 items-center h-full">
        
        {/* Left: Image Display */}
        <div className="relative w-full aspect-[3/2] bg-slate-800 rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10">
            {/* Loading Overlay */}
            {state.isGenerating && (
            <div className="absolute inset-0 z-20 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin mb-3"></div>
                <div className="text-lg font-medium tracking-wide">GENERAZIONE SCENA...</div>
            </div>
            )}

            {/* Error Overlay */}
            {state.error && (
                <div className="absolute inset-0 z-30 bg-red-900/90 flex items-center justify-center text-white p-6 text-center">
                    <div>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-2 text-red-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm">{state.error}</p>
                    </div>
                </div>
            )}

            {/* Image Display */}
            {scene?.imageBase64 ? (
            <img 
                src={`data:image/jpeg;base64,${scene.imageBase64}`} 
                alt="Generated Scene" 
                className="w-full h-full object-cover transition-opacity duration-500"
            />
            ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-2">
                <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                </div>
                <span className="text-lg">In attesa...</span>
            </div>
            )}
        </div>

        {/* Right: Narrative Text & Controls */}
        <div className="flex flex-col h-full justify-center py-4">
            <div className="mb-10">
                <h3 className="text-indigo-400 text-xl md:text-2xl font-bold uppercase tracking-wider mb-6">
                    Capitolo {state.currentChapterIndex + 1}
                </h3>
                
                <div className="prose prose-invert prose-xl md:prose-2xl max-w-none">
                     <p className="text-slate-200 leading-relaxed">
                        {scene ? scene.narrative : "Caricamento in corso..."}
                    </p>
                </div>
            </div>

            <div className="mt-auto space-y-8">
                 <div className="flex gap-4">
                     {/* Play / Pause Button */}
                     <button 
                        onClick={togglePlay}
                        disabled={state.isGenerating}
                        className={`flex-grow py-6 rounded-2xl font-semibold text-xl transition-all flex items-center justify-center gap-3 shadow-lg ${
                            state.isPlaying 
                            ? 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-600' 
                            : 'bg-indigo-600 text-white hover:bg-indigo-500 hover:scale-[1.02]'
                        }`}
                     >
                        {state.isPlaying ? (
                            <>
                                <span className="w-4 h-4 bg-red-500 rounded-sm"></span>
                                Pausa
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                                Avvia
                            </>
                        )}
                     </button>

                     {/* Next Button */}
                     <button
                        onClick={handleManualNext}
                        disabled={state.isGenerating || !canGoNext}
                        className="px-8 rounded-2xl bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:border-slate-500 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        title="Prossimo Capitolo"
                     >
                         <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                     </button>
                 </div>

                 <div className="flex justify-center text-base">
                    <label className="flex items-center gap-3 cursor-pointer text-slate-400 hover:text-white transition-colors p-2">
                        <input 
                            type="checkbox" 
                            checked={state.isInfinite}
                            onChange={() => updateState({ isInfinite: !state.isInfinite })}
                            className="w-6 h-6 rounded border-slate-600 text-indigo-600 focus:ring-indigo-500 bg-slate-800"
                        />
                        Loop Storia (Ricomincia alla fine)
                    </label>
                 </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Player;