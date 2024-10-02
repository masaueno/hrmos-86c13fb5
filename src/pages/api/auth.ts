import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/supabase';
import jwt from 'jsonwebtoken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'メソッドが許可されていません' });
  }

  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ error: '従業員IDまたはメールアドレスとパスワードが必要です' });
  }

  try {
    // Supabaseの認証機能を使用してユーザーを認証
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: identifier,
      password: password,
    });

    if (authError) throw authError;

    if (!authData.user) {
      return res.status(401).json({ error: '認証に失敗しました' });
    }

    // ユーザー情報を取得
    const { data: userData, error: userError } = await supabase
      .from('employees')
      .select('*')
      .eq('email', authData.user.email)
      .single();

    if (userError) throw userError;

    // JWTトークンを生成
    const token = jwt.sign(
      {
        userId: userData.id,
        email: userData.email,
        role: userData.position_id, // 役職IDを含める
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '1d' }
    );

    // レスポンスを返す
    res.status(200).json({
      token,
      user: {
        id: userData.id,
        email: userData.email,
        firstName: userData.first_name,
        lastName: userData.last_name,
        employeeNumber: userData.employee_number,
        positionId: userData.position_id,
      },
    });
  } catch (error) {
    console.error('認証エラー:', error);
    res.status(500).json({ error: '認証処理中にエラーが発生しました' });
  }
}