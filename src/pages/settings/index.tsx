import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Topbar from '@/components/Topbar';
import { FaCog, FaBell, FaLink } from 'react-icons/fa';

const Settings = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('勤務区分');

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen h-full bg-gray-100">
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">設定画面</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex mb-6">
            <button
              onClick={() => handleTabClick('勤務区分')}
              className={`mr-4 px-4 py-2 rounded-md ${
                activeTab === '勤務区分'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              <FaCog className="inline-block mr-2" />
              勤務区分設定
            </button>
            <button
              onClick={() => handleTabClick('アラート')}
              className={`mr-4 px-4 py-2 rounded-md ${
                activeTab === 'アラート'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              <FaBell className="inline-block mr-2" />
              アラート設定
            </button>
            <button
              onClick={() => handleTabClick('システム連携')}
              className={`px-4 py-2 rounded-md ${
                activeTab === 'システム連携'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              <FaLink className="inline-block mr-2" />
              システム連携設定
            </button>
          </div>

          {activeTab === '勤務区分' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">勤務区分設定</h2>
              {/* 勤務区分設定の内容をここに追加 */}
            </div>
          )}

          {activeTab === 'アラート' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">アラート設定</h2>
              {/* アラート設定の内容をここに追加 */}
            </div>
          )}

          {activeTab === 'システム連携' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">システム連携設定</h2>
              {/* システム連携設定の内容をここに追加 */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;