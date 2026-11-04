'use client';

import React, { useState, KeyboardEvent } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface TagInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  maxTags?: number;
}

const TagInput: React.FC<TagInputProps> = ({
  value = [],
  onChange,
  placeholder = 'Add tags...',
  className = '',
  maxTags = 20,
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Add tag on Enter or comma
    if ((e.key === 'Enter' || e.key === ',') && inputValue.trim()) {
      e.preventDefault();
      
      const newTag = inputValue.trim().toLowerCase();
      
      // Check if tag already exists
      if (!value.includes(newTag) && value.length < maxTags) {
        onChange([...value, newTag]);
      }
      
      setInputValue('');
    }
    
    // Remove last tag on Backspace if input is empty
    if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className={`flex min-h-11 flex-wrap gap-2 rounded-xl border border-input bg-[#101116] p-2.5 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/25 ${className}`}>
      {value.map((tag) => (
        <div
          key={tag}
          className="flex items-center gap-1.5 rounded-lg border border-[#4a435d] bg-[#272331] px-2.5 py-1 text-sm text-[#ddd4f7]"
        >
          <span>{tag}</span>
          <button
            type="button"
            onClick={() => removeTag(tag)}
            className="grid size-6 place-items-center rounded-md text-[#b9ace0] hover:bg-[#352f42] hover:text-white focus-visible:outline-none"
            aria-label={`Remover ${tag}`}
          >
            <XMarkIcon className="size-3.5" />
          </button>
        </div>
      ))}
      
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={value.length === 0 ? placeholder : ''}
        className="min-w-[120px] flex-grow border-none bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
};

export default TagInput;
