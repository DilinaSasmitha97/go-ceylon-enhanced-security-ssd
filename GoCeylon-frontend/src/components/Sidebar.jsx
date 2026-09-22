import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { MdOutlineDashboard, MdLogout } from "react-icons/md";
import { GoDotFill } from "react-icons/go";
import { FaBookmark } from "react-icons/fa";
import { FaUmbrellaBeach, FaUser } from "react-icons/fa6";
import { FaShop } from "react-icons/fa6";
import { BiRfid } from "react-icons/bi";
import logo from "../assets/logo.png";

const Sidebar = () => {
    const location = useLocation();
    const [openMenus, setOpenMenus] = useState({});

    const menuItems = [
        { name: "Dashboard", icon: <MdOutlineDashboard />, path: "/admin/dashboard" },
        {
            name: "Location",
            icon: <FaUmbrellaBeach />,
            submenu: [
                { name: "New Location", icon: <GoDotFill />, path: "/admin/add-locations" },
                { name: "Locations List", icon: <GoDotFill />, path: "/admin/locations" },
            ],
            // Use a base path to match dynamic routes
            relatedPathPrefix: "/admin/update-location",
        },
        { name: "Guides", icon: <FaUser />, path: "/admin/guides" },
        { name: "Business", icon: <FaShop />, path: "/admin/business" },
        {
            name: "RFID Info",
            icon: <BiRfid />,
            submenu: [
                { name: "New RFID", icon: <GoDotFill />, path: "/admin/add-rfid" },
                { name: "RFID List", icon: <GoDotFill />, path: "/admin/rfid" },
                { name: "RFID Tracking", icon: <GoDotFill />, path: "/admin/tracking" },
            ],
            // Use a base path to match dynamic routes
            relatedPathPrefix: "/update-rfid",

        },
        { name: "Booking", icon: <FaBookmark />, path: "/admin/booking" },
        { name: "Logout", icon: <MdLogout />, path: "/logout" },
    ];

    const toggleMenu = (menuName) => {
        setOpenMenus((prev) => ({ ...prev, [menuName]: !prev[menuName] }));
    };

    const getNavLinkClass = ({ isActive }) =>
        `flex items-center gap-3 p-2 rounded ${isActive ? "bg-emerald-700" : "hover:bg-[#ffffff1c]"}`;

    return (
        <div className="w-64 bg-[#212121] text-white p-5 h-screen fixed">
            <ul className="space-y-3">
                <img src={logo} alt="Logo" />
                {menuItems.map((menu, index) => {
                    // Check if any submenu item or related path prefix is active
                    const isSubmenuActive =
                        menu.submenu?.some((sub) => location.pathname === sub.path) ||
                        (menu.relatedPathPrefix && location.pathname.startsWith(menu.relatedPathPrefix));

                    return (
                        <li key={index}>
                            {menu.submenu ? (
                                <>
                                    {/* Parent Menu */}
                                    <div
                                        className={`flex justify-between items-center p-2 rounded cursor-pointer ${isSubmenuActive ? "bg-emerald-700" : "hover:bg-[#ffffff1c]"
                                            }`}
                                        onClick={() => toggleMenu(menu.name)}
                                    >
                                        <div className="flex items-center gap-3">
                                            {menu.icon}
                                            <span>{menu.name}</span>
                                        </div>
                                        {openMenus[menu.name] ? <FiChevronUp /> : <FiChevronDown />}
                                    </div>

                                    {/* Submenu */}
                                    {openMenus[menu.name] && (
                                        <ul className="ml-6 mt-2 space-y-2">
                                            {menu.submenu.map((sub, subIndex) => (
                                                <li key={subIndex}>
                                                    <NavLink to={sub.path} className={getNavLinkClass}>
                                                        {sub.icon && <span>{sub.icon}</span>}
                                                        <span>{sub.name}</span>
                                                    </NavLink>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </>
                            ) : (
                                <NavLink to={menu.path} className={getNavLinkClass}>
                                    {menu.icon}
                                    <span>{menu.name}</span>
                                </NavLink>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default Sidebar;