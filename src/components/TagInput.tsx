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
    <div className={`flex flex-wrap gap-2 p-2 bg-gray-800 border border-gray-700 rounded-md focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 ${className}`}>
      {value.map((tag) => (
        <div
          key={tag}
          className="flex items-center gap-1 px-2 py-1 text-sm bg-indigo-900 text-indigo-100 rounded-md"
        >
          <span>{tag}</span>
          <button
            type="button"
            onClick={() => removeTag(tag)}
            className="text-indigo-300 hover:text-white focus:outline-none"
          >
            <XMarkIcon className="h-3 w-3" />
          </button>
        </div>
      ))}
      
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={value.length === 0 ? placeholder : ''}
        className="flex-grow min-w-[120px] bg-transparent border-none outline-none text-white placeholder-gray-400"
      />
    </div>
  );
};

export default TagInput;
