import { useState, useCallback, useRef } from 'react';
import {
  Card, Button, Row, Col, DatePicker, Select, Spin, Table, Tree, message,
  Space, Tag, Descriptions, Statistic, Divider, Typography, Empty, Tooltip
} from 'antd';
import {
  PrinterOutlined, FileExcelOutlined, FilePdfOutlined,
  ReloadOutlined, SendOutlined, EyeOutlined, BarChartOutlined
} from '@ant-design/icons';
import type { DataNode } from 'antd/es/tree';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import {
  getBcxReport, getBchReport, getBcxTT37Report, getBchTT37Report,
  getBhytReport, getSoYtcs, getBhytSummary, getDiseaseStatisticsReport,
  getNcdStatistics, getBillingSummary, getGeneralSummary, getPatientByLevel,
  getUtilityReport, getPharmacyReport, exportReport,
  type ReportFilterParams
} from '../api/report';

const { Title, Text } = Typography;

// ============================================================
// Report tree data structure
// ============================================================

interface ReportItem {
  key: string;
  title: string;
  code: string;
  category: string;
  apiCall: string;        // which API to call
  apiParam?: string;      // parameter for the API
  filterFields: string[]; // which filter fields to show
}

const REPORT_ITEMS: ReportItem[] = [
  // BCX (tuyen xa) Bieu 1-10
  { key: 'bcx-1', title: 'Bieu 1 - Don vi HC, dan so, sinh tu', code: 'BCX-01', category: 'bcx', apiCall: 'bcx', apiParam: '1', filterFields: ['year'] },
  { key: 'bcx-2', title: 'Bieu 2 - Ngan sach TYT', code: 'BCX-02', category: 'bcx', apiCall: 'bcx', apiParam: '2', filterFields: ['year'] },
  { key: 'bcx-3', title: 'Bieu 3 - Nhan luc y te', code: 'BCX-03', category: 'bcx', apiCall: 'bcx', apiParam: '3', filterFields: ['year'] },
  { key: 'bcx-4', title: 'Bieu 4 - Co so vat chat, TTB', code: 'BCX-04', category: 'bcx', apiCall: 'bcx', apiParam: '4', filterFields: ['year'] },
  { key: 'bcx-5', title: 'Bieu 5 - Kham chua benh', code: 'BCX-05', category: 'bcx', apiCall: 'bcx', apiParam: '5', filterFields: ['year'] },
  { key: 'bcx-6', title: 'Bieu 6 - CSSKSS, KHHGD', code: 'BCX-06', category: 'bcx', apiCall: 'bcx', apiParam: '6', filterFields: ['year'] },
  { key: 'bcx-7', title: 'Bieu 7 - Tiem chung mo rong', code: 'BCX-07', category: 'bcx', apiCall: 'bcx', apiParam: '7', filterFields: ['year'] },
  { key: 'bcx-8', title: 'Bieu 8 - Benh truyen nhiem', code: 'BCX-08', category: 'bcx', apiCall: 'bcx', apiParam: '8', filterFields: ['year'] },
  { key: 'bcx-9', title: 'Bieu 9 - Benh khong lay nhiem', code: 'BCX-09', category: 'bcx', apiCall: 'bcx', apiParam: '9', filterFields: ['year'] },
  { key: 'bcx-10', title: 'Bieu 10 - GDSK, VSMT, ATTP', code: 'BCX-10', category: 'bcx', apiCall: 'bcx', apiParam: '10', filterFields: ['year'] },

  // BCX TT37 Bieu 1-8
  { key: 'bcx-tt37-1', title: 'Bieu 1 - Tong hop hoat dong KCB', code: 'TT37X-01', category: 'bcx-tt37', apiCall: 'bcx-tt37', apiParam: '1', filterFields: ['year', 'quarter'] },
  { key: 'bcx-tt37-2', title: 'Bieu 2 - Benh tat (10 benh mac nhieu)', code: 'TT37X-02', category: 'bcx-tt37', apiCall: 'bcx-tt37', apiParam: '2', filterFields: ['year', 'quarter'] },
  { key: 'bcx-tt37-3', title: 'Bieu 3 - Thu thuat', code: 'TT37X-03', category: 'bcx-tt37', apiCall: 'bcx-tt37', apiParam: '3', filterFields: ['year', 'quarter'] },
  { key: 'bcx-tt37-4', title: 'Bieu 4 - Duoc, VTYT', code: 'TT37X-04', category: 'bcx-tt37', apiCall: 'bcx-tt37', apiParam: '4', filterFields: ['year', 'quarter'] },
  { key: 'bcx-tt37-5', title: 'Bieu 5 - CSSKSS', code: 'TT37X-05', category: 'bcx-tt37', apiCall: 'bcx-tt37', apiParam: '5', filterFields: ['year', 'quarter'] },
  { key: 'bcx-tt37-6', title: 'Bieu 6 - Tiem chung', code: 'TT37X-06', category: 'bcx-tt37', apiCall: 'bcx-tt37', apiParam: '6', filterFields: ['year', 'quarter'] },
  { key: 'bcx-tt37-7', title: 'Bieu 7 - Benh truyen nhiem', code: 'TT37X-07', category: 'bcx-tt37', apiCall: 'bcx-tt37', apiParam: '7', filterFields: ['year', 'quarter'] },
  { key: 'bcx-tt37-8', title: 'Bieu 8 - Benh KLN', code: 'TT37X-08', category: 'bcx-tt37', apiCall: 'bcx-tt37', apiParam: '8', filterFields: ['year', 'quarter'] },

  // BCH (tuyen huyen) Bieu 1-16
  { key: 'bch-1', title: 'Bieu 1 - Don vi HC, dan so, tu vong', code: 'BCH-01', category: 'bch', apiCall: 'bch', apiParam: '1', filterFields: ['year'] },
  { key: 'bch-2', title: 'Bieu 2 - Nhan luc y te toan huyen', code: 'BCH-02', category: 'bch', apiCall: 'bch', apiParam: '2', filterFields: ['year'] },
  { key: 'bch-3', title: 'Bieu 3 - KCB toan huyen', code: 'BCH-03', category: 'bch', apiCall: 'bch', apiParam: '3', filterFields: ['year'] },
  { key: 'bch-4', title: 'Bieu 4 - Benh tat toan huyen', code: 'BCH-04', category: 'bch', apiCall: 'bch', apiParam: '4', filterFields: ['year'] },
  { key: 'bch-5', title: 'Bieu 5 - Tai chinh y te', code: 'BCH-05', category: 'bch', apiCall: 'bch', apiParam: '5', filterFields: ['year'] },
  { key: 'bch-6', title: 'Bieu 6 - CSSKSS toan huyen', code: 'BCH-06', category: 'bch', apiCall: 'bch', apiParam: '6', filterFields: ['year'] },
  { key: 'bch-7', title: 'Bieu 7 - Tiem chung toan huyen', code: 'BCH-07', category: 'bch', apiCall: 'bch', apiParam: '7', filterFields: ['year'] },
  { key: 'bch-8', title: 'Bieu 8 - Benh truyen nhiem toan huyen', code: 'BCH-08', category: 'bch', apiCall: 'bch', apiParam: '8', filterFields: ['year'] },
  { key: 'bch-9', title: 'Bieu 9 - Benh KLN toan huyen', code: 'BCH-09', category: 'bch', apiCall: 'bch', apiParam: '9', filterFields: ['year'] },
  { key: 'bch-10', title: 'Bieu 10 - GDSK, VSMT, ATTP toan huyen', code: 'BCH-10', category: 'bch', apiCall: 'bch', apiParam: '10', filterFields: ['year'] },
  { key: 'bch-11', title: 'Bieu 11 - HIV/AIDS, ma tuy', code: 'BCH-11', category: 'bch', apiCall: 'bch', apiParam: '11', filterFields: ['year'] },
  { key: 'bch-12', title: 'Bieu 12 - Dinh duong', code: 'BCH-12', category: 'bch', apiCall: 'bch', apiParam: '12', filterFields: ['year'] },
  { key: 'bch-13', title: 'Bieu 13 - Tai nan thuong tich', code: 'BCH-13', category: 'bch', apiCall: 'bch', apiParam: '13', filterFields: ['year'] },
  { key: 'bch-14', title: 'Bieu 14 - Nguoi cao tuoi', code: 'BCH-14', category: 'bch', apiCall: 'bch', apiParam: '14', filterFields: ['year'] },
  { key: 'bch-15', title: 'Bieu 15 - Truong hoc', code: 'BCH-15', category: 'bch', apiCall: 'bch', apiParam: '15', filterFields: ['year'] },
  { key: 'bch-16', title: 'Bieu 16 - Tong hop chi tieu', code: 'BCH-16', category: 'bch', apiCall: 'bch', apiParam: '16', filterFields: ['year'] },

  // BCH TT37 Bieu 1-14
  ...Array.from({ length: 14 }, (_, i) => ({
    key: `bch-tt37-${i + 1}`,
    title: `Bieu ${i + 1} - Bao cao TT37 huyen`,
    code: `TT37H-${String(i + 1).padStart(2, '0')}`,
    category: 'bch-tt37',
    apiCall: 'bch-tt37',
    apiParam: String(i + 1),
    filterFields: ['year', 'quarter'],
  })),

  // BHYT Reports
  { key: 'bhyt-mau19', title: 'Mau 19 - Bang ke chi phi KCB ngoai tru', code: 'BHYT-M19', category: 'bhyt', apiCall: 'bhyt', apiParam: 'mau19', filterFields: ['year', 'month'] },
  { key: 'bhyt-mau20', title: 'Mau 20 - Bang ke chi phi KCB noi tru', code: 'BHYT-M20', category: 'bhyt', apiCall: 'bhyt', apiParam: 'mau20', filterFields: ['year', 'month'] },
  { key: 'bhyt-mau21', title: 'Mau 21 - Tong hop chi phi KCB BHYT', code: 'BHYT-M21', category: 'bhyt', apiCall: 'bhyt', apiParam: 'mau21', filterFields: ['year', 'month'] },
  { key: 'bhyt-mau79', title: 'Mau 79 - Tong hop thanh toan chi phi', code: 'BHYT-M79', category: 'bhyt', apiCall: 'bhyt', apiParam: 'mau79', filterFields: ['year', 'quarter'] },
  { key: 'bhyt-mau80', title: 'Mau 80 - Chi tiet chi phi theo nguon', code: 'BHYT-M80', category: 'bhyt', apiCall: 'bhyt', apiParam: 'mau80', filterFields: ['year', 'month'] },
  { key: 'bhyt-mau14a', title: 'Mau 14A - Danh sach BN KCB BHYT', code: 'BHYT-14A', category: 'bhyt', apiCall: 'bhyt', apiParam: 'mau14a', filterFields: ['year', 'month'] },
  { key: 'bhyt-tk371', title: 'TK37.1 - Thong ke tien KCB BHYT', code: 'BHYT-TK371', category: 'bhyt', apiCall: 'bhyt', apiParam: 'tk371', filterFields: ['year'] },

  // So YTCS (A1-A12)
  { key: 'so-a1', title: 'A1 - So kham benh', code: 'SO-A1', category: 'so-ytcs', apiCall: 'so-ytcs', apiParam: 'A1', filterFields: ['year'] },
  { key: 'so-a2', title: 'A2 - So KHHGD', code: 'SO-A2', category: 'so-ytcs', apiCall: 'so-ytcs', apiParam: 'A2', filterFields: ['year'] },
  { key: 'so-a3', title: 'A3 - So phong chong sot ret', code: 'SO-A3', category: 'so-ytcs', apiCall: 'so-ytcs', apiParam: 'A3', filterFields: ['year'] },
  { key: 'so-a4', title: 'A4 - So theo doi BN tam than', code: 'SO-A4', category: 'so-ytcs', apiCall: 'so-ytcs', apiParam: 'A4', filterFields: ['year'] },
  { key: 'so-a5', title: 'A5 - So quan ly benh lao', code: 'SO-A5', category: 'so-ytcs', apiCall: 'so-ytcs', apiParam: 'A5', filterFields: ['year'] },
  { key: 'so-a6', title: 'A6 - So theo doi HIV/AIDS', code: 'SO-A6', category: 'so-ytcs', apiCall: 'so-ytcs', apiParam: 'A6', filterFields: ['year'] },
  { key: 'so-a7', title: 'A7 - So quan ly benh KLN', code: 'SO-A7', category: 'so-ytcs', apiCall: 'so-ytcs', apiParam: 'A7', filterFields: ['year'] },
  { key: 'so-a8', title: 'A8 - So thu thuat', code: 'SO-A8', category: 'so-ytcs', apiCall: 'so-ytcs', apiParam: 'A8', filterFields: ['year'] },
  { key: 'so-a9', title: 'A9 - So chan doan hinh anh', code: 'SO-A9', category: 'so-ytcs', apiCall: 'so-ytcs', apiParam: 'A9', filterFields: ['year'] },
  { key: 'so-a10', title: 'A10 - So xet nghiem', code: 'SO-A10', category: 'so-ytcs', apiCall: 'so-ytcs', apiParam: 'A10', filterFields: ['year'] },
  { key: 'so-a11', title: 'A11 - So tiem chung', code: 'SO-A11', category: 'so-ytcs', apiCall: 'so-ytcs', apiParam: 'A11', filterFields: ['year'] },
  { key: 'so-a12', title: 'A12 - So tu vong', code: 'SO-A12', category: 'so-ytcs', apiCall: 'so-ytcs', apiParam: 'A12', filterFields: ['year'] },

  // Thong ke KCB
  { key: 'stat-general', title: 'Tong hop hoat dong', code: 'TK-TH', category: 'thongke', apiCall: 'general-summary', filterFields: ['year'] },
  { key: 'stat-disease', title: 'Thong ke benh tat', code: 'TK-BT', category: 'thongke', apiCall: 'disease-statistics', filterFields: ['year'] },
  { key: 'stat-ncd', title: 'Benh khong lay nhiem', code: 'TK-KLN', category: 'thongke', apiCall: 'ncd-statistics', filterFields: ['year'] },
  { key: 'stat-billing', title: 'Thu vien phi', code: 'TK-VP', category: 'thongke', apiCall: 'billing-summary', filterFields: ['year', 'month'] },
  { key: 'stat-bhyt-summary', title: 'Tong hop BHYT', code: 'TK-BHYT', category: 'thongke', apiCall: 'bhyt-summary', filterFields: ['year', 'month'] },
  { key: 'stat-patient-level', title: 'BN theo tuyen', code: 'TK-BN', category: 'thongke', apiCall: 'patient-by-level', filterFields: ['year'] },
  { key: 'stat-utility', title: 'Tien ich co so', code: 'TK-TI', category: 'thongke', apiCall: 'utility', filterFields: ['year'] },

  // Duoc pham
  { key: 'pharma-report', title: 'Bao cao duoc pham', code: 'DP-BC', category: 'pharmacy', apiCall: 'pharmacy', filterFields: ['year', 'month'] },
];

// ---- Build tree ----

const TREE_DATA: DataNode[] = [
  {
    title: 'Bao cao tuyen xa (BCX)',
    key: 'cat-bcx',
    children: REPORT_ITEMS.filter(r => r.category === 'bcx').map(r => ({ key: r.key, title: `${r.code}: ${r.title}`, isLeaf: true })),
  },
  {
    title: 'BCX theo TT37',
    key: 'cat-bcx-tt37',
    children: REPORT_ITEMS.filter(r => r.category === 'bcx-tt37').map(r => ({ key: r.key, title: `${r.code}: ${r.title}`, isLeaf: true })),
  },
  {
    title: 'Bao cao tuyen huyen (BCH)',
    key: 'cat-bch',
    children: REPORT_ITEMS.filter(r => r.category === 'bch').map(r => ({ key: r.key, title: `${r.code}: ${r.title}`, isLeaf: true })),
  },
  {
    title: 'BCH theo TT37',
    key: 'cat-bch-tt37',
    children: REPORT_ITEMS.filter(r => r.category === 'bch-tt37').map(r => ({ key: r.key, title: `${r.code}: ${r.title}`, isLeaf: true })),
  },
  {
    title: 'Bao cao BHYT',
    key: 'cat-bhyt',
    children: REPORT_ITEMS.filter(r => r.category === 'bhyt').map(r => ({ key: r.key, title: `${r.code}: ${r.title}`, isLeaf: true })),
  },
  {
    title: 'So YTCS (A1-A12)',
    key: 'cat-so-ytcs',
    children: REPORT_ITEMS.filter(r => r.category === 'so-ytcs').map(r => ({ key: r.key, title: `${r.code}: ${r.title}`, isLeaf: true })),
  },
  {
    title: 'Thong ke KCB',
    key: 'cat-thongke',
    children: REPORT_ITEMS.filter(r => r.category === 'thongke').map(r => ({ key: r.key, title: `${r.code}: ${r.title}`, isLeaf: true })),
  },
  {
    title: 'Bao cao duoc pham',
    key: 'cat-pharmacy',
    children: REPORT_ITEMS.filter(r => r.category === 'pharmacy').map(r => ({ key: r.key, title: `${r.code}: ${r.title}`, isLeaf: true })),
  },
];

// ============================================================
// Component
// ============================================================

export default function Reports() {
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [year, setYear] = useState<number>(dayjs().year());
  const [month, setMonth] = useState<number>(dayjs().month() + 1);
  const [quarter, setQuarter] = useState<number>(Math.ceil((dayjs().month() + 1) / 3));
  const [reportData, setReportData] = useState<Record<string, unknown> | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const buildFilter = useCallback((): ReportFilterParams => {
    const f: ReportFilterParams = { year };
    if (selectedReport?.filterFields.includes('month')) f.month = month;
    if (selectedReport?.filterFields.includes('quarter')) f.quarter = quarter;
    return f;
  }, [year, month, quarter, selectedReport]);

  const fetchReport = useCallback(async () => {
    if (!selectedReport) return;
    setLoading(true);
    setReportData(null);
    try {
      const filter = buildFilter();
      let res;
      switch (selectedReport.apiCall) {
        case 'bcx': res = await getBcxReport(Number(selectedReport.apiParam), filter); break;
        case 'bch': res = await getBchReport(Number(selectedReport.apiParam), filter); break;
        case 'bcx-tt37': res = await getBcxTT37Report(Number(selectedReport.apiParam), filter); break;
        case 'bch-tt37': res = await getBchTT37Report(Number(selectedReport.apiParam), filter); break;
        case 'bhyt': res = await getBhytReport(selectedReport.apiParam!, filter); break;
        case 'so-ytcs': res = await getSoYtcs(selectedReport.apiParam!, filter); break;
        case 'bhyt-summary': res = await getBhytSummary(filter); break;
        case 'disease-statistics': res = await getDiseaseStatisticsReport(filter); break;
        case 'ncd-statistics': res = await getNcdStatistics(filter); break;
        case 'billing-summary': res = await getBillingSummary(filter); break;
        case 'general-summary': res = await getGeneralSummary(filter); break;
        case 'patient-by-level': res = await getPatientByLevel(filter); break;
        case 'utility': res = await getUtilityReport(filter); break;
        case 'pharmacy': res = await getPharmacyReport(filter); break;
        default: message.warning('API chua ho tro'); return;
      }
      setReportData(res.data as Record<string, unknown>);
    } catch {
      message.warning('Khong the tai bao cao');
    } finally {
      setLoading(false);
    }
  }, [selectedReport, buildFilter]);

  const handleExport = async (format: 'excel' | 'pdf') => {
    if (!selectedReport) return;
    try {
      const res = await exportReport({
        format,
        reportType: selectedReport.key,
        filter: buildFilter(),
      });
      if (res.data instanceof Blob && res.data.size > 0) {
        const url = window.URL.createObjectURL(res.data);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedReport.code}_${year}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
        a.click();
        window.URL.revokeObjectURL(url);
        message.success('Tai file thanh cong');
      } else {
        message.info('Chuc nang xuat file dang phat trien');
      }
    } catch {
      message.warning('Khong the xuat file');
    }
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const printWin = window.open('', '_blank');
    if (!printWin) return;
    printWin.document.write(`
      <html><head><title>${selectedReport?.title ?? 'Bao cao'}</title>
      <style>body{font-family:serif;padding:20px}table{width:100%;border-collapse:collapse}
      th,td{border:1px solid #333;padding:6px 8px;text-align:left;font-size:13px}
      th{background:#f0f0f0;font-weight:bold}h2{text-align:center}
      @media print{body{padding:0}}</style></head><body>
      ${printRef.current.innerHTML}</body></html>
    `);
    printWin.document.close();
    printWin.print();
  };

  const onTreeSelect = (keys: React.Key[]) => {
    if (keys.length === 0) return;
    const key = keys[0] as string;
    const item = REPORT_ITEMS.find(r => r.key === key);
    if (item) {
      setSelectedReport(item);
      setReportData(null);
    }
  };

  // ---- Render report data ----

  const renderReportContent = () => {
    if (!reportData) return null;
    const data = reportData;

    // If data has 'items' array, render as table
    if (Array.isArray(data.items) && data.items.length > 0) {
      return renderItemsTable(data.items as Record<string, unknown>[]);
    }

    // If data has 'records' array (So YTCS)
    if (Array.isArray(data.records) && data.records.length > 0) {
      return renderRecordsTable(data as Record<string, unknown>);
    }

    // If data has 'topDiseases' array
    if (Array.isArray(data.topDiseases)) {
      return renderDiseasesTable(data.topDiseases as Record<string, unknown>[]);
    }

    // If data has 'diseases' array
    if (Array.isArray(data.diseases)) {
      return renderDiseasesTable(data.diseases as Record<string, unknown>[]);
    }

    // If data has 'monthlyData' array
    if (Array.isArray(data.monthlyData)) {
      return renderMonthlyTable(data as Record<string, unknown>);
    }

    // If data has 'vaccineData' array
    if (Array.isArray(data.vaccineData)) {
      return renderVaccineTable(data.vaccineData as Record<string, unknown>[]);
    }

    // If data has 'details' array
    if (Array.isArray(data.details)) {
      return renderDetailsTable(data.details as Record<string, unknown>[]);
    }

    // If data has 'indicators' array
    if (Array.isArray(data.indicators)) {
      return renderIndicatorsTable(data.indicators as Record<string, unknown>[]);
    }

    // If data has 'categoryBreakdown' array
    if (Array.isArray(data.categoryBreakdown)) {
      return renderCategoryBreakdown(data as Record<string, unknown>);
    }

    // If data has 'diseaseGroups' array (NCD)
    if (Array.isArray(data.diseaseGroups)) {
      return renderNcdTable(data as Record<string, unknown>);
    }

    // Default: render as Descriptions
    return renderDescriptions(data);
  };

  const renderItemsTable = (items: Record<string, unknown>[]) => {
    if (items.length === 0) return <Empty description="Khong co du lieu" />;
    const cols = Object.keys(items[0]).filter(k => k !== 'extraFields').map(k => ({
      title: formatColumnTitle(k), dataIndex: k, key: k,
      render: (v: unknown) => formatCellValue(v),
    }));
    return <Table dataSource={items} columns={cols} rowKey={(_, i) => String(i)} size="small" scroll={{ x: 'max-content' }} pagination={{ pageSize: 50 }} />;
  };

  const renderRecordsTable = (data: Record<string, unknown>) => {
    const records = data.records as Record<string, unknown>[];
    const soName = data.soName as string || '';
    const totalRecords = data.totalRecords as number || 0;

    const columns: ColumnsType<Record<string, unknown>> = [
      { title: 'STT', dataIndex: 'stt', key: 'stt', width: 60 },
      { title: 'Ngay', dataIndex: 'recordDate', key: 'recordDate', width: 110, render: v => v ? dayjs(v as string).format('DD/MM/YYYY') : '' },
      { title: 'Ho ten', dataIndex: 'patientName', key: 'patientName', width: 180 },
      { title: 'Gioi', dataIndex: 'gender', key: 'gender', width: 60, render: v => v === 1 ? 'Nam' : v === 2 ? 'Nu' : '' },
      { title: 'Dia chi', dataIndex: 'address', key: 'address', width: 200 },
      { title: 'Chan doan', dataIndex: 'diagnosis', key: 'diagnosis', width: 200 },
      { title: 'Dieu tri', dataIndex: 'treatment', key: 'treatment', width: 200 },
      { title: 'Ket qua', dataIndex: 'result', key: 'result', width: 120 },
      { title: 'Ghi chu', dataIndex: 'notes', key: 'notes', width: 150 },
    ];

    return (
      <>
        <Descriptions column={2} size="small" style={{ marginBottom: 12 }}>
          <Descriptions.Item label="Loai so">{soName}</Descriptions.Item>
          <Descriptions.Item label="Tong so ban ghi">{totalRecords}</Descriptions.Item>
        </Descriptions>
        <Table dataSource={records} columns={columns} rowKey={(_, i) => String(i)} size="small" scroll={{ x: 'max-content' }} pagination={{ pageSize: 50 }} />
      </>
    );
  };

  const renderDiseasesTable = (diseases: Record<string, unknown>[]) => {
    const columns: ColumnsType<Record<string, unknown>> = [
      { title: 'Ma ICD', dataIndex: 'icdCode', key: 'icdCode', width: 90 },
      { title: 'Ten benh', dataIndex: 'diseaseName', key: 'diseaseName', width: 250 },
      { title: 'So ca', dataIndex: 'cases', key: 'cases', width: 90, render: v => v ?? (diseases[0] as Record<string, unknown>).caseCount },
      { title: 'Tu vong', dataIndex: 'deaths', key: 'deaths', width: 90 },
      { title: 'Duoi 5 tuoi', dataIndex: 'under5Cases', key: 'under5Cases', width: 100 },
    ];
    // Also handle caseCount field
    if (diseases[0] && 'caseCount' in diseases[0]) {
      columns[2] = { title: 'So ca', dataIndex: 'caseCount', key: 'caseCount', width: 90 };
    }
    return <Table dataSource={diseases} columns={columns} rowKey={(_, i) => String(i)} size="small" pagination={false} />;
  };

  const renderMonthlyTable = (data: Record<string, unknown>) => {
    const monthly = data.monthlyData as Record<string, unknown>[];
    const cols = monthly.length > 0 ? Object.keys(monthly[0]).map(k => ({
      title: formatColumnTitle(k), dataIndex: k, key: k,
      render: (v: unknown) => formatCellValue(v),
    })) : [];
    return (
      <>
        {renderDescriptions(data, ['monthlyData', 'quarterlyData', 'items'])}
        <Divider orientation="left" style={{ fontSize: 14 }}>Du lieu theo thang</Divider>
        <Table dataSource={monthly} columns={cols} rowKey={(_, i) => String(i)} size="small" pagination={false} />
      </>
    );
  };

  const renderVaccineTable = (vaccines: Record<string, unknown>[]) => {
    const columns: ColumnsType<Record<string, unknown>> = [
      { title: 'Vac xin', dataIndex: 'vaccineName', key: 'vaccineName', width: 200 },
      { title: 'Mui 1', dataIndex: 'dose1', key: 'dose1', width: 80 },
      { title: 'Mui 2', dataIndex: 'dose2', key: 'dose2', width: 80 },
      { title: 'Mui 3', dataIndex: 'dose3', key: 'dose3', width: 80 },
      { title: 'Mui 4', dataIndex: 'dose4', key: 'dose4', width: 80 },
      { title: 'Nhac lai', dataIndex: 'booster', key: 'booster', width: 80 },
      { title: 'Ty le (%)', dataIndex: 'coveragePercent', key: 'coveragePercent', width: 100 },
    ];
    return <Table dataSource={vaccines} columns={columns} rowKey={(_, i) => String(i)} size="small" pagination={false} />;
  };

  const renderDetailsTable = (details: Record<string, unknown>[]) => {
    if (details.length === 0) return <Empty description="Khong co du lieu chi tiet" />;
    const cols = Object.keys(details[0]).map(k => ({
      title: formatColumnTitle(k), dataIndex: k, key: k,
      render: (v: unknown) => formatCellValue(v),
    }));
    return <Table dataSource={details} columns={cols} rowKey={(_, i) => String(i)} size="small" pagination={false} />;
  };

  const renderIndicatorsTable = (indicators: Record<string, unknown>[]) => {
    const columns: ColumnsType<Record<string, unknown>> = [
      { title: 'Ma', dataIndex: 'indicatorCode', key: 'indicatorCode', width: 100 },
      { title: 'Chi tieu', dataIndex: 'indicatorName', key: 'indicatorName', width: 250 },
      { title: 'Don vi', dataIndex: 'unit', key: 'unit', width: 80 },
      { title: 'Ke hoach', dataIndex: 'target', key: 'target', width: 100, render: v => formatCellValue(v) },
      { title: 'Thuc hien', dataIndex: 'achieved', key: 'achieved', width: 100, render: v => formatCellValue(v) },
      { title: 'Ty le (%)', dataIndex: 'achievementRate', key: 'achievementRate', width: 100, render: v => formatCellValue(v) },
    ];
    return <Table dataSource={indicators} columns={columns} rowKey={(_, i) => String(i)} size="small" pagination={false} />;
  };

  const renderCategoryBreakdown = (data: Record<string, unknown>) => {
    const breakdown = data.categoryBreakdown as Record<string, unknown>[];
    const columns: ColumnsType<Record<string, unknown>> = [
      { title: 'Nhom', dataIndex: 'category', key: 'category', width: 150 },
      { title: 'Tong', dataIndex: 'amount', key: 'amount', width: 150, render: v => formatCurrency(v as number) },
      { title: 'BHYT', dataIndex: 'bhytAmount', key: 'bhytAmount', width: 150, render: v => formatCurrency(v as number) },
      { title: 'BN tra', dataIndex: 'patientAmount', key: 'patientAmount', width: 150, render: v => formatCurrency(v as number) },
    ];
    return (
      <>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}><Statistic title="Tong doanh thu" value={data.totalRevenue as number || 0} precision={0} suffix="d" /></Col>
          <Col span={6}><Statistic title="BHYT" value={data.bhytRevenue as number || 0} precision={0} suffix="d" /></Col>
          <Col span={6}><Statistic title="Vien phi" value={data.feeRevenue as number || 0} precision={0} suffix="d" /></Col>
          <Col span={6}><Statistic title="So phieu" value={data.totalReceipts as number || 0} /></Col>
        </Row>
        <Table dataSource={breakdown} columns={columns} rowKey={(_, i) => String(i)} size="small" pagination={false} />
      </>
    );
  };

  const renderNcdTable = (data: Record<string, unknown>) => {
    const groups = data.diseaseGroups as Record<string, unknown>[];
    const columns: ColumnsType<Record<string, unknown>> = [
      { title: 'Loai benh', dataIndex: 'diseaseType', key: 'diseaseType', width: 200 },
      { title: 'Dang ky', dataIndex: 'registered', key: 'registered', width: 100 },
      { title: 'Ca moi', dataIndex: 'newCases', key: 'newCases', width: 100 },
      { title: 'Dang quan ly', dataIndex: 'managed', key: 'managed', width: 120 },
      { title: 'Kiem soat tot', dataIndex: 'controlled', key: 'controlled', width: 120 },
    ];
    return (
      <>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}><Statistic title="Tong dang ky" value={data.totalRegistered as number || 0} /></Col>
          <Col span={6}><Statistic title="Ca moi" value={data.newCases as number || 0} /></Col>
          <Col span={6}><Statistic title="Dang quan ly" value={data.activelyManaged as number || 0} /></Col>
          <Col span={6}><Statistic title="Kiem soat tot" value={data.controlledWell as number || 0} /></Col>
        </Row>
        <Table dataSource={groups} columns={columns} rowKey={(_, i) => String(i)} size="small" pagination={false} />
      </>
    );
  };

  const renderDescriptions = (data: Record<string, unknown>, excludeKeys: string[] = []) => {
    const skipKeys = ['year', 'month', 'quarter', ...excludeKeys];
    const entries = Object.entries(data).filter(
      ([k, v]) => !skipKeys.includes(k) && !Array.isArray(v) && typeof v !== 'object'
    );

    if (entries.length === 0) return null;

    return (
      <Descriptions column={2} bordered size="small" style={{ marginBottom: 16 }}>
        {entries.map(([k, v]) => (
          <Descriptions.Item key={k} label={formatColumnTitle(k)}>
            {typeof v === 'number' ? (
              k.toLowerCase().includes('amount') || k.toLowerCase().includes('revenue') ||
              k.toLowerCase().includes('expense') || k.toLowerCase().includes('budget') ||
              k.toLowerCase().includes('value') || k.toLowerCase().includes('fee') ||
              k.toLowerCase().includes('pay') || k.toLowerCase().includes('total') && (v as number) > 1000
                ? formatCurrency(v) : String(v)
            ) : typeof v === 'boolean' ? (v ? 'Co' : 'Khong') : String(v ?? '')}
          </Descriptions.Item>
        ))}
      </Descriptions>
    );
  };

  // ---- Helpers ----

  const formatColumnTitle = (key: string): string => {
    const map: Record<string, string> = {
      stt: 'STT', patientName: 'Ho ten', insuranceNumber: 'So BHYT', mainDiagnosis: 'Chan doan',
      icdCode: 'Ma ICD', examDate: 'Ngay kham', examFee: 'Tien kham', medicineFee: 'Tien thuoc',
      labFee: 'Tien XN', imagingFee: 'Tien CDHA', procedureFee: 'Tien TT', bedFee: 'Tien giuong',
      otherFee: 'Khac', totalFee: 'Tong cong', bhytPay: 'BHYT chi tra', patientPay: 'BN chi tra',
      month: 'Thang', visits: 'Luot kham', outpatient: 'Ngoai tru', inpatient: 'Noi tru',
      emergency: 'Cap cuu', facilityName: 'Co so', year: 'Nam', totalPopulation: 'Dan so',
      malePopulation: 'Nam', femalePopulation: 'Nu', totalHouseholds: 'So ho',
      totalBirths: 'Sinh', totalDeaths: 'Tu vong', birthRate: 'Ty le sinh', deathRate: 'Ty le chet',
      vaccineName: 'Vac xin', dose1: 'Mui 1', dose2: 'Mui 2', dose3: 'Mui 3',
      diseaseName: 'Ten benh', cases: 'So ca', deaths: 'Tu vong', caseCount: 'So ca',
      diseaseType: 'Loai benh', totalRegistered: 'Dang ky', newCases: 'Ca moi',
      managed: 'Quan ly', controlled: 'Kiem soat', category: 'Nhom', amount: 'So tien',
      bhytAmount: 'BHYT', patientAmount: 'BN tra', revenue: 'Doanh thu',
      totalAmount: 'Tong', totalRevenue: 'Tong doanh thu', bhytRevenue: 'BHYT',
      feeRevenue: 'Vien phi', totalStaff: 'Tong CBYT', doctors: 'Bac si',
      nurses: 'Dieu duong', pharmacists: 'Duoc si', midwives: 'Ho sinh',
      totalVisits: 'Tong luot kham', outpatientVisits: 'Ngoai tru',
      inpatientAdmissions: 'Noi tru', referralUp: 'Chuyen tuyen',
      admissionDate: 'Ngay nhap vien', dischargeDate: 'Ngay xuat vien',
      lengthOfStay: 'So ngay DT', surgeryFee: 'Tien PT', bloodFee: 'Tien mau',
      gender: 'Gioi tinh', dateOfBirth: 'Ngay sinh', address: 'Dia chi',
      totalMedicineTypes: 'Loai thuoc', totalMedicineValue: 'Gia tri ton kho',
      expiredItems: 'Het han', nearExpiryItems: 'Sap het han',
      bedOccupancyRate: 'CS giuong (%)', avgLengthOfStay: 'SNGDT TB',
      totalBeds: 'Tong giuong', occupiedBeds: 'Dang su dung',
    };
    return map[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
  };

  const formatCellValue = (v: unknown): string => {
    if (v === null || v === undefined) return '';
    if (typeof v === 'boolean') return v ? 'Co' : 'Khong';
    if (typeof v === 'number') return v.toLocaleString('vi-VN');
    if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}/.test(v)) return dayjs(v).format('DD/MM/YYYY');
    return String(v);
  };

  const formatCurrency = (v: number): string => {
    if (!v) return '0';
    return v.toLocaleString('vi-VN') + ' d';
  };

  // ============================================================
  // Render
  // ============================================================

  return (
    <Spin spinning={loading}>
      <Row gutter={16} style={{ height: 'calc(100vh - 140px)' }}>
        {/* Left sidebar: Report tree */}
        <Col xs={24} lg={7} style={{ height: '100%', overflow: 'auto' }}>
          <Card
            title={<><BarChartOutlined /> Danh muc bao cao</>}
            size="small"
            styles={{ body: { padding: '8px 0', maxHeight: 'calc(100vh - 210px)', overflow: 'auto' } }}
          >
            <Tree
              treeData={TREE_DATA}
              onSelect={onTreeSelect}
              selectedKeys={selectedReport ? [selectedReport.key] : []}
              defaultExpandedKeys={['cat-bcx']}
              showLine
              blockNode
              style={{ fontSize: 13 }}
            />
          </Card>
        </Col>

        {/* Right panel: Filter + Report content */}
        <Col xs={24} lg={17} style={{ height: '100%', overflow: 'auto' }}>
          <Card
            title={
              selectedReport ? (
                <Space>
                  <Tag color="blue">{selectedReport.code}</Tag>
                  <span>{selectedReport.title}</span>
                </Space>
              ) : 'Chon bao cao tu danh muc ben trai'
            }
            size="small"
            extra={selectedReport ? (
              <Space>
                <Tooltip title="Xem bao cao"><Button type="primary" icon={<EyeOutlined />} onClick={fetchReport}>Xem bao cao</Button></Tooltip>
                <Tooltip title="Xuat Excel"><Button icon={<FileExcelOutlined />} onClick={() => handleExport('excel')}>Excel</Button></Tooltip>
                <Tooltip title="Xuat PDF"><Button icon={<FilePdfOutlined />} onClick={() => handleExport('pdf')}>PDF</Button></Tooltip>
                <Tooltip title="In bao cao"><Button icon={<PrinterOutlined />} onClick={handlePrint}>In</Button></Tooltip>
                <Tooltip title="Gui tuyen tren"><Button icon={<SendOutlined />} onClick={() => message.info('Chuc nang gui tuyen tren dang phat trien')}>Gui</Button></Tooltip>
              </Space>
            ) : null}
          >
            {selectedReport ? (
              <>
                {/* Filter bar */}
                <div style={{ marginBottom: 16, padding: '12px 16px', background: '#fafafa', borderRadius: 6 }}>
                  <Space size="middle">
                    <Text strong>Bo loc:</Text>
                    {selectedReport.filterFields.includes('year') && (
                      <Select
                        value={year} onChange={setYear} style={{ width: 100 }}
                        options={Array.from({ length: 6 }, (_, i) => ({ value: dayjs().year() - i, label: String(dayjs().year() - i) }))}
                      />
                    )}
                    {selectedReport.filterFields.includes('month') && (
                      <Select
                        value={month} onChange={setMonth} style={{ width: 120 }}
                        options={Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `Thang ${i + 1}` }))}
                      />
                    )}
                    {selectedReport.filterFields.includes('quarter') && (
                      <Select
                        value={quarter} onChange={setQuarter} style={{ width: 100 }}
                        options={[{ value: 1, label: 'Quy 1' }, { value: 2, label: 'Quy 2' }, { value: 3, label: 'Quy 3' }, { value: 4, label: 'Quy 4' }]}
                      />
                    )}
                    <Button icon={<ReloadOutlined />} onClick={fetchReport}>Tai lai</Button>
                  </Space>
                </div>

                {/* Report content */}
                <div ref={printRef}>
                  {reportData ? (
                    <>
                      <Title level={4} style={{ textAlign: 'center', marginBottom: 4 }}>
                        {selectedReport.title}
                      </Title>
                      <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 16 }}>
                        {selectedReport.filterFields.includes('quarter') && `Quy ${quarter}/`}
                        {selectedReport.filterFields.includes('month') && `Thang ${month}/`}
                        Nam {year}
                      </Text>
                      {renderReportContent()}
                    </>
                  ) : (
                    <Empty
                      description="Nhan 'Xem bao cao' de tai du lieu"
                      style={{ padding: 48 }}
                    />
                  )}
                </div>
              </>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span style={{ color: '#999' }}>
                    Chon mot bao cao tu danh muc ben trai de bat dau.
                    <br />
                    He thong ho tro 41+ mau bao cao: BCX, BCH, TT37, BHYT, So YTCS, Thong ke KCB, Duoc pham.
                  </span>
                }
                style={{ padding: 80 }}
              />
            )}
          </Card>
        </Col>
      </Row>
    </Spin>
  );
}
