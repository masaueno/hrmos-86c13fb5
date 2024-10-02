import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import { createClient } from '@supabase/supabase-js';
import Topbar from '@/components/Topbar';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const WorkCategorySettings = () => {
  const router = useRouter();
  const [workCategories, setWorkCategories] = useState([]);

  useEffect(() => {
    fetchWorkCategories();
  }, []);

  const fetchWorkCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('work_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setWorkCategories(data || []);
    } catch (error) {
      console.error('勤務区分の取得に失敗しました:', error.message);
      // エラー時のサンプルデータ
      setWorkCategories([
        { id: 1, name: '通常勤務', description: '9:00-18:00の通常勤務' },
        { id: 2, name: '早番', description: '7:00-16:00の早番勤務' },
        { id: 3, name: '遅番', description: '13:00-22:00の遅番勤務' },
      ]);
    }
  };

  const handleAdd = () => {
    router.push('/work-category-add');
  };

  const handleEdit = (id) => {
    router.push(`/work-category-edit/${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm('この勤務区分を削除してもよろしいですか？')) {
      try {
        const { error } = await supabase
          .from('work_categories')
          .delete()
          .eq('id', id);

        if (error) throw error;
        fetchWorkCategories();
      } catch (error) {
        console.error('勤務区分の削除に失敗しました:', error.message);
      }
    }
  };

  return (
    <div className="min-h-screen h-full bg-gray-100">
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">勤務区分設定</h1>
        <button
          onClick={handleAdd}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded flex items-center mb-4"
        >
          <FiPlus className="mr-2" />
          新規追加
        </button>
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-200 text-gray-700">
                <th className="py-3 px-4 text-left">名称</th>
                <th className="py-3 px-4 text-left">説明</th>
                <th className="py-3 px-4 text-center">操作</th>
              </tr>
            </thead>
            <tbody>
              {workCategories.map((category) => (
                <tr key={category.id} className="border-b border-gray-200">
                  <td className="py-3 px-4">{category.name}</td>
                  <td className="py-3 px-4">{category.description}</td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleEdit(category.id)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-2 rounded mr-2"
                    >
                      <FiEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded"
                    >
                      <FiTrash2 />
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

export default WorkCategorySettings;