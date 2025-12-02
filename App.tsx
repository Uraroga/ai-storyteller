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
          <a
            href="https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=uraroga@gmail.com&item_name=Supporto+Narratore+AI&currency_code=EUR"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 px-6 py-3 bg-slate-800 hover:bg-[#0070BA] border border-slate-700 hover:border-[#0070BA] rounded-full transition-all duration-300 shadow-lg hover:shadow-cyan-500/20"
          >
             <svg className="w-5 h-5 text-amber-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M2,21H20V19H2M20,8H18V5H20M20,3H4V13A4,4 0 0,0 8,17H14A4,4 0 0,0 18,13V10H20A2,2 0 0,0 22,8V5C22,3.89 21.1,3 20,3Z" />
             </svg>
             <span className="font-medium text-slate-300 group-hover:text-white">Offri un caffé a uraroga</span>
          </a>
          
          <div className="text-slate-600 text-sm">
            Powered by Gemini 2.5 Flash
          </div>
        </footer>
      </main>
    </div>
  );
};

export default App;