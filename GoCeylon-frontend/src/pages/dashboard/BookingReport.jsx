import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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

const BookingReport = () => {
    const navigate = useNavigate();
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [bookingData, setBookingData] = useState([]);
    const token = localStorage.getItem("authToken");

    useEffect(() => {
        if (!token) return;

        axios
            .get(`${API_BASE_URL}/booking`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then((response) => {
                if (Array.isArray(response.data)) {
                    setBookingData(response.data);
                    console.log(response.data);
                } else {
                    console.error("Invalid API response format:", response.data);
                }
            })
            .catch((error) => {
                console.error("Error fetching bookings:", error);
                alert("Failed to fetch booking data. Please try again later.");
            });
    }, [token]);

    const filteredData = useMemo(() => {
        let filtered = [...bookingData];

        // Apply status filter
        if (statusFilter) {
            filtered = filtered.filter(booking =>
                booking.bookingStatus === statusFilter
            );
        }

        // Apply global search filter
        if (globalFilter) {
            const searchTerm = globalFilter.toLowerCase();
            filtered = filtered.filter(booking =>
                (booking.userId?.name?.toLowerCase().includes(searchTerm) || '') ||
                (booking.guideId?.g_name?.toLowerCase().includes(searchTerm) || '') ||
                booking.code.toLowerCase().includes(searchTerm) ||
                booking.bookingStatus.toLowerCase().includes(searchTerm)
            );
        }

        return filtered;
    }, [bookingData, statusFilter, globalFilter]);

    const columns = useMemo(
        () => [
            {
                header: "User",
                accessorFn: (row) => row.userId?.name || "N/A",
            },
            {
                header: "Guide",
                accessorFn: (row) => row.guideId?.g_name || "N/A",
            },
            {
                header: "Status",
                accessorKey: "bookingStatus",
                cell: info => {
                    const status = info.getValue();
                    const statusColors = {
                        'confirmed': 'bg-blue-100 text-blue-800',
                        'cancel': 'bg-red-100 text-red-800',
                        'finish': 'bg-green-100 text-green-800',
                    };
                    return (
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
                            {status}
                        </span>
                    );
                }
            },
            {
                header: "Start Time",
                accessorFn: (row) => {
                    if (!row.startAt) return "N/A";
                    return new Date(row.startAt).toLocaleString();
                },
            },
            {
                header: "End Time",
                accessorFn: (row) => {
                    if (!row.endAt) return "N/A";
                    return new Date(row.endAt).toLocaleString();
                },
            },
            {
                header: "Price",
                accessorFn: (row) => `$${row.price.toFixed(2)}`,
            },
        ],
        []
    );

    const table = useReactTable({
        data: filteredData,
        columns,
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.text("Booking Report", 14, 10);
        autoTable(doc, {
            head: [["Code", "User", "Guide", "Status", "Start Time", "End Time", "Duration", "Members", "Price"]],
            body: filteredData.map((row) => [
                row.code,
                row.userId?.name || "N/A",
                row.guideId?.g_name || "N/A",
                row.bookingStatus,
                row.startAt ? new Date(row.startAt).toLocaleString() : "N/A",
                row.endAt ? new Date(row.endAt).toLocaleString() : "N/A",
                row.expectedDuration,
                row.numberOfMembers,
                `$${row.price.toFixed(2)}`,
            ]),
        });
        doc.save("booking_report.pdf");
    };

    return (
        <div className="flex h-screen bg-[#eee]">
            <Sidebar />
            <div className="flex-1 ml-64 overflow-y-auto h-screen p-8">
                <div className="bg-white w-full p-10 rounded-lg shadow-xl relative">
                    <div className="p-6 mx-auto">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Booking Report</h2>
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
                                <div className="relative w-full max-w-xs">
                                    <select
                                        value={statusFilter}
                                        onChange={e => setStatusFilter(e.target.value)}
                                        className="block appearance-none w-full h-[42px] bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-10 rounded-md leading-tight focus:outline-none"
                                    >
                                        <option value="">All Status</option>
                                        <option value="confirmed">Confirmed</option>
                                        <option value="cancel">Cancelled</option>
                                        <option value="finish">Finished</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                        <svg
                                            className="h-4 w-4"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M5.23 7.21a.75.75 0 011.06.02L10 11.292l3.71-4.06a.75.75 0 111.08 1.04l-4.25 4.65a.75.75 0 01-1.08 0l-4.25-4.65a.75.75 0 01.02-1.06z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </div>
                                </div>
                                <button
                                    onClick={exportToPDF}
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

export default BookingReport;