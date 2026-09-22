import React from 'react';
import { MdLogout } from "react-icons/md";
import { NavLink } from "react-router-dom";

const TopBar = () => {
    return (
        <div className="flex justify-between items-center bg-white shadow-md px-6 py-4 fixed w-[calc(100%-16rem)] top-0 z-10">
            <h2 className="text-1xl  font-semibold text-gray-800">Dashboard Overview</h2>
            <div className="flex items-center space-x-4">
                <NavLink to='/logout' className="flex items-center gap-2 text-gray-800">
                    <MdLogout /> Logout
                </NavLink>
            </div>
        </div>
    );
}

export default TopBar;