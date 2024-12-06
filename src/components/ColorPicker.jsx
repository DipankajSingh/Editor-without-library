import React, { useState } from 'react';
import { useEditorContext } from '../context/EditorProvider';

const presetColors = {
  red: '#EF4444',
  blue: '#3B82F6',
  green: '#10B981',
  yellow: '#F59E0B',
  purple: '#8B5CF6',
  orange: '#F97316',
  pink: '#EC4899'
};

function ColorPicker() {
  const [textColor, setTextColor] = useState('#ffffff');
  const { handleTextColorChange, tempSegment } = useEditorContext();

  const handleColorChange = (hexValue) => {
    tempSegment.current=null;
    setTextColor(hexValue);
    handleTextColorChange(hexValue);
  };

  return (
    <div className="flex gap-2 items-center p-2">
      <div className="flex gap-2 items-center">
        {Object.entries(presetColors).map(([colorName, hexValue]) => (
          <button
            key={colorName}
            onClick={() => handleColorChange(hexValue)}
            className="hover:scale-110 transition-transform"
          >
            <span 
              style={{ color: hexValue, borderColor: hexValue }} 
              className="border-b-4 px-2 font-bold"
            >
              A
            </span>
          </button>
        ))}
        <div className="relative">
          <input
            type="color"
            value={textColor}
            onChange={(e) => handleColorChange(e.target.value)}
            className="hidden"
            id="customColor"
          />
          <label 
            htmlFor="customColor" 
            style={{ color: textColor, borderColor: textColor }} 
            className="
            border-[#000000] border-[1px]
            border-b-4 px-3 py-1 
            font-bold cursor-pointer hover:scale-110 transition-transform inline-block"
            tabIndex={1}
          >
            A
          </label>
        </div>
      </div>
    </div>
  );
}

export default ColorPicker;
