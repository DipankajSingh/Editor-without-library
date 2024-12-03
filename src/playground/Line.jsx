import React, { memo } from 'react';
import { useEditorContext } from '../context/EditorProvider';
import { charWidthInPxl } from '../utils/measurement';

const Line = memo(function Line({line, lineIndex, isActive}) {
  const { textSize } = useEditorContext();
  return (
    <pre 
      style={{ 
        whiteSpace: 'pre-wrap',
        fontFamily: 'monospace, Arial, sans-serif', 
        fontSize: `${textSize}px`,
        lineHeight: '1',
        height: 'fit-content',
        width: 'fit-content',
      }} 
      className={`flex bg-red-500 flex-row before:content-['${lineIndex + 1}']}`}
    >
       {line.text.length === 0 ? '\u00A0' : line.text.map((segment, index) => (
        <span 
          key={index} 
          style={{ 
            color: segment?.styles?.color,
            width: 'fit-content',
            display: 'inline-block',
            fontFeatureSettings: 'tnum',
            WebkitFontSmoothing: 'subpixel-antialiased',
            textRendering: 'geometricPrecision'
          }}
        >
          {segment.content}
        </span>
      ))}
    </pre>
  );
}, (prevProps, nextProps) => {
  // Only re-render if the line content changes or active state changes
  return prevProps.line === nextProps.line && 
         prevProps.isActive === nextProps.isActive;
});

export default Line;