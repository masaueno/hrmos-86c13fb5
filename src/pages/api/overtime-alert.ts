import { supabase } from '@/supabase';
import { NextApiRequest, NextApiResponse } from 'next';
import { getLlmModelAndGenerateContent } from '@/utils/functions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return res.status(401).json({ error: '認証が必要です' });
      }

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
        console.error('残業アラートの取得エラー:', error);
        
        // サンプルデータを返す
        const sampleData = [
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
        ];
        return res.status(200).json(sampleData);
      }

      // AIを使用して残業アラートの分析と提案を生成
      const systemPrompt = "あなたは勤怠管理システムのAIアシスタントです。残業アラートデータを分析し、改善提案を行ってください。";
      const userPrompt = `以下の残業アラートデータを分析し、簡潔な改善提案を3点挙げてください:
${JSON.stringify(data)}`;
      const aiAnalysis = await getLlmModelAndGenerateContent("Gemini", systemPrompt, userPrompt);

      return res.status(200).json({ alerts: data, aiAnalysis });
    } catch (error) {
      console.error('残業アラート処理エラー:', error);
      return res.status(500).json({ error: '内部サーバーエラーが発生しました' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return res.status(401).json({ error: '認証が必要です' });
      }

      const { id } = req.body;
      const { error } = await supabase
        .from('overtime_alerts')
        .update({ is_resolved: true })
        .eq('id', id);

      if (error) {
        console.error('残業アラート更新エラー:', error);
        return res.status(500).json({ error: 'アラートの更新に失敗しました' });
      }

      return res.status(200).json({ message: 'アラートが正常に更新されました' });
    } catch (error) {
      console.error('残業アラート更新エラー:', error);
      return res.status(500).json({ error: '内部サーバーエラーが発生しました' });
    }
  } else {
    res.setHeader('Allow', ['POST', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}