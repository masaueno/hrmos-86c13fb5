import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { FaCalendarAlt, FaUser, FaClock, FaFilter, FaBell } from 'react-icons/fa';
import Topbar from '@/components/Topbar';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const OvertimeStatus = () => {
  const router = useRouter();
  const [period, setPeriod] = useState('今月');
  const [selectedEmployee, setSelectedEmployee] = useState('全員');
  const [overtimeData, setOvertimeData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOvertimeData();
  }, [period, selectedEmployee]);

  const fetchOvertimeData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('time_records')
        .select('*, employees(first_name, last_name)')
        .eq(selectedEmployee !== '全員' ? 'employee_id' : 'id', selectedEmployee !== '全員' ? selectedEmployee : 'id')
        .gte('record_time', getPeriodStartDate())
        .lte('record_time', new Date().toISOString());

      if (error) throw error;

      const processedData = processOvertimeData(data);
      setOvertimeData(processedData);
    } catch (error) {
      console.error('残業データの取得に失敗しました:', error);
      setOvertimeData(getSampleOvertimeData());
    } finally {
      setLoading(false);
    }
  };

  const processOvertimeData = (data) => {
    // ここでデータを処理して残業時間を計算します
    // この実装は簡略化されています
    return data.map(record => ({
      ...record,
      overtimeHours: Math.random() * 5 // サンプルデータ: 0-5時間のランダムな残業時間
    }));
  };

  const getPeriodStartDate = () => {
    const now = new Date();
    switch (period) {
      case '今週':
        now.setDate(now.getDate() - now.getDay());
        break;
      case '今月':
        now.setDate(1);
        break;
      case '今年':
        now.setMonth(0, 1);
        break;
      default:
        break;
    }
    return now.toISOString();
  };

  const getSampleOvertimeData = () => {
    return [
      { id: 1, employees: { first_name: '太郎', last_name: '山田' }, overtimeHours: 2.5 },
      { id: 2, employees: { first_name: '花子', last_name: '鈴木' }, overtimeHours: 1.8 },
      { id: 3, employees: { first_name: '一郎', last_name: '佐藤' }, overtimeHours: 3.2 },
    ];
  };

  const getWarningLevel = (hours) => {
    if (hours > 4) return 'bg-red-200';
    if (hours > 2) return 'bg-yellow-200';
    return 'bg-green-200';
  };

  return (
    <div className="min-h-screen h-full bg-gray-100">
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">残業状況画面</h1>
        
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <div className="flex flex-wrap justify-between items-center mb-6">
            <div className="flex items-center mb-4 md:mb-0">
              <FaCalendarAlt className="mr-2 text-blue-500" />
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="border rounded px-2 py-1"
              >
                <option>今週</option>
                <option>今月</option>
                <option>今年</option>
              </select>
            </div>
            <div className="flex items-center mb-4 md:mb-0">
              <FaUser className="mr-2 text-blue-500" />
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="border rounded px-2 py-1"
              >
                <option value="全員">全従業員</option>
                {/* 実際の従業員リストをここに追加 */}
              </select>
            </div>
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
              <FaFilter className="inline-block mr-2" />
              フィルター
            </button>
          </div>

          {loading ? (
            <p className="text-center">データを読み込んでいます...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="px-4 py-2">従業員名</th>
                    <th className="px-4 py-2">残業時間</th>
                    <th className="px-4 py-2">状態</th>
                  </tr>
                </thead>
                <tbody>
                  {overtimeData.map((employee) => (
                    <tr key={employee.id} className={`${getWarningLevel(employee.overtimeHours)}`}>
                      <td className="border px-4 py-2">{`${employee.employees.last_name} ${employee.employees.first_name}`}</td>
                      <td className="border px-4 py-2">{`${employee.overtimeHours.toFixed(1)}時間`}</td>
                      <td className="border px-4 py-2">
                        {employee.overtimeHours > 4 ? '要注意' : employee.overtimeHours > 2 ? '注意' : '正常'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="text-center">
          <Link href="/alert-settings" className="inline-block bg-green-500 text-white px-6 py-3 rounded-full hover:bg-green-600 transition-colors">
            <FaBell className="inline-block mr-2" />
            アラート設定
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OvertimeStatus;