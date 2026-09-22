import React from 'react';
import { HiDotsVertical } from "react-icons/hi";
import { IoMdAdd } from "react-icons/io";
import { Link } from 'react-router-dom';

export default function TobAppBarGuide() {
    return (
        <div className="flex bg-emerald-700 justify-between shadow-xs text-white w-full fixed items-center left-0 px-4 py-4 right-0 top-0 z-10">
            {/* Left Side: Menu Icon & Title */}
            <div className='flex gap-3 items-center'>
                <span className="text-2xl font-bold">GoCeylon</span>
            </div>

            {/* Right Side: Camera Icon & Home Icon */}
            <div className='flex gap-4 items-center'>
                <HiDotsVertical size={24} />
            </div>
        </div>
    )
}