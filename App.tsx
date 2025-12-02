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
      
      <main className="container mx-auto p-4 md:p-8 min-h-screen flex flex-col max-w-7xl">
        <header className="mb-10 flex justify-between items-center py-4">
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
        
        <footer className="mt-12 text-center text-slate-600 text-sm py-4 border-t border-slate-800">
          Powered by Gemini 2.5 Flash
        </footer>
      </main>
    </div>
  );
};

export default App;