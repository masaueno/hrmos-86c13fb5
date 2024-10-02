import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUser } from 'react-icons/fa';
import { createClient } from '@supabase/supabase-js';
import Topbar from '@/components/Topbar';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const ShiftRegistration = () => {
  const router = useRouter();
  const [employees, setEmployees] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [shiftPattern, setShiftPattern] = useState('');

  useEffect(() => {
    fetchEmployees();
    fetchLocations();
  }, []);

  const fetchEmployees = async () => {
    const { data, error } = await supabase.from('employees').select('id, first_name, last_name');
    if (error) {
      console.error('Error fetching employees:', error);
    } else {
      setEmployees(data);
    }
  };

  const fetchLocations = async () => {
    const { data, error } = await supabase.from('locations').select('id, name');
    if (error) {
      console.error('Error fetching locations:', error);
    } else {
      setLocations(data);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const shiftData = {
      employee_id: selectedEmployee,
      start_time: `${date}T${startTime}:00`,
      end_time: `${date}T${endTime}:00`,
      location_id: selectedLocation,
      is_confirmed: false,
    };

    const { data, error } = await supabase.from('shifts').insert([shiftData]);

    if (error) {
      console.error('Error registering shift:', error);
      alert('シフトの登録に失敗しました。');
    } else {
      alert('シフトが正常に登録されました。');
      router.push('/shift-management');
    }
  };

  return (
    <div className="min-h-screen h-full bg-gray-100">
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">シフト登録</h1>
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="employee">
              <FaUser className="inline-block mr-2" />
              従業員
            </label>
            <select
              id="employee"
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            >
              <option value="">従業員を選択してください</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {`${employee.last_name} ${employee.first_name}`}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date">
              <FaCalendarAlt className="inline-block mr-2" />
              日付
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="flex mb-4">
            <div className="w-1/2 mr-2">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="startTime">
                <FaClock className="inline-block mr-2" />
                開始時間
              </label>
              <input
                type="time"
                id="startTime"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div className="w-1/2 ml-2">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="endTime">
                <FaClock className="inline-block mr-2" />
                終了時間
              </label>
              <input
                type="time"
                id="endTime"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="location">
              <FaMapMarkerAlt className="inline-block mr-2" />
              勤務場所
            </label>
            <select
              id="location"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            >
              <option value="">勤務場所を選択してください</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="shiftPattern">
              シフトパターン
            </label>
            <input
              type="text"
              id="shiftPattern"
              value={shiftPattern}
              onChange={(e) => setShiftPattern(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="例：早番、遅番など（任意）"
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              登録
            </button>
            <Link href="/shift-management">
              <span className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800">
                キャンセル
              </span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShiftRegistration;