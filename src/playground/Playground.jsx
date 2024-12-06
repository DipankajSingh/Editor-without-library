import Line from './Line'
import { useEditorContext } from '../context/EditorProvider';
import Cursor from './Cursor';

// In Playground.jsx
import React, { useCallback, useEffect } from 'react';

export default function Playground() {
  const playgroundRef = React.useRef(null);
  const { lineData, activeLine } = useEditorContext();
  useEffect(() => {
    if (playgroundRef.current) {
      playgroundRef.current.scrollTop = playgroundRef.current.scrollHeight;
    }
  }, [lineData]); 
  const renderLine = useCallback((line, index) => (
    
    <Line 
      line={line} 
      key={index}
      lineIndex={index}
      isActive={index === activeLine}
    />
  ), [activeLine]);
  return (
    <div 
      id="playground" 
      tabIndex={0} 
      ref={playgroundRef}  
      className='flex-1 outline-none overflow-auto relative w-full p-2 self-stretch'
    >
      <Cursor playgroundRef={playgroundRef}/>
      {lineData.map(renderLine)}
    </div>
  );
}