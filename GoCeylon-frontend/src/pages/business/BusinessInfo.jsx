import React from 'react';


import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import API_BASE_URL from "../../config/config"
import { ArrowLeft, Edit, Trash2, MapPin, Phone, Info } from "lucide-react"

const BusinessInfo = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [business, setBusiness] = useState(null)
    const [loading, setLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState("")
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    useEffect(() => {
        const fetchBusinessDetails = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/business/${id}`)
                setBusiness(response.data)
            } catch (error) {
                setErrorMessage("Failed to fetch business details")
            } finally {
                setLoading(false)
            }
        }
        fetchBusinessDetails()
    }, [id])

    // Delete business handler
    const handleDelete = async () => {
        try {
            await axios.delete(`${API_BASE_URL}/api/business/${id}`)
            // After deletion, navigate back to the business list
            navigate("/business")
        } catch (error) {
            setErrorMessage("Failed to delete business")
        }
    }

    // Redirect to update page
    const handleUpdate = () => {
        navigate(`/business/update/${id}`)
    }

    // Go back to previous page
    const handleBack = () => {
        navigate(-1)
    }

    if (loading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-white">
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-t-[#007a55] border-b-[#007a55] border-l-gray-200 border-r-gray-200 rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-600 font-medium">Loading business details...</p>
                </div>
            </div>
        )
    }

    if (errorMessage) {
        return (
            <div className="fixed inset-0 flex flex-col items-center justify-center bg-white p-6">
                <div className="bg-red-50 rounded-lg p-6 w-full max-w-md shadow-md">
                    <h3 className="text-xl font-semibold text-red-700 mb-2">Error</h3>
                    <p className="text-gray-700 mb-4">{errorMessage}</p>
                    <button
                        onClick={handleBack}
                        className="w-full bg-[#007a55] text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Go Back
                    </button>
                </div>
            </div>
        )
    }

    // Determine which image to use as cover photo
    const coverPhoto =
        business?.ownerPhoto ||
        (business?.images && business.images.length > 0
            ? `${API_BASE_URL}/uploads/${business.images[0].split("/").pop()}`
            : null)

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            {/* Header is now part of the main content for better scrolling */}
            <div className="flex-1 pb-20">
                {/* Hero section with cover photo */}
                <div className="relative">
                    {/* Cover photo with gradient overlay */}
                    <div className="relative h-64 w-full">
                        {coverPhoto ? (
                            <img
                                src={coverPhoto || "/placeholder.svg"}
                                alt={business?.business_name}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="h-full w-full bg-gradient-to-r from-[#007a55] to-[#00a573]"></div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    </div>

                    {/* Back button */}
                    <button onClick={handleBack} className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm p-2 rounded-full">
                        <ArrowLeft className="w-5 h-5 text-white" />
                    </button>

                    {/* Business name overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                        <h1 className="text-2xl font-bold text-white drop-shadow-sm">{business?.business_name}</h1>
                        <p className="text-white/90 text-sm mt-1">{business?.business_category}</p>
                    </div>
                </div>

                {/* Business details card */}
                <div className="px-5 mt-5">
                    <div className="bg-white rounded-xl shadow-sm p-5">
                        <div className="space-y-4">
                            <div className="flex items-start">
                                <Phone className="w-5 h-5 text-[#007a55] mt-0.5 mr-3 flex-shrink-0" />
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Contact</p>
                                    <p className="text-gray-800 font-medium">{business?.contact_number}</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <MapPin className="w-5 h-5 text-[#007a55] mt-0.5 mr-3 flex-shrink-0" />
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Address</p>
                                    <p className="text-gray-800">{business?.address}</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <Info className="w-5 h-5 text-[#007a55] mt-0.5 mr-3 flex-shrink-0" />
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Description</p>
                                    <p className="text-gray-700">{business?.description}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Business stats/highlights card */}
                <div className="px-5 mt-4">
                    <div className="bg-white rounded-xl shadow-sm p-5">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">Business Highlights</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 rounded-lg p-3 text-center">
                                <p className="text-sm text-gray-500">Category</p>
                                <p className="text-lg font-semibold text-[#007a55]">{business?.business_category}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3 text-center">
                                <p className="text-sm text-gray-500">Status</p>
                                <p className="text-lg font-semibold text-[#007a55]">Active</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact card with action buttons */}

            </div>

            {/* Fixed action buttons at bottom */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex gap-3">
                <button
                    onClick={handleUpdate}
                    className="flex-1 bg-[#007a55] text-white font-medium py-3 rounded-lg flex items-center justify-center"
                >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                </button>

                <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex-1 bg-white border border-red-500 text-red-500 font-medium py-3 rounded-lg flex items-center justify-center"
                >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                </button>
            </div>

            {/* Delete confirmation modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-5 z-50">
                    <div className="bg-white rounded-xl p-5 w-full max-w-sm">
                        <h3 className="text-xl font-semibold text-gray-800 mb-3">Delete Business</h3>
                        <p className="text-gray-600 mb-5">
                            Are you sure you want to delete {business?.business_name}? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 bg-gray-100 text-gray-700 font-medium py-3 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button onClick={handleDelete} className="flex-1 bg-red-500 text-white font-medium py-3 rounded-lg">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default BusinessInfo
