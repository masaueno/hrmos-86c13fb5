import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaCalendarAlt, FaUserFriends, FaCheck, FaEdit } from 'react-icons/fa';
import { createClient } from '@supabase/supabase-js';
import Topbar from '@/components/Topbar';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const ShiftAdjustmentPage = () => {
  const router = useRouter();
  const [employees, setEmployees] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    fetchEmployees();
    fetchShifts();
  }, []);

  const fetchEmployees = async () => {
    const { data, error } = await supabase.from('employees').select('*');
    if (error) {
      console.error('従業員データの取得に失敗しました:', error);
    } else {
      setEmployees(data);
    }
  };

  const fetchShifts = async () => {
    const { data, error } = await supabase.from('shifts').select('*');
    if (error) {
      console.error('シフトデータの取得に失敗しました:', error);
    } else {
      setShifts(data);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleDragStart = (e, shiftId) => {
    e.dataTransfer.setData('text/plain', shiftId);
  };

  const handleDrop = async (e, employeeId, date) => {
    e.preventDefault();
    const shiftId = e.dataTransfer.getData('text');
    
    // ここでシフトの更新処理を実装
    const { data, error } = await supabase
      .from('shifts')
      .update({ employee_id: employeeId, start_time: date })
      .eq('id', shiftId);

    if (error) {
      console.error('シフトの更新に失敗しました:', error);
    } else {
      fetchShifts(); // シフトを再取得して表示を更新
    }
  };

  const handleBulkApprove = async () => {
    // 一括承認の処理を実装
    const { data, error } = await supabase
      .from('shifts')
      .update({ is_confirmed: true })
      .eq('is_confirmed', false);

    if (error) {
      console.error('一括承認に失敗しました:', error);
    } else {
      fetchShifts(); // シフトを再取得して表示を更新
    }
  };

  return (
    <div className="min-h-screen h-full bg-gray-100">
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">シフト調整画面</h1>
        <div className="flex mb-6">
          <div className="w-1/4 pr-4">
            <h2 className="text-xl font-semibold mb-4">従業員一覧</h2>
            <ul className="bg-white rounded-lg shadow">
              {employees.map((employee) => (
                <li key={employee.id} className="p-3 border-b last:border-b-0">
                  {employee.last_name} {employee.first_name}
                </li>
              ))}
            </ul>
          </div>
          <div className="w-3/4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">カレンダー</h2>
              <div>
                <button
                  onClick={handleBulkApprove}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded mr-2"
                >
                  <FaCheck className="inline-block mr-2" />
                  一括承認
                </button>
                <Link href="/shift-edit" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                  <FaEdit className="inline-block mr-2" />
                  個別調整
                </Link>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              {/* カレンダーコンポーネントをここに実装 */}
              <div className="grid grid-cols-7 gap-2">
                {[...Array(7)].map((_, index) => (
                  <div
                    key={index}
                    className="border p-2 h-32"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(e, null, new Date(selectedDate.getTime() + index * 24 * 60 * 60 * 1000))}
                  >
                    {new Date(selectedDate.getTime() + index * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    {shifts
                      .filter(
                        (shift) =>
                          new Date(shift.start_time).toDateString() ===
                          new Date(selectedDate.getTime() + index * 24 * 60 * 60 * 1000).toDateString()
                      )
                      .map((shift) => (
                        <div
                          key={shift.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, shift.id)}
                          className="bg-blue-100 p-1 my-1 rounded text-sm"
                        >
                          {employees.find((emp) => emp.id === shift.employee_id)?.last_name}
                        </div>
                      ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShiftAdjustmentPage;