import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FiBell, FiMail, FiSettings } from 'react-icons/fi';
import { createClient } from '@supabase/supabase-js';
import Topbar from '@/components/Topbar';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const AlertSettings = () => {
  const router = useRouter();
  const [alertType, setAlertType] = useState('');
  const [targetAttendance, setTargetAttendance] = useState('');
  const [targetPeriod, setTargetPeriod] = useState('');
  const [threshold, setThreshold] = useState('');
  const [notificationMethod, setNotificationMethod] = useState('');

  const handleSave = async () => {
    try {
      const { data, error } = await supabase
        .from('alert_settings')
        .insert({
          alert_type: alertType,
          target_attendance: targetAttendance,
          target_period: targetPeriod,
          threshold: threshold,
          notification_method: notificationMethod,
        });

      if (error) throw error;
      alert('アラート設定が保存されました。');
    } catch (error) {
      console.error('Error saving alert settings:', error);
      alert('アラート設定の保存に失敗しました。');
    }
  };

  return (
    <div className="min-h-screen h-full bg-gray-100">
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">アラート設定</h1>
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="alertType">
              アラート種類
            </label>
            <select
              id="alertType"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={alertType}
              onChange={(e) => setAlertType(e.target.value)}
            >
              <option value="">選択してください</option>
              <option value="overtime">残業アラート</option>
              <option value="absence">欠勤アラート</option>
              <option value="late">遅刻アラート</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="targetAttendance">
              対象勤怠
            </label>
            <input
              id="targetAttendance"
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={targetAttendance}
              onChange={(e) => setTargetAttendance(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="targetPeriod">
              対象期間
            </label>
            <input
              id="targetPeriod"
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={targetPeriod}
              onChange={(e) => setTargetPeriod(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="threshold">
              基準値
            </label>
            <input
              id="threshold"
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="notificationMethod">
              通知方法
            </label>
            <select
              id="notificationMethod"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={notificationMethod}
              onChange={(e) => setNotificationMethod(e.target.value)}
            >
              <option value="">選択してください</option>
              <option value="email">メール</option>
              <option value="system">システム通知</option>
              <option value="both">両方</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={handleSave}
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertSettings;