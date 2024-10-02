import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/supabase';
import { createObjectCsvStringifier } from 'csv-writer';
import { format } from 'date-fns';
import { getLlmModelAndGenerateContent } from '@/utils/functions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { startDate, endDate, selectedEmployees, selectedItems, fileFormat } = req.body;

  try {
    // データベースからデータを取得
    const { data: attendanceData, error } = await supabase
      .from('time_records')
      .select(`
        id,
        employee_id,
        record_type,
        record_time,
        employees (first_name, last_name)
      `)
      .gte('record_time', startDate)
      .lte('record_time', endDate)
      .in('employee_id', selectedEmployees);

    if (error) throw error;

    // データを整形
    const formattedData = attendanceData.map((record) => {
      const formattedRecord: any = {
        従業員名: `${record.employees.last_name} ${record.employees.first_name}`,
        日付: format(new Date(record.record_time), 'yyyy-MM-dd'),
        種類: record.record_type,
        時間: format(new Date(record.record_time), 'HH:mm:ss'),
      };

      selectedItems.forEach((item) => {
        switch (item) {
          case '勤務時間':
            formattedRecord['勤務時間'] = '計算が必要';
            break;
          case '休憩時間':
            formattedRecord['休憩時間'] = '計算が必要';
            break;
          case '残業時間':
            formattedRecord['残業時間'] = '計算が必要';
            break;
          case '有給休暇':
            formattedRecord['有給休暇'] = '別テーブルから取得が必要';
            break;
          case '欠勤':
            formattedRecord['欠勤'] = '判定が必要';
            break;
        }
      });

      return formattedRecord;
    });

    // CSVデータの生成
    const csvStringifier = createObjectCsvStringifier({
      header: [
        { id: '従業員名', title: '従業員名' },
        { id: '日付', title: '日付' },
        { id: '種類', title: '種類' },
        { id: '時間', title: '時間' },
        ...selectedItems.map(item => ({ id: item, title: item })),
      ],
    });

    const csvString = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(formattedData);

    // ファイル形式に応じた処理
    switch (fileFormat) {
      case 'csv':
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=勤怠データ_${startDate}_${endDate}.csv`);
        return res.status(200).send(csvString);

      case 'xlsx':
        // Excel形式への変換処理（実際にはライブラリを使用して実装）
        return res.status(501).json({ error: 'Excel形式の出力は未実装です' });

      case 'pdf':
        // PDF形式への変換処理（実際にはライブラリを使用して実装）
        return res.status(501).json({ error: 'PDF形式の出力は未実装です' });

      default:
        return res.status(400).json({ error: '不正なファイル形式です' });
    }

  } catch (error) {
    console.error('データ出力エラー:', error);
    return res.status(500).json({ error: 'データの出力に失敗しました' });
  }
}