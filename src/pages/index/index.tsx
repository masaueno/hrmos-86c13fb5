import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabase } from '@/supabase';
import Topbar from '@/components/Topbar';
import { FaClock, FaCalendarAlt, FaClipboardList } from 'react-icons/fa';
import { IoMdNotifications } from 'react-icons/io';

const HomePage = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [todaySchedule, setTodaySchedule] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        fetchAttendanceSummary(user.id);
        fetchTodaySchedule(user.id);
      } else {
        router.push('/login');
      }
    };

    fetchUserData();
  }, []);

  const fetchAttendanceSummary = async (userId) => {
    // この部分は実際のデータ取得ロジックに置き換える必要があります
    const summary = {
      totalWorkHours: '7時間30分',
      overtimeHours: '1時間15分',
      remainingPaidLeave: '10日'
    };
    setAttendanceSummary(summary);
  };

  const fetchTodaySchedule = async (userId) => {
    // この部分は実際のデータ取得ロジックに置き換える必要があります
    const schedule = [
      { time: '10:00', event: '朝会' },
      { time: '14:00', event: 'プロジェクトミーティング' },
      { time: '16:30', event: '顧客面談' }
    ];
    setTodaySchedule(schedule);
  };

  return (
    <div className="min-h-screen h-full bg-gray-100">
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap -mx-4">
          <div className="w-full lg:w-3/4 px-4 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4">勤怠状況サマリー</h2>
              {attendanceSummary && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-gray-600">総労働時間</p>
                    <p className="text-xl font-semibold">{attendanceSummary.totalWorkHours}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600">残業時間</p>
                    <p className="text-xl font-semibold">{attendanceSummary.overtimeHours}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600">残有給休暇</p>
                    <p className="text-xl font-semibold">{attendanceSummary.remainingPaidLeave}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">本日の予定</h2>
              <ul>
                {todaySchedule.map((item, index) => (
                  <li key={index} className="mb-2">
                    <span className="font-semibold">{item.time}</span> - {item.event}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="w-full lg:w-1/4 px-4">
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4">クイックアクセス</h2>
              <div className="space-y-4">
                <Link href="/attendance" className="flex items-center text-blue-600 hover:text-blue-800">
                  <FaClock className="mr-2" /> 打刻
                </Link>
                <Link href="/leave-request" className="flex items-center text-blue-600 hover:text-blue-800">
                  <FaCalendarAlt className="mr-2" /> 休暇申請
                </Link>
                <Link href="/shift-schedule" className="flex items-center text-blue-600 hover:text-blue-800">
                  <FaClipboardList className="mr-2" /> シフト確認
                </Link>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">通知</h2>
              <div className="flex items-center justify-between text-gray-600">
                <IoMdNotifications className="text-2xl" />
                <span>新着通知はありません</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;