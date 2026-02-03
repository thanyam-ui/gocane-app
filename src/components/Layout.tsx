
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  onBack?: () => void;
  onChat?: () => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  onToggleAssistant: () => void;
  isAssistantActive: boolean;
  language: 'th' | 'en';
  onLanguageChange: (lang: 'th' | 'en') => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title = "GO CANE", 
  onBack, 
  onChat, 
  fontSize, 
  onFontSizeChange,
  onToggleAssistant,
  isAssistantActive,
  language,
  onLanguageChange
}) => {
  return (
    <div 
      className="min-h-screen flex flex-col w-full bg-white shadow-xl relative transition-all origin-top"
      style={{ zoom: fontSize }} // ใช้ zoom เพื่อขยายทุกอย่างตามสเกล
    >
      {/* Header - Fixed Top Full Width */}
      <header className="bg-pink-400 text-white p-4 sticky top-0 z-50 shadow-md w-full">
        <div className="max-w-5xl mx-auto w-full">
            <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
                {onBack && (
                <button onClick={onBack} className="p-1 hover:bg-pink-500 rounded-full transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                )}
                <h1 className="text-xl font-bold truncate">{title}</h1>
            </div>
            
            <div className="flex items-center gap-2">
                {/* Language Switcher */}
                <div className="flex bg-pink-500 rounded-full p-0.5 border border-pink-300 mr-1">
                <button 
                    onClick={() => onLanguageChange('th')}
                    className={`px-2 py-1 rounded-full text-[10px] font-bold transition-all ${language === 'th' ? 'bg-white text-pink-500' : 'text-white hover:bg-pink-600'}`}
                >
                    ไทย
                </button>
                <button 
                    onClick={() => onLanguageChange('en')}
                    className={`px-2 py-1 rounded-full text-[10px] font-bold transition-all ${language === 'en' ? 'bg-white text-pink-500' : 'text-white hover:bg-pink-600'}`}
                >
                    ENG
                </button>
                </div>

                {onChat && (
                <button onClick={onChat} className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors relative">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    <span className="absolute top-0 right-0 h-2.5 w-2.5 bg-yellow-400 rounded-full border-2 border-pink-400"></span>
                </button>
                )}
            </div>
            </div>

            {/* Controls Bar (Font Size + AI) */}
            <div className="flex items-center justify-between gap-4">
                {/* Font Size Slider */}
                <div className="flex items-center gap-4 bg-white/10 px-3 py-2 rounded-xl flex-1 max-w-xs">
                    <span className="text-[10px] font-bold opacity-80 whitespace-nowrap">
                        <span className="text-xs">ก</span> - <span className="text-lg">ก</span>
                    </span>
                    <input 
                        type="range" 
                        min="0.9" 
                        max="1.3" 
                        step="0.05" 
                        value={fontSize} 
                        onChange={(e) => onFontSizeChange(parseFloat(e.target.value))}
                        className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-white"
                    />
                </div>

                {/* AI Assistant Button Area */}
                <div className="flex items-center justify-end relative">
                    {/* Text Bubble */}
                    {!isAssistantActive && (
                        <div className="hidden sm:block absolute right-[52px] top-1/2 -translate-y-1/2 bg-white text-pink-600 text-[10px] font-bold py-1 px-3 rounded-l-xl rounded-t-xl shadow-lg animate-bounce mr-1 whitespace-nowrap">
                            {language === 'th' ? "ต้องการความช่วยเหลือกดเลย!" : "Need help? Press here!"}
                            <div className="absolute right-0 top-1/2 translate-x-[4px] -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-l-[8px] border-l-white border-b-[6px] border-b-transparent"></div>
                        </div>
                    )}
                    
                    <button 
                    onClick={onToggleAssistant}
                    className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 transition-all shadow-lg active:scale-90 ${isAssistantActive ? 'bg-red-500 border-white animate-pulse' : 'bg-white border-pink-200'}`}
                    >
                    {isAssistantActive ? (
                        // Close / Stop Icon
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        // Physical Therapist / Doctor Icon
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 sm:h-8 sm:w-8 text-pink-500">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                            <path d="M0 0h24v24H0z" fill="none"/>
                        </svg>
                    )}
                    </button>
                </div>
            </div>
        </div>
      </header>

      {/* Main Content with Responsive Container */}
      <main className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 pb-24">
        {children}
      </main>
    </div>
  );
};

export default Layout;
