import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaPlus, FaEdit, FaTrash, FaCheck } from 'react-icons/fa';
import { createClient } from '@supabase/supabase-js';
import Topbar from '@/components/Topbar';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const SystemIntegrationSettings = () => {
  const [integrations, setIntegrations] = useState([]);
  const [newIntegration, setNewIntegration] = useState({ name: '', type: '', status: '未接続' });
  const [editingId, setEditingId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const { data, error } = await supabase.from('system_integrations').select('*');
      if (error) throw error;
      setIntegrations(data || []);
    } catch (error) {
      console.error('システム連携の取得に失敗しました:', error.message);
      // サンプルデータを表示
      setIntegrations([
        { id: 1, name: '給与計算システム', type: 'API', status: '接続済み' },
        { id: 2, name: '人事システム', type: 'データベース', status: '未接続' },
      ]);
    }
  };

  const handleAddIntegration = async () => {
    try {
      const { data, error } = await supabase.from('system_integrations').insert([newIntegration]);
      if (error) throw error;
      setIntegrations([...integrations, data[0]]);
      setNewIntegration({ name: '', type: '', status: '未接続' });
    } catch (error) {
      console.error('新規連携の追加に失敗しました:', error.message);
    }
  };

  const handleEditIntegration = async (id) => {
    if (editingId === id) {
      try {
        const { error } = await supabase
          .from('system_integrations')
          .update(integrations.find(i => i.id === id))
          .eq('id', id);
        if (error) throw error;
        setEditingId(null);
      } catch (error) {
        console.error('連携の編集に失敗しました:', error.message);
      }
    } else {
      setEditingId(id);
    }
  };

  const handleDeleteIntegration = async (id) => {
    try {
      const { error } = await supabase.from('system_integrations').delete().eq('id', id);
      if (error) throw error;
      setIntegrations(integrations.filter(i => i.id !== id));
    } catch (error) {
      console.error('連携の削除に失敗しました:', error.message);
    }
  };

  const handleTestIntegration = async (id) => {
    // 実際のテスト連携ロジックをここに実装
    alert(`ID: ${id} の連携をテストしています...`);
  };

  return (
    <div className="min-h-screen h-full bg-gray-100">
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">システム連携設定</h1>
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">新規連携追加</h2>
          <div className="flex space-x-4">
            <input
              type="text"
              placeholder="連携名"
              className="flex-1 border rounded-md px-3 py-2"
              value={newIntegration.name}
              onChange={(e) => setNewIntegration({ ...newIntegration, name: e.target.value })}
            />
            <input
              type="text"
              placeholder="連携タイプ"
              className="flex-1 border rounded-md px-3 py-2"
              value={newIntegration.type}
              onChange={(e) => setNewIntegration({ ...newIntegration, type: e.target.value })}
            />
            <button
              onClick={handleAddIntegration}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
            >
              <FaPlus className="inline mr-2" />
              追加
            </button>
          </div>
        </div>
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-6 py-3 text-left">連携名</th>
                <th className="px-6 py-3 text-left">タイプ</th>
                <th className="px-6 py-3 text-left">ステータス</th>
                <th className="px-6 py-3 text-left">アクション</th>
              </tr>
            </thead>
            <tbody>
              {integrations.map((integration) => (
                <tr key={integration.id} className="border-b">
                  <td className="px-6 py-4">
                    {editingId === integration.id ? (
                      <input
                        type="text"
                        value={integration.name}
                        onChange={(e) => setIntegrations(integrations.map(i => i.id === integration.id ? { ...i, name: e.target.value } : i))}
                        className="border rounded-md px-2 py-1 w-full"
                      />
                    ) : (
                      integration.name
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === integration.id ? (
                      <input
                        type="text"
                        value={integration.type}
                        onChange={(e) => setIntegrations(integrations.map(i => i.id === integration.id ? { ...i, type: e.target.value } : i))}
                        className="border rounded-md px-2 py-1 w-full"
                      />
                    ) : (
                      integration.type
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-sm ${integration.status === '接続済み' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                      {integration.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleEditIntegration(integration.id)}
                      className="text-blue-500 hover:text-blue-700 mr-2"
                    >
                      {editingId === integration.id ? <FaCheck /> : <FaEdit />}
                    </button>
                    <button
                      onClick={() => handleDeleteIntegration(integration.id)}
                      className="text-red-500 hover:text-red-700 mr-2"
                    >
                      <FaTrash />
                    </button>
                    <button
                      onClick={() => handleTestIntegration(integration.id)}
                      className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition-colors"
                    >
                      テスト連携
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SystemIntegrationSettings;