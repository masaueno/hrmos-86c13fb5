import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaFileExport, FaCalendarAlt, FaUserFriends, FaListUl, FaFileAlt } from 'react-icons/fa';
import { createClient } from '@supabase/supabase-js';
import Topbar from '@/components/Topbar';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const DataExport: React.FC = () => {
  const router = useRouter();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [fileFormat, setFileFormat] = useState('csv');
  const [employees, setEmployees] = useState<any[]>([]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    const { data, error } = await supabase.from('employees').select('id, last_name, first_name');
    if (error) {
      console.error('従業員データの取得に失敗しました:', error);
    } else {
      setEmployees(data || []);
    }
  };

  const handleEmployeeSelection = (employeeId: string) => {
    setSelectedEmployees(prev =>
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleItemSelection = (item: string) => {
    setSelectedItems(prev =>
      prev.includes(item)
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/export-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate,
          endDate,
          selectedEmployees,
          selectedItems,
          fileFormat,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `勤怠データ_${startDate}_${endDate}.${fileFormat}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        console.error('データのエクスポートに失敗しました');
      }
    } catch (error) {
      console.error('エクスポート中にエラーが発生しました:', error);
    }
  };

  return (
    <div className="min-h-screen h-full bg-gray-100">
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">データ出力</h1>

        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FaCalendarAlt className="mr-2 text-blue-500" />
              期間選択
            </h2>
            <div className="flex space-x-4">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border rounded-md p-2 flex-1"
              />
              <span className="text-gray-500 self-center">から</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border rounded-md p-2 flex-1"
              />
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FaUserFriends className="mr-2 text-blue-500" />
              従業員選択
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {employees.map((employee) => (
                <label key={employee.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedEmployees.includes(employee.id)}
                    onChange={() => handleEmployeeSelection(employee.id)}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                  <span>{`${employee.last_name} ${employee.first_name}`}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FaListUl className="mr-2 text-blue-500" />
              出力項目選択
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {['勤務時間', '休憩時間', '残業時間', '有給休暇', '欠勤'].map((item) => (
                <label key={item} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item)}
                    onChange={() => handleItemSelection(item)}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FaFileAlt className="mr-2 text-blue-500" />
              ファイル形式選択
            </h2>
            <select
              value={fileFormat}
              onChange={(e) => setFileFormat(e.target.value)}
              className="border rounded-md p-2 w-full"
            >
              <option value="csv">CSV</option>
              <option value="xlsx">Excel</option>
              <option value="pdf">PDF</option>
            </select>
          </div>

          <button
            onClick={handleExport}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center w-full"
          >
            <FaFileExport className="mr-2" />
            出力
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataExport;