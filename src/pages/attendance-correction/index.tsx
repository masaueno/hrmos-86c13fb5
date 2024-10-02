import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import Topbar from '@/components/Topbar';
import { FiCalendar, FiSave } from 'react-icons/fi';
import { supabase } from '@/supabase';

const AttendanceCorrection = () => {
  const router = useRouter();
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [attendanceData, setAttendanceData] = useState({
    clockIn: '',
    clockOut: '',
    breakTime: '',
  });
  const [correction, setCorrection] = useState({
    clockIn: '',
    clockOut: '',
    breakTime: '',
  });
  const [reason, setReason] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    const { data, error } = await supabase.from('employees').select('id, last_name, first_name');
    if (error) {
      console.error('従業員データの取得に失敗しました:', error);
    } else {
      setEmployees(data);
    }
  };

  const fetchAttendanceData = async () => {
    if (!selectedEmployee || !selectedDate) return;

    const { data, error } = await supabase
      .from('time_records')
      .select('*')
      .eq('employee_id', selectedEmployee)
      .eq('record_time::date', selectedDate)
      .order('record_time', { ascending: true });

    if (error) {
      console.error('勤怠データの取得に失敗しました:', error);
    } else if (data && data.length > 0) {
      const clockIn = data.find(record => record.record_type === '出勤');
      const clockOut = data.find(record => record.record_type === '退勤');
      const breakStart = data.find(record => record.record_type === '休憩開始');
      const breakEnd = data.find(record => record.record_type === '休憩終了');

      setAttendanceData({
        clockIn: clockIn ? clockIn.record_time : '',
        clockOut: clockOut ? clockOut.record_time : '',
        breakTime: breakStart && breakEnd ? 
          (new Date(breakEnd.record_time) - new Date(breakStart.record_time)) / (1000 * 60) : 0,
      });
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, [selectedEmployee, selectedDate]);

  const handleSave = async () => {
    if (!selectedEmployee || !selectedDate || !reason) {
      alert('全ての項目を入力してください。');
      return;
    }

    const { data, error } = await supabase
      .from('attendance_corrections')
      .insert({
        employee_id: selectedEmployee,
        correction_date: selectedDate,
        original_clock_in: attendanceData.clockIn,
        original_clock_out: attendanceData.clockOut,
        original_break_time: attendanceData.breakTime,
        corrected_clock_in: correction.clockIn || attendanceData.clockIn,
        corrected_clock_out: correction.clockOut || attendanceData.clockOut,
        corrected_break_time: correction.breakTime || attendanceData.breakTime,
        reason: reason,
      });

    if (error) {
      console.error('勤怠修正の保存に失敗しました:', error);
      alert('勤怠修正の保存に失敗しました。');
    } else {
      alert('勤怠修正が正常に保存されました。');
      router.push('/attendance-management');
    }
  };

  return (
    <div className="min-h-screen h-full bg-gray-100">
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">勤怠修正</h1>
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">従業員選択</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
              >
                <option value="">従業員を選択してください</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.last_name} {employee.first_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">日付選択</label>
              <div className="relative">
                <input
                  type="date"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
                <FiCalendar className="absolute right-3 top-3 text-gray-400" />
              </div>
            </div>
          </div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">現在の勤怠データ</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">出勤時間</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
                  value={attendanceData.clockIn}
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">退勤時間</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
                  value={attendanceData.clockOut}
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">休憩時間（分）</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
                  value={attendanceData.breakTime}
                  readOnly
                />
              </div>
            </div>
          </div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">修正入力</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">出勤時間</label>
                <input
                  type="time"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={correction.clockIn}
                  onChange={(e) => setCorrection({ ...correction, clockIn: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">退勤時間</label>
                <input
                  type="time"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={correction.clockOut}
                  onChange={(e) => setCorrection({ ...correction, clockOut: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">休憩時間（分）</label>
                <input
                  type="number"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={correction.breakTime}
                  onChange={(e) => setCorrection({ ...correction, breakTime: e.target.value })}
                />
              </div>
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">修正理由</label>
            <textarea
              className="w-full p-2 border border-gray-300 rounded-md"
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="修正理由を入力してください"
            ></textarea>
          </div>
          <div className="flex justify-end">
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md flex items-center"
              onClick={handleSave}
            >
              <FiSave className="mr-2" />
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceCorrection;