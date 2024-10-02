import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { employee_id, record_type, record_time, location_id, record_method } = req.body;

  if (!employee_id || !record_type || !record_time || !location_id || !record_method) {
    return res.status(400).json({ error: '必要な情報が不足しています' });
  }

  try {
    const { data, error } = await supabase
      .from('time_records')
      .insert({
        employee_id,
        record_type,
        record_time,
        location_id,
        record_method
      });

    if (error) throw error;

    res.status(200).json({ message: `${record_type}を記録しました。`, data });
  } catch (error) {
    console.error('打刻エラー:', error);
    res.status(500).json({ error: '打刻に失敗しました。もう一度お試しください。' });
  }
}