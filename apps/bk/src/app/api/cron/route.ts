import { NextRequest, NextResponse } from 'next/server';
import { generateTradingDays } from '@/lib/utils';

// 数据库配置 - 从环境变量读取
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'ChangeMe2026!Secure',
  database: process.env.DB_NAME || 'stock_tracker',
  charset: 'utf8mb4'
};

// Tushare API配置
const TUSHARE_TOKEN = '2876ea85cb005fb5fa17c809a98174f2d5aae8b1f830110a5ead6211';

interface Stock {
  StockName: string;
  StockCode: string;
  ZSName: string;
  TDType: string;
  Amount: number;
  LimitUpTime: string;
}

interface LimitUpApiResponse {
  list?: Array<{
    ZSName: string;
    StockList: Array<any>;
  }>;
}

// 动态导入mysql以避免构建时问题
async function createDatabaseConnection() {
  try {
    const mysql = await import('mysql2/promise');
    return await mysql.default.createConnection(dbConfig);
  } catch (error) {
    console.log('[DB] MySQL连接失败，使用模拟模式:', error);
    return null;
  }
}

// 日志记录函数
async function logToDatabase(type: 'info' | 'warning' | 'error' | 'success', message: string, details: any = null) {
  try {
    const connection = await createDatabaseConnection();
    if (!connection) {
      console.log(`[${type.toUpperCase()}] ${message}`, details || '');
      return;
    }

    await connection.execute(
      'INSERT INTO system_logs (log_type, message, details) VALUES (?, ?, ?)',
      [type, message, details ? JSON.stringify(details) : null]
    );
    await connection.end();
    console.log(`[${type.toUpperCase()}] ${message}`);
  } catch (error) {
    console.error(`[LOG_ERROR] 写入日志失败: ${error}`);
  }
}

// 获取涨停股票数据
async function getLimitUpStocks(date: string): Promise<Stock[]> {
  try {
    await logToDatabase('info', `开始获取${date}的涨停股票数据`);

    const url = 'https://apphis.longhuvip.com/w1/api/index.php';
    const formData = new URLSearchParams({
      Date: date.replace(/-/g, ''),
      Index: '0',
      PhoneOSNew: '2',
      VerSion: '5.21.0.1',
      a: 'GetPlateInfo_w38',
      apiv: 'w42',
      c: 'HisLimitResumption',
      st: '20'
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        'Accept': '*/*',
        'User-Agent': 'lhb/5.21.1 (com.kaipanla.www; build:1; iOS 18.6.2) Alamofire/4.9.1',
      },
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseText = await response.text();
    const data: LimitUpApiResponse = JSON.parse(responseText);

    const stocks: Stock[] = [];

    if (data.list && Array.isArray(data.list)) {
      data.list.forEach(category => {
        const zsName = category.ZSName || '未分类';
        if (category.StockList && Array.isArray(category.StockList)) {
          const reversedStockList = [...category.StockList].reverse();
          reversedStockList.forEach((stockData: any[]) => {
            const stockCode = stockData[0];
            const stockName = stockData[1];
            const tdType = stockData[9] || '首板';
            // stockData[13] 是成交额（单位：元）
            const amountInYuan = parseFloat(stockData[13]) || 0;
            const amountInYi = Math.round((amountInYuan / 100000000) * 100) / 100;
            // stockData[6] 是涨停时间戳，需要转换
            const limitUpTimestamp = parseInt(stockData[6]) || 0;
            let limitUpTime = '09:30';
            if (limitUpTimestamp > 0) {
              const date = new Date(limitUpTimestamp * 1000);
              const hours = date.getHours().toString().padStart(2, '0');
              const minutes = date.getMinutes().toString().padStart(2, '0');
              limitUpTime = `${hours}:${minutes}`;
            }

            // 过滤无效数据
            if (stockCode && stockName && !stockName.includes('退市') && !stockCode.startsWith('4') && !stockCode.startsWith('8')) {
              stocks.push({
                StockName: stockName,
                StockCode: stockCode,
                ZSName: zsName,
                TDType: tdType,
                Amount: amountInYi,
                LimitUpTime: limitUpTime
              });
            }
          });
        }
      });
    }

    await logToDatabase('success', `成功获取${stocks.length}只涨停股票`, { date, count: stocks.length });
    return stocks;

  } catch (error) {
    await logToDatabase('error', `获取涨停股票数据失败: ${error}`, { date });
    return [];
  }
}

// 转换股票代码格式
function convertStockCodeForTushare(stockCode: string): string {
  if (stockCode.startsWith('60') || stockCode.startsWith('68') || stockCode.startsWith('51')) {
    return `${stockCode}.SH`;
  } else if (stockCode.startsWith('00') || stockCode.startsWith('30') || stockCode.startsWith('12')) {
    return `${stockCode}.SZ`;
  } else if (stockCode.startsWith('43') || stockCode.startsWith('83') || stockCode.startsWith('87')) {
    return `${stockCode}.BJ`;
  }
  return `${stockCode}.SZ`;
}

// 新浪财经API获取单只股票K线数据
async function getSinaStockKline(stockCode: string, days: number = 30): Promise<Array<{date: string; pctChg: number}>> {
  try {
    const sinaCode = stockCode.startsWith('6') ? `sh${stockCode}` : `sz${stockCode}`;
    const url = `https://money.finance.sina.com.cn/quotes_service/api/json_v2.php/CN_MarketData.getKLineData?symbol=${sinaCode}&scale=240&ma=no&datalen=${days}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Referer': 'https://finance.sina.com.cn',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) return [];

    const text = await response.text();
    const data = JSON.parse(text);

    if (!Array.isArray(data) || data.length === 0) return [];

    const result: Array<{date: string; pctChg: number}> = [];

    for (let i = 1; i < data.length; i++) {
      const current = data[i];
      const prev = data[i - 1];
      const closePrice = parseFloat(current.close);
      const prevClose = parseFloat(prev.close);

      if (prevClose > 0) {
        const pctChg = ((closePrice - prevClose) / prevClose) * 100;
        result.push({
          date: current.day,
          pctChg: Math.round(pctChg * 100) / 100
        });
      }
    }

    return result;
  } catch (error) {
    return [];
  }
}

// 使用新浪API批量获取股票数据
async function getBatchStockDailyFromSina(
  stockCodes: string[],
  tradeDates: string[]
): Promise<Map<string, Record<string, number>>> {
  const result = new Map<string, Record<string, number>>();

  stockCodes.forEach(code => {
    result.set(code, {});
    tradeDates.forEach(date => {
      result.get(code)![date] = 0;
    });
  });

  console.log(`[新浪API] 开始批量获取 ${stockCodes.length} 只股票数据`);

  const BATCH_SIZE = 10;
  let totalMatched = 0;

  for (let i = 0; i < stockCodes.length; i += BATCH_SIZE) {
    const batch = stockCodes.slice(i, i + BATCH_SIZE);

    const promises = batch.map(async (stockCode) => {
      const klineData = await getSinaStockKline(stockCode, 30);
      let matchedCount = 0;

      klineData.forEach(item => {
        if (tradeDates.includes(item.date) && result.has(stockCode)) {
          result.get(stockCode)![item.date] = item.pctChg;
          matchedCount++;
        }
      });

      return matchedCount;
    });

    const batchResults = await Promise.all(promises);
    totalMatched += batchResults.reduce((sum, count) => sum + count, 0);

    if (i + BATCH_SIZE < stockCodes.length) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }

  console.log(`[新浪API] 批量获取完成, 总共匹配 ${totalMatched} 条数据`);
  return result;
}

// 批量获取股票表现数据
async function getBatchStockPerformance(stockCodes: string[], tradingDays: string[]): Promise<Map<string, Record<string, number>>> {
  const result = new Map<string, Record<string, number>>();

  // 初始化数据
  stockCodes.forEach(code => {
    result.set(code, {});
    tradingDays.forEach(date => {
      result.get(code)![date] = 0;
    });
  });

  let useSinaFallback = false;

  try {
    await logToDatabase('info', `开始批量获取股票表现数据`, {
      stockCount: stockCodes.length,
      daysCount: tradingDays.length
    });

    const tsCodes = stockCodes.map(code => convertStockCodeForTushare(code));

    const response = await fetch('https://api.tushare.pro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_name: 'daily',
        token: TUSHARE_TOKEN,
        params: {
          ts_code: tsCodes.join(','),
          start_date: Math.min(...tradingDays.map(d => parseInt(d.replace(/-/g, '')))).toString(),
          end_date: Math.max(...tradingDays.map(d => parseInt(d.replace(/-/g, '')))).toString()
        },
        fields: 'ts_code,trade_date,pct_chg'
      })
    });

    if (!response.ok) {
      throw new Error(`Tushare API HTTP error: ${response.status}`);
    }

    const data = await response.json();

    console.log('[Tushare] API响应:', JSON.stringify({
      code: data.code,
      msg: data.msg,
      itemsCount: data.data?.items?.length || 0
    }));

    // 检查是否遇到频率限制
    if (data.code && data.code !== 0) {
      console.log(`[Tushare] API错误: ${data.msg}`);
      useSinaFallback = true;
    } else if (data.code === 0 && data.data && data.data.items) {
      data.data.items.forEach((item: any[]) => {
        const tsCode = item[0];
        const tradeDate = item[1];
        const pctChg = parseFloat(item[2]) || 0;

        const formattedDate = `${tradeDate.slice(0,4)}-${tradeDate.slice(4,6)}-${tradeDate.slice(6,8)}`;

        const originalCode = stockCodes.find(code =>
          convertStockCodeForTushare(code) === tsCode
        );

        if (originalCode && tradingDays.includes(formattedDate)) {
          result.get(originalCode)![formattedDate] = pctChg;
        }
      });

      await logToDatabase('success', `成功获取${data.data.items.length}条股票表现数据`);
    } else {
      useSinaFallback = true;
    }

  } catch (error) {
    await logToDatabase('error', `获取股票表现数据失败: ${error}`);
    useSinaFallback = true;
  }

  // 如果Tushare失败或数据为空，使用新浪API
  if (useSinaFallback) {
    console.log(`[Cron] 切换到新浪财经API获取数据`);
    try {
      const sinaResult = await getBatchStockDailyFromSina(stockCodes, tradingDays);

      sinaResult.forEach((performance, stockCode) => {
        Object.entries(performance).forEach(([date, pctChg]) => {
          if (result.has(stockCode) && pctChg !== 0) {
            result.get(stockCode)![date] = pctChg;
          }
        });
      });

      await logToDatabase('success', `新浪API数据获取完成`);
    } catch (sinaError) {
      await logToDatabase('error', `新浪API也失败: ${sinaError}`);
    }
  }

  return result;
}

// 保存股票基础信息到数据库
async function saveStocksToDatabase(stocks: Stock[], date: string) {
  const connection = await createDatabaseConnection();
  if (!connection) {
    await logToDatabase('warning', '数据库不可用，跳过保存股票基础信息', { date });
    return;
  }

  try {
    await connection.beginTransaction();

    // 清理当日数据（如果存在）
    await connection.execute('DELETE FROM stocks WHERE date = ?', [date]);

    // 批量插入股票数据
    const stockValues = stocks.map(stock => [
      stock.StockCode,
      stock.StockName,
      stock.ZSName,
      stock.TDType,
      stock.Amount,
      stock.LimitUpTime,
      date
    ]);

    if (stockValues.length > 0) {
      await connection.query(
        'INSERT INTO stocks (stock_code, stock_name, category, td_type, amount, limit_up_time, date) VALUES ?',
        [stockValues]
      );
    }

    await connection.commit();
    await logToDatabase('success', `保存${stocks.length}只股票基础信息到数据库`, { date });

  } catch (error) {
    await connection.rollback();
    await logToDatabase('error', `保存股票基础信息失败: ${error}`, { date });
    throw error;
  } finally {
    await connection.end();
  }
}

// 保存股票表现数据到数据库
async function savePerformanceToDatabase(performanceData: Map<string, Record<string, number>>, baseDate: string, tradingDays: string[]) {
  const connection = await createDatabaseConnection();
  if (!connection) {
    await logToDatabase('warning', '数据库不可用，跳过保存股票表现数据', { baseDate });
    return;
  }

  try {
    await connection.beginTransaction();

    // 清理基准日期的表现数据
    await connection.execute('DELETE FROM stock_performance WHERE base_date = ?', [baseDate]);

    // 批量插入表现数据
    const performanceValues: any[] = [];

    performanceData.forEach((dayData, stockCode) => {
      tradingDays.forEach(tradingDate => {
        const pctChange = dayData[tradingDate];
        if (pctChange !== undefined) {
          performanceValues.push([
            stockCode,
            baseDate,
            tradingDate,
            pctChange
          ]);
        }
      });
    });

    if (performanceValues.length > 0) {
      await connection.query(
        'INSERT INTO stock_performance (stock_code, base_date, performance_date, pct_change) VALUES ?',
        [performanceValues]
      );
    }

    await connection.commit();
    await logToDatabase('success', `保存${performanceValues.length}条股票表现数据到数据库`, { baseDate });

  } catch (error) {
    await connection.rollback();
    await logToDatabase('error', `保存股票表现数据失败: ${error}`, { baseDate });
    throw error;
  } finally {
    await connection.end();
  }
}

// 主要的数据预加载函数
async function preloadStockData(date: string) {
  const startTime = Date.now();

  try {
    await logToDatabase('info', `开始预加载${date}的股票数据`);

    // 1. 获取涨停股票列表
    const stocks = await getLimitUpStocks(date);
    if (stocks.length === 0) {
      await logToDatabase('warning', `${date}没有获取到涨停股票数据`);
      return { success: false, message: '没有获取到股票数据', stocks: 0 };
    }

    // 2. 保存股票基础信息
    await saveStocksToDatabase(stocks, date);

    // 3. 生成交易日
    const tradingDays = generateTradingDays(date, 5);

    // 4. 获取股票表现数据
    const stockCodes = stocks.map(stock => stock.StockCode);
    const performanceData = await getBatchStockPerformance(stockCodes, tradingDays);

    // 5. 保存股票表现数据
    await savePerformanceToDatabase(performanceData, date, tradingDays);

    const duration = Date.now() - startTime;
    await logToDatabase('success', `数据预加载完成`, {
      date,
      stockCount: stocks.length,
      duration: `${duration}ms`,
      tradingDays: tradingDays.length
    });

    return {
      success: true,
      message: `成功预加载${date}的数据`,
      stocks: stocks.length,
      tradingDays: tradingDays.length,
      duration: `${duration}ms`,
      performance_records: Array.from(performanceData.values()).reduce((sum, data) => sum + Object.keys(data).length, 0)
    };

  } catch (error) {
    const duration = Date.now() - startTime;
    await logToDatabase('error', `数据预加载失败: ${error}`, { date, duration: `${duration}ms` });
    return {
      success: false,
      message: `数据预加载失败: ${error}`,
      duration: `${duration}ms`
    };
  }
}

// 手动触发预加载（GET请求用于测试）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    console.log(`[CRON] 手动预加载请求: ${date}`);

    // 尝试执行完整的数据预加载
    const result = await preloadStockData(date);

    return NextResponse.json({
      success: true,
      message: result.success ? result.message : `预加载执行完成（${result.message}）`,
      data: {
        date,
        timestamp: new Date().toISOString(),
        status: result.success ? 'completed' : 'partial',
        mode: 'manual_trigger',
        details: result
      }
    });

  } catch (error) {
    console.error('[CRON] GET请求失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '预加载失败'
    }, { status: 500 });
  }
}

// 定时任务API端点
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'preload';
    const targetDate = searchParams.get('date');

    // 验证请求来源（简单的安全措施）
    const authToken = request.headers.get('authorization');
    const validToken = 'Bearer cron-token-2025';

    if (authToken !== validToken) {
      console.log('[CRON] 未授权的请求');
      return NextResponse.json({
        success: false,
        error: '未授权的请求'
      }, { status: 401 });
    }

    console.log(`[CRON] 定时任务执行: action=${action}, date=${targetDate}`);

    if (action === 'preload') {
      const date = targetDate || new Date().toISOString().split('T')[0];
      const result = await preloadStockData(date);

      return NextResponse.json({
        success: true,
        message: `定时任务执行完成 - ${result.message}`,
        data: {
          action,
          date,
          timestamp: new Date().toISOString(),
          status: result.success ? 'completed' : 'partial',
          details: result
        }
      });

    } else if (action === 'preload_recent') {
      // 预加载最近6天的数据
      const results = [];
      const today = new Date();

      for (let i = 0; i < 6; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        try {
          const result = await preloadStockData(dateStr);
          results.push({
            date: dateStr,
            success: result.success,
            message: result.message,
            stocks: result.stocks || 0,
            performance_records: result.performance_records || 0
          });
        } catch (error) {
          results.push({
            date: dateStr,
            success: false,
            message: String(error),
            stocks: 0,
            performance_records: 0
          });
        }

        // 避免API频率限制
        if (i < 5) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      const totalStocks = results.reduce((sum, r) => sum + r.stocks, 0);
      const totalRecords = results.reduce((sum, r) => sum + r.performance_records, 0);
      const successfulDates = results.filter(r => r.success).length;

      return NextResponse.json({
        success: true,
        message: '批量数据预加载完成',
        data: {
          action,
          results,
          timestamp: new Date().toISOString(),
          processed_dates: results.length,
          successful_dates: successfulDates,
          total_stocks: totalStocks,
          total_performance_records: totalRecords
        }
      });
    }

    return NextResponse.json({
      success: false,
      error: '未知的操作类型'
    }, { status: 400 });

  } catch (error) {
    await logToDatabase('error', `定时任务执行失败: ${error}`);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '服务器内部错误'
    }, { status: 500 });
  }
}