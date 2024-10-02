import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { employee_id, start_time, end_time, location_id } = req.body;

  // シフト情報の検証
  if (!employee_id || !start_time || !end_time || !location_id) {
    return res.status(400).json({ error: '必須項目が不足しています' });
  }

  try {
    // シフト情報をデータベースに登録
    const { data, error } = await supabase
      .from('shifts')
      .insert([
        {
          employee_id,
          start_time,
          end_time,
          location_id,
          is_confirmed: false
        }
      ]);

    if (error) throw error;

    res.status(200).json({ message: 'シフトが正常に登録されました', data });
  } catch (error) {
    console.error('シフト登録エラー:', error);
    res.status(500).json({ error: 'シフトの登録に失敗しました' });
  }
}