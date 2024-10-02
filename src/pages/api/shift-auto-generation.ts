import { supabase } from '@/supabase';
import axios from 'axios';
import { getLlmModelAndGenerateContent } from '@/utils/functions';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'メソッドが許可されていません' });
  }

  try {
    const { employeeIds, rules } = req.body;

    // 従業員の希望シフトと利用可能な時間帯を取得
    const { data: employeeShifts, error: shiftError } = await supabase
      .from('shift_requests')
      .select('*')
      .in('employee_id', employeeIds);

    if (shiftError) throw shiftError;

    // AIを使用してシフトを自動生成
    const prompt = `以下の従業員の希望シフトと利用可能な時間帯、およびルールに基づいてシフトを自動生成してください:
    従業員シフト情報: ${JSON.stringify(employeeShifts)}
    ルール: ${JSON.stringify(rules)}`;

    const generatedShifts = await getLlmModelAndGenerateContent("Gemini", "あなたはシフト管理の専門家です。", prompt);

    // 生成されたシフトをパースしてデータベースに登録
    const parsedShifts = JSON.parse(generatedShifts);
    const { data: insertedShifts, error: insertError } = await supabase
      .from('shifts')
      .insert(parsedShifts);

    if (insertError) throw insertError;

    // 管理者に通知を送信
    await sendNotificationToAdmin(insertedShifts);

    res.status(200).json({ message: 'シフトが正常に生成されました', shifts: insertedShifts });
  } catch (error) {
    console.error('シフト自動生成エラー:', error);
    res.status(500).json({ error: 'シフトの自動生成に失敗しました', details: error.message });
  }
}

async function sendNotificationToAdmin(shifts) {
  try {
    const { data: admins, error } = await supabase
      .from('employees')
      .select('email')
      .eq('role', 'admin');

    if (error) throw error;

    const adminEmails = admins.map(admin => admin.email);

    // ここでメール送信や通知サービスを使用して管理者に通知
    // 例: メール送信サービスを使用
    await axios.post('https://api.emailservice.com/send', {
      to: adminEmails,
      subject: 'シフト自動生成完了',
      body: `${shifts.length}件のシフトが自動生成されました。確認してください。`
    });
  } catch (error) {
    console.error('管理者への通知送信エラー:', error);
  }
}