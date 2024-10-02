import React, { useState } from 'react';
import Link from 'next/link';
import { FaHome, FaClock, FaCalendarAlt, FaChartBar, FaCog, FaUserCircle } from 'react-icons/fa';
import { HiMenu } from 'react-icons/hi';

const Topbar: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <nav className="bg-blue-600 text-white p-4">
            <div className="container mx-auto flex justify-between items-center">
                <Link href="/" className="text-xl font-bold">
                    勤怠管理システム
                </Link>

                <div className="hidden md:flex space-x-4">
                    <Link href="/" className="hover:text-blue-200 transition duration-300">
                        <FaHome className="inline mr-1" />
                        ホーム
                    </Link>
                    <Link href="/time-clock" className="hover:text-blue-200 transition duration-300">
                        <FaClock className="inline mr-1" />
                        打刻
                    </Link>
                    <Link href="/shift-management" className="hover:text-blue-200 transition duration-300">
                        <FaCalendarAlt className="inline mr-1" />
                        シフト
                    </Link>
                    <Link href="/attendance-data-management" className="hover:text-blue-200 transition duration-300">
                        <FaChartBar className="inline mr-1" />
                        勤怠データ
                    </Link>
                    <Link href="/settings" className="hover:text-blue-200 transition duration-300">
                        <FaCog className="inline mr-1" />
                        設定
                    </Link>
                </div>

                <div className="flex items-center">
                    <Link href="/login" className="hover:text-blue-200 transition duration-300">
                        <FaUserCircle className="inline mr-1" />
                        ログイン
                    </Link>
                    <button onClick={toggleMenu} className="ml-4 md:hidden">
                        <HiMenu className="text-2xl" />
                    </button>
                </div>
            </div>

            {isMenuOpen && (
                <div className="md:hidden mt-4">
                    <Link href="/" className="block py-2 hover:bg-blue-700">
                        <FaHome className="inline mr-2" />
                        ホーム
                    </Link>
                    <Link href="/time-clock" className="block py-2 hover:bg-blue-700">
                        <FaClock className="inline mr-2" />
                        打刻
                    </Link>
                    <Link href="/shift-management" className="block py-2 hover:bg-blue-700">
                        <FaCalendarAlt className="inline mr-2" />
                        シフト
                    </Link>
                    <Link href="/attendance-data-management" className="block py-2 hover:bg-blue-700">
                        <FaChartBar className="inline mr-2" />
                        勤怠データ
                    </Link>
                    <Link href="/settings" className="block py-2 hover:bg-blue-700">
                        <FaCog className="inline mr-2" />
                        設定
                    </Link>
                </div>
            )}
        </nav>
    );
};

export default Topbar;