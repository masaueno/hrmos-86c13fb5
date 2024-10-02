import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabase } from '@/supabase';
import Topbar from '@/components/Topbar';
import { FaCalendarAlt, FaClipboardList, FaPlusCircle, FaUserClock } from 'react-icons/fa';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const ShiftManagement = () => {
  const router = useRouter();
  const [shifts, setShifts] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    fetchShifts();
  }, [selectedDate]);

  const fetchShifts = async () => {
    const { data, error } = await supabase
      .from('shifts')
      .select('*, employees(first_name, last_name)')
      .gte('start_time', selectedDate.toISOString().split('T')[0])
      .lte('start_time', new Date(selectedDate.getTime() + 86400000).toISOString().split('T')[0]);

    if (error) {
      console.error('シフトの取得に失敗しました:', error);
    } else {
      setShifts(data);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  return (
    <div className="min-h-screen h-full bg-gray-100">
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">シフト管理</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FaCalendarAlt className="mr-2 text-blue-500" />
              カレンダー
            </h2>
            <Calendar
              onChange={handleDateChange}
              value={selectedDate}
              className="w-full"
            />
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 md:col-span-2">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FaClipboardList className="mr-2 text-green-500" />
              シフト一覧
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="px-4 py-2">従業員名</th>
                    <th className="px-4 py-2">開始時間</th>
                    <th className="px-4 py-2">終了時間</th>
                    <th className="px-4 py-2">確定状況</th>
                  </tr>
                </thead>
                <tbody>
                  {shifts.map((shift) => (
                    <tr key={shift.id} className="border-b">
                      <td className="px-4 py-2">{`${shift.employees.last_name} ${shift.employees.first_name}`}</td>
                      <td className="px-4 py-2">{new Date(shift.start_time).toLocaleTimeString()}</td>
                      <td className="px-4 py-2">{new Date(shift.end_time).toLocaleTimeString()}</td>
                      <td className="px-4 py-2">{shift.is_confirmed ? '確定' : '未確定'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="mt-8 flex justify-center space-x-4">
          <Link href="/shift-registration">
            <a className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded flex items-center">
              <FaPlusCircle className="mr-2" />
              シフト登録
            </a>
          </Link>
          <Link href="/shift-request">
            <a className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded flex items-center">
              <FaUserClock className="mr-2" />
              希望シフト申請
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ShiftManagement;