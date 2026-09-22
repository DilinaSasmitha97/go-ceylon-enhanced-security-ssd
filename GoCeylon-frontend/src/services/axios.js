/*import axios from "axios";

const instance = axios.create({
    baseURL: "http://localhost:3000/", // Backend API URL
    headers: { "Content-Type": "application/json" }
});

export default instance;


useEffect(() => {
    axios.get("http://localhost:3000/guides")
        .then(response => {
            console.log("API Response:", response.data); // Log the response
            setGuides(response.data);
            setLoading(false);
        })
        .catch(error => {
            console.error("Error fetching guides:", error); // Log the error
            setError(error);
            setLoading(false);
        });
}, []);



 useEffect(() => {
        setLoading(true); // Set loading to true before making the request

        axios.get("/guides")
            .then(response => {
                // Check if the response contains valid data
                if (response.data && Array.isArray(response.data)) {
                    console.log("API Response:", response.data); // Log the response for debugging
                    setGuides(response.data); // Update the guides state with the fetched data
                } else {
                    // If the data format is invalid, set an error
                    console.error("Invalid data format:", response.data);
                    setError(new Error("Invalid data format received from the server."));
                }
            })
            .catch(error => {
                // Handle any errors that occur during the request
                console.error("Error fetching guides:", error);
                setError(error); // Set the error state
            })
            .finally(() => {
                setLoading(false); // Set loading to false when the request completes
            });
    }, []); // Empty dependency array ensures this runs only once when the component mounts
*/

 const [guides, setGuides] = useState([]);

 useEffect(() => {
    axios.get("http://localhost:3000/guides")
    .then(response => {
        console.log("API Response:", response.data); // Correctly logs the response data
        setGuides(response.data);
    })
    .catch(error => {
        console.error("Error fetching guides:", error);
    });

}, []);

useEffect(() => {
    console.log("Updated guides:", guides);
}, [guides]);





    {guides.map((guide) => (
        <div key={guide._id} className="flex items-center p-5 bg-white rounded-xl shadow-md mb-4">
            <div className="ml-5 flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{guide.g_name}</h3>
                <p className="text-sm text-gray-600">DOB: {new Date(guide.g_dob).toLocaleDateString()}</p>
                <p className="text-sm text-gray-600">Email: {guide.email}</p>
                <p className="text-sm text-gray-600">Language: {guide.language}</p>
                <p className="text-sm text-gray-600">Gender: {guide.gender}</p>
                <p className="text-sm text-gray-600">Price: ${guide.price}</p>
                <p className="text-sm text-gray-600">Location: {guide.location.join(", ")}</p>
                <p className="text-sm text-gray-600">Contact: {guide.contact_number}</p>
            </div>
        </div>
    ))}
        

    {/* 
            {guides.map((guide) => (
                <div key={guide._id} className="flex items-center p-5 bg-white rounded-xl shadow-md mb-4">
                    <div className="ml-5 flex-1">
                        {/* Guide name */}
                        <h3 className="text-lg font-semibold text-gray-900">{guide.g_name}</h3>

                        {/* Guide details */}
                        <p className="text-sm text-gray-600">DOB: {new Date(guide.g_dob).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-600">Email: {guide.email}</p>
                        <p className="text-sm text-gray-600">Language: {guide.language}</p>
                        <p className="text-sm text-gray-600">Gender: {guide.gender}</p>
                        <p className="text-sm text-gray-600">Price: ${guide.price}</p>
                        <p className="text-sm text-gray-600">Location: {guide.location.join(", ")}</p>
                        <p className="text-sm text-gray-600">Contact: {guide.contact_number}</p>

                        {/* Availability status */}
                        <p className={`text-sm font-semibold mt-2 ${guide.availability ? 'text-green-500' : 'text-red-500'}`}>
                            {guide.availability ? "Available" : "Not Available"}
                        </p>

                        {/* Rating */}
                        <div className="flex items-center mt-2">
                            <FaStar className="text-yellow-500" />
                            <span className="ml-2 text-sm text-gray-600">{guide.rating || "No rating"}</span>
                        </div>

                        {/* Book Now button (only shown if the guide is available) */}
                        {guide.availability && (
                            <button
                                onClick={() => handleBooking(guide)}
                                className="ml-auto px-4 py-2 bg-green-500 text-white text-sm font-semibold rounded-lg hover:bg-green-600 transition duration-200"
                            >
                                Book Now
                            </button>
                        )}
                    </div>
                </div>
            ))}
       */}