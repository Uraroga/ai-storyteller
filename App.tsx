import React, { useState } from 'react';
import { Story } from './types';
import StorySetup from './components/StorySetup';
import Player from './components/Player';

const App: React.FC = () => {
  const [story, setStory] = useState<Story | null>(null);

  const handleStartStory = (newStory: Story) => {
    setStory(newStory);
  };

  const handleBackToSetup = () => {
    setStory(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      
      <main className="container mx-auto p-4 md:p-6 min-h-screen flex flex-col max-w-[95%] 2xl:max-w-[1800px]">
        <header className="mb-6 flex justify-between items-center py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/20"></div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              AI Storyteller
            </h1>
          </div>
          {story && (
            <button 
                onClick={handleBackToSetup}
                className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
                Esci
            </button>
          )}
        </header>

        <div className="flex-grow flex flex-col justify-center">
          {!story ? (
            <StorySetup onStart={handleStartStory} />
          ) : (
            <Player story={story} onBack={handleBackToSetup} />
          )}
        </div>
        
        <footer className="mt-8 py-8 border-t border-slate-800 flex flex-col items-center gap-4">
          <div className="text-slate-600 text-sm">
            Powered by Gemini 2.5 Flash
          </div>
          <a
            href="https://paypal.me/uraroga"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-[#003087] text-slate-400 hover:text-white text-xs font-medium rounded-full transition-all border border-slate-700 hover:border-[#003087]"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
              <path d="M7.076 21.337l.756-4.728H5.69a2.274 2.274 0 01-2.275-2.276V5.422A2.274 2.274 0 015.691 3.147h7.418c3.697 0 6.698 3.001 6.698 6.699 0 3.696-3.001 6.698-6.698 6.698h-2.09l-.258 1.614-.257 1.614-.002.012-.016.103-.002.012-.016.103-.235 1.472h-3.158l.487-3.047z" />
            </svg>
            PayPal.me
          </a>
        </footer>
      </main>
    </div>
  );
};

export default App;