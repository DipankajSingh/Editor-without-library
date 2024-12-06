import React from 'react'
import ColorPicker from './ColorPicker'
import { RiFolderOpenFill } from 'react-icons/ri'
import TextSizePicker from './TextSizePicker'
import { BiSave } from 'react-icons/bi'
import { useEditorContext } from '../context/EditorProvider'

function Nav() {

const { setLineData, lineData:lines } = useEditorContext();

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const fileContent = e.target.result;
      const lines = JSON.parse(fileContent);
      setLineData(lines);
    };
    reader.readAsText(file);
  };

  const handleFileDownload = () => {
    const fileContent = JSON.stringify(lines);
    const blob = new Blob([fileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'windeditor.we';
    link.click();
    URL.revokeObjectURL(url);
  };


  return (
    <div className="bg-indigo-900 px-3 py-1 flex flex-row justify-between items-center">
      <div className="text-white">
        <h1>WindEditor</h1>
      </div>
      <div className="flex flex-row gap-2 items-center">
        <TextSizePicker/>
        <ColorPicker/>
      <input onChange={handleFileUpload} hidden={true} type="file" name="file" id="file" />
      <label tabIndex={2} htmlFor="file" className='border border-white px-[10px] py-[9px] cursor-pointer hover:scale-110 transition-transform inline-block' ><RiFolderOpenFill /></label>
     
     <button onClick={handleFileDownload} className='border border-white px-[10px] py-[9px] cursor-pointer hover:scale-110 transition-transform inline-block'><BiSave /></button>
     
      </div>
    </div>
  )
}

export default Nav  