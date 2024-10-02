import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import Topbar from '@/components/Topbar';
import { FaCheckCircle, FaTimesCircle, FaInfoCircle } from 'react-icons/fa';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const LeaveApproval = () => {
  const router = useRouter();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    const { data, error } = await supabase
      .from('leave_requests')
      .select(`
        id,
        employee_id,
        leave_type_id,
        start_date,
        end_date,
        status,
        reason,
        employees(first_name, last_name),
        leave_types(name)
      `)
      .eq('status', 'pending');

    if (error) {
      console.error('Error fetching leave requests:', error);
    } else {
      setLeaveRequests(data);
    }
  };

  const handleRequestSelect = (request) => {
    setSelectedRequest(request);
  };

  const handleApprove = async () => {
    await updateLeaveRequest('approved');
  };

  const handleReject = async () => {
    await updateLeaveRequest('rejected');
  };

  const updateLeaveRequest = async (status) => {
    const { error } = await supabase
      .from('leave_requests')
      .update({ status, approver_id: '現在のユーザーID' })
      .eq('id', selectedRequest.id);

    if (error) {
      console.error('Error updating leave request:', error);
    } else {
      fetchLeaveRequests();
      setSelectedRequest(null);
      setComment('');
    }
  };

  return (
    <div className="min-h-screen h-full bg-gray-100">
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">休暇承認画面</h1>
        <div className="flex">
          <div className="w-1/2 pr-4">
            <h2 className="text-xl font-semibold mb-4">申請一覧</h2>
            <ul className="bg-white rounded-lg shadow">
              {leaveRequests.map((request) => (
                <li
                  key={request.id}
                  className="p-4 border-b last:border-b-0 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleRequestSelect(request)}
                >
                  <p className="font-semibold">{`${request.employees.last_name} ${request.employees.first_name}`}</p>
                  <p>{request.leave_types.name}</p>
                  <p>{`${request.start_date} ～ ${request.end_date}`}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="w-1/2 pl-4">
            <h2 className="text-xl font-semibold mb-4">申請詳細</h2>
            {selectedRequest ? (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-2">{`${selectedRequest.employees.last_name} ${selectedRequest.employees.first_name}の申請`}</h3>
                <p><strong>休暇種類:</strong> {selectedRequest.leave_types.name}</p>
                <p><strong>期間:</strong> {`${selectedRequest.start_date} ～ ${selectedRequest.end_date}`}</p>
                <p><strong>理由:</strong> {selectedRequest.reason}</p>
                <div className="mt-4">
                  <label htmlFor="comment" className="block mb-2">コメント:</label>
                  <textarea
                    id="comment"
                    className="w-full p-2 border rounded"
                    rows="3"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  ></textarea>
                </div>
                <div className="mt-4 flex justify-end space-x-4">
                  <button
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center"
                    onClick={handleApprove}
                  >
                    <FaCheckCircle className="mr-2" />
                    承認
                  </button>
                  <button
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 flex items-center"
                    onClick={handleReject}
                  >
                    <FaTimesCircle className="mr-2" />
                    却下
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6 flex items-center justify-center text-gray-500">
                <FaInfoCircle className="mr-2" />
                申請を選択してください
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveApproval;