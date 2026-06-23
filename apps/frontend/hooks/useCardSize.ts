import { useState, useEffect } from 'react';

export type CardSize = 'small' | 'medium' | 'large';

export function useCardSize(defaultSize: CardSize = 'medium') {
  const [size, setSize] = useState<CardSize>(defaultSize);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('arrena_template_card_size') as CardSize;
    if (saved && ['small', 'medium', 'large'].includes(saved)) {
      setSize(saved);
    }
  }, []);

  const updateSize = (newSize: CardSize) => {
    setSize(newSize);
    localStorage.setItem('arrena_template_card_size', newSize);
  };

  return { size, setSize: updateSize, mounted };
}
