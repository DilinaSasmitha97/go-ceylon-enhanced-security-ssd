import React, { useState } from 'react';

// ConfirmationModal Component
export default ConfirmationModal = ({ message, onConfirm, onCancel }) => {
    return (
        <div className='container mx-auto p-6 mt-[4rem] bg-gray-100 min-h-screen'>
            <TopAppBar />

            <div className="mb-[4rem]">

                <div className="flex flex-col gap-3 p-4 bg-white rounded-lg shadow-md">
                    {/* Search Bar */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by Guide Name, Location, or Date"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 shadow-sm"
                        />
                        <span className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 pointer-events-none">
                            <IoMdSearch className="w-5 h-5" />
                        </span>
                    </div>
                    {/* Sort Options */}
                    <div className="flex items-center gap-2">
                        <label className="text-gray-600 text-sm">Sort by:</label>
                        <select
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 shadow-sm"
                        >
                            <option value="createdAt">Created Date</option>
                            <option value="b_date">Booking Date</option>
                        </select>
                    </div>
                </div>

                {upcomingBookings.length > 0 && <h3 className='text-xl mt-5 mb-2 font-bold text-gray-600'>Upcoming Bookings</h3>}
                {upcomingBookings.map(booking => (
                    <div className='flex flex-col p-5 bg-white border border-gray-100 rounded-xl shadow-md mb-4 hover:bg-green-100 transition duration-200'>
                        <h3 className='text-xl font-semibold text-green-800'>{booking.b_guide.g_name}</h3>
                        <p className='text-sm text-green-700'>Date: {booking.b_date}</p>
                        <p className='text-sm text-green-700'>Duratiopn(hours): {booking.b_time} hours</p>
                        <p className='text-sm text-green-700'>Location: {booking.b_location}</p>
                        <p className='text-sm text-green-700 font-bold'>Price: ${booking.price}</p>
                        <div className="flex gap-4 mt-2">
                            <FaEdit className='text-yellow-500 cursor-pointer' onClick={() => handleEdit(booking)} />
                            <FaTrashAlt className='text-red-500 cursor-pointer' onClick={() => handleDelete(booking._id)} />
                            <FaEye className='text-yellow-500 cursor-pointer' onClick={() => navigate(`/user/booking/info/${booking._id}`)} />

                        </div>
                    </div>
                ))}

                {pastBookings.length > 0 && <h3 className='text-xl mt-5 mb-2 font-bold text-gray-600'>Past Bookings</h3>}
                {pastBookings.map(booking => (
                    <Link to={`/user/booking/info/${booking._id}`} key={booking._id}>
                        <div className='flex flex-col p-5 bg-white border border-gray-100 rounded-xl shadow-md mb-4 hover:bg-green-100 transition duration-200'>
                            <h3 className='text-xl font-semibold text-green-800'>{booking.b_guide.g_name}</h3>
                            <p className='text-sm text-green-700'>Date: {booking.b_date}</p>
                            <p className='text-sm text-green-700'>Duration(hours): {booking.b_time} hours</p>
                            <p className='text-sm text-green-700'>Location: {booking.b_location}</p>
                            <p className='text-sm text-green-700 font-bold'>Price: ${booking.price}</p>
                        </div>
                    </Link>
                ))}

            </div>

            <BottomTabBar />
        </div>

    );
};


