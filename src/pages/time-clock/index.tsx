import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import Topbar from '@/components/Topbar';
import { FaClock, FaMapMarkerAlt, FaUserCheck, FaUserTimes, FaCoffee, FaUtensils } from 'react-icons/fa';
import { BiSelectMultiple } from 'react-icons/bi';
import { supabase } from '@/supabase';

const TimeClock: React.FC = () => {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [recordMethod, setRecordMethod] = useState('PCブラウザ');
  const [location, setLocation] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleTimeRecord = async (recordType: string) => {
    try {
      const { data, error } = await supabase
        .from('time_records')
        .insert({
          employee_id: 'サンプル従業員ID', // 実際の実装ではログインユーザーのIDを使用
          record_type: recordType,
          record_time: new Date().toISOString(),
          location_id: location,
          record_method: recordMethod
        });

      if (error) throw error;
      setMessage(`${recordType}を記録しました。`);
    } catch (error) {
      console.error('打刻エラー:', error);
      setMessage('打刻に失敗しました。もう一度お試しください。');
    }
  };

  return (
    <div className="min-h-screen h-full bg-gray-100">
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center text-blue-600">勤怠打刻</h1>
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
          <div className="text-4xl font-bold text-center mb-4 text-gray-800">
            {currentTime.toLocaleTimeString()}
          </div>
          <div className="flex justify-center space-x-4 mb-8">
            <button onClick={() => handleTimeRecord('出勤')} className="flex items-center px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-300">
              <FaUserCheck className="mr-2" />
              出勤
            </button>
            <button onClick={() => handleTimeRecord('退勤')} className="flex items-center px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300">
              <FaUserTimes className="mr-2" />
              退勤
            </button>
            <button onClick={() => handleTimeRecord('休憩開始')} className="flex items-center px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition duration-300">
              <FaCoffee className="mr-2" />
              休憩開始
            </button>
            <button onClick={() => handleTimeRecord('休憩終了')} className="flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300">
              <FaUtensils className="mr-2" />
              休憩終了
            </button>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="recordMethod">
              打刻方法
            </label>
            <div className="relative">
              <select
                id="recordMethod"
                value={recordMethod}
                onChange={(e) => setRecordMethod(e.target.value)}
                className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
              >
                <option>PCブラウザ</option>
                <option>スマホアプリ</option>
                <option>ICカード</option>
                <option>QRコード</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <BiSelectMultiple className="fill-current h-4 w-4" />
              </div>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="location">
              勤務場所
            </label>
            <div className="relative">
              <select
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
              >
                <option value="">選択してください</option>
                <option value="本社">本社</option>
                <option value="支社A">支社A</option>
                <option value="支社B">支社B</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <FaMapMarkerAlt className="fill-current h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
        {message && (
          <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-8" role="alert">
            <p>{message}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeClock;