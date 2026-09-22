import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import TopAppBar from '../../components/TopAppBar';
import BottomTabBar from '../../components/BottomTabBar';
import API_BASE_URL from "../../config/config";

const AttractionsPage = () => {
  const [locations, setLocations] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Helper function to strip HTML tags and truncate text to 12 words
  const truncateDescription = (htmlString, wordLimit = 12) => {
    const plainText = htmlString.replace(/<[^>]+>/g, '');
    const words = plainText.split(/\s+/).filter(Boolean);
    return words.slice(0, wordLimit).join(' ') + (words.length > wordLimit ? '...' : '');
  };

  // Fetch all locations when the component mounts
  useEffect(() => {
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", "#007a55");
    const fetchLocations = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/location/`);
        const data = response.data;
        setLocations(data.locations);

        // Extract unique tags from the fetched data
        const allTags = data.locations.flatMap(location => location.tags);
        setTags([...new Set(allTags)]);
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };
    fetchLocations();
  }, []);

  // Filter locations based on search query and selected tag
  const filteredLocations = locations.filter(location => {
    const matchesTag = selectedTag ? location.tags.includes(selectedTag) : true;
    const matchesSearchQuery =
      location.name.toLowerCase().includes(searchQuery) ||
      location.description.toLowerCase().includes(searchQuery);
    return matchesTag && matchesSearchQuery;
  });

  const handleTagChange = (event) => {
    setSelectedTag(event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const handleCardClick = (id) => {
    // Navigate to the AttractionDetailsPage
    navigate(`/user/location/${id}`);
  };

  return (
    <>
      <TopAppBar />
      <div className="container mx-auto p-6 mt-[4rem] bg-gray-100 min-h-screen">
        <div className="mb-[4rem]">

          {/* Search Bar */}
          <div class="pb-4">
            <div class="relative bg-white border-1 border-gray-300 rounded-lg">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={handleSearchChange}
                class="w-full px-4 py-3 pl-10 rounded-lg border-0 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
              <svg
                class="w-5 h-5 absolute left-3 top-3.5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex overflow-x-auto space-x-3 scrollbar-hide">
              <button
                className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium ${selectedTag === "" ? "bg-[#007a551c] text-[#007a55]" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  } transition-colors`}
                onClick={() => handleTagChange({ target: { value: "" } })}
              >
                All Tags
              </button>
              {tags.map((tag) => (
                <button
                  key={tag}
                  className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium ${selectedTag === tag ? "bg-[#007a551c] text-[#007a55]" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    } transition-colors`}
                  onClick={() => handleTagChange({ target: { value: tag } })}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Display filtered locations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredLocations.length > 0 ? (
              filteredLocations.map(location => (
                <div
                  key={location._id}
                  className="border border-gray-300 rounded-xl overflow-hidden shadow-xl transform hover:scale-105 transition-transform duration-300 ease-in-out"
                  onClick={() => handleCardClick(location._id)}
                >
                  <div className="relative w-full h-56 sm:h-64 md:h-72 lg:h-80">
                    <img
                      src={location.image_url[0]}
                      alt={location.name}
                      className="absolute inset-0 w-full h-full object-cover rounded-t-xl"
                    />
                  </div>
                  <div className="p-6 bg-white">
                    <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                      {location.name}
                    </h3>
                    <p className="text-gray-600 text-base">
                      {truncateDescription(location.description)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 col-span-full">
                No attractions found matching the criteria.
              </p>
            )}
          </div>
        </div>
      </div>
      <BottomTabBar />
    </>
  );
};

export default AttractionsPage;
