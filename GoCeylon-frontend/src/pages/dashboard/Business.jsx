import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import * as XLSX from 'xlsx';
import Sidebar from "../../components/Sidebar";
import API_BASE_URL from "../../config/config";
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    getFilteredRowModel,
    flexRender,
} from "@tanstack/react-table";

const Business = () => {
    const navigate = useNavigate();
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [businessData, setBusinessData] = useState([]);

    const token = localStorage.getItem("authToken");

    useEffect(() => {
        if (!token) return;

        axios
            .get(`${API_BASE_URL}/api/business/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then((response) => {
                if (Array.isArray(response.data)) {
                    setBusinessData(response.data);
                } else {
                    console.error("Invalid API response format:", response.data);
                }
            })
            .catch((error) => {
                console.error("Error fetching Business:", error);
                alert("Failed to fetch business data. Please try again later.");
            });
    }, [token]);

    // Function to generate and download Excel report
    const generateExcelReport = () => {
        // Use filtered rows from the table
        const filteredRows = table.getFilteredRowModel().rows;

        // Prepare data for Excel from filtered rows
        const reportData = filteredRows.map((row, index) => ({
            ID: index + 1,
            Name: row.original.business_name,
            Category: row.original.business_category,
            Number: row.original.contact_number,
            Address: row.original.address,
        }));

        // Create worksheet
        const worksheet = XLSX.utils.json_to_sheet(reportData);

        // Create workbook
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Businesses');

        // Add headers styling
        worksheet['!cols'] = [
            { wch: 10 }, // ID column width
            { wch: 20 }, // Name column width
            { wch: 20 }, // Category column width
            { wch: 15 }, // Number column width
            { wch: 30 }, // Address column width
        ];

        // Generate Excel file and trigger download
        XLSX.writeFile(workbook, `Businesses_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    const columns = useMemo(
        () => [
            {
                header: 'ID',
                accessorFn: (row, index) => index + 1,
                id: 'sequentialId',
                enableSorting: false,
            },
            { header: "Name", accessorKey: "business_name" },
            { header: "Category", accessorKey: "business_category" },
            { header: "Number", accessorKey: "contact_number" },
            { header: "Address", accessorKey: "address" },
        ],
        []
    );

    const table = useReactTable({
        data: businessData,
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
                <div className="bg-white w-full p-10 rounded-lg shadow-xl relative">
                    <div className="p-6 mx-auto">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Business Management</h2>
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
                                    onClick={generateExcelReport}
                                    className="px-4 py-2 bg-[#007a55] text-white rounded-md"
                                >
                                    Download
                                </button>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <tr key={headerGroup.id}>
                                            {headerGroup.headers.map((header) => (
                                                <th
                                                    key={header.id}
                                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                    onClick={header.column.getToggleSortingHandler()}
                                                >
                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                </th>
                                            ))}
                                        </tr>
                                    ))}
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {table.getRowModel().rows.map((row) => (
                                        <tr key={row.id} className="hover:bg-gray-50 even:bg-gray-50">
                                            {row.getVisibleCells().map((cell) => (
                                                <td key={cell.id} className="px-6 py-4 text-sm text-gray-700">
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                <span>Show</span>
                                <select
                                    value={table.getState().pagination.pageSize}
                                    onChange={(e) => table.setPageSize(Number(e.target.value))}
                                    className="px-2 py-1 border rounded-md"
                                >
                                    {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                                        <option key={pageSize} value={pageSize}>{pageSize}</option>
                                    ))}
                                </select>
                                <span>entries</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="px-4 py-2 border rounded-md">
                                    Previous
                                </button>
                                <span className="px-4 py-2 text-sm">Page {table.getState().pagination.pageIndex + 1} of {Math.max(1, table.getPageCount())}</span>
                                <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="px-4 py-2 border rounded-md">
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

export default Business;