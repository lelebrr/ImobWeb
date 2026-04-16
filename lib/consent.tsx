import { createContext, useContext, useEffect, useState } from 'react';

const ConsentContext = createContext({
    hasConsent: false,
    giveConsent: () => { },
    revokeConsent: () => { },
});

export const ConsentProvider = ({ children }: { children: React.ReactNode }) => {
    const [hasConsent, setHasConsent] = useState(false);

    useEffect(() => {
        // Check for consent cookie
        if (typeof window !== 'undefined') {
            const consent = document.cookie
                .split('; ')
                .find(row => row.startsWith('imobweb_consent='))
                ?.split('=')[1];
            if (consent === 'true') {
                setHasConsent(true);
            }
        }
    }, []);

    const giveConsent = () => {
        setHasConsent(true);
        // Set cookie for 1 year
        document.cookie = 'imobweb_consent=true; path=/; max-age=' + 60 * 60 * 24 * 365;
    };

    const revokeConsent = () => {
        setHasConsent(false);
        document.cookie = 'imobweb_consent=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    };

    return (
        <ConsentContext.Provider value={{ hasConsent, giveConsent, revokeConsent }}>
            {children}
        </ConsentContext.Provider>
    );
};

export const useConsent = () => useContext(ConsentContext);