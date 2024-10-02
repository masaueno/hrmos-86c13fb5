import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/supabase';
import axios from 'axios';
import { getLlmModelAndGenerateContent } from '@/utils/functions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '許可されていないメソッドです' });
  }

  const { employee_id, leave_type_id, start_date, end_date, reason } = req.body;

  if (!employee_id || !leave_type_id || !start_date || !end_date) {
    return res.status(400).json({ message: '必須項目が不足しています' });
  }

  try {
    // 休暇申請情報をデータベースに登録
    const { data, error } = await supabase
      .from('leave_requests')
      .insert([
        {
          employee_id,
          leave_type_id,
          start_date,
          end_date,
          reason,
          status: 'pending'
        }
      ]);

    if (error) throw error;

    // 承認者の情報を取得
    const { data: employeeData, error: employeeError } = await supabase
      .from('employees')
      .select('manager_id')
      .eq('id', employee_id)
      .single();

    if (employeeError) throw employeeError;

    if (employeeData.manager_id) {
      // 承認者に通知を送信
      const notificationContent = await getLlmModelAndGenerateContent(
        "Gemini",
        "休暇申請の通知文を生成してください。",
        `新しい休暇申請があります。従業員ID: ${employee_id}, 開始日: ${start_date}, 終了日: ${end_date}`
      );

      // 通知をデータベースに保存
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert([
          {
            user_id: employeeData.manager_id,
            content: notificationContent,
            type: 'leave_request'
          }
        ]);

      if (notificationError) throw notificationError;
    }

    res.status(200).json({ message: '休暇申請が正常に送信されました' });
  } catch (error) {
    console.error('休暇申請の処理中にエラーが発生しました:', error);
    res.status(500).json({ message: '休暇申請の処理中にエラーが発生しました' });
  }
}