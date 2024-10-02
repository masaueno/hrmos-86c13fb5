import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Topbar from '@/components/Topbar';
import { supabase } from '@/supabase';
import { FaCheck, FaEdit } from 'react-icons/fa';

const TimeClockConfirmation: React.FC = () => {
  const router = useRouter();
  const [timeRecord, setTimeRecord] = useState<any>(null);

  useEffect(() => {
    const fetchTimeRecord = async () => {
      // 本来はSupabaseから最新の打刻データを取得する
      // 今回はサンプルデータを使用
      const sampleData = {
        record_time: new Date().toLocaleString(),
        record_type: '出勤',
        location: {
          name: '東京オフィス'
        }
      };
      setTimeRecord(sampleData);
    };

    fetchTimeRecord();
  }, []);

  const handleConfirm = async () => {
    // 確認処理をここに実装
    // Supabaseを使用して打刻データを確定させる
    alert('打刻が確認されました');
    router.push('/home');
  };

  const handleEdit = () => {
    router.push('/time-clock');
  };

  if (!timeRecord) {
    return <div>読み込み中...</div>;
  }

  return (
    <div className="min-h-screen h-full flex flex-col bg-gray-100">
      <Topbar />
      <div className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">打刻確認</h1>
        <div className="bg-white shadow-lg rounded-lg p-6 max-w-md mx-auto">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2 text-gray-700">打刻内容</h2>
            <p className="text-lg"><span className="font-medium">日時:</span> {timeRecord.record_time}</p>
            <p className="text-lg"><span className="font-medium">種類:</span> {timeRecord.record_type}</p>
            <p className="text-lg"><span className="font-medium">場所:</span> {timeRecord.location.name}</p>
          </div>
          <div className="flex justify-between">
            <button
              onClick={handleConfirm}
              className="flex items-center justify-center bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300"
            >
              <FaCheck className="mr-2" />
              確認
            </button>
            <button
              onClick={handleEdit}
              className="flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
            >
              <FaEdit className="mr-2" />
              修正
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeClockConfirmation;