import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Select from "react-select";
import Sidebar from "../../components/Sidebar";
import axios from "axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import API_BASE_URL from "../../config/config";
import { MapPin, Tag, ImageIcon, Info, Plus, Trash2, Save, AlertCircle, X } from 'lucide-react';

const UpdateAttractionForm = () => {
    const token = localStorage.getItem("authToken");
    const { id } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [attractionData, setAttractionData] = useState({
        name: "",
        description: "",
        google_map_url: "",
        tags: [],
        images: [],
        existingImages: [],
        points: [{ point: "", text: "" }]
    });

    const [imagePreviews, setImagePreviews] = useState([]);
    const [errors, setErrors] = useState({});
    const [notification, setNotification] = useState({ type: "", message: "" });

    useEffect(() => {
        const fetchAttraction = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get(`${API_BASE_URL}/location/${id}`);
                const data = response.data;

                setAttractionData({
                    name: data.name || "",
                    description: data.description || "",
                    google_map_url: data.google_map_url || "",
                    tags: data.tags || [],
                    images: [],
                    existingImages: data.image_url || [],
                    points: data.points && data.points.length > 0 ? data.points : [{ point: "", text: "" }]
                });
            } catch (error) {
                console.error("Error fetching attraction:", error);
                setNotification({
                    type: "error",
                    message: "Failed to load attraction data. Please try again."
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchAttraction();
    }, [id]);

    const tagOptions = [
        { value: "beach", label: "Beach" },
        { value: "mountain", label: "Mountain" },
        { value: "historical", label: "Historical" },
        { value: "cultural", label: "Cultural" },
        { value: "adventure", label: "Adventure" },
        { value: "wildlife", label: "Wildlife" }
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAttractionData(prevData => ({ ...prevData, [name]: value }));

        // Clear error for this field if it exists
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleTagChange = (selectedOptions) => {
        const selectedTags = selectedOptions ? selectedOptions.map(option => option.value) : [];
        setAttractionData(prevData => ({ ...prevData, tags: selectedTags }));

        // Clear tag error if it exists
        if (errors.tags) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.tags;
                return newErrors;
            });
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);

        setAttractionData(prevData => ({
            ...prevData,
            images: [...prevData.images, ...files]
        }));

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(prevPreviews => [...prevPreviews, ...newPreviews]);

        // Clear image error if it exists
        if (errors.images) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.images;
                return newErrors;
            });
        }
    };

    const removeExistingImage = (index) => {
        setAttractionData(prevData => ({
            ...prevData,
            existingImages: prevData.existingImages.filter((_, i) => i !== index)
        }));
    };

    const removeNewImage = (index) => {
        // Revoke the object URL to avoid memory leaks
        URL.revokeObjectURL(imagePreviews[index]);

        setImagePreviews(prevPreviews => prevPreviews.filter((_, i) => i !== index));
        setAttractionData(prevData => ({
            ...prevData,
            images: prevData.images.filter((_, i) => i !== index)
        }));
    };

    const handlePointChange = (index, field, value) => {
        const updatedPoints = [...attractionData.points];
        updatedPoints[index][field] = value;
        setAttractionData(prevData => ({ ...prevData, points: updatedPoints }));

        // Clear error for this point if it exists
        if (errors[`point${index}`] || errors[`text${index}`]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[`${field}${index}`];
                return newErrors;
            });
        }
    };

    const addPoint = () => {
        setAttractionData(prevData => ({
            ...prevData,
            points: [...prevData.points, { point: "", text: "" }]
        }));
    };

    const removePoint = (index) => {
        setAttractionData(prevData => ({
            ...prevData,
            points: prevData.points.filter((_, i) => i !== index)
        }));

        // Remove any errors associated with this point
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[`point${index}`];
            delete newErrors[`text${index}`];
            return newErrors;
        });
    };

    const validateForm = () => {
        let validationErrors = {};

        // Basic field validation
        if (!attractionData.name.trim()) validationErrors.name = "Name is required";
        if (!attractionData.description.trim()) validationErrors.description = "Description is required";

        // Google Map URL validation
        const googleMapUrlRegex = /^https:\/\/maps\.app\.goo\.gl\/[a-zA-Z0-9_-]+/;
        if (!attractionData.google_map_url.trim()) {
            validationErrors.google_map_url = "Google Map URL is required";
        } else if (!googleMapUrlRegex.test(attractionData.google_map_url)) {
            validationErrors.google_map_url = "Invalid Google Map URL format. It should be from the Google Maps mobile app.";
        }

        // Tags validation
        if (!attractionData.tags || attractionData.tags.length === 0) {
            validationErrors.tags = "At least one tag is required";
        }

        // Images validation (must have at least one: existing or new)
        const totalImages = (attractionData.existingImages?.length || 0) + (attractionData.images?.length || 0);
        if (totalImages === 0) {
            validationErrors.images = "At least one image is required";
        }

        // Points validation
        const poiIdRegex = /^PO\d{4}$/;
        attractionData.points.forEach((poi, index) => {
            if (!poi.point.trim()) {
                validationErrors[`point${index}`] = `Point ID is required`;
            } else if (!poiIdRegex.test(poi.point)) {
                validationErrors[`point${index}`] = `Must start with 'PO' followed by 4 digits`;
            }

            if (!poi.text.trim()) {
                validationErrors[`text${index}`] = `Description is required`;
            }
        });

        setErrors(validationErrors);
        return Object.keys(validationErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            // Scroll to the first error
            const firstErrorElement = document.querySelector(".error-message");
            if (firstErrorElement) {
                firstErrorElement.scrollIntoView({ behavior: "smooth", block: "center" });
            }
            return;
        }

        setIsSaving(true);

        try {
            const formData = new FormData();
            formData.append("name", attractionData.name);
            formData.append("description", attractionData.description);
            formData.append("google_map_url", attractionData.google_map_url);
            formData.append("tags", JSON.stringify(attractionData.tags));
            formData.append("points", JSON.stringify(attractionData.points));
            formData.append("existingImages", JSON.stringify(attractionData.existingImages));

            attractionData.images.forEach((image) => {
                formData.append("images", image);
            });

            const response = await axios.put(`${API_BASE_URL}/location/${id}`, formData, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            });

            if (response.status >= 200 && response.status < 300) {
                setNotification({
                    type: "success",
                    message: "Attraction updated successfully!"
                });

                // Scroll to top to show notification
                window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
                throw new Error("Failed to update attraction.");
            }
        } catch (error) {
            console.error("Error updating attraction:", error);
            setNotification({
                type: "error",
                message: "Failed to update attraction. Please try again."
            });

            // Scroll to top to show error
            window.scrollTo({ top: 0, behavior: "smooth" });
        } finally {
            setIsSaving(false);
        }
    };

    // Function to generate the QR code URL using the provided API
    const generateQRCode = (attractionId, pointId) => {
        return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(JSON.stringify({ attractionId, pointId }))}`;
    };

    // Custom styles for react-select
    const customSelectStyles = {
        control: (provided) => ({
            ...provided,
            borderRadius: '0.5rem',
            padding: '0.25rem',
            borderColor: '#d1d5db',
            boxShadow: 'none',
            '&:hover': {
                borderColor: '#10b981'
            }
        }),
        multiValue: (provided) => ({
            ...provided,
            backgroundColor: '#ecfdf5',
            borderRadius: '0.375rem'
        }),
        multiValueLabel: (provided) => ({
            ...provided,
            color: '#047857'
        }),
        multiValueRemove: (provided) => ({
            ...provided,
            color: '#047857',
            '&:hover': {
                backgroundColor: '#d1fae5',
                color: '#047857'
            }
        })
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar />
            <div className="flex-1 ml-64 overflow-y-auto h-screen">
                <div className="mx-auto px-6 py-8">
                    {/* Header */}

                    {/* Notification */}
                    {notification.message && (
                        <div
                            className={`mb-6 p-4 rounded-lg flex items-start justify-between ${notification.type === "success"
                                ? "bg-green-50 text-green-800 border border-green-200"
                                : "bg-red-50 text-red-800 border border-red-200"
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                {notification.type === "success" ? (
                                    <div className="bg-green-100 p-1 rounded-full">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                ) : (
                                    <AlertCircle size={20} className="text-red-600" />
                                )}
                                <span className="font-medium">{notification.message}</span>
                            </div>
                            <button
                                onClick={() => setNotification({ type: "", message: "" })}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    )}

                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="w-12 h-12 border-4 border-t-emerald-500 border-emerald-200 rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Basic Info Card */}
                            <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
                                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                    <Info className="text-emerald-600" size={22} />
                                    <h2 className="text-xl font-semibold text-gray-800">Basic Information</h2>
                                </div>

                                <div className="grid grid-cols-1 gap-6">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                            Attraction Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={attractionData.name}
                                            onChange={handleChange}
                                            placeholder="Enter attraction name"
                                            className={`border ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200`}
                                        />
                                        {errors.name && (
                                            <p className="text-red-600 text-sm mt-1 error-message flex items-center gap-1">
                                                <AlertCircle size={14} />
                                                {errors.name}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                            Description <span className="text-red-500">*</span>
                                        </label>
                                        <div className={`${errors.description ? 'border border-red-300 rounded-lg' : ''}`}>
                                            <ReactQuill
                                                id="description"
                                                theme="snow"
                                                value={attractionData.description}
                                                onChange={(value) => {
                                                    setAttractionData(prev => ({ ...prev, description: value }));
                                                    if (errors.description) {
                                                        setErrors(prev => {
                                                            const newErrors = { ...prev };
                                                            delete newErrors.description;
                                                            return newErrors;
                                                        });
                                                    }
                                                }}
                                                className="bg-white rounded-lg"
                                                modules={{
                                                    toolbar: [
                                                        [{ 'header': [1, 2, 3, false] }],
                                                        ['bold', 'italic', 'underline', 'strike'],
                                                        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                                        ['link'],
                                                        ['clean']
                                                    ]
                                                }}
                                            />
                                        </div>
                                        {errors.description && (
                                            <p className="text-red-600 text-sm mt-1 error-message flex items-center gap-1">
                                                <AlertCircle size={14} />
                                                {errors.description}
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="google_map_url" className="block text-sm font-medium text-gray-700 mb-1">
                                                Google Map URL <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <MapPin size={18} className="text-gray-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    id="google_map_url"
                                                    name="google_map_url"
                                                    value={attractionData.google_map_url}
                                                    onChange={handleChange}
                                                    placeholder="https://maps.app.goo.gl/..."
                                                    className={`border ${errors.google_map_url ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-lg p-3 pl-10 w-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200`}
                                                />
                                            </div>
                                            {errors.google_map_url && (
                                                <p className="text-red-600 text-sm mt-1 error-message flex items-center gap-1">
                                                    <AlertCircle size={14} />
                                                    {errors.google_map_url}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                                                Tags <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Tag size={18} className="text-gray-400" />
                                                </div>
                                                <Select
                                                    inputId="tags"
                                                    isMulti
                                                    options={tagOptions}
                                                    value={tagOptions.filter(option => attractionData.tags.includes(option.value))}
                                                    onChange={handleTagChange}
                                                    placeholder="Select tags..."
                                                    className={`${errors.tags ? 'border border-red-300 rounded-lg' : ''}`}
                                                    styles={customSelectStyles}
                                                    theme={(theme) => ({
                                                        ...theme,
                                                        colors: {
                                                            ...theme.colors,
                                                            primary: '#10b981',
                                                            primary25: '#d1fae5',
                                                        },
                                                    })}
                                                />
                                            </div>
                                            {errors.tags && (
                                                <p className="text-red-600 text-sm mt-1 error-message flex items-center gap-1">
                                                    <AlertCircle size={14} />
                                                    {errors.tags}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Images Card */}
                            <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
                                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                    <ImageIcon className="text-emerald-600" size={22} />
                                    <h2 className="text-xl font-semibold text-gray-800">Images</h2>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label htmlFor="images" className="block text-sm font-medium text-gray-700">
                                            Upload Images <span className="text-red-500">*</span>
                                        </label>
                                        <span className="text-xs text-gray-500">
                                            {(attractionData.existingImages?.length || 0) + (attractionData.images?.length || 0)} images selected
                                        </span>
                                    </div>

                                    <div className={`border-2 border-dashed ${errors.images ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition duration-200`}>
                                        <input
                                            type="file"
                                            id="images"
                                            multiple
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                        <label htmlFor="images" className="cursor-pointer flex flex-col items-center">
                                            <ImageIcon size={36} className="text-gray-400 mb-2" />
                                            <span className="text-sm font-medium text-gray-700">Click to upload images</span>
                                            <span className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</span>
                                        </label>
                                    </div>

                                    {errors.images && (
                                        <p className="text-red-600 text-sm mt-1 error-message flex items-center gap-1">
                                            <AlertCircle size={14} />
                                            {errors.images}
                                        </p>
                                    )}
                                </div>

                                {/* Image Previews */}
                                {(attractionData.existingImages.length > 0 || imagePreviews.length > 0) && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-700 mb-3">Image Gallery</h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                            {/* Existing Images */}
                                            {attractionData.existingImages.map((src, index) => (
                                                <div key={`existing-${index}`} className="group relative rounded-lg overflow-hidden shadow-sm border border-gray-200 aspect-square">
                                                    <img
                                                        src={src || "/placeholder.svg"}
                                                        className="w-full h-full object-cover"
                                                        alt={`Attraction ${index + 1}`}
                                                    />
                                                    <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeExistingImage(index)}
                                                            className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition duration-200"
                                                            aria-label="Remove image"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}

                                            {/* New Image Previews */}
                                            {imagePreviews.map((src, index) => (
                                                <div key={`new-${index}`} className="group relative rounded-lg overflow-hidden shadow-sm border border-gray-200 aspect-square">
                                                    <img
                                                        src={src || "/placeholder.svg"}
                                                        className="w-full h-full object-cover"
                                                        alt={`New upload ${index + 1}`}
                                                    />
                                                    <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeNewImage(index)}
                                                            className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition duration-200"
                                                            aria-label="Remove image"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                    <div className="absolute top-2 right-2 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full">
                                                        New
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Points of Interest Card */}
                            <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
                                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="text-emerald-600" size={22} />
                                        <h2 className="text-xl font-semibold text-gray-800">Points of Interest</h2>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addPoint}
                                        className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium transition duration-200"
                                    >
                                        <Plus size={16} />
                                        Add Point
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {attractionData.points.map((point, index) => (
                                        <div
                                            key={index}
                                            className={`rounded-lg border ${errors[`point${index}`] || errors[`text${index}`]
                                                ? 'border-red-200 bg-red-50'
                                                : 'border-gray-200 bg-gray-50'
                                                } p-4`}
                                        >
                                            <div className="flex flex-col md:flex-row gap-4">
                                                <div className="flex-1 space-y-4">
                                                    <div>
                                                        <label htmlFor={`point-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                                                            Point ID <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            id={`point-${index}`}
                                                            value={point.point}
                                                            onChange={(e) => handlePointChange(index, 'point', e.target.value)}
                                                            placeholder="PO1234"
                                                            className={`border ${errors[`point${index}`] ? 'border-red-300' : 'border-gray-300'} rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200`}
                                                        />
                                                        {errors[`point${index}`] && (
                                                            <p className="text-red-600 text-sm mt-1 error-message flex items-center gap-1">
                                                                <AlertCircle size={14} />
                                                                {errors[`point${index}`]}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <label htmlFor={`text-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                                                            Description <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            id={`text-${index}`}
                                                            value={point.text}
                                                            onChange={(e) => handlePointChange(index, 'text', e.target.value)}
                                                            placeholder="Point description"
                                                            className={`border ${errors[`text${index}`] ? 'border-red-300' : 'border-gray-300'} rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200`}
                                                        />
                                                        {errors[`text${index}`] && (
                                                            <p className="text-red-600 text-sm mt-1 error-message flex items-center gap-1">
                                                                <AlertCircle size={14} />
                                                                {errors[`text${index}`]}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex flex-col items-center justify-center gap-3">
                                                    <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200">
                                                        <img
                                                            src={generateQRCode(id, point.point) || "/placeholder.svg"}
                                                            alt={`QR Code for Point ${index + 1}`}
                                                            className="w-24 h-24 object-contain"
                                                        />
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => removePoint(index)}
                                                        className="bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-lg transition duration-200"
                                                        aria-label="Remove point"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-lg shadow-sm transition duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isSaving ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Saving...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save size={18} />
                                            <span>Update Attraction</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UpdateAttractionForm;
