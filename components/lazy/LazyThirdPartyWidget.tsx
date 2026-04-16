import { useEffect, useState, useRef } from 'react';

interface LazyThirdPartyWidgetProps {
    children: React.ReactNode;
    rootMargin?: string;
    threshold?: number | number[];
}

export function LazyThirdPartyWidget({
    children,
    rootMargin = '100px',
    threshold = 0
}: LazyThirdPartyWidgetProps) {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            {
                rootMargin,
                threshold
            }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, [rootMargin, threshold]);

    if (!isVisible) {
        return <div ref={ref} aria-hidden="true" />;
    }

    return (
        <div ref={ref}>
            {children}
        </div>
    );
}