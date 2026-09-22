import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaHome, FaSearch, FaBell, FaUser } from "react-icons/fa";
import { IoBookmarks } from "react-icons/io5";
import { SiCodemagic } from "react-icons/si";
import { IoMdBookmark } from "react-icons/io";


const tabs = [
    { name: "Home", icon: FaHome, path: "/guide" },
    { name: "Profile", icon: FaUser, path: "/guide/profile" },
];

export default function BottomTabBarGuide() {
    const location = useLocation();

    return (
        <div className="flex bg-white justify-around shadow-2xl w-full bottom-0 fixed left-0 py-2">
            {tabs.map((tab) => (
                <Link
                    key={tab.name}
                    to={tab.path}
                    className={`flex flex-col items-center p-2 transition-all duration-200 ease-in-out ${location.pathname === tab.path
                        ? "text-emerald-700"
                        : "text-gray-500 hover:text-emerald-700"
                        }`}
                >
                    <tab.icon size={24} />
                    <span className="text-xs pt-1">{tab.name}</span>
                </Link>
            ))}
        </div>
    );
}
