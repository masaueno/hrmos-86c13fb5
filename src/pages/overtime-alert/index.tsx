import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabase } from '@/supabase';
import Topbar from '@/components/Topbar';
import { FiFilter, FiEye, FiCheck } from 'react-icons/fi';

const OvertimeAlertPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    const { data, error } = await supabase
      .from('overtime_alerts')
      .select(`
        id,
        alert_type,
        alert_date,
        overtime_hours,
        threshold_hours,
        is_resolved,
        employees (
          first_name,
          last_name
        )
      `)
      .order('alert_date', { ascending: false });

    if (error) {
      console.error('Error fetching alerts:', error);
      // サンプルデータを表示
      setAlerts([
        {
          id: '1',
          alert_type: '日次残業',
          alert_date: '2023-06-01',
          overtime_hours: 3.5,
          threshold_hours: 2,
          is_resolved: false,
          employees: { first_name: '太郎', last_name: '山田' }
        },
        {
          id: '2',
          alert_type: '月次残業',
          alert_date: '2023-06-15',
          overtime_hours: 45,
          threshold_hours: 40,
          is_resolved: true,
          employees: { first_name: '花子', last_name: '鈴木' }
        }
      ]);
    } else {
      setAlerts(data);
    }
  };

  const handleFilter = (e) => {
    setFilter(e.target.value);
  };

  const filteredAlerts = alerts.filter(alert =>
    alert.employees.last_name.includes(filter) ||
    alert.employees.first_name.includes(filter) ||
    alert.alert_type.includes(filter)
  );

  const handleResolve = async (id) => {
    const { error } = await supabase
      .from('overtime_alerts')
      .update({ is_resolved: true })
      .eq('id', id);

    if (error) {
      console.error('Error resolving alert:', error);
    } else {
      fetchAlerts();
    }
  };

  return (
    <div className="min-h-screen h-full bg-gray-100">
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">残業アラート画面</h1>
        <div className="mb-4 flex items-center">
          <FiFilter className="mr-2" />
          <input
            type="text"
            placeholder="フィルター"
            value={filter}
            onChange={handleFilter}
            className="border rounded px-2 py-1"
          />
        </div>
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2">従業員名</th>
                <th className="px-4 py-2">アラート種類</th>
                <th className="px-4 py-2">発生日時</th>
                <th className="px-4 py-2">残業時間</th>
                <th className="px-4 py-2">アクション</th>
              </tr>
            </thead>
            <tbody>
              {filteredAlerts.map((alert) => (
                <tr key={alert.id} className="border-b">
                  <td className="px-4 py-2">{`${alert.employees.last_name} ${alert.employees.first_name}`}</td>
                  <td className="px-4 py-2">{alert.alert_type}</td>
                  <td className="px-4 py-2">{new Date(alert.alert_date).toLocaleDateString()}</td>
                  <td className="px-4 py-2">{`${alert.overtime_hours}時間`}</td>
                  <td className="px-4 py-2 flex items-center">
                    <button
                      onClick={() => router.push(`/overtime-alert-detail/${alert.id}`)}
                      className="mr-2 bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                    >
                      <FiEye />
                    </button>
                    {!alert.is_resolved && (
                      <button
                        onClick={() => handleResolve(alert.id)}
                        className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                      >
                        <FiCheck />
                      </button>
                    )}
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

export default OvertimeAlertPage;