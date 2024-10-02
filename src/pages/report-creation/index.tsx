import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaCalendarAlt, FaUsers, FaChartBar } from 'react-icons/fa';
import { supabase } from '@/supabase';
import Topbar from '@/components/Topbar';

const ReportCreation = () => {
  const router = useRouter();
  const [reportType, setReportType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [chartType, setChartType] = useState('');
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name')
        .order('last_name', { ascending: true });

      if (error) throw error;
      setEmployees(data);
    } catch (error) {
      console.error('従業員データの取得に失敗しました:', error.message);
      // サンプルデータを表示
      setEmployees([
        { id: 1, first_name: '太郎', last_name: '山田' },
        { id: 2, first_name: '花子', last_name: '鈴木' },
      ]);
    }
  };

  const handleEmployeeSelect = (employeeId) => {
    setSelectedEmployees(prev =>
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.rpc('generate_report', {
        report_type: reportType,
        start_date: startDate,
        end_date: endDate,
        employee_ids: selectedEmployees,
        chart_type: chartType
      });

      if (error) throw error;
      
      // レポート生成成功時の処理
      alert('レポートが正常に生成されました。');
      // レポート表示画面へ遷移
      router.push('/report-display');
    } catch (error) {
      console.error('レポート生成に失敗しました:', error.message);
      alert('レポート生成に失敗しました。もう一度お試しください。');
    }
  };

  return (
    <div className="min-h-screen h-full bg-gray-100">
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">レポート作成</h1>
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="reportType">
              レポート種類
            </label>
            <select
              id="reportType"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            >
              <option value="">選択してください</option>
              <option value="daily">日次</option>
              <option value="monthly">月次</option>
              <option value="overtime">残業</option>
              <option value="paid_leave">有給休暇</option>
              <option value="36_agreement">36協定</option>
            </select>
          </div>

          <div className="mb-6 flex space-x-4">
            <div className="w-1/2">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="startDate">
                開始日
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div className="w-1/2">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="endDate">
                終了日
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              従業員選択
            </label>
            <div className="max-h-48 overflow-y-auto border rounded p-2">
              {employees.map((employee) => (
                <div key={employee.id} className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id={`employee-${employee.id}`}
                    checked={selectedEmployees.includes(employee.id)}
                    onChange={() => handleEmployeeSelect(employee.id)}
                    className="mr-2"
                  />
                  <label htmlFor={`employee-${employee.id}`}>
                    {employee.last_name} {employee.first_name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="chartType">
              グラフ種類
            </label>
            <select
              id="chartType"
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">選択してください</option>
              <option value="bar">棒グラフ</option>
              <option value="line">折れ線グラフ</option>
              <option value="pie">円グラフ</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              レポート作成
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportCreation;