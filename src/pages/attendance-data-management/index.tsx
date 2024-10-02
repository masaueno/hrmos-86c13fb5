import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/supabase';
import Topbar from '@/components/Topbar';
import { FaCalendarAlt, FaUserFriends, FaChartBar, FaFileExport, FaFileAlt } from 'react-icons/fa';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const AttendanceDataManagement = () => {
  const router = useRouter();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [attendanceData, setAttendanceData] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    const { data, error } = await supabase.from('employees').select('id, first_name, last_name');
    if (error) {
      console.error('従業員データの取得に失敗しました:', error);
    } else {
      setEmployees(data);
    }
  };

  const handleDateChange = (e, type) => {
    if (type === 'start') {
      setStartDate(e.target.value);
    } else {
      setEndDate(e.target.value);
    }
  };

  const handleEmployeeSelect = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedEmployees(selectedOptions);
  };

  const fetchAttendanceData = async () => {
    if (!startDate || !endDate || selectedEmployees.length === 0) {
      alert('期間と従業員を選択してください。');
      return;
    }

    // 実際のデータ取得の代わりにサンプルデータを生成
    const sampleData = {
      workingHours: Array.from({ length: 7 }, () => Math.floor(Math.random() * 5) + 5),
      overtimeHours: Array.from({ length: 7 }, () => Math.floor(Math.random() * 3)),
      leavesTaken: Math.floor(Math.random() * 3),
    };

    setAttendanceData(sampleData);
  };

  const chartData = {
    labels: ['月', '火', '水', '木', '金', '土', '日'],
    datasets: [
      {
        label: '勤務時間',
        data: attendanceData?.workingHours || [],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
      {
        label: '残業時間',
        data: attendanceData?.overtimeHours || [],
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="min-h-screen h-full bg-gray-100">
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">勤怠データ管理画面</h1>
        
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaCalendarAlt className="inline mr-2" />
                開始日
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleDateChange(e, 'start')}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaCalendarAlt className="inline mr-2" />
                終了日
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => handleDateChange(e, 'end')}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaUserFriends className="inline mr-2" />
                従業員選択
              </label>
              <select
                multiple
                value={selectedEmployees}
                onChange={handleEmployeeSelect}
                className="w-full p-2 border rounded-md"
              >
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.last_name} {employee.first_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={fetchAttendanceData}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            データ表示
          </button>
        </div>

        {attendanceData && (
          <div className="bg-white shadow-md rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">勤怠データ</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">勤務時間</h3>
                <p>{attendanceData.workingHours.reduce((a, b) => a + b, 0)} 時間</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">残業時間</h3>
                <p>{attendanceData.overtimeHours.reduce((a, b) => a + b, 0)} 時間</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">休暇取得日数</h3>
                <p>{attendanceData.leavesTaken} 日</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">
                <FaChartBar className="inline mr-2" />
                勤務時間・残業時間グラフ
              </h3>
              <Line data={chartData} />
            </div>

            <div className="flex justify-end space-x-4">
              <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded flex items-center">
                <FaFileExport className="mr-2" />
                データ出力
              </button>
              <button className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded flex items-center">
                <FaFileAlt className="mr-2" />
                レポート作成
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceDataManagement;