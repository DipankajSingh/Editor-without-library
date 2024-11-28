import React, { memo } from 'react';
import { useEditorContext } from '../context/EditorProvider';

const Line = memo(function Line({line, lineIndex, isActive}) {
  const { textSize } = useEditorContext();
  return (
    <pre 
      style={{ 
        whiteSpace: 'pre-wrap',
        fontFamily: 'monospace, Arial, sans-serif', 
        fontSize: `${textSize}px`,
        lineHeight: '1.5',
        width: 'fit-content',
      }} 
      className={`flex flex-row`}
    >
       {line.text.map((segment, index) => (
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