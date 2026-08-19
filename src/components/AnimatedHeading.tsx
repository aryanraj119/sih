import { useEffect, useState } from 'react';

interface AnimatedHeadingProps {
  text: string;
  className?: string;
  initialDelay?: number;
  charDelay?: number;
  duration?: number;
}

export const AnimatedHeading = ({
  text,
  className = 'text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-normal mb-4',
  initialDelay = 200,
  charDelay = 30,
  duration = 500,
}: AnimatedHeadingProps) => {
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimated(true);
    }, initialDelay);

    return () => clearTimeout(timer);
  }, [initialDelay]);

  const lines = text.split('\n');
  const line0Length = lines[0]?.length || 0;

  return (
    <h1
      className={`text-white ${className}`}
      style={{ letterSpacing: '-0.04em' }}
    >
      {lines.map((line, lineIndex) => (
        <span key={lineIndex} className="block">
          {line.split('').map((char, charIndex) => {
            const staggeredDelay = (lineIndex * line0Length * charDelay) + (charIndex * charDelay);
            const displayChar = char === ' ' ? '\u00A0' : char;

            return (
              <span
                key={charIndex}
                className="inline-block"
                style={{
                  opacity: isAnimated ? 1 : 0,
                  transform: isAnimated ? 'translateX(0)' : 'translateX(-18px)',
                  transitionDuration: `${duration}ms`,
                  transitionDelay: `${staggeredDelay}ms`,
                  transitionProperty: 'opacity, transform',
                  transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                {displayChar}
              </span>
            );
          })}
        </span>
      ))}
    </h1>
  );
};
