import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { FaCalendarAlt, FaClock, FaExclamationTriangle, FaUserClock } from 'react-icons/fa';
import Topbar from '@/components/Topbar';

const EmployeeAttendanceDetail = () => {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [employee, setEmployee] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [totalWorkHours, setTotalWorkHours] = useState(0);
  const [overtimeHours, setOvertimeHours] = useState(0);
  const [leaveRequests, setLeaveRequests] = useState([]);

  useEffect(() => {
    fetchEmployeeData();
    fetchAttendanceData();
  }, [selectedPeriod]);

  const fetchEmployeeData = async () => {
    // 従業員データの取得（サンプルデータ）
    setEmployee({
      id: '1',
      employee_number: 'EMP001',
      last_name: '山田',
      first_name: '太郎',
      email: 'yamada@example.com',
      department: '営業部',
      position: '主任'
    });
  };

  const fetchAttendanceData = async () => {
    // 勤怠データの取得（サンプルデータ）
    setAttendanceRecords([
      { date: '2023-06-01', start_time: '09:00', end_time: '18:00', work_hours: 8 },
      { date: '2023-06-02', start_time: '08:30', end_time: '19:30', work_hours: 10 },
      { date: '2023-06-03', start_time: '09:15', end_time: '18:15', work_hours: 8 },
    ]);
    setTotalWorkHours(26);
    setOvertimeHours(2);
    setLeaveRequests([
      { date: '2023-06-05', type: '有給休暇', status: '承認済み' },
      { date: '2023-06-10', type: '半日休暇', status: '申請中' },
    ]);
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };

  return (
    <div className="min-h-screen h-full bg-gray-100">
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">従業員別勤怠詳細</h1>
        {employee && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">従業員情報</h2>
            <div className="grid grid-cols-2 gap-4">
              <p><span className="font-semibold">社員番号:</span> {employee.employee_number}</p>
              <p><span className="font-semibold">氏名:</span> {employee.last_name} {employee.first_name}</p>
              <p><span className="font-semibold">メールアドレス:</span> {employee.email}</p>
              <p><span className="font-semibold">部署:</span> {employee.department}</p>
              <p><span className="font-semibold">役職:</span> {employee.position}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">期間選択</h2>
          <div className="flex space-x-4">
            <button
              onClick={() => handlePeriodChange('today')}
              className={`px-4 py-2 rounded ${selectedPeriod === 'today' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              今日
            </button>
            <button
              onClick={() => handlePeriodChange('week')}
              className={`px-4 py-2 rounded ${selectedPeriod === 'week' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              今週
            </button>
            <button
              onClick={() => handlePeriodChange('month')}
              className={`px-4 py-2 rounded ${selectedPeriod === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              今月
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">勤怠記録一覧</h2>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">日付</th>
                <th className="p-2 text-left">出勤時間</th>
                <th className="p-2 text-left">退勤時間</th>
                <th className="p-2 text-left">勤務時間</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRecords.map((record, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                  <td className="p-2">{record.date}</td>
                  <td className="p-2">{record.start_time}</td>
                  <td className="p-2">{record.end_time}</td>
                  <td className="p-2">{record.work_hours}時間</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">勤務時間集計</h2>
            <div className="flex items-center mb-4">
              <FaClock className="text-blue-500 mr-2" size={24} />
              <p className="text-xl">総勤務時間: {totalWorkHours}時間</p>
            </div>
            <div className="flex items-center">
              <FaExclamationTriangle className="text-orange-500 mr-2" size={24} />
              <p className="text-xl">残業時間: {overtimeHours}時間</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">休暇取得状況</h2>
            {leaveRequests.map((leave, index) => (
              <div key={index} className="flex items-center mb-2">
                <FaCalendarAlt className="text-green-500 mr-2" size={18} />
                <p>{leave.date}: {leave.type} ({leave.status})</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Link href="/attendance-modification">
            <button className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-300">
              勤怠修正
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EmployeeAttendanceDetail;