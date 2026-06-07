import { createContext, useContext, useState, useEffect } from 'react';

const FontScaleContext = createContext();

export const FontScaleProvider = ({ children }) => {
  const [scale, setScale] = useState(() => {
    const saved = localStorage.getItem('app-font-scale');
    return saved ? parseFloat(saved) : 1.0;
  });

  const incrementFont = () => {
    setScale(prev => {
      const next = parseFloat((prev + 0.05).toFixed(2));
      localStorage.setItem('app-font-scale', next);
      return next;
    });
  };

  const decrementFont = () => {
    setScale(prev => {
      // Establish a reasonable lower bound (e.g., 0.70rem) to keep text legible
      const next = parseFloat(Math.max(0.70, prev - 0.05).toFixed(2));
      localStorage.setItem('app-font-scale', next);
      return next;
    });
  };

  const resetFont = () => {
    setScale(1.0);
    localStorage.setItem('app-font-scale', 1.0);
  };

  useEffect(() => {
    document.documentElement.style.setProperty('--app-font-scale', `${scale}rem`);
  }, [scale]);

  return (
    <FontScaleContext.Provider value={{ scale, incrementFont, decrementFont, resetFont }}>
      {children}
    </FontScaleContext.Provider>
  );
};

export const useFontScale = () => {
  const context = useContext(FontScaleContext);
  if (!context) {
    throw new Error('useFontScale must be used within a FontScaleProvider');
  }
  return context;
};
