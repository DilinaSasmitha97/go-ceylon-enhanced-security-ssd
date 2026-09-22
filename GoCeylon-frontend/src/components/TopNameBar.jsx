import React from 'react';
import { IoArrowBackOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { HiDotsVertical } from "react-icons/hi";

export default function TopNameBar({ title }) {
    const navigate = useNavigate();

    return (
        <div className="flex bg-emerald-700 justify-between shadow-xs text-white w-full fixed items-center left-0 px-4 py-4 right-0 top-0 z-10">
            {/* Left Side: Back Icon & Title */}
            <div className='flex gap-3 items-center'>
                <IoArrowBackOutline size={24} onClick={() => navigate(-1)} className="cursor-pointer" />
                <span className="text-2xl font-bold">{title}</span>
            </div>
            <div className='flex gap-4 items-center'>
                <HiDotsVertical size={24} />
            </div>
        </div>
    );
}