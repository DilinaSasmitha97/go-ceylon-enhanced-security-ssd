import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import API_BASE_URL from "../../config/config"
import { ArrowLeft, MapPin, Phone, Info, Star, Calendar, Clock, Share2, Heart } from "lucide-react"

const BusinessInfo = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [business, setBusiness] = useState(null)
    const [loading, setLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState("")
    const [isFavorite, setIsFavorite] = useState(false)

    useEffect(() => {
        if (!id) return; // Prevents unnecessary calls if `id` is undefined/null

        const controller = new AbortController(); // To cancel request if component unmounts

        const fetchBusinessDetails = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/business/${id}`);
                setBusiness(response.data);
                console.log("Business details:", response.data);
            } catch (error) {
                if (axios.isCancel(error)) {
                    console.log('Request cancelled:', error.message);
                } else {
                    console.error('Error fetching business details:', error);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchBusinessDetails();

        return () => {
            controller.abort(); // Cancel the request on unmount
        };
    }, [id]);

    // Go back to previous page
    const handleBack = () => {
        navigate(-1)
    }

    // Toggle favorite status
    const toggleFavorite = () => {
        setIsFavorite(!isFavorite)
        // Here you would typically call an API to update the user's favorites
    }

    // Share business
    const handleShare = () => {
        if (navigator.share) {
            navigator
                .share({
                    title: business?.business_name,
                    text: `Check out ${business?.business_name}!`,
                    url: window.location.href,
                })
                .catch((err) => console.error("Error sharing:", err))
        } else {
            // Fallback for browsers that don't support the Web Share API
            alert(`Share this link: ${window.location.href}`)
        }
    }

    if (loading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-white">
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-t-emerald-600 border-b-emerald-600 border-l-gray-200 border-r-gray-200 rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-600 font-medium">Loading business details...</p>
                </div>
            </div>
        )
    }


    // Determine which image to use as cover photo
    const coverPhoto =
        business?.images && business.images.length > 0
            ? `${API_BASE_URL}/${business.images[0]}`
            : null

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
                                src={coverPhoto}
                                alt={business?.business_name}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="h-full w-full bg-gradient-to-r from-emerald-600 to-emerald-400"></div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    </div>

                    {/* Back button */}
                    <button onClick={handleBack} className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm p-2 rounded-full">
                        <ArrowLeft className="w-5 h-5 text-white" />
                    </button>

                    {/* Action buttons */}
                    <div className="absolute top-4 right-4 flex space-x-2">
                        <button
                            onClick={toggleFavorite}
                            className={`p-2 rounded-full ${isFavorite ? "bg-red-100" : "bg-white/20 backdrop-blur-sm"}`}
                        >
                            <Heart className={`w-5 h-5 ${isFavorite ? "text-red-500 fill-red-500" : "text-white"}`} />
                        </button>
                        <button onClick={handleShare} className="bg-white/20 backdrop-blur-sm p-2 rounded-full">
                            <Share2 className="w-5 h-5 text-white" />
                        </button>
                    </div>

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
                                <Phone className="w-5 h-5 text-emerald-600 mt-0.5 mr-3 flex-shrink-0" />
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Contact</p>
                                    <p className="text-gray-800 font-medium">{business?.contact_number}</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <MapPin className="w-5 h-5 text-emerald-600 mt-0.5 mr-3 flex-shrink-0" />
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Address</p>
                                    <p className="text-gray-800">{business?.address}</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <Info className="w-5 h-5 text-emerald-600 mt-0.5 mr-3 flex-shrink-0" />
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Description</p>
                                    <p className="text-gray-700">{business?.description || "No description available"}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Business highlights card */}
                <div className="px-5 mt-4">
                    <div className="bg-white rounded-xl shadow-sm p-5">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">Business Highlights</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 rounded-lg p-3 text-center">
                                <p className="text-sm text-gray-500">Category</p>
                                <p className="text-lg font-semibold text-emerald-600">{business?.business_category}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3 text-center">
                                <p className="text-sm text-gray-500">Status</p>
                                <p className="text-lg font-semibold text-emerald-600">Active</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Image gallery if available */}
                {business?.images && business.images.length > 1 && (
                    <div className="px-5 mt-4">
                        <div className="bg-white rounded-xl shadow-sm p-5">
                            <h3 className="text-lg font-semibold mb-4 text-gray-800">Photo Gallery</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {business.images.slice(1).map((image, index) => (
                                    <div key={index} className="aspect-square rounded-lg overflow-hidden">
                                        <img
                                            src={`${API_BASE_URL}/${image}`}
                                            alt={`${business.business_name} - Image ${index + 2}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Fixed action buttons at bottom */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex gap-3">
                <button
                    onClick={() => window.open(`tel:${business?.contact_number}`)}
                    className="flex-1 bg-emerald-600 text-white font-medium py-3 rounded-lg flex items-center justify-center"
                >
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                </button>

                <button
                    onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business?.address)}`, '_blank')}
                    className="flex-1 bg-gray-800 text-white font-medium py-3 rounded-lg flex items-center justify-center"
                >
                    <MapPin className="w-4 h-4 mr-2" />
                    Directions
                </button>
            </div>
        </div>
    )
}

export default BusinessInfo 