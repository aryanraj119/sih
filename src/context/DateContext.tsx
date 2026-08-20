import React, { createContext, useContext, useState } from 'react';

interface DateContextType {
  selectedDate: string; // YYYY-MM-DD
  setSelectedDate: (date: string) => void;
  presetDates: { label: string; date: string; season: string }[];
}

const DEFAULT_PRESET_DATES = [
  { label: '🔥 Summer Heatwave Peak (June 15)', date: '2026-06-15', season: 'Summer Peak' },
  { label: '🌧️ Monsoon High Humidity (July 20)', date: '2026-07-20', season: 'Monsoon Load' },
  { label: '⚡ Peak Summer Load (August 20)', date: '2026-08-20', season: 'Max Demand' },
  { label: '🍃 Late Summer Transition (Sept 01)', date: '2026-09-01', season: 'Transition' },
];

const DateContext = createContext<DateContextType>({
  selectedDate: '2026-08-20',
  setSelectedDate: () => {},
  presetDates: DEFAULT_PRESET_DATES,
});

export const DateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedDate, setSelectedDate] = useState<string>('2026-08-20');

  return (
    <DateContext.Provider
      value={{
        selectedDate,
        setSelectedDate,
        presetDates: DEFAULT_PRESET_DATES,
      }}
    >
      {children}
    </DateContext.Provider>
  );
};

export const useDate = () => useContext(DateContext);
