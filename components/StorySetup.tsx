import React, { useState } from 'react';
import { Story } from '../types';

interface StorySetupProps {
  onStart: (story: Story) => void;
}

// Pre-defined templates to provide variety on load
const STORY_TEMPLATES = [
  {
    title: "Il Segreto della Foresta",
    synopsis: "Un esploratore trova una mappa antica che porta a una civiltà perduta nel cuore dell'Amazzonia.",
    chapters: [
      "Il viaggio inizia all'alba. L'equipaggiamento è pronto, la giungla è fitta e silenziosa.",
      "Attraversando il fiume impetuoso, la barca rischia di rovesciarsi. Qualcosa si muove sott'acqua.",
      "Arrivo alle rovine al tramonto. Le statue di pietra sembrano guardare i visitatori."
    ]
  },
  {
    title: "Protocollo Omega",
    synopsis: "In un futuro cyberpunk, un hacker scopre un codice in grado di spegnere l'intera rete neurale della città.",
    chapters: [
      "Il terminale lampeggia verde. Ho trovato la backdoor nel sistema della MegaCorp.",
      "I droni della sicurezza mi hanno individuato. Inizia una fuga frenetica sui tetti al neon sotto la pioggia.",
      "L'ultimo server è nel seminterrato. Devo caricare il virus prima che sfondino la porta blindata."
    ]
  },
  {
    title: "L'Ultimo Treno per Milano",
    synopsis: "Un thriller noir ambientato negli anni '50. Un detective privato deve scortare una testimone chiave mentre un assassino li insegue.",
    chapters: [
      "La stazione è avvolta dalla nebbia. Il treno fischia in lontananza mentre controllo la mia pistola.",
      "Qualcuno sta bussando alla porta dello scompartimento. Non è il controllore.",
      "Inseguimento sul tetto del treno in corsa mentre attraversiamo le campagne innevate."
    ]
  },
  {
    title: "La Torre dei Sussurri",
    synopsis: "Un giovane mago deve scalare una torre maledetta per recuperare l'anima di suo fratello.",
    chapters: [
      "L'ingresso della torre è sigillato da una magia antica. Devo risolvere l'enigma delle tre rune.",
      "Salendo le scale a chiocciola, le voci dei fantasmi cercano di farmi impazzire.",
      "La sala del trono in cima alla torre. Il custode spettrale mi attende per la prova finale."
    ]
  }
];

const StorySetup: React.FC<StorySetupProps> = ({ onStart }) => {
  // Initialize state with a random story template
  const [initialStory] = useState(() => {
    const randomIndex = Math.floor(Math.random() * STORY_TEMPLATES.length);
    return STORY_TEMPLATES[randomIndex];
  });

  const [title, setTitle] = useState(initialStory.title);
  const [synopsis, setSynopsis] = useState(initialStory.synopsis);
  const [chapters, setChapters] = useState<string[]>(initialStory.chapters);

  const handleChapterChange = (index: number, value: string) => {
    const newChapters = [...chapters];
    newChapters[index] = value;
    setChapters(newChapters);
  };

  const addChapter = () => setChapters([...chapters, ""]);
  
  const removeChapter = (index: number) => {
    if (chapters.length > 1) {
      const newChapters = chapters.filter((_, i) => i !== index);
      setChapters(newChapters);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && synopsis && chapters.every(c => c.trim().length > 0)) {
      onStart({ title, synopsis, chapters });
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-full">
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-8 rounded-2xl shadow-xl">
        <h2 className="text-3xl font-bold text-white mb-2">Nuova Storia</h2>
        <p className="text-slate-400 mb-8">Definisci i dettagli della tua narrazione e lascia che l'AI crei l'esperienza.</p>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-slate-300 text-sm font-semibold mb-2">Titolo</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none p-4 text-white placeholder-slate-600 transition-all"
              placeholder="Inserisci titolo..."
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-semibold mb-2">Sinossi</label>
            <textarea 
              value={synopsis} 
              onChange={(e) => setSynopsis(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none p-4 text-white placeholder-slate-600 h-28 resize-none transition-all"
              placeholder="Riassunto della trama..."
            />
          </div>

          <div className="space-y-4">
            <label className="block text-slate-300 text-sm font-semibold">Capitoli</label>
            {chapters.map((chapter, idx) => (
              <div key={idx} className="flex gap-4 items-start group">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-700 text-slate-300 text-sm font-bold mt-1 shrink-0">
                  {idx + 1}
                </span>
                <textarea 
                  value={chapter} 
                  onChange={(e) => handleChapterChange(idx, e.target.value)}
                  className="flex-grow bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none p-4 text-white h-24 resize-none transition-all"
                  placeholder={`Dettagli Capitolo ${idx + 1}...`}
                />
                <button 
                  type="button" 
                  onClick={() => removeChapter(idx)}
                  className="mt-3 p-2 text-slate-500 hover:text-red-400 hover:bg-slate-700 rounded-full transition-all"
                  title="Rimuovi Capitolo"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              </div>
            ))}
            
            <button 
              type="button" 
              onClick={addChapter}
              className="text-sm font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-800 transition-all ml-12"
            >
              + Aggiungi un altro capitolo
            </button>
          </div>

          <div className="pt-6 border-t border-slate-700">
            <button 
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-lg font-semibold py-4 rounded-xl shadow-lg shadow-indigo-600/20 transform hover:-translate-y-0.5 transition-all"
            >
              Crea Narrazione
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StorySetup;