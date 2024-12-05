import React from 'react'
import ColorPicker from './ColorPicker'
import { RiFolderOpenFill } from 'react-icons/ri'
import TextSizePicker from './TextSizePicker'

function Nav() {
  return (
    <div className="bg-indigo-900 px-3 py-1 flex flex-row justify-between items-center">
      <div className="text-white">
        <h1>WindEditor</h1>
      </div>
      <div className="flex flex-row gap-2 items-center">
        <TextSizePicker/>
        <ColorPicker/>
      <input hidden={true} type="file" name="file" id="file" />
      <label tabIndex={2} htmlFor="file" className='border border-white px-[10px] py-[9px] cursor-pointer hover:scale-110 transition-transform inline-block' ><RiFolderOpenFill /></label>
      </div>
    </div>
  )
}

export default Nav  