import React, { useEffect, useState } from "react"
import axios from "axios"
import { Users, Compass, Briefcase, MapPin, Calendar, TrendingUp, Activity, ChevronRight } from "lucide-react"
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from "recharts"
import Sidebar from "../../components/Sidebar";

import API_BASE_URL from "../../config/config";

export default function Dashboard() {
    const [stats, setStats] = useState(null)
    const [locationData, setLocationData] = useState([])
    const [genderData, setGenderData] = useState([])
    const [topLocations, setTopLocations] = useState([])
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Fetch data from APIs
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const token = localStorage.getItem("authToken")

                // Fetch overview stats
                const statsResponse = await axios.get(`${API_BASE_URL}/report/overview`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                setStats(statsResponse.data.data)

                // Fetch location categories
                const locationResponse = await axios.get(`${API_BASE_URL}/report/location-categories`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                setLocationData(locationResponse.data.data)

                // Fetch gender diversity
                const genderResponse = await axios.get(`${API_BASE_URL}/report/gender-diversity`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                setGenderData(genderResponse.data.data)

                // Fetch top locations
                const topLocationsResponse = await axios.get(`${API_BASE_URL}/report/top-locations`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                setTopLocations(topLocationsResponse.data.data)

                // Fetch bookings
                const bookingsResponse = await axios.get(`${API_BASE_URL}/booking`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                setBookings(bookingsResponse.data)

                setLoading(false)
            } catch (err) {
                setError(err.message)
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    // Function to format date
    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
    }

    // Function to get status color
    const getStatusColor = (status) => {
        switch (status) {
            case "confirmed":
                return "bg-[#e6f5f0] text-[#007a55]"
            case "finish":
                return "bg-gray-200 text-gray-800"
            case "cancel":
                return "bg-gray-100 text-gray-700"
            default:
                return "bg-gray-100 text-gray-700"
        }
    }

    // Colors for pie chart - using the requested color scheme
    const GENDER_COLORS = ["#333333", "#007a55"]

    // Colors for bar chart - using the requested color scheme
    const LOCATION_COLORS = ["#007a55", "#333333", "#555555", "#777777", "#999999"]

    // Get first 5 bookings
    const recentBookings = bookings.slice?.(0, 5) || []



    if (error) {
        return (
            <div className="flex h-screen">
                <div className="w-64 bg-[#1a1a1a] fixed inset-y-0 left-0 z-10">{/* Sidebar placeholder */}</div>
                <div className="flex-1 ml-64 overflow-y-auto h-screen p-8 bg-gray-100">
                    <div className="text-center text-red-600">Error: {error}</div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-screen">

            <Sidebar />

            {/* Main content area */}
            <div className="flex-1 ml-64 overflow-y-auto h-screen bg-gray-100">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 px-8 py-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                            <p className="text-sm text-gray-500 mt-1">Welcome to your admin dashboard</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600">Last updated: {new Date().toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                <div className="p-8">
                    {/* Overview Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {/* Travelers Card */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="p-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 mb-1">Total Travelers</p>
                                        <h3 className="text-2xl font-bold text-gray-900">
                                            {stats?.travelers?.total?.toLocaleString() || "0"}
                                        </h3>
                                    </div>
                                    <div className="h-10 w-10 bg-[#e6f5f0] rounded-md flex items-center justify-center">
                                        <Users className="h-5 w-5 text-[#007a55]" />
                                    </div>
                                </div>
                            </div>
                            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
                                <div className="flex items-center">
                                    <Activity className="h-4 w-4 text-[#007a55] mr-1.5" />
                                    <span className="text-xs font-medium text-gray-600">Active users</span>
                                </div>
                            </div>
                        </div>

                        {/* Guides Card */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="p-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 mb-1">Total Guides</p>
                                        <h3 className="text-2xl font-bold text-gray-900">
                                            {stats?.guides?.total?.toLocaleString() || "0"}
                                        </h3>
                                    </div>
                                    <div className="h-10 w-10 bg-[#e6f5f0] rounded-md flex items-center justify-center">
                                        <Compass className="h-5 w-5 text-[#007a55]" />
                                    </div>
                                </div>
                            </div>
                            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
                                <div className="flex items-center">
                                    <TrendingUp className="h-4 w-4 text-[#007a55] mr-1.5" />
                                    <span className="text-xs font-medium text-gray-600">Professional guides</span>
                                </div>
                            </div>
                        </div>

                        {/* Businesses Card */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="p-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 mb-1">Total Businesses</p>
                                        <h3 className="text-2xl font-bold text-gray-900">
                                            {stats?.businesses?.total?.toLocaleString() || "0"}
                                        </h3>
                                    </div>
                                    <div className="h-10 w-10 bg-[#e6f5f0] rounded-md flex items-center justify-center">
                                        <Briefcase className="h-5 w-5 text-[#007a55]" />
                                    </div>
                                </div>
                            </div>
                            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
                                <div className="flex items-center">
                                    <Calendar className="h-4 w-4 text-[#007a55] mr-1.5" />
                                    <span className="text-xs font-medium text-gray-600">Registered partners</span>
                                </div>
                            </div>
                        </div>

                        {/* Locations Card */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="p-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 mb-1">Total Locations</p>
                                        <h3 className="text-2xl font-bold text-gray-900">
                                            {stats?.locations?.total?.toLocaleString() || "0"}
                                        </h3>
                                    </div>
                                    <div className="h-10 w-10 bg-[#e6f5f0] rounded-md flex items-center justify-center">
                                        <MapPin className="h-5 w-5 text-[#007a55]" />
                                    </div>
                                </div>
                            </div>
                            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
                                <div className="flex items-center">
                                    <MapPin className="h-4 w-4 text-[#007a55] mr-1.5" />
                                    <span className="text-xs font-medium text-gray-600">Available destinations</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Location Categories Chart */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900">Locations by Category</h3>
                                </div>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={locationData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                            <XAxis dataKey="name" tick={{ fill: "#4b5563" }} />
                                            <YAxis tick={{ fill: "#4b5563" }} />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: "#fff",
                                                    border: "1px solid #e5e7eb",
                                                    borderRadius: "0.375rem",
                                                }}
                                            />
                                            <Bar dataKey="count" name="Number of Locations" fill="#007a55">
                                                {locationData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={LOCATION_COLORS[index % LOCATION_COLORS.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Guide Gender Diversity Chart */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900">Guide Gender Diversity</h3>
                                </div>
                                <div className="h-80 flex flex-col items-center justify-center">
                                    <ResponsiveContainer width="100%" height="80%">
                                        <PieChart>
                                            <Pie
                                                data={genderData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            >
                                                {genderData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                formatter={(value) => [`${value} guides`, "Count"]}
                                                contentStyle={{
                                                    backgroundColor: "#fff",
                                                    border: "1px solid #e5e7eb",
                                                    borderRadius: "0.375rem",
                                                }}
                                            />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="flex justify-center space-x-8 mt-2">
                                        {genderData.map((entry, index) => (
                                            <div key={entry.name} className="flex items-center">
                                                <div
                                                    className="w-3 h-3 rounded-full mr-2"
                                                    style={{ backgroundColor: GENDER_COLORS[index] }}
                                                ></div>
                                                <span className="text-sm text-gray-600">
                                                    {entry.name}: {entry.value} (
                                                    {((entry.value / genderData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}
                                                    %)
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tables Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Recent Bookings Table */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
                                    <button className="text-sm text-[#007a55] font-medium hover:text-[#006a45] flex items-center">
                                        View All
                                        <ChevronRight className="h-4 w-4 ml-1" />
                                    </button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                        <thead>
                                            <tr className="border-b border-gray-200">
                                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Traveler
                                                </th>
                                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Guide
                                                </th>
                                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Date
                                                </th>
                                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {recentBookings.map((booking) => (
                                                <tr key={booking._id} className="hover:bg-gray-50">
                                                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-700">
                                                        {booking.userId?.name || "N/A"}
                                                    </td>
                                                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-700">
                                                        {booking.guideId?.g_name || "N/A"}
                                                    </td>
                                                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-700">
                                                        {formatDate(booking.createdAt)}
                                                    </td>
                                                    <td className="px-3 py-3 whitespace-nowrap">
                                                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(booking.bookingStatus)}`}>
                                                            {booking.bookingStatus.charAt(0).toUpperCase() + booking.bookingStatus.slice(1)}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Top Locations Table */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900">Top Locations</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                        <thead>
                                            <tr className="border-b border-gray-200">
                                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Location
                                                </th>
                                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Bookings
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {topLocations.map((location, index) => (
                                                <tr key={index} className="hover:bg-gray-50">
                                                    <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-700">
                                                        {location.name}
                                                    </td>
                                                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-700">{location.bookings}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
