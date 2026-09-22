import React, { useMemo, useState, useEffect } from 'react';
import Sidebar from "../../components/Sidebar";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from "../../config/config";
import { useModal } from '../../context/ModalContext';
import { MdDelete } from "react-icons/md";
import { BiSolidEdit } from "react-icons/bi";
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    getFilteredRowModel,
    flexRender,
} from '@tanstack/react-table';
import * as XLSX from 'xlsx';

const RfidList = () => {
    const navigate = useNavigate();
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [countryFilter, setCountryFilter] = useState('');
    const [data, setData] = useState([]);
    const { showModal, closeModal } = useModal();
    const token = localStorage.getItem("authToken");

    // Fetch data from API
    const fetchData = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/rfid`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                },
            });
            if (response.data.success) {
                setData(response.data.data);
            } else {
                console.error('Failed to fetch data');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

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

    // Fetch data on component mount
    useEffect(() => {
        fetchData();
    }, []);

    const filteredData = useMemo(() => {
        let filtered = [...data];

        // Apply country filter
        if (countryFilter) {
            filtered = filtered.filter(item => item.nationality === countryFilter);
        }

        // Apply global search filter
        if (globalFilter) {
            const searchTerm = globalFilter.toLowerCase();
            filtered = filtered.filter(item =>
                item.rfidTagCode.toLowerCase().includes(searchTerm) ||
                item.fullName.toLowerCase().includes(searchTerm) ||
                item.email.toLowerCase().includes(searchTerm) ||
                item.phoneNumber.toLowerCase().includes(searchTerm) ||
                item.nationality.toLowerCase().includes(searchTerm) ||
                item.passportNumber.toLowerCase().includes(searchTerm)
            );
        }

        return filtered;
    }, [data, countryFilter, globalFilter]);

    // Function to generate and download Excel report
    const generateExcelReport = () => {
        // Use filtered rows from the table
        const filteredRows = table.getFilteredRowModel().rows;

        // Prepare data for Excel from filtered rows
        const reportData = filteredRows.map((row, index) => ({
            ID: index + 1,
            'RFID Tag Code': row.original.rfidTagCode,
            'Full Name': row.original.fullName,
            Email: row.original.email,
            'Phone Number': row.original.phoneNumber,
            Country: row.original.nationality,
            'Passport Number': row.original.passportNumber,
            Wallet: row.original.walletAmount,
        }));

        // Create worksheet
        const worksheet = XLSX.utils.json_to_sheet(reportData);

        // Create workbook
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'RFID Records');

        // Add headers styling
        worksheet['!cols'] = [
            { wch: 10 }, // ID column width
            { wch: 20 }, // RFID Tag Code column width
            { wch: 20 }, // Full Name column width
            { wch: 30 }, // Email column width
            { wch: 15 }, // Phone Number column width
            { wch: 15 }, // Country column width
            { wch: 20 }, // Passport Number column width
            { wch: 10 }, // Wallet column width
        ];

        // Generate Excel file and trigger download
        XLSX.writeFile(workbook, `RFID_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    // Define columns
    const columns = useMemo(() => [
        {
            header: 'ID',
            accessorFn: (row, index) => index + 1, // Sequential ID starting from 1
            id: 'sequentialId',
            enableSorting: false,
        },
        {
            header: 'RFID Tag Code',
            accessorKey: 'rfidTagCode',
        },
        {
            header: 'Full Name',
            accessorKey: 'fullName',
        },
        {
            header: 'Email',
            accessorKey: 'email',
        },
        {
            header: 'Phone Number',
            accessorKey: 'phoneNumber',
        },
        {
            header: 'Country',
            accessorKey: 'nationality',
        },
        {
            header: 'Passport Number',
            accessorKey: 'passportNumber',
        },
        {
            header: 'Wallet',
            accessorKey: 'walletAmount',
        },
        {
            header: 'Actions',
            id: 'actions',
            cell: ({ row }) => (
                <div className="flex space-x-2">
                    <button
                        onClick={() => handleUpdate(row.original._id)}
                        className="px-2 py-1 w-15 bg-emerald-600 text-white rounded cursor-pointer flex flex-row items-center gap-[5px]"
                    >
                        <BiSolidEdit />Edit
                    </button>
                    <button
                        onClick={() => handleDelete(row.original._id)}
                        className="px-2 py-1 bg-red-500 text-white rounded cursor-pointer flex flex-row items-center gap-[5px]"
                    >
                        <MdDelete />Delete
                    </button>
                </div>
            ),
            enableSorting: false,
        },
    ], []);

    // Action handlers
    const handleDelete = async (id) => {
        showModal({
            type: 'delete',
            title: 'Are you sure you want to delete this?',
            content: 'Once you are delete this item you can\'t undo this process.',
            buttons: [
                {
                    label: 'Confirm',
                    onClick: async () => {
                        try {
                            const response = await axios.delete(`${API_BASE_URL}/rfid/${id}`, {
                                headers: {
                                    "Authorization": `Bearer ${token}`
                                },
                            });
                            if (response.data.success) {
                                fetchData();
                            } else {
                                console.error('Failed to delete');
                            }
                        } catch (error) {
                            console.error('Error deleting RFID:', error);
                        }
                        closeModal();
                    },
                    className: 'w-full px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700'
                }, {
                    label: 'Cancel',
                    onClick: closeModal,
                    className: 'w-full px-4 py-2 text-white bg-gray-500 border border-gray-500 rounded hover:bg-gray-600'
                }
            ]
        });
    };

    const handleUpdate = (id) => {
        // Navigate to the update page with the RFID ID
        navigate(`/update-rfid/${id}`);
    };

    // Create table instance
    const table = useReactTable({
        data: filteredData,
        columns,
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    return (
        <div className="flex h-screen bg-[#eee]">
            <Sidebar />
            <div className="flex-1 ml-64 overflow-y-auto h-screen p-8">
                <div className="bg-white w-full p-10 rounded-lg shadow-xl relative">
                    <div className="p-6 mx-auto">
                        {/* Header and Search */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">RFID Management</h2>
                            <div className="flex items-center gap-4">

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
                                        value={countryFilter}
                                        onChange={e => setCountryFilter(e.target.value)}
                                        className="block appearance-none w-full h-[42px] bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-10 rounded-md leading-tight focus:outline-none "
                                    >
                                        <option value="">All Countries</option>
                                        {countries.map((country) => (
                                            <option key={country.value} value={country.value}>
                                                {country.label}
                                            </option>
                                        ))}
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
                                    onClick={generateExcelReport}
                                    className="px-4 py-2 bg-[#007a55] text-white rounded-md"
                                >
                                    Download
                                </button>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    {table.getHeaderGroups().map(headerGroup => (
                                        <tr key={headerGroup.id}>
                                            {headerGroup.headers.map(header => (
                                                <th
                                                    key={header.id}
                                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hover:bg-gray-100 transition-colors cursor-pointer"
                                                    onClick={header.column.getToggleSortingHandler()}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        {flexRender(
                                                            header.column.columnDef.header,
                                                            header.getContext()
                                                        )}
                                                        {header.column.getIsSorted() && (
                                                            <span className="text-blue-600">
                                                                {header.column.getIsSorted() === 'asc' ? '↑' : '↓'}
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
                                        <tr key={row.id} className="hover:bg-gray-50 transition-colors even:bg-gray-50">
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
                                    onChange={e => table.setPageSize(Number(e.target.value))}
                                    className="px-2 py-1 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                                >
                                    {[10, 20, 30, 40, 50].map(pageSize => (
                                        <option key={pageSize} value={pageSize}>
                                            {pageSize}
                                        </option>
                                    ))}
                                </select>
                                <span>entries</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => table.previousPage()}
                                    disabled={!table.getCanPreviousPage()}
                                    className="px-4 py-2 border rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Previous
                                </button>
                                <span className="px-4 py-2 text-sm text-gray-700">
                                    Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                                </span>
                                <button
                                    onClick={() => table.nextPage()}
                                    disabled={!table.getCanNextPage()}
                                    className="px-4 py-2 border rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

export default RfidList;