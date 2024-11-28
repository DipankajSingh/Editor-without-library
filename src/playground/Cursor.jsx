import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { useEditorContext } from '../context/EditorProvider';
import { charWidthInPxl } from '../utils/measurement';

export default function Cursor({ playgroundRef }) {
  const cursorRef = useRef(null);
  const {
    cursorPositionInActiveLine,
    handleCursorPositionChange,
    activeLine,
    lineData,
    updateActiveLine,
    textSize
  } = useEditorContext();

  const getCurrentCharAtCursor = useCallback((direction) => {
    const currentLine = lineData[activeLine];
    const flatText = currentLine.text.map((segment) => segment.content).join('');
    if(direction === "left") {
      return flatText[cursorPositionInActiveLine - 1];
    } else if(direction === "right") {
      return flatText[cursorPositionInActiveLine];
    }
  }, [lineData, activeLine, cursorPositionInActiveLine]);

  const updateCursorPosition = useCallback((direction) => {
    if (!playgroundRef.current || !cursorRef.current) return;
  
    const playgroundRect = playgroundRef.current.getBoundingClientRect();
    const cursorRect = cursorRef.current.getBoundingClientRect();
    const currentLeft = cursorRect.left - playgroundRect.left;
  
    const currentChar = getCurrentCharAtCursor(direction);
    if (!currentChar) {
      console.warn('No character found at cursor position');
      return;
    }
  
    const charWidth = charWidthInPxl(currentChar, textSize);
    if (!charWidth) {
      console.warn('Invalid character width');
      return;
    }
  
    const offset = direction === "left" ? -charWidth : charWidth;
    const newLeft = Math.max(0, currentLeft + offset);
  
    cursorRef.current.style.left = `${newLeft}px`;
  }, [getCurrentCharAtCursor, textSize]);

  const moveLeft = useCallback(() => {
    if (cursorPositionInActiveLine === 0) return;
    handleCursorPositionChange(cursorPositionInActiveLine - 1);
    updateCursorPosition("left");
  }, [cursorPositionInActiveLine, handleCursorPositionChange, updateCursorPosition]);

  const moveRight = useCallback(() => {
    if (cursorPositionInActiveLine === lineData[activeLine].length) return;
    handleCursorPositionChange(cursorPositionInActiveLine + 1);
    updateCursorPosition("right");
  }, [cursorPositionInActiveLine, lineData, activeLine, handleCursorPositionChange, updateCursorPosition]);

  const insertText = useCallback((char) => {
    updateActiveLine(char, "char");
    handleCursorPositionChange(cursorPositionInActiveLine + 1);
    updateCursorPosition("right");
  }, [updateActiveLine, handleCursorPositionChange, cursorPositionInActiveLine, updateCursorPosition]);

  const deleteText = useCallback(() => {
    updateActiveLine("", "backspace");
    handleCursorPositionChange(cursorPositionInActiveLine - 1);
    updateCursorPosition("left");
  }, [updateActiveLine, handleCursorPositionChange, cursorPositionInActiveLine, updateCursorPosition]);

  const handleKeyDown = useCallback((event) => {
    if (event.key === 'ArrowLeft') {
      moveLeft();
    } else if (event.key === 'ArrowRight') {
      moveRight();
    } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
      insertText(event.key);
    } else if (event.key === 'Backspace') {
      deleteText();
    }
  }, [moveLeft, moveRight, insertText, deleteText]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div
      ref={cursorRef}
      style={{
        position: 'absolute',
        width: '0.5px',
        height: `${textSize}px`,
        left: '6.5px',
        top: '12px',
        backgroundColor: 'white',
        transition: 'left 0.05s ease'
      }}
    />
  );
}