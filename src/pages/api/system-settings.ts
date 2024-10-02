import { createClient } from '@supabase/supabase-js';
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/supabase';
import axios from 'axios';
import { getLlmModelAndGenerateContent } from '@/utils/functions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '許可されていないメソッドです' });
  }

  try {
    const { settings } = req.body;

    // 設定情報の検証
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ message: '無効な設定情報です' });
    }

    // データベースに設定を更新
    const { data, error } = await supabase
      .from('system_settings')
      .upsert(settings, { onConflict: 'key' });

    if (error) {
      throw error;
    }

    // 更新成功時のレスポンス
    res.status(200).json({ message: 'システム設定が正常に更新されました', data });
  } catch (error) {
    console.error('システム設定の更新中にエラーが発生しました:', error);
    res.status(500).json({ message: 'システム設定の更新中にエラーが発生しました' });
  }
}