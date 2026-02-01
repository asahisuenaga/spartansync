import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { VOICES } from '../lib/elevenlabs';

type AccessibilityContextType = {
    dyslexicFont: boolean;
    highContrast: boolean;
    voiceId: string;
    toggleDyslexicFont: () => void;
    toggleHighContrast: () => void;
    setVoiceId: (id: string) => void;
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider = ({ children }: { children: ReactNode }) => {
    const [dyslexicFont, setDyslexicFont] = useState(false);
    const [highContrast, setHighContrast] = useState(false);
    const [voiceId, setVoiceId] = useState(VOICES.ADAM); // Default to Adam

    const toggleDyslexicFont = () => {
        setDyslexicFont(prev => {
            const newValue = !prev;
            if (newValue) document.body.classList.add('font-dyslexic');
            else document.body.classList.remove('font-dyslexic');
            return newValue;
        });
    };

    const toggleHighContrast = () => {
        setHighContrast(prev => {
            const newValue = !prev;
            if (newValue) document.body.classList.add('accessibility-high-contrast');
            else document.body.classList.remove('accessibility-high-contrast');
            return newValue;
        });
    };

    return (
        <AccessibilityContext.Provider value={{
            dyslexicFont,
            highContrast,
            voiceId,
            toggleDyslexicFont,
            toggleHighContrast,
            setVoiceId
        }}>
            {children}
        </AccessibilityContext.Provider>
    );
};

export const useAccessibility = () => {
    const context = useContext(AccessibilityContext);
    if (context === undefined) {
        throw new Error('useAccessibility must be used within an AccessibilityProvider');
    }
    return context;
};
