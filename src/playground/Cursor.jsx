import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { useEditorContext } from '../context/EditorProvider';
import { charWidthInPxl } from '../utils/measurement';

export default function Cursor({ playgroundRef }) {
  const cursorRef = useRef(null);
  const cursorPositionRef = useRef(0);
  const {
    cursorPositionInActiveLine,
    handleCursorPositionChange,
    activeLine,
    lineData,
    updateActiveLine,
    textSize,
    handleEnterPress,
    handleActiveLineChange,
    totalLines
  } = useEditorContext();



  // Memoize getCurrentCharAtCursor with all its dependencies
  const getCurrentCharAtCursor = useCallback((direction) => {
    const currentLine = lineData[activeLine];
    const flatText = currentLine.text.map((segment) => segment.content).join('');
    if(direction === "left") {
      return flatText[cursorPositionInActiveLine - 1];
    } else if(direction === "right") {
      return flatText[cursorPositionInActiveLine];
    }
  }, [lineData, activeLine, cursorPositionInActiveLine]);

  // Memoize updateCursorPosition with all its dependencies
  const updateCursorPosition = useCallback((direction) => {
    if (!playgroundRef.current || !cursorRef.current) return;
  
    const currentChar = getCurrentCharAtCursor(direction);
    if (!currentChar) {
      return;
    }
  
    const charWidth = charWidthInPxl(currentChar, textSize);
    if (!charWidth) {
      return;
    }
  
    const offset = direction === "left" ? -charWidth : charWidth;
    cursorPositionRef.current = Math.max(0, cursorPositionRef.current + offset);
  
    cursorRef.current.style.transform = `translate(${cursorPositionRef.current}px, ${textSize * activeLine}px)`;
  }, [getCurrentCharAtCursor, textSize, playgroundRef]);

  // Memoize movement handlers
  const moveLeft = useCallback(() => {
    if (cursorPositionInActiveLine === 0) {
      // Only move to previous line if we're not at the first line
      if (activeLine > 0) {
        handleActiveLineChange(activeLine - 1);
        // Move cursor to end of previous line
        const prevLineLength = lineData[activeLine - 1].length;
        handleCursorPositionChange(prevLineLength);
      }
      return;
    }
    handleCursorPositionChange(cursorPositionInActiveLine - 1);
    updateCursorPosition("left");
  }, [cursorPositionInActiveLine, activeLine, lineData, handleActiveLineChange, handleCursorPositionChange, updateCursorPosition]);

  const moveRight = useCallback(() => {
    if (cursorPositionInActiveLine === lineData[activeLine].length) {
      // Only move to next line if we're not at the last line
      if (activeLine < lineData.length - 1) {
        handleActiveLineChange(activeLine + 1);
        // Move cursor to start of next line
        handleCursorPositionChange(0);
      }
      return;
    }
    handleCursorPositionChange(cursorPositionInActiveLine + 1);
    updateCursorPosition("right");
  }, [cursorPositionInActiveLine, lineData, activeLine, handleActiveLineChange, handleCursorPositionChange, updateCursorPosition]);

  // Memoize text handlers
  const insertText = useCallback((char) => {
    updateActiveLine(char, "char");
    handleCursorPositionChange(cursorPositionInActiveLine + 1);
    // Only update cursor position if not at the end of line
    if(lineData.length === 0) {
      console.log("lineData is empty",lineData);
      return;
    }
    const currentLine = lineData[activeLine];
    const isEndOfLine = cursorPositionInActiveLine === currentLine.length;
    if (!isEndOfLine) {
      updateCursorPosition("right");
    }
  }, [updateActiveLine, handleCursorPositionChange, cursorPositionInActiveLine, updateCursorPosition, lineData, activeLine]);

  const deleteText = useCallback((key) => {
    if (key === 'Backspace') {
      updateActiveLine("", "backspace");
    } else if (key === 'Delete') {
      updateActiveLine("", "delete");
    }
    handleCursorPositionChange(cursorPositionInActiveLine - 1);
    // Only update cursor position if not at the start of line
    if (cursorPositionInActiveLine > 0) {
      updateCursorPosition("left");
    }
  }, [updateActiveLine, handleCursorPositionChange, cursorPositionInActiveLine, updateCursorPosition]);

  const handleKeyDown = useCallback((event) => {
    requestAnimationFrame(() => {
      if (event.key === 'ArrowLeft') {
        moveLeft();
      } else if (event.key === 'ArrowRight') {
        moveRight();
      } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
        insertText(event.key);
      } else if (event.key === 'Backspace' || event.key === 'Delete') {
        deleteText(event.key);
      } else if (event.key === 'Enter') {
        handleEnterPress();
      }else if (event.key === 'ArrowUp') {
        if (activeLine > 0) {
          handleActiveLineChange(activeLine - 1);
        }
      }else if (event.key === 'ArrowDown') {
        if (activeLine < lineData.length - 1) {
          handleActiveLineChange(activeLine + 1);
        }
      }
    });
  }, [moveLeft, moveRight, insertText, deleteText, handleEnterPress]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Update cursor position when lineData, activeLine, or cursorPositionInActiveLine changes
  useEffect(() => {
    if(lineData.length === 0) {
      return;
    }
    const flatText = lineData[activeLine].text.map((segment) => segment.content).join('');
    const newPosition = charWidthInPxl(flatText.slice(0, cursorPositionInActiveLine), textSize);
    cursorPositionRef.current = newPosition;
    cursorRef.current.style.transform = `translate(${newPosition}px, ${(textSize) * activeLine}px)`;
  }, [lineData, activeLine, cursorPositionInActiveLine, textSize]);

  // Debug
  // function debugText() {
  //     console.log(lineData)
  // }
  // debugText()
  return (
    <div
      ref={cursorRef}
      className='absolute w-[2px] bg-slate-200 z-50'
      style={{
        
        height: `${textSize}px`
      }}
    />
  );
}