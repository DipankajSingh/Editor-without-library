import React, { createContext, useState, useCallback } from 'react';

/**
 * @typedef {Object} TextStyle
 * @property {boolean} [bold] - Whether the text is bold
 * @property {string} [color] - Text color (e.g., "red")
 */

/**
 * @typedef {Object} TextSegment
 * @property {string} content - The text content
 * @property {TextStyle} styles - Styling information for this segment
 */

/**
 * @typedef {Object} LineData
 * @property {TextSegment[]} text - Array of text segments with their styles
 * @property {number} length - Total length of the line
 * @property {number} textSize - Size of the text
 */

/**
 * @typedef {Object} EditorContextType
 * @property {LineData[]} lineData - Array of line data
 * @property {(newLineData: LineData[]) => void} handleLineDataChange - Function to update line data
 * @property {number} activeLine - Current active line number
 * @property {number} cursorPositionInActiveLine - Cursor position in the active line
 * @property {(newPosition: number) => void} handleCursorPositionChange - Function to update cursor position
 * @property {(newLine: number) => void} handleActiveLineChange - Function to change active line
 */

/**
 * React Context for the code editor
 * Provides state and functions for managing editor content, cursor position, and line data
 * @type {React.Context<EditorContextType>}
 */
export const EditorContext = createContext();

export const useEditorContext = () => {
  const context = React.useContext(EditorContext);
  if (!context) {
    throw new Error('useEditorContext must be used within a EditorProvider');
  }
  return context;
};

// Line Data Structure
let lines=[
  {
    text: [
      { content: "ine "},
      { content: "no. ", styles: {color: "purple"}},
      { content: "1"},
  ], 
  length: 9
  }
]

// Utility functions
const findActiveSegment = (currentLine, cursorPosition) => {
  let cumulativeLength = 0;
  
  for (let i = 0; i < currentLine.text.length; i++) {
    const segment = currentLine.text[i];
    if (cumulativeLength + segment.content.length >= cursorPosition) {
      return {
        activeSegmentIndex: i,
        positionInSegment: cursorPosition - cumulativeLength
      };
    }
    cumulativeLength += segment.content.length;
  }
  
  return {
    activeSegmentIndex: currentLine.text.length - 1,
    positionInSegment: currentLine.text[currentLine.text.length - 1].content.length
  };
};

const createUpdatedSegment = (segment, position, char, isInserting = true) => {
  if (isInserting) {
    return {
      content: segment.content.slice(0, position) + char + segment.content.slice(position),
      styles: segment.styles
    };
  }
  return {
    content: segment.content.slice(0, position - 1) + segment.content.slice(position),
    styles: segment.styles
  };
};

const mergeSegments = (prevSegment, currentSegment) => ({
  content: prevSegment.content + currentSegment.content,
  styles: prevSegment.styles
});





export const EditorProvider = ({ children }) => {
  const [activeLine, setActiveLine] = useState(0);
  const [lineData, setLineData] = useState(lines);
  // Initialize cursor position at the end of the active line
  const [cursorPositionInActiveLine, setCursorPositionInActiveLine] = useState(() => {
    return lines[0].text.reduce((total, segment) => total + segment.content.length, 0);
  });
  const [textSize, setTextSize] = useState(25);

  const [totalLines, setTotalLines] = useState(() => {
    return lines.length;
  });

  const handleInsertText = useCallback((currentLine, char, segmentInfo) => {
    const { activeSegmentIndex, positionInSegment } = segmentInfo;
    const newSegments = [...currentLine.text];
    const activeSegment = newSegments[activeSegmentIndex];
    newSegments[activeSegmentIndex] = createUpdatedSegment(
      activeSegment,
      positionInSegment,
      char,
      true
    );

    return {
      ...currentLine,
      text: newSegments,
      length: currentLine.length + 1
    };
  }, []);

  const handleBackspace = useCallback((currentLine, segmentInfo) => {
    const { activeSegmentIndex, positionInSegment } = segmentInfo;
    
    if (positionInSegment === 0 && activeSegmentIndex > 0) {
      const newSegments = [...currentLine.text];
      const mergedSegment = mergeSegments(
        newSegments[activeSegmentIndex - 1],
        newSegments[activeSegmentIndex]
      );
      
      newSegments[activeSegmentIndex - 1] = mergedSegment;
      newSegments.splice(activeSegmentIndex, 1);

      return {
        ...currentLine,
        text: newSegments,
        length: currentLine.length - 1
      };
    }
    
    const newSegments = [...currentLine.text];
    const activeSegment = newSegments[activeSegmentIndex];
    
    newSegments[activeSegmentIndex] = createUpdatedSegment(
      activeSegment,
      positionInSegment,
      '',
      false
    );

    return {
      ...currentLine,
      text: newSegments,
      length: currentLine.length - 1
    };
  }, []);

  const updateActiveLine = useCallback((char, action) => {
    const currentLine = lineData[activeLine];
    
    if (action === "backspace" && cursorPositionInActiveLine === 0) return;
    
    const segmentInfo = findActiveSegment(currentLine, cursorPositionInActiveLine);
    
    const updatedLine = action === "char"
      ? handleInsertText(currentLine, char, segmentInfo)
      : handleBackspace(currentLine, segmentInfo);
    
    setLineData(prev => {
      const newData = [...prev];
      newData[activeLine] = updatedLine;
      return newData;
    });

    // Update cursor position after text insertion
    if (action === "char") {
      setCursorPositionInActiveLine(prev => prev + 1);
    } else if (action === "backspace") {
      setCursorPositionInActiveLine(prev => Math.max(0, prev - 1));
    }else if(action==="Delete"){
      setCursorPositionInActiveLine(prev => Math.max(0, prev + 1));
    }
  }, [lineData, activeLine, cursorPositionInActiveLine, handleInsertText, handleBackspace]);

  const handleCursorPositionChange = useCallback((newCursorPositionInActiveLine) => {
    setCursorPositionInActiveLine(newCursorPositionInActiveLine);
  }, []);

  const handleActiveLineChange = useCallback((newActiveLine) => {
    console.log('Line changed');
    setActiveLine(newActiveLine);
  }, []);
 
  const handleLineDataChange = useCallback((newLineData) => {
    setLineData(newLineData);
  }, []);

  function handleEnterPress() {
    const currentLine = lineData[activeLine];
    

    function createLine(content="") {
      handleLineDataChange([...lineData, {
        text: [{ content, styles: {} }],
        length: content.length
      }]);
      handleActiveLineChange(activeLine + 1);
    }

    // if active line dont have text just add a new line
  if((cursorPositionInActiveLine === currentLine.length) || (!currentLine.text.length)) {
      createLine()
    } else {
      newLineWithTextFromCurrentLine();
    }


    function newLineWithTextFromCurrentLine() {
      const currentLine = lineData[activeLine];
      const { activeSegmentIndex, positionInSegment } = findActiveSegment(currentLine, cursorPositionInActiveLine);
      const currentSegment = currentLine.text[activeSegmentIndex];
      
      // Split the active segment
      const beforeContent = currentSegment.content.slice(0, positionInSegment);
      const afterContent = currentSegment.content.slice(positionInSegment);
      
      // Create segments for both lines
      const beforeSegments = [
        ...currentLine.text.slice(0, activeSegmentIndex),
        ...(beforeContent ? [{ content: beforeContent, styles: { ...currentSegment.styles } }] : [])
      ];
      
      const afterSegments = [
        ...(afterContent ? [{ content: afterContent, styles: { ...currentSegment.styles } }] : []),
        ...currentLine.text.slice(activeSegmentIndex + 1)
      ];
      
      // Create new lines with preserved styles
      const updatedCurrentLine = {
        text: beforeSegments,
        length: beforeSegments.reduce((total, seg) => total + seg.content.length, 0)
      };
      
      const newLine = {
        text: afterSegments,
        length: afterSegments.reduce((total, seg) => total + seg.content.length, 0)
      };
      
      // Update line data with the split lines
      const newLineData = [...lineData];
      newLineData[activeLine] = updatedCurrentLine;
      newLineData.splice(activeLine + 1, 0, newLine);
      handleLineDataChange(newLineData);
      handleActiveLineChange(activeLine + 1);
      handleCursorPositionChange(0); // Move cursor to start of new line
    }
  }

  return (
    <EditorContext.Provider value={{
      lineData, 
      handleLineDataChange, 
      activeLine, 
      cursorPositionInActiveLine, 
      handleCursorPositionChange, 
      handleActiveLineChange,
      updateActiveLine,
      textSize,
      setTextSize,
      handleEnterPress,
      totalLines
      }}>
      {children}
    </EditorContext.Provider>
  );
};
