import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/supabase';
import { getLlmModelAndGenerateContent } from '@/utils/functions';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'メソッドが許可されていません' });
  }

  const { reportType, startDate, endDate, employeeIds, chartType } = req.body;

  try {
    // 1. クライアントから受け取った集計条件を検証する
    if (!reportType || !startDate || !endDate || !employeeIds || employeeIds.length === 0) {
      return res.status(400).json({ error: '必要なパラメータが不足しています' });
    }

    // 2. データベースから該当する勤怠データを取得する
    const { data: attendanceData, error: attendanceError } = await supabase
      .from('time_records')
      .select('*')
      .in('employee_id', employeeIds)
      .gte('record_time', startDate)
      .lte('record_time', endDate);

    if (attendanceError) {
      throw new Error('勤怠データの取得に失敗しました');
    }

    // 3. データを集計し、レポートを生成する
    let reportData;
    switch (reportType) {
      case 'daily':
        reportData = generateDailyReport(attendanceData);
        break;
      case 'monthly':
        reportData = generateMonthlyReport(attendanceData);
        break;
      case 'overtime':
        reportData = generateOvertimeReport(attendanceData);
        break;
      case 'paid_leave':
        reportData = await generatePaidLeaveReport(employeeIds, startDate, endDate);
        break;
      case '36_agreement':
        reportData = generate36AgreementReport(attendanceData);
        break;
      default:
        return res.status(400).json({ error: '無効なレポートタイプです' });
    }

    // AIを使用してレポートの分析と洞察を生成
    const aiAnalysis = await generateAIAnalysis(reportData, reportType);

    // チャートデータの生成
    const chartData = generateChartData(reportData, chartType);

    // 4. 生成したレポートデータをクライアントに返す
    res.status(200).json({
      reportData,
      aiAnalysis,
      chartData,
    });
  } catch (error) {
    console.error('レポート生成エラー:', error);
    res.status(500).json({ error: 'レポートの生成中にエラーが発生しました' });
  }
}

function generateDailyReport(attendanceData: any[]) {
  // 日次レポートの生成ロジック
  const dailyReport = attendanceData.reduce((acc, record) => {
    const date = new Date(record.record_time).toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = { totalHours: 0, employeeCount: new Set() };
    }
    acc[date].totalHours += calculateWorkHours(record);
    acc[date].employeeCount.add(record.employee_id);
    return acc;
  }, {});

  return Object.entries(dailyReport).map(([date, data]) => ({
    date,
    totalHours: Number(data.totalHours.toFixed(2)),
    employeeCount: data.employeeCount.size,
  }));
}

function generateMonthlyReport(attendanceData: any[]) {
  // 月次レポートの生成ロジック
  const monthlyReport = attendanceData.reduce((acc, record) => {
    const month = new Date(record.record_time).toISOString().slice(0, 7);
    if (!acc[month]) {
      acc[month] = { totalHours: 0, employeeCount: new Set() };
    }
    acc[month].totalHours += calculateWorkHours(record);
    acc[month].employeeCount.add(record.employee_id);
    return acc;
  }, {});

  return Object.entries(monthlyReport).map(([month, data]) => ({
    month,
    totalHours: Number(data.totalHours.toFixed(2)),
    employeeCount: data.employeeCount.size,
  }));
}

function generateOvertimeReport(attendanceData: any[]) {
  // 残業レポートの生成ロジック
  const overtimeReport = attendanceData.reduce((acc, record) => {
    const date = new Date(record.record_time).toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = { overtimeHours: 0, employeeCount: new Set() };
    }
    const workHours = calculateWorkHours(record);
    if (workHours > 8) {
      acc[date].overtimeHours += workHours - 8;
      acc[date].employeeCount.add(record.employee_id);
    }
    return acc;
  }, {});

  return Object.entries(overtimeReport).map(([date, data]) => ({
    date,
    overtimeHours: Number(data.overtimeHours.toFixed(2)),
    employeeCount: data.employeeCount.size,
  }));
}

async function generatePaidLeaveReport(employeeIds: string[], startDate: string, endDate: string) {
  // 有給休暇レポートの生成ロジック
  const { data: leaveRequests, error } = await supabase
    .from('leave_requests')
    .select('*')
    .in('employee_id', employeeIds)
    .gte('start_date', startDate)
    .lte('end_date', endDate)
    .eq('status', 'approved')
    .eq('leave_type_id', 'paid_leave_type_id'); // 有給休暇のタイプIDを指定

  if (error) {
    throw new Error('有給休暇データの取得に失敗しました');
  }

  const paidLeaveReport = leaveRequests.reduce((acc, request) => {
    const employeeId = request.employee_id;
    if (!acc[employeeId]) {
      acc[employeeId] = { totalDays: 0, requests: [] };
    }
    const days = calculateLeaveDays(request.start_date, request.end_date);
    acc[employeeId].totalDays += days;
    acc[employeeId].requests.push({
      startDate: request.start_date,
      endDate: request.end_date,
      days,
    });
    return acc;
  }, {});

  return Object.entries(paidLeaveReport).map(([employeeId, data]) => ({
    employeeId,
    totalPaidLeaveDays: data.totalDays,
    leaveRequests: data.requests,
  }));
}

function generate36AgreementReport(attendanceData: any[]) {
  // 36協定レポートの生成ロジック
  const monthlyOvertimeReport = attendanceData.reduce((acc, record) => {
    const month = new Date(record.record_time).toISOString().slice(0, 7);
    const employeeId = record.employee_id;
    if (!acc[month]) {
      acc[month] = {};
    }
    if (!acc[month][employeeId]) {
      acc[month][employeeId] = { overtimeHours: 0, daysOver: 0 };
    }
    const workHours = calculateWorkHours(record);
    if (workHours > 8) {
      acc[month][employeeId].overtimeHours += workHours - 8;
      acc[month][employeeId].daysOver++;
    }
    return acc;
  }, {});

  return Object.entries(monthlyOvertimeReport).map(([month, employeeData]) => ({
    month,
    employeeOvertimes: Object.entries(employeeData).map(([employeeId, data]) => ({
      employeeId,
      overtimeHours: Number(data.overtimeHours.toFixed(2)),
      daysOver: data.daysOver,
    })),
  }));
}

function calculateWorkHours(record: any) {
  // 勤務時間の計算ロジック（仮の実装）
  return 8; // 固定の8時間として仮実装
}

function calculateLeaveDays(startDate: string, endDate: string) {
  // 休暇日数の計算ロジック
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

async function generateAIAnalysis(reportData: any, reportType: string) {
  const prompt = `以下の${reportType}レポートデータを分析し、重要な洞察や推奨事項を提供してください：

${JSON.stringify(reportData)}`;

  try {
    const aiResponse = await getLlmModelAndGenerateContent("Gemini", "あなたは勤怠管理のエキスパートです。", prompt);
    return aiResponse;
  } catch (error) {
    console.error('AI分析の生成に失敗しました:', error);
    return '申し訳ありませんが、AI分析を生成できませんでした。';
  }
}

function generateChartData(reportData: any, chartType: string) {
  // チャートデータの生成ロジック
  switch (chartType) {
    case 'bar':
      return {
        labels: reportData.map((item: any) => item.date || item.month),
        datasets: [{
          label: '合計時間',
          data: reportData.map((item: any) => item.totalHours || item.overtimeHours),
        }],
      };
    case 'line':
      return {
        labels: reportData.map((item: any) => item.date || item.month),
        datasets: [{
          label: '合計時間',
          data: reportData.map((item: any) => item.totalHours || item.overtimeHours),
        }],
      };
    case 'pie':
      return {
        labels: reportData.map((item: any) => item.date || item.month),
        datasets: [{
          data: reportData.map((item: any) => item.totalHours || item.overtimeHours),
        }],
      };
    default:
      return {};
  }
}