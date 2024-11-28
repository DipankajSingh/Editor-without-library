import Line from './Line'
import { useEditorContext } from '../context/EditorProvider';
import Cursor from './Cursor';

// In Playground.jsx
import React, { useCallback } from 'react';

export default function Playground() {
  const playgroundRef = React.useRef(null);
  const { lineData, activeLine } = useEditorContext();

  const renderLine = useCallback((line, index) => (
    <Line 
      line={line} 
      key={index}
      lineIndex={index}
      isActive={index === activeLine}
    />
  ), [activeLine]);

  return (
    <div ref={playgroundRef} className='relative w-full h-[80vh] p-2 outline outline-1 self-stretch'>
      <Cursor playgroundRef={playgroundRef}/>
      {lineData.map(renderLine)}
    </div>
  );
}