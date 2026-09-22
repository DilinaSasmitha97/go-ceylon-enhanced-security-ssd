import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../config/config';
import TopAppBar from '../../components/TopAppBarGuide';
import BottomTabBar from '../../components/BottomTabBarGuide';
import { useNavigate } from 'react-router-dom';


export default function Profile() {
  const navigate = useNavigate();


  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };


  return (
    <div className='container mx-auto p-6 mt-[4rem] bg-gray-100 min-h-screen'>
      <TopAppBar />
      <div>
        <button
          onClick={handleLogout}
          className='w-full mt-1 bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700'>
          Logout
        </button>
      </div>
      <BottomTabBar />
    </div >
  );
}
