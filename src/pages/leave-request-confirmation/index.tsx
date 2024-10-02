import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabase } from '@/supabase';
import Topbar from '@/components/Topbar';
import { FaCheck, FaEdit } from 'react-icons/fa';

const LeaveRequestConfirmation = () => {
  const router = useRouter();
  const [leaveRequest, setLeaveRequest] = useState(null);

  useEffect(() => {
    const fetchLeaveRequest = async () => {
      // 実際のアプリケーションでは、クエリパラメータやステート管理ライブラリを使用して
      // 前の画面から休暇申請データを受け取ることになります。
      // ここではサンプルデータを使用します。
      const sampleLeaveRequest = {
        leaveType: '有給休暇',
        startDate: '2023-07-01',
        endDate: '2023-07-03',
        reason: '夏季休暇'
      };
      setLeaveRequest(sampleLeaveRequest);
    };

    fetchLeaveRequest();
  }, []);

  const handleConfirm = async () => {
    try {
      // Supabaseを使用して休暇申請を保存
      const { data, error } = await supabase
        .from('leave_requests')
        .insert([
          {
            employee_id: 'ログインユーザーのID', // 実際のアプリケーションではログインユーザーのIDを使用
            leave_type_id: 'leave_typesテーブルの対応するID',
            start_date: leaveRequest.startDate,
            end_date: leaveRequest.endDate,
            reason: leaveRequest.reason,
            status: 'pending'
          }
        ]);

      if (error) throw error;

      alert('休暇申請が送信されました');
      router.push('/home'); // ホーム画面に遷移
    } catch (error) {
      console.error('休暇申請の送信に失敗しました', error);
      alert('休暇申請の送信に失敗しました。もう一度お試しください。');
    }
  };

  const handleEdit = () => {
    router.push('/leave-request'); // 休暇申請画面に戻る
  };

  if (!leaveRequest) {
    return <div>読み込み中...</div>;
  }

  return (
    <div className="min-h-screen h-full bg-gray-100">
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">休暇申請確認</h1>
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">申請内容</h2>
          <div className="mb-4">
            <p className="font-medium">休暇種類:</p>
            <p>{leaveRequest.leaveType}</p>
          </div>
          <div className="mb-4">
            <p className="font-medium">期間:</p>
            <p>{`${leaveRequest.startDate} から ${leaveRequest.endDate}`}</p>
          </div>
          <div className="mb-6">
            <p className="font-medium">理由:</p>
            <p>{leaveRequest.reason}</p>
          </div>
          <div className="flex justify-between">
            <button
              onClick={handleConfirm}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded flex items-center"
            >
              <FaCheck className="mr-2" />
              確認
            </button>
            <button
              onClick={handleEdit}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded flex items-center"
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

export default LeaveRequestConfirmation;