/*import React from 'react';
import { FaBars, FaCamera, FaHome } from "react-icons/fa"; // Icons for menu, camera, and home
import { HiDotsVertical } from "react-icons/hi";
import { IoSearchSharp } from "react-icons/io5";
import { FaSearch } from "react-icons/fa";
import { Link } from 'react-router-dom';

export default function TopAppBar() {
    return (
        <div className="flex bg-emerald-700 justify-between shadow-xs text-white w-full fixed items-center left-0 px-4 py-4 right-0 top-0 z-10">
    
            <div className='flex gap-3 items-center'>
                <span className="text-2xl font-bold">GoCeylon</span>
            </div>

            <div className='flex gap-4 items-center'>
                <Link key="scaner" to="/user/scaner">
                    <FaCamera size={24} />
                </Link>

                <IoSearchSharp size={24} />

                <HiDotsVertical size={24} />
            </div>
        </div>
    );
}
*/

import React, { useState } from 'react';
import { FaCamera } from "react-icons/fa";
import { HiDotsVertical } from "react-icons/hi";
import { Link } from 'react-router-dom';

export default function TopAppBar() {

    return (
        <div className="fixed top-0 left-0 right-0 z-10">
            <div className="bg-emerald-700 shadow-xs text-white w-full px-4 py-4 transition-all duration-300 ease-in-out">
                {/* Normal AppBar */}
                <div className={`flex justify-between items-center transition-all duration-300`}>
                    <span className="text-2xl font-bold">GoCeylon</span>
                    <div className="flex gap-4 items-center">
                        <Link to="/user/scaner">
                            <FaCamera size={24} />
                        </Link>
                        <button>
                            <HiDotsVertical size={24} />
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
