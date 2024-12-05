import React, { createContext, useState, useCallback, useRef } from 'react';

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
let lines = [
  {
    text: [
      { content: "Line " },
      { content: "no. ", styles: { color: "purple" } },
      { content: "1" },
    ],
    length: 10
  }
]

// Utility functions for text segment operations
const segmentOperations = {
  calculateLength: (segments) => segments.reduce((total, seg) => total + seg.content.length, 0),

  createSegment: (content="", styles = {}) => ({
    content,
    styles: { ...styles }
  }),

  splitSegment: (segment, position=0) => ({
    before: segment.content.slice(0, position),
    after: segment.content.slice(position)
  }),

  createSegmentsFromSplit: (segment, { before, after }) => ({
    beforeSegments: before ? [{ content: before, styles: { ...segment.styles } }] : [],
    afterSegments: after ? [{ content: after, styles: { ...segment.styles } }] : []
  }),

  mergeMultipleSegments: (segments=[]) => ({
    content: segments.map((segment) => segment.content).join(''),
    styles: segments[0].styles
  })
};

// Line operations
const lineOperations = {
  createEmptyLine: (styles) => {
    return {
      text: [{ content: "", styles: { ...styles } }],
      length: 0
    };
  },

  createLineWithContent: (content, styles = {}) => ({
    text: [{ content, styles }],
    length: content.length
  }),

  splitLine: (line, segmentIndex, position) => {
    if (segmentIndex === 0 && position === 0) {
      return {
        beforeLine: lineOperations.createEmptyLine(line.text[0].styles),
        afterLine: {
          text: [...line.text],
          length: segmentOperations.calculateLength(line.text)
        }
      };
    }

    const segment = line.text[segmentIndex];
    const { before, after } = segmentOperations.splitSegment(segment, position);
    const { beforeSegments, afterSegments } = segmentOperations.createSegmentsFromSplit(segment, { before, after });

    const beforeLineSegments = [...line.text.slice(0, segmentIndex), ...beforeSegments];
    const afterLineSegments = [...afterSegments, ...line.text.slice(segmentIndex + 1)];

    return {
      beforeLine: {
        text: beforeLineSegments,
        length: segmentOperations.calculateLength(beforeLineSegments)
      },
      afterLine: {
        text: afterLineSegments,
        length: segmentOperations.calculateLength(afterLineSegments)
      }
    };
  }
};

// State update helpers
const stateUpdaters = {
  updateLineData: (prevData, index, newLine) => {
    const newData = [...prevData];
    newData[index] = newLine;
    return newData;
  },

  insertLine: (prevData, index, newLine) => {
    const newData = [...prevData];
    console.log(newLine);
    newData.splice(index + 1, 0, newLine);
    return newData;
  },

  removeLine: (prevData, index) => {
    const newData = [...prevData];
    newData.splice(index, 1);
    return newData;
  }
};

// Utility functions
const findActiveSegment = (currentLine, cursorPosition) => {
  if (cursorPosition === 0) {
    return {
      activeSegmentIndex: 0,
      positionInSegment: 0
    };
  }

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

const shouldMergeLines = (action, currentLine, cursorPos, lineNum) => {
  return (
    action === "backspace" &&
    cursorPos === 0 &&
    lineNum > 0 &&
    !currentLine.text.length === 0
  );
};

const updateLineContent = (action, char, line, segmentInfo) => {
  const { activeSegmentIndex, positionInSegment } = segmentInfo;
  const newSegments = [...line.text];
  const activeSegment = newSegments[activeSegmentIndex];

  newSegments[activeSegmentIndex] = createUpdatedSegment(
    activeSegment,
    positionInSegment,
    char,
    action === "char"
  );

  return {
    text: newSegments,
    length: segmentOperations.calculateLength(newSegments)
  };
};

export const EditorProvider = ({ children }) => {
  const tempSegment=useRef(null);
  const [activeColor, setActiveColor] = useState("#ffffff");
  const [activeLine, setActiveLine] = useState(0);
  const [lineData, setLineData] = useState(lines);
  const [cursorPositionInActiveLine, setCursorPositionInActiveLine] = useState(() => {
    return segmentOperations.calculateLength(lines[0].text);
  });
  const [textSize, setTextSize] = useState(25);
  const [totalLines, setTotalLines] = useState(lines.length);
  const [isColorWasChanged, setIsColorWasChanged] = useState(false);

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
      text: newSegments,
      length: segmentOperations.calculateLength(newSegments)
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
        text: newSegments,
        length: segmentOperations.calculateLength(newSegments)
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
      text: newSegments,
      length: segmentOperations.calculateLength(newSegments)
    };
  }, []);

  const mergeLines = useCallback((lineToMerge = activeLine, lineToMergeWith = 0) => {
    const line1 = lineData[lineToMerge];
    const line2 = lineData[lineToMergeWith];
    const mergedLine = {
      text: [...line1.text, ...line2.text],
      length: line1.length + line2.length
    };

    setLineData(prevData => {
      const newData = stateUpdaters.updateLineData(prevData, lineToMerge, mergedLine);
      return stateUpdaters.removeLine(newData, lineToMergeWith);
    });
    setActiveLine(lineToMerge);
    setCursorPositionInActiveLine(mergedLine.length);
  }, [activeLine, lineData]);

// Function to handle Enter key press
  const handleEnterPress = useCallback(() => {
    const currentLine = lineData[activeLine];

    if (cursorPositionInActiveLine === currentLine.length || !currentLine.text.length) {
      console.log("empty line or cursor at end of line");
      setLineData(prevData => 
        stateUpdaters.insertLine(
          prevData,
          activeLine,
          lineOperations.createEmptyLine({color: activeColor})
        )
      );
      setActiveLine(prev => prev + 1);
      setCursorPositionInActiveLine(0);
      return;
    }

    const { activeSegmentIndex, positionInSegment } = findActiveSegment(currentLine, cursorPositionInActiveLine);
    const { beforeLine, afterLine } = lineOperations.splitLine(currentLine, activeSegmentIndex, positionInSegment);

    setLineData(prevData => {
      const updatedData = stateUpdaters.updateLineData(prevData, activeLine, beforeLine);
      return stateUpdaters.insertLine(updatedData, activeLine, afterLine);
    });

    setActiveLine(activeLine + 1);
    setCursorPositionInActiveLine(0);
  }, [activeLine, cursorPositionInActiveLine, lineData]);

  const updateActiveLine = useCallback((char, action) => {
    if(lineData.length === 0) return;
    const currentLine = lineData[activeLine];

    if (action === "backspace" && currentLine.length === 0) {
      if (activeLine === 0 && currentLine.length === 0 ) {
        return;
      }
      const newLineData = [...lineData];
      newLineData.splice(activeLine, 1);
      setLineData(newLineData);
      setActiveLine((prev) => Math.max(0, prev - 1));
      setCursorPositionInActiveLine(lineData[activeLine].length);
      return;
    }

    if (shouldMergeLines(action, currentLine, cursorPositionInActiveLine, activeLine)) {
      mergeLines(activeLine, activeLine - 1);
      setCursorPositionInActiveLine(0);
      return;
    }

    if(isColorWasChanged) {
      tempSegment.current.content=char;
      currentLine.length=segmentOperations.calculateLength(currentLine.text);
      setIsColorWasChanged(false);
      tempSegment.current=null;
      return;
    }

    const segmentInfo = findActiveSegment(currentLine, cursorPositionInActiveLine);
    const updatedLine = updateLineContent(action, char, currentLine, segmentInfo);

    setLineData((prev) => {
      const newData = [...prev];
      newData[activeLine] = updatedLine;
      return newData;
    });

    setCursorPositionInActiveLine((prev) => {
      if (action === "char") {
        return prev + 1;
      } else if (action === "backspace") {
        return prev - 1;
      }
    });
  }, [lineData, activeLine, cursorPositionInActiveLine, handleInsertText, handleBackspace]);

  const handleCursorPositionChange = useCallback((newCursorPositionInActiveLine) => {
    setCursorPositionInActiveLine(newCursorPositionInActiveLine);
  }, []);

  const handleActiveLineChange = useCallback((newActiveLine) => {
    setActiveLine(newActiveLine);
  }, []);

  const handleLineDataChange = useCallback((newLineData) => {
    setLineData(newLineData);
  }, []);

  // Function to handle text color change
  const handleTextColorChange = useCallback((newTextColor) => {
    setActiveColor(newTextColor);
    const currentLine = lineData[activeLine];
    const { activeSegmentIndex, positionInSegment } = findActiveSegment(currentLine, cursorPositionInActiveLine);
    const activeSegment = currentLine.text[activeSegmentIndex];
    
    const newSegment = segmentOperations.createSegment('', { color: newTextColor });
    tempSegment.current = newSegment;

    const { before, after } = segmentOperations.splitSegment(activeSegment, positionInSegment);
    const { beforeSegments, afterSegments } = segmentOperations.createSegmentsFromSplit(activeSegment, { before, after });

    const updatedLine = stateUpdaters.updateLineData(
      lineData,
      activeLine,
      {
        text: [
          ...currentLine.text.slice(0, activeSegmentIndex),
          ...beforeSegments,
          newSegment,
          ...afterSegments,
          ...currentLine.text.slice(activeSegmentIndex + 1)
        ],
        length: currentLine.length
      }
    )[activeLine];

    setLineData(prev => {
      const newData = [...prev];
      newData[activeLine] = updatedLine;
      return newData;
    });

    setIsColorWasChanged(true);
  }, [activeColor, activeLine, cursorPositionInActiveLine]);
    
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
      totalLines,
      handleTextColorChange,
    }}>
      {children}
    </EditorContext.Provider>
  );
};
