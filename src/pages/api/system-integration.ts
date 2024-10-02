import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/supabase';
import axios from 'axios';
import { getLlmModelAndGenerateContent } from '@/utils/functions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { data: integrations, error } = await supabase
      .from('system_integrations')
      .select('*')
      .eq('status', '接続済み');

    if (error) {
      throw error;
    }

    for (const integration of integrations) {
      const data = await fetchDataForIntegration(integration);
      await sendDataToExternalSystem(integration, data);
    }

    res.status(200).json({ message: 'データ連携が正常に完了しました' });
  } catch (error) {
    console.error('データ連携エラー:', error);
    res.status(500).json({ error: 'データ連携中にエラーが発生しました' });
  }
}

async function fetchDataForIntegration(integration: any) {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .limit(10);  // 連携するデータ量を制限

  if (error) {
    throw error;
  }

  return data;
}

async function sendDataToExternalSystem(integration: any, data: any) {
  try {
    const apiUrl = integration.api_url;
    const response = await axios.post(apiUrl, data, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${integration.api_key}`
      }
    });

    if (response.status !== 200) {
      throw new Error(`外部システムへのデータ送信に失敗しました: ${response.statusText}`);
    }

    // AIを使用してレスポンスを解析
    const aiPrompt = `
    システム: 外部システムからのレスポンスを解析し、人間が理解しやすい形式に変換してください。
    ユーザー: 以下のレスポンスを解析してください: ${JSON.stringify(response.data)}
    `;
    const aiResponse = await getLlmModelAndGenerateContent("Gemini", "システム連携レスポンス解析", aiPrompt);

    // 連携結果をログに記録
    await supabase
      .from('integration_logs')
      .insert({
        integration_id: integration.id,
        status: 'success',
        details: aiResponse,
        data_sent: JSON.stringify(data)
      });

  } catch (error) {
    console.error('外部システムへのデータ送信エラー:', error);

    // エラーをログに記録
    await supabase
      .from('integration_logs')
      .insert({
        integration_id: integration.id,
        status: 'error',
        details: error.message,
        data_sent: JSON.stringify(data)
      });

    // 管理者に通知
    await sendNotificationToAdmin(integration, error);
  }
}

async function sendNotificationToAdmin(integration: any, error: any) {
  const adminEmail = 'admin@example.com';  // 実際の管理者メールアドレスに置き換える
  const subject = `システム連携エラー: ${integration.name}`;
  const body = `
    システム連携中にエラーが発生しました。
    連携名: ${integration.name}
    エラー詳細: ${error.message}
  `;

  // ここでメール送信ロジックを実装
  // 例: SendGridやNodemailerなどのライブラリを使用
  console.log('管理者通知:', { to: adminEmail, subject, body });
}