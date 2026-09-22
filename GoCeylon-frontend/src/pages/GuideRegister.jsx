import React, { useEffect, useState } from 'react';
import axios from 'axios';

const GuideRegistrationForm = () => {
  const [formData, setFormData] = useState({
    g_name: '',
    g_dob: '',
    email: '',
    password: '',
    language: [],
    gender: 'Male',
    price: '',
    location: [],
    contact_number: '',
    photo: null,
  });

  const [locations, setLocations] = useState([]);
  const [message, setMessage] = useState('');

  const availableLanguages = ['English', 'Sinhala', 'Tamil', 'French', 'German', 'Spanish'];

  // Fetch locations from API
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await axios.get('http://localhost:3000/location');
        setLocations(res.data.locations);
      } catch (error) {
        console.error('Failed to fetch locations:', error);
      }
    };
    fetchLocations();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (name === 'photo') {
      setFormData({ ...formData, photo: files[0] });
    } else if (name === 'language' || name === 'location') {
      const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
      setFormData({ ...formData, [name]: selectedOptions });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('g_name', formData.g_name);
      data.append('g_dob', formData.g_dob);
      data.append('email', formData.email);
      data.append('password', formData.password);
      formData.language.forEach((lang) => data.append('language', lang));
      data.append('gender', formData.gender);
      data.append('price', formData.price);
      formData.location.forEach((loc) => data.append('location', loc));
      data.append('contact_number', formData.contact_number);
      if (formData.photo) {
        data.append('photo', formData.photo);
      }

      const res = await axios.post('http://localhost:3000/guides', data);
      setMessage('Guide registered successfully!');
      console.log(res.data);
    } catch (error) {
      console.error(error);
      setMessage('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Register New Guide</h2>
      {message && <div className="mb-4 text-center text-red-500">{message}</div>}
      <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-4">
        <input type="text" name="g_name" placeholder="Full Name" value={formData.g_name} onChange={handleChange} required className="w-full border px-4 py-2 rounded" />

        <input type="date" name="g_dob" value={formData.g_dob} onChange={handleChange} required className="w-full border px-4 py-2 rounded" />

        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required className="w-full border px-4 py-2 rounded" />

        <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required className="w-full border px-4 py-2 rounded" />

        <label className="block text-sm font-medium text-gray-700">Languages</label>
        <select name="language" multiple value={formData.language} onChange={handleChange} required className="w-full border px-4 py-2 rounded h-32">
          {availableLanguages.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>

        <label className="block text-sm font-medium text-gray-700">Gender</label>
        <select name="gender" value={formData.gender} onChange={handleChange} required className="w-full border px-4 py-2 rounded">
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>

        <input type="number" name="price" placeholder="Price per Day" value={formData.price} onChange={handleChange} required className="w-full border px-4 py-2 rounded" />

        <label className="block text-sm font-medium text-gray-700">Locations</label>
        <select name="location" multiple value={formData.location} onChange={handleChange} required className="w-full border px-4 py-2 rounded h-32">
          {locations.map((loc) => (
            <option key={loc._id} value={loc._id}>
              {loc.name}
            </option>
          ))}
        </select>

        <input type="text" name="contact_number" placeholder="Contact Number" value={formData.contact_number} onChange={handleChange} required className="w-full border px-4 py-2 rounded" />

        <input type="file" name="photo" accept="image/*" onChange={handleChange} className="w-full" />

        <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700 transition">
          Register
        </button>
      </form>
    </div>
  );
};

export default GuideRegistrationForm;
