import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaPrint, FaFileExport, FaFilter } from 'react-icons/fa';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { supabase } from '@/supabase';
import Topbar from '@/components/Topbar';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const ReportDisplay = () => {
  const router = useRouter();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [employees, setEmployees] = useState([]);
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    fetchEmployees();
    fetchReportData();
  }, []);

  const fetchEmployees = async () => {
    const { data, error } = await supabase.from('employees').select('id, last_name, first_name');
    if (error) {
      console.error('従業員データの取得に失敗しました:', error);
    } else {
      setEmployees(data);
    }
  };

  const fetchReportData = async () => {
    // 実際のデータ取得処理をここに実装
    // サンプルデータを使用
    const sampleData = {
      labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
      datasets: [
        {
          label: '労働時間',
          data: [160, 165, 170, 168, 172, 175],
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
        },
      ],
    };
    setReportData(sampleData);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    // エクスポート処理をここに実装
    alert('データがエクスポートされました');
  };

  const handleFilter = () => {
    // フィルター処理をここに実装
    fetchReportData();
  };

  return (
    <div className="min-h-screen h-full bg-gray-100">
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">レポート表示</h1>
        
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <div className="flex flex-wrap -mx-2 mb-4">
            <div className="w-full md:w-1/4 px-2 mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="startDate">
                開始日
              </label>
              <input
                type="date"
                id="startDate"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="w-full md:w-1/4 px-2 mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="endDate">
                終了日
              </label>
              <input
                type="date"
                id="endDate"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="w-full md:w-1/4 px-2 mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="employee">
                従業員
              </label>
              <select
                id="employee"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
              >
                <option value="">全従業員</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {`${employee.last_name} ${employee.first_name}`}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full md:w-1/4 px-2 mb-4 flex items-end">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                onClick={handleFilter}
              >
                <FaFilter className="inline-block mr-2" />
                フィルター
              </button>
            </div>
          </div>
        </div>

        {reportData && (
          <div className="bg-white shadow-md rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">労働時間グラフ</h2>
            <Line data={reportData} />
          </div>
        )}

        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">勤怠データ表</h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">日付</th>
                <th className="border p-2">従業員名</th>
                <th className="border p-2">出勤時間</th>
                <th className="border p-2">退勤時間</th>
                <th className="border p-2">労働時間</th>
              </tr>
            </thead>
            <tbody>
              {/* サンプルデータ */}
              <tr>
                <td className="border p-2">2023-05-01</td>
                <td className="border p-2">山田 太郎</td>
                <td className="border p-2">09:00</td>
                <td className="border p-2">18:00</td>
                <td className="border p-2">8時間</td>
              </tr>
              <tr>
                <td className="border p-2">2023-05-02</td>
                <td className="border p-2">佐藤 花子</td>
                <td className="border p-2">08:30</td>
                <td className="border p-2">17:30</td>
                <td className="border p-2">8時間</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={handlePrint}
          >
            <FaPrint className="inline-block mr-2" />
            印刷
          </button>
          <button
            className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={handleExport}
          >
            <FaFileExport className="inline-block mr-2" />
            エクスポート
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportDisplay;