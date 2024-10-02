import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { FiFilter, FiRefreshCw } from 'react-icons/fi';
import Topbar from '@/components/Topbar';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const AttendanceStatus = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [filter, setFilter] = useState('all');
  const router = useRouter();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    const { data, error } = await supabase
      .from('employees')
      .select(`
        id,
        employee_number,
        last_name,
        first_name,
        time_records (
          record_type,
          record_time
        )
      `)
      .order('last_name', { ascending: true });

    if (error) {
      console.error('Error fetching employees:', error);
      return;
    }

    const employeesWithStatus = data.map(employee => ({
      ...employee,
      status: getEmployeeStatus(employee.time_records),
      workingHours: calculateWorkingHours(employee.time_records),
    }));

    setEmployees(employeesWithStatus);
    setFilteredEmployees(employeesWithStatus);
  };

  const getEmployeeStatus = (timeRecords) => {
    if (!timeRecords || timeRecords.length === 0) return '未出勤';
    const lastRecord = timeRecords[timeRecords.length - 1];
    switch (lastRecord.record_type) {
      case '出勤': return '出勤中';
      case '退勤': return '退勤';
      case '休憩開始': return '休憩中';
      case '休憩終了': return '出勤中';
      default: return '不明';
    }
  };

  const calculateWorkingHours = (timeRecords) => {
    if (!timeRecords || timeRecords.length === 0) return '0:00';
    const clockIn = timeRecords.find(record => record.record_type === '出勤');
    const clockOut = timeRecords.find(record => record.record_type === '退勤');
    if (!clockIn || !clockOut) return '計算中...';
    const diff = new Date(clockOut.record_time) - new Date(clockIn.record_time);
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  const handleFilter = (status) => {
    setFilter(status);
    if (status === 'all') {
      setFilteredEmployees(employees);
    } else {
      setFilteredEmployees(employees.filter(employee => employee.status === status));
    }
  };

  return (
    <div className="min-h-screen h-full bg-gray-100">
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">勤怠状況確認</h1>
        <div className="mb-6 flex justify-between items-center">
          <div className="flex space-x-2">
            <button
              onClick={() => handleFilter('all')}
              className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
            >
              全て
            </button>
            <button
              onClick={() => handleFilter('出勤中')}
              className={`px-4 py-2 rounded ${filter === '出勤中' ? 'bg-green-500 text-white' : 'bg-white text-gray-700'}`}
            >
              出勤中
            </button>
            <button
              onClick={() => handleFilter('退勤')}
              className={`px-4 py-2 rounded ${filter === '退勤' ? 'bg-red-500 text-white' : 'bg-white text-gray-700'}`}
            >
              退勤
            </button>
            <button
              onClick={() => handleFilter('休憩中')}
              className={`px-4 py-2 rounded ${filter === '休憩中' ? 'bg-yellow-500 text-white' : 'bg-white text-gray-700'}`}
            >
              休憩中
            </button>
          </div>
          <button
            onClick={fetchEmployees}
            className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            <FiRefreshCw className="mr-2" />
            更新
          </button>
        </div>
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-200 text-gray-700">
              <tr>
                <th className="px-6 py-3 text-left">社員番号</th>
                <th className="px-6 py-3 text-left">氏名</th>
                <th className="px-6 py-3 text-left">ステータス</th>
                <th className="px-6 py-3 text-left">勤務時間</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{employee.employee_number}</td>
                  <td className="px-6 py-4">{`${employee.last_name} ${employee.first_name}`}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium
                      ${employee.status === '出勤中' ? 'bg-green-200 text-green-800' :
                        employee.status === '退勤' ? 'bg-red-200 text-red-800' :
                          employee.status === '休憩中' ? 'bg-yellow-200 text-yellow-800' :
                            'bg-gray-200 text-gray-800'}`}>
                      {employee.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{employee.workingHours}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceStatus;