import React, { useState } from 'react';

const BusinessmanRegister = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    businessName: '',
    businessCategory: '',
    dob: '',
    contactNumber: '',
    address: '',
    businessDocument: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, businessDocument: e.target.files[0] });
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Business Registered Successfully!');
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-2xl font-semibold text-center mb-6">Business Registration</h2>
        
        {step === 1 && (
          <div>
            <input 
              type="text" 
              name="name" 
              placeholder="Name" 
              value={formData.name} 
              onChange={handleChange} 
              className="w-full px-3 py-2 border rounded-lg mb-2" 
              required
            />
            <input 
              type="email" 
              name="email" 
              placeholder="Email" 
              value={formData.email} 
              onChange={handleChange} 
              className="w-full px-3 py-2 border rounded-lg mb-2" 
              required
            />
            <input 
              type="password" 
              name="password" 
              placeholder="Password" 
              value={formData.password} 
              onChange={handleChange} 
              className="w-full px-3 py-2 border rounded-lg mb-2" 
              required
            />
            <button 
              onClick={nextStep} 
              className="w-full bg-green-600 text-white py-2 rounded-lg"
            >
              Next
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <input 
              type="text" 
              name="businessName" 
              placeholder="Business Name" 
              value={formData.businessName} 
              onChange={handleChange} 
              className="w-full px-3 py-2 border rounded-lg mb-2" 
              required
            />
            <select 
              name="businessCategory" 
              value={formData.businessCategory} 
              onChange={handleChange} 
              className="w-full px-3 py-2 border rounded-lg mb-2" 
              required
            >
              <option value="">Select Category</option>
              <option value="Hotel">Hotel</option>
              <option value="Restaurant">Restaurant</option>
              <option value="Transport">Transport</option>
            </select>
            <input 
              type="date" 
              name="dob" 
              value={formData.dob} 
              onChange={handleChange} 
              className="w-full px-3 py-2 border rounded-lg mb-2" 
              required
            />
            <input 
              type="text" 
              name="contactNumber" 
              placeholder="Contact Number" 
              value={formData.contactNumber} 
              onChange={handleChange} 
              className="w-full px-3 py-2 border rounded-lg mb-2" 
              required
            />
            <input 
              type="text" 
              name="address" 
              placeholder="Address" 
              value={formData.address} 
              onChange={handleChange} 
              className="w-full px-3 py-2 border rounded-lg mb-2" 
              required
            />
            <div className="flex justify-between">
              <button onClick={prevStep} className="px-4 py-2 bg-gray-500 text-white rounded">Back</button>
              <button onClick={nextStep} className="px-4 py-2 bg-green-600 text-white rounded">Next</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <input 
              type="file" 
              onChange={handleFileChange} 
              className="w-full px-3 py-2 border rounded-lg mb-2" 
              required
            />
            <div className="flex justify-between">
              <button onClick={prevStep} className="px-4 py-2 bg-gray-500 text-white rounded">Back</button>
              <button onClick={handleSubmit} className="px-4 py-2 bg-green-600 text-white rounded">Submit</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessmanRegister;