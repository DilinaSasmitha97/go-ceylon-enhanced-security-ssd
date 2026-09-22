import React, { useMemo, useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import axios from "axios";
import API_BASE_URL from "../../config/config";
import { useNavigate } from "react-router-dom";
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    getFilteredRowModel,
    flexRender,
} from "@tanstack/react-table";

const Tracking = () => {
    const navigate = useNavigate();
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [data, setData] = useState([]);

    const token = localStorage.getItem("authToken");

    // Fetch data from API
    const fetchData = async () => {
        try {
            const token = localStorage.getItem("authToken");
            const response = await axios.get(`${API_BASE_URL}/api/scaner/rfid`, {
                headers: {
                    "Authorization": `Bearer ${token}`, // Include token in the request header
                }
            });
            setData(response.data.data);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        fetchData(); // Initial fetch
        const interval = setInterval(fetchData, 1000); // Fetch data every 1 second
        return () => clearInterval(interval); // Cleanup on unmount
    }, []);

    const handleScanerRecodeDownload = async () => {
        try {
            // Make the request to the backend to download the Excel file
            const response = await axios.get(`${API_BASE_URL}/api/scaner/export`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                responseType: 'blob', // This ensures the response is treated as a file
            });

            // Create a link element to trigger the download
            const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'RFID_Records.xlsx'; // Specify the filename
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error downloading file', error);
            alert('Error downloading file');
        }
    };

    // Define columns
    const columns = useMemo(() => [
        { header: "RFID Tag Code", accessorKey: "rfidTagCode" },
        { header: "Nationality", accessorKey: "nationality" },
        { header: "Passport Number", accessorKey: "passportNumber" },
        { header: "Scan Location", accessorKey: "scanLocation" },
        { header: "Transaction Amount", accessorKey: "transactionAmount" },
        { header: "Timestamp", accessorKey: "timestamp" },
    ], []);

    // Create table instance
    const table = useReactTable({
        data,
        columns,
        state: { sorting, globalFilter },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    return (
        <div className="flex h-screen bg-[#eee]">
            <Sidebar />
            <div className="flex-1 ml-64 overflow-y-auto h-screen p-8">
                <div className="bg-white w-full p-10 rounded-lg shadow-xl">
                    <div className="p-6 mx-auto">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">RFID Scan Records</h2>
                            <div className="flex gap-4">
                                <div className="relative w-full sm:max-w-xs">
                                    <input
                                        type="text"
                                        value={globalFilter}
                                        onChange={e => setGlobalFilter(e.target.value)}
                                        placeholder="Search here..."
                                        className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md outline-none"
                                    />
                                    <svg
                                        className="absolute left-3 top-3 h-5 w-5 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                        />
                                    </svg>
                                </div>
                                <button
                                    onClick={handleScanerRecodeDownload}
                                    className="px-4 py-2 bg-[#007a55] text-white rounded-lg"
                                >
                                    Generate
                                </button>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    {table.getHeaderGroups().map(headerGroup => (
                                        <tr key={headerGroup.id}>
                                            {headerGroup.headers.map(header => (
                                                <th
                                                    key={header.id}
                                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                    onClick={header.column.getToggleSortingHandler()}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                                        {header.column.getIsSorted() && (
                                                            <span className="text-blue-600">
                                                                {header.column.getIsSorted() === "asc" ? "↑" : "↓"}
                                                            </span>
                                                        )}
                                                    </div>
                                                </th>
                                            ))}
                                        </tr>
                                    ))}
                                </thead>

                                <tbody className="bg-white divide-y divide-gray-200">
                                    {table.getRowModel().rows.map(row => (
                                        <tr key={row.id} className="hover:bg-gray-50 even:bg-gray-50">
                                            {row.getVisibleCells().map(cell => (
                                                <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                <span>Show</span>
                                <select
                                    value={table.getState().pagination.pageSize}
                                    onChange={(e) => table.setPageSize(Number(e.target.value))}
                                    className="px-2 py-1 border rounded-md focus:ring-blue-500"
                                >
                                    {[10, 20, 30, 40, 50].map(pageSize => (
                                        <option key={pageSize} value={pageSize}>{pageSize}</option>
                                    ))}
                                </select>
                                <span>entries</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => table.previousPage()}
                                    disabled={!table.getCanPreviousPage()}
                                    className="px-4 py-2 border rounded-md text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <span className="px-4 py-2 text-sm text-gray-700">
                                    Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                                </span>
                                <button
                                    onClick={() => table.nextPage()}
                                    disabled={!table.getCanNextPage()}
                                    className="px-4 py-2 border rounded-md text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Tracking;
