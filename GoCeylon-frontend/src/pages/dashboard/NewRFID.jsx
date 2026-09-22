import React, { useState } from "react";
import Select from "react-select";
import axios from "axios";
import Sidebar from "../../components/Sidebar";
import { useModal } from '../../context/ModalContext';
import API_BASE_URL from "../../config/config";

const countries = [
    { value: "US", label: "United States" },
    { value: "UK", label: "United Kingdom" },
    { value: "CA", label: "Canada" },
    { value: "AU", label: "Australia" },
    { value: "IN", label: "India" },
    { value: "LK", label: "Sri Lanka" },
    { value: "FR", label: "France" },
    { value: "DE", label: "Germany" },
];

const token = localStorage.getItem("authToken");

const InputField = ({ label, name, type, value, onChange, error }) => (
    <div className="w-full">
        <label className="block text-lg font-semibold text-gray-700 mb-1">{label}</label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            className={`w-full p-3 border ${error ? "border-red-500" : "border-gray-300"} rounded-md focus:ring-2 focus:ring-[#007a55] outline-none`}
        />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
);

export default function NewRFID() {

    const { showModal, closeModal } = useModal();

    const handleOpenModal = () => {
        showModal({
            title: 'Confirm Action',
            content: <p>Are you sure you want to perform this action?</p>,
            buttons: [
                {
                    label: 'Cancel',
                    onClick: closeModal,
                    className: 'bg-gray-200 hover:bg-gray-300'
                },
                {
                    label: 'Confirm',
                    onClick: () => {
                        alert('Action confirmed!');
                        closeModal();
                    },
                    className: 'bg-[#007a55] text-white'
                }
            ]
        });
    };

    const [traveler, setTraveler] = useState({ fullName: "", email: "", phoneNumber: "", nationality: "", passportNumber: "", rfidTagCode: "", walletAmount: "", birthday: "", });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTraveler((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const handleCountryChange = (selectedOption) => {
        setTraveler((prev) => ({ ...prev, nationality: selectedOption?.value || "" }));
        setErrors((prev) => ({ ...prev, nationality: "" }));
    };


    const today = new Date(); // Get the current date
    const birthdayDate = new Date(traveler.birthday); // Convert input to Date object

    const validateForm = () => {
        let newErrors = {};
        if (!traveler.fullName.trim()) {
            newErrors.fullName = "Full Name is required.";
        } else if (!/^[A-Za-z.\s]+$/.test(traveler.fullName.trim())) {
            newErrors.fullName = "Full Name cannot contain numbers or special characters.";
        }
        if (!traveler.email.trim()) newErrors.email = "Email is required.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(traveler.email)) newErrors.email = "Invalid email format.";
        if (!traveler.phoneNumber.trim()) {
            newErrors.phoneNumber = "Phone Number is required.";
        } else if (!/^\d{10}$/.test(traveler.phoneNumber.trim())) {
            newErrors.phoneNumber = "Phone Number must be exactly 10 digits.";
        }
        else if (!/^\d+$/.test(traveler.phoneNumber)) newErrors.phoneNumber = "Phone number must contain only digits.";
        if (!traveler.rfidTagCode.trim()) newErrors.rfidTagCode = "RFID Tag Code is required.";
        if (!traveler.nationality) newErrors.nationality = "Nationality is required.";
        if (!traveler.passportNumber.trim()) newErrors.passportNumber = "Passport Number is required.";
        if (!traveler.walletAmount) newErrors.walletAmount = "Wallet Amount is required.";
        else if (Number(traveler.walletAmount) < 0) newErrors.walletAmount = "Wallet amount cannot be negative.";
        if (!traveler.birthday) {
            newErrors.birthday = "Birthday is required.";
        } else if (birthdayDate >= today) {
            newErrors.birthday = "Birthday must be a date in the past.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        console.log("Sending traveler data:", traveler);
        setLoading(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/rfid`, traveler, {
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            });
            console.log("Traveler Added:", response.data);
            showModal({
                title: 'Registered Successful!',
                content: <p>Your RFID tag was registered successfully, And now on you can use that tag</p>,
                buttons: [
                    {
                        label: 'Ok',
                        onClick: () => {
                            closeModal();
                        },
                        className: 'bg-[#007a55] w-[6rem] text-white'
                    }
                ]
            });
            setTraveler({
                fullName: "",
                email: "",
                phoneNumber: "",
                nationality: "",
                passportNumber: "",
                rfidTagCode: "",
                walletAmount: "",
                birthday: "",
            });
            setErrors({});
        } catch (error) {
            console.error("Error adding traveler:", error);
            showModal({
                title: 'Error adding traveler!',
                content: <p>{error.response?.data?.message || "Failed to add traveler."}</p>,
                buttons: [
                    {
                        label: 'Ok',
                        onClick: () => {
                            closeModal();
                        },
                        className: 'bg-[#007a55] w-[6rem] text-white'
                    }
                ]
            });
        } finally {
            setLoading(false);
        }
    };

    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            borderWidth: "1px",
            borderColor: state.isFocused ? "#d1d5dc" : "#d1d5dc",
            boxShadow: state.isFocused ? "0 0 0 1px #007a55" : "none", // Simulating focus:ring-2
            "&:hover": { borderColor: "#007a55" }, // Change border on hover
        }),
    };

    return (
        <div className="flex h-screen bg-[#eee]">
            <Sidebar />
            <div className="flex-1 ml-64 overflow-y-auto h-screen p-8">
                <div className="bg-white w-full p-10 rounded-lg shadow-xl relative">
                    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
                        <InputField label="Full Name" name="fullName" type="text" value={traveler.fullName} onChange={handleChange} error={errors.fullName} />
                        <InputField label="Email" name="email" type="email" value={traveler.email} onChange={handleChange} error={errors.email} />
                        <InputField label="Phone Number" name="phoneNumber" type="tel" value={traveler.phoneNumber} onChange={handleChange} error={errors.phoneNumber} />
                        <InputField label="RFID Tag Code" name="rfidTagCode" type="text" value={traveler.rfidTagCode} onChange={handleChange} error={errors.rfidTagCode} />
                        <div className="w-full">
                            <label className="block text-lg font-semibold text-gray-700 mb-1">Nationality</label>
                            <Select options={countries} styles={customStyles} classNames={{
                                control: () => "block text-lg text-gray-700 p-[4px] mb-1",
                            }} onChange={handleCountryChange} value={countries.find(c => c.value === traveler.nationality) || null} isClearable placeholder="Select a country..." />
                            {errors.nationality && <p className="text-red-500 text-sm mt-1">{errors.nationality}</p>}
                        </div>
                        <InputField label="Passport Number" name="passportNumber" type="text" value={traveler.passportNumber} onChange={handleChange} error={errors.passportNumber} />
                        <InputField label="Wallet Amount" name="walletAmount" type="number" value={traveler.walletAmount} onChange={handleChange} error={errors.walletAmount} />
                        <InputField label="Birthday" name="birthday" type="date" value={traveler.birthday} onChange={handleChange} error={errors.birthday} />
                        <div className="col-span-2 flex justify-end">
                            <button type="submit" disabled={loading} className={`bg-[#007a55] text-white text-lg font-semibold py-3 px-6 rounded-md transition ${loading ? "opacity-50 cursor-not-allowed" : ''}`}>{loading ? "Registering..." : "Register"}</button>
                        </div>
                    </form>

                </div>
            </div>
        </div>
    );
}
