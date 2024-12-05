import React, { useState } from 'react'
import { TbTextResize } from 'react-icons/tb'
import { useEditorContext } from '../context/EditorProvider';

/**
 * TextSizePicker component
 * 
 * This component allows users to select the text size from a dropdown list.
 * 
 * @returns {JSX.Element} The TextSizePicker component
 */
export default function TextSizePicker() {
    const {textSize,setTextSize} = useEditorContext();


    /**
     * Handles the change event of the text size input field.
     * 
     * @param {ChangeEvent} event The change event
     */
    const handleTextSizeChange = (event) => {
      const newSize = parseInt(event.target.value);
      setTextSize(newSize);
    };

  return (
    <div className='flex border-2 text-white border-white flex-row items-center'>
        <label htmlFor="input"><TbTextResize size={28} /></label> 
        <input onChange={handleTextSizeChange} value={textSize} className='w-8 outline-none bg-transparent text-center' type="number" id="input" />
        <select onChange={handleTextSizeChange} value={textSize} className='outline-none bg-transparent border-l  w-6 text-black hover:cursor-pointer' name="input">
            <option value="12">12</option>
            <option value="16">16</option>
            <option value="18">18</option>
            <option value="20">20</option>
            <option value="24">24</option>
            <option value="28">28</option>
            <option value="32">32</option>
            <option value="36">36</option>
            <option value="40">40</option>
            <option value="48">48</option>
        </select>
    </div>
  )
}
