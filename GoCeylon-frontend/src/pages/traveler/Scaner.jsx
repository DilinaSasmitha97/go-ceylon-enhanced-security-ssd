import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNameBar from "../../components/TopNameBar";
import { Scanner } from '@yudiel/react-qr-scanner';

export default function ScannerScreen() {
    const [scanResult, setScanResult] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate(); // Initialize navigate

    const handleScan = (result) => {
        console.log("Raw Scan Result:", result);

        if (Array.isArray(result) && result.length > 0) {
            const firstItem = result[0];
            console.log("First Item in Array:", firstItem);

            if (firstItem && firstItem.rawValue) {
                try {
                    const parsedData = JSON.parse(firstItem.rawValue);
                    console.log("Parsed Scan Result:", parsedData);
                    setError(null);
                    // After parsing the data, navigate to PointGuide and pass data via state
                    navigate('/user/guide/point', { state: parsedData });

                } catch (e) {
                    setError('Failed to parse the QR code data.');
                    console.error("Parsing Error:", e);
                }
            } else {
                setError('No valid rawValue found in the result');
                console.log("Raw value not found in the first item");
            }
        } else {
            setError('No valid QR code detected');
            console.log("Result is not an array or is empty");
        }
    };

    const handleError = (error) => {
        setError("Failed to scan QR code. Please try again.");
        console.error("Scanner Error:", error);
    };

    return (
        <div className="flex flex-col h-screen w-full bg-gray-100">
            <TopNameBar title="Scanner" />
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-4">
                    <Scanner
                        onScan={handleScan}
                        onError={handleError}
                        className="w-full h-64 border rounded-lg"
                    />
                    {error && <p className="text-red-500 text-center mt-2">{error}</p>}
                    {scanResult && (
                        <div className="mt-4">
                            <p className="text-center text-green-500">Scanned Result:</p>
                            <pre className="text-center">{JSON.stringify(scanResult, null, 2)}</pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
