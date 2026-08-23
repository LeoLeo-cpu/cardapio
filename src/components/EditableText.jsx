import React, { useRef, useEffect, useState } from 'react';

export default function EditableText({ 
  value, 
  onChange, 
  placeholder = "Clique para editar", 
  className = "",
  style = {},
  tagName = "div",
  formatValue
}) {
  const contentEditableRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);

  const displayValue = !isEditing && formatValue && value ? formatValue(value) : value;

  useEffect(() => {
    if (contentEditableRef.current && !isEditing) {
      if (contentEditableRef.current.textContent !== displayValue) {
        contentEditableRef.current.textContent = displayValue || '';
      }
      
      if (!displayValue && placeholder) {
        contentEditableRef.current.textContent = placeholder;
      }
    }
  }, [displayValue, placeholder, isEditing]);

  const handleBlur = (e) => {
    setIsEditing(false);
    let text = e.target.textContent;
    if (text === placeholder) text = '';
    
    if (onChange) {
      onChange(text);
    }
  };

  const handleFocus = (e) => {
    setIsEditing(true);
    if (e.target.textContent === placeholder) {
      e.target.textContent = '';
    } else {
      e.target.textContent = value || '';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      contentEditableRef.current.blur();
    }
  };

  const Tag = tagName;

  return (
    <Tag
      ref={contentEditableRef}
      contentEditable
      suppressContentEditableWarning
      className={`editable-text ${className}`}
      style={{ cursor: 'text', ...style }}
      onBlur={handleBlur}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
    />
  );
}
