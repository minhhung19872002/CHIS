import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Tag, Spin, message, Modal, Tabs, Input, Space, Form, Row, Col, DatePicker, Select, InputNumber, Statistic, Descriptions } from 'antd';
import { SearchOutlined, ReloadOutlined, PlusOutlined, PrinterOutlined, BarcodeOutlined, SendOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { immunizationApi } from '../api/immunization';
import type {
  ImmunizationSubjectDto, VaccinationRecordDto, VaccineDto, VaccineStockDto,
  VaccineStockIssueDto, ImmunReportDto, ChildAgeStatsDto, NutritionMeasurementDto,
} from '../api/immunization';

const ISSUE_TYPES = [
  { value: 'Return', label: 'Xuat tra' },
  { value: 'Destroy', label: 'Xuat huy' },
  { value: 'Inspection', label: 'Xuat kiem dinh' },
  { value: 'Usage', label: 'Xuat su dung' },
];

const REPORT_CODES = [
  { value: '02-01', label: '02-01: BC tiem chung hang thang' },
  { value: '02-02', label: '02-02: Theo doi doi tuong TC' },
  { value: '02-03', label: '02-03: Lich tiem chung' },
  { value: '03-01', label: '03-01: Su dung vac xin' },
  { value: '03-02', label: '03-02: Nhu cau vac xin quy' },
  { value: '03-03', label: '03-03: Bao quan vac xin' },
  { value: '04-01', label: '04-01: Giam sat phan ung sau tiem' },
  { value: '04-02', label: '04-02: Tai bien nang sau tiem' },
  { value: '05-01', label: '05-01: Truyen thong TCMR' },
  { value: '05-19', label: '05/19: Tong hop tiem chung nam' },
  { value: '06-01', label: '06-01: Dinh duong - Can nang' },
  { value: '04/19-TCMR', label: '04/19-TCMR: Giam sat TCMR' },
];

export default function Immunization() {
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState<ImmunizationSubjectDto[]>([]);
  const [total, setTotal] = useState(0);
  const [vaccines, setVaccines] = useState<VaccineDto[]>([]);
  const [stock, setStock] = useState<VaccineStockDto[]>([]);
  const [vaccinations, setVaccinations] = useState<VaccinationRecordDto[]>([]);
  const [selected, setSelected] = useState<ImmunizationSubjectDto | null>(null);
  const [keyword, setKeyword] = useState('');
  const [subjectModal, setSubjectModal] = useState(false);
  const [vaccinateModal, setVaccinateModal] = useState(false);
  const [subjectForm] = Form.useForm();
  const [vaccinateForm] = Form.useForm();

  // Vaccine stock issues state
  const [stockIssues, setStockIssues] = useState<VaccineStockIssueDto[]>([]);
  const [stockIssueTotal, setStockIssueTotal] = useState(0);
  const [issueTypeFilter, setIssueTypeFilter] = useState<string | undefined>(undefined);
  const [issueModal, setIssueModal] = useState(false);
  const [issueForm] = Form.useForm();

  // Reports state
  const [reportCode, setReportCode] = useState('02-01');
  const [reportYear, setReportYear] = useState(dayjs().year());
  const [reportMonth, setReportMonth] = useState<number | undefined>(dayjs().month() + 1);
  const [reportData, setReportData] = useState<ImmunReportDto | null>(null);

  // Child stats
  const [childStats, setChildStats] = useState<ChildAgeStatsDto | null>(null);

  // Nutrition state
  const [nutritionData, setNutritionData] = useState<NutritionMeasurementDto[]>([]);

  const fetchSubjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await immunizationApi.getSubjects({ keyword, pageSize: 30 });
      setSubjects(res.data.items || []);
      setTotal(res.data.totalCount || 0);
    } catch { setSubjects([]); } finally { setLoading(false); }
  }, [keyword]);

  const fetchVaccines = useCallback(async () => {
    try { const res = await immunizationApi.getVaccines(); setVaccines(res.data || []); } catch { setVaccines([]); }
  }, []);

  const fetchStock = useCallback(async () => {
    try { const res = await immunizationApi.getVaccineStock(); setStock(res.data || []); } catch { setStock([]); }
  }, []);

  const fetchStockIssues = useCallback(async () => {
    try {
      const res = await immunizationApi.getVaccineStockIssues({ issueType: issueTypeFilter, pageSize: 30 });
      setStockIssues(res.data.items || []);
      setStockIssueTotal(res.data.totalCount || 0);
    } catch { setStockIssues([]); }
  }, [issueTypeFilter]);

  const fetchChildStats = useCallback(async () => {
    try { const res = await immunizationApi.getChildStats(); setChildStats(res.data); } catch { setChildStats(null); }
  }, []);

  useEffect(() => { fetchSubjects(); fetchVaccines(); fetchStock(); fetchChildStats(); }, [fetchSubjects, fetchVaccines, fetchStock, fetchChildStats]);
  useEffect(() => { fetchStockIssues(); }, [fetchStockIssues]);

  const handleSelectSubject = async (s: ImmunizationSubjectDto) => {
    setSelected(s);
    try {
      const [vaxRes, nutRes] = await Promise.allSettled([
        immunizationApi.getVaccinations(s.id),
        immunizationApi.getNutritionMeasurements(s.id),
      ]);
      setVaccinations(vaxRes.status === 'fulfilled' ? vaxRes.value.data || [] : []);
      setNutritionData(nutRes.status === 'fulfilled' ? nutRes.value.data || [] : []);
    } catch {
      setVaccinations([]);
      setNutritionData([]);
    }
  };

  const handleCreateSubject = async (values: Record<string, unknown>) => {
    try {
      await immunizationApi.createSubject({
        fullName: values.fullName as string,
        dateOfBirth: (values.dateOfBirth as dayjs.Dayjs)?.format('YYYY-MM-DD'),
        gender: values.gender as number,
        motherName: values.motherName as string,
        fatherName: values.fatherName as string,
        address: values.address as string,
        village: values.village as string,
        phone: values.phone as string,
      });
      message.success('Them doi tuong thanh cong');
      setSubjectModal(false); subjectForm.resetFields(); fetchSubjects();
    } catch { message.warning('Loi them doi tuong'); }
  };

  const handleVaccinate = async (values: Record<string, unknown>) => {
    if (!selected) return;
    try {
      await immunizationApi.recordVaccination({
        subjectId: selected.id,
        vaccineId: values.vaccineId as string,
        doseNumber: values.doseNumber as number,
        batchNumber: values.batchNumber as string,
        injectionSite: values.injectionSite as string,
        route: values.route as string,
      });
      message.success('Ghi nhan tiem chung thanh cong');
      setVaccinateModal(false); vaccinateForm.resetFields();
      handleSelectSubject(selected);
    } catch { message.warning('Loi ghi nhan tiem'); }
  };

  const handleCreateIssue = async (values: Record<string, unknown>) => {
    try {
      await immunizationApi.createVaccineStockIssue({
        issueType: values.issueType as string,
        vaccineId: values.vaccineId as string,
        quantity: values.quantity as number,
        reason: values.reason as string,
        batchNumber: values.batchNumber as string,
        notes: values.notes as string,
      });
      message.success('Tao phieu xuat thanh cong');
      setIssueModal(false); issueForm.resetFields(); fetchStockIssues(); fetchStock();
    } catch { message.warning('Loi tao phieu xuat'); }
  };

  const handleFetchReport = async () => {
    try {
      const res = await immunizationApi.getReport(reportCode, { year: reportYear, month: reportMonth });
      setReportData(res.data);
    } catch { message.warning('Loi lay bao cao'); setReportData(null); }
  };

  const handleSendReport = async () => {
    if (!reportData) return;
    try {
      await immunizationApi.sendReport(reportCode, reportData.id);
      message.success('Gui bao cao tuyen tren thanh cong');
      handleFetchReport();
    } catch { message.warning('Loi gui bao cao'); }
  };

  const handlePrintBarcode = async (subjectId: string) => {
    try {
      const res = await immunizationApi.printBarcode(subjectId);
      const blob = new Blob([res.data], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const w = window.open(url, '_blank');
      if (w) { w.onload = () => { w.print(); }; }
    } catch { message.warning('Loi in barcode'); }
  };

  // Subject columns
  const subjectColumns: ColumnsType<ImmunizationSubjectDto> = [
    { title: 'Ma', dataIndex: 'subjectCode', width: 100 },
    { title: 'Ho ten', dataIndex: 'fullName', width: 150 },
    { title: 'Ngay sinh', dataIndex: 'dateOfBirth', width: 100, render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
    { title: 'Gioi', dataIndex: 'gender', width: 50, render: (v: number) => v === 1 ? 'Nam' : 'Nu' },
    { title: 'Me', dataIndex: 'motherName', width: 120 },
    { title: 'Dia chi', dataIndex: 'address' },
    { title: 'So mui', dataIndex: 'vaccinationCount', width: 60 },
    {
      title: '', width: 170,
      render: (_: unknown, r: ImmunizationSubjectDto) => (
        <Space>
          <Button size="small" onClick={() => handleSelectSubject(r)}>XEM</Button>
          <Button size="small" type="primary" onClick={() => { setSelected(r); vaccinateForm.resetFields(); setVaccinateModal(true); }}>Tiem</Button>
          <Button size="small" icon={<BarcodeOutlined />} onClick={() => handlePrintBarcode(r.id)} title="In barcode" />
        </Space>
      ),
    },
  ];

  // Vaccination history columns
  const vaxColumns: ColumnsType<VaccinationRecordDto> = [
    { title: 'Vaccine', dataIndex: 'vaccineName' },
    { title: 'Mui', dataIndex: 'doseNumber', width: 50 },
    { title: 'Ngay tiem', dataIndex: 'vaccinationDate', render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
    { title: 'Lo', dataIndex: 'batchNumber' },
    { title: 'Vi tri', dataIndex: 'injectionSite' },
    { title: 'Duong dung', dataIndex: 'route' },
    { title: 'Phan ung', dataIndex: 'reaction' },
  ];

  // Stock columns
  const stockColumns: ColumnsType<VaccineStockDto> = [
    { title: 'Ma', dataIndex: 'stockCode', width: 100 },
    { title: 'Vaccine', dataIndex: 'vaccineName' },
    { title: 'Loai', dataIndex: 'stockType', width: 80 },
    { title: 'Ngay', dataIndex: 'stockDate', width: 100, render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
    { title: 'So luong', dataIndex: 'quantity', width: 80 },
    { title: 'Lo', dataIndex: 'batchNumber', width: 100 },
    { title: 'Han dung', dataIndex: 'expiryDate', width: 100, render: (v?: string) => v ? dayjs(v).format('DD/MM/YYYY') : '' },
  ];

  // Stock issue columns
  const issueColumns: ColumnsType<VaccineStockIssueDto> = [
    { title: 'Ma phieu', dataIndex: 'issueCode', width: 100 },
    { title: 'Loai', dataIndex: 'issueType', width: 100, render: (v: string) => ISSUE_TYPES.find(t => t.value === v)?.label || v },
    { title: 'Vaccine', dataIndex: 'vaccineName' },
    { title: 'So luong', dataIndex: 'quantity', width: 80 },
    { title: 'Ngay', dataIndex: 'issueDate', width: 100, render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
    { title: 'Lo', dataIndex: 'batchNumber', width: 100 },
    { title: 'Ly do', dataIndex: 'reason' },
    { title: 'TT', dataIndex: 'status', width: 60, render: (v: number) => <Tag color={v === 1 ? 'green' : 'blue'}>{v === 1 ? 'Xong' : 'Moi'}</Tag> },
  ];

  // Nutrition columns
  const nutritionColumns: ColumnsType<NutritionMeasurementDto> = [
    { title: 'Ngay do', dataIndex: 'measurementDate', render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
    { title: 'Can nang (kg)', dataIndex: 'weight' },
    { title: 'Chieu cao (cm)', dataIndex: 'height' },
    { title: 'Vong dau (cm)', dataIndex: 'headCircumference' },
    { title: 'Tinh trang DD', dataIndex: 'nutritionStatus', render: (v?: string) => {
      if (!v) return '';
      const colors: Record<string, string> = { Normal: 'green', Underweight: 'orange', SevereUnderweight: 'red', Overweight: 'blue' };
      return <Tag color={colors[v] || 'default'}>{v}</Tag>;
    }},
  ];

  return (
    <Spin spinning={loading}>
      {/* Child stats cards */}
      {childStats && (
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={3}><Card size="small"><Statistic title="Tong doi tuong" value={childStats.totalSubjects} /></Card></Col>
          <Col span={3}><Card size="small"><Statistic title="< 1 tuoi" value={childStats.under1Year} /></Card></Col>
          <Col span={3}><Card size="small"><Statistic title="1-2 tuoi" value={childStats.from1To2Years} /></Card></Col>
          <Col span={3}><Card size="small"><Statistic title="2-5 tuoi" value={childStats.from2To5Years} /></Card></Col>
          <Col span={3}><Card size="small"><Statistic title="> 5 tuoi" value={childStats.above5Years} /></Card></Col>
          <Col span={3}><Card size="small"><Statistic title="Tiem du" value={childStats.fullyVaccinated} styles={{ content: { color: '#52c41a' } }} /></Card></Col>
          <Col span={3}><Card size="small"><Statistic title="Tiem 1 phan" value={childStats.partiallyVaccinated} styles={{ content: { color: '#faad14' } }} /></Card></Col>
          <Col span={3}><Card size="small"><Statistic title="Chua tiem" value={childStats.totalSubjects - childStats.fullyVaccinated - childStats.partiallyVaccinated} styles={{ content: { color: '#f5222d' } }} /></Card></Col>
        </Row>
      )}

      <Tabs items={[
        {
          key: 'subjects', label: 'Doi tuong tiem chung',
          children: (
            <Card extra={<Space>
              <Input placeholder="Tim kiem..." prefix={<SearchOutlined />} value={keyword} onChange={e => setKeyword(e.target.value)} onPressEnter={() => fetchSubjects()} style={{ width: 200 }} />
              <Button type="primary" icon={<PlusOutlined />} onClick={() => { subjectForm.resetFields(); setSubjectModal(true); }}>Them</Button>
              <Button icon={<ReloadOutlined />} onClick={fetchSubjects} />
            </Space>}>
              <Table columns={subjectColumns} dataSource={subjects} rowKey="id" size="small" pagination={{ total, pageSize: 30 }} scroll={{ x: 900 }} />
              {selected && (
                <>
                  <Card size="small" title={`Lich su tiem - ${selected.fullName}`} style={{ marginTop: 16 }}>
                    <Table dataSource={vaccinations} rowKey="id" size="small" pagination={false} columns={vaxColumns} scroll={{ x: 700 }} />
                  </Card>
                  {nutritionData.length > 0 && (
                    <Card size="small" title="Dinh duong / Tang truong" style={{ marginTop: 12 }}>
                      <Table dataSource={nutritionData} rowKey="id" size="small" pagination={false} columns={nutritionColumns} />
                    </Card>
                  )}
                </>
              )}
            </Card>
          ),
        },
        {
          key: 'stock', label: 'Ton kho vaccine',
          children: (
            <Card extra={<Button icon={<ReloadOutlined />} onClick={fetchStock} />}>
              <Table columns={stockColumns} dataSource={stock} rowKey="id" size="small" pagination={false} scroll={{ x: 700 }} />
            </Card>
          ),
        },
        {
          key: 'stock-issues', label: 'Xuat vaccine',
          children: (
            <Card extra={<Space>
              <Select placeholder="Loai xuat" allowClear style={{ width: 150 }} options={ISSUE_TYPES} value={issueTypeFilter} onChange={setIssueTypeFilter} />
              <Button type="primary" icon={<PlusOutlined />} onClick={() => { issueForm.resetFields(); setIssueModal(true); }}>Tao phieu xuat</Button>
              <Button icon={<ReloadOutlined />} onClick={fetchStockIssues} />
            </Space>}>
              <Table columns={issueColumns} dataSource={stockIssues} rowKey="id" size="small" pagination={{ total: stockIssueTotal, pageSize: 30 }} scroll={{ x: 850 }} />
            </Card>
          ),
        },
        {
          key: 'reports', label: 'Bao cao',
          children: (
            <Card>
              <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={8}>
                  <Select placeholder="Loai bao cao" style={{ width: '100%' }} options={REPORT_CODES} value={reportCode} onChange={setReportCode} />
                </Col>
                <Col span={4}>
                  <InputNumber placeholder="Nam" style={{ width: '100%' }} value={reportYear} onChange={v => setReportYear(v || dayjs().year())} />
                </Col>
                <Col span={4}>
                  <InputNumber placeholder="Thang" style={{ width: '100%' }} min={1} max={12} value={reportMonth} onChange={v => setReportMonth(v || undefined)} />
                </Col>
                <Col span={8}>
                  <Space>
                    <Button type="primary" icon={<SearchOutlined />} onClick={handleFetchReport}>Xem</Button>
                    {reportData && <Button icon={<SendOutlined />} onClick={handleSendReport}>Gui tuyen tren</Button>}
                    {reportData && <Button icon={<PrinterOutlined />} onClick={() => window.print()}>In</Button>}
                  </Space>
                </Col>
              </Row>
              {reportData ? (
                <Card size="small">
                  <Descriptions size="small" column={3}>
                    <Descriptions.Item label="Ma BC">{reportData.reportCode}</Descriptions.Item>
                    <Descriptions.Item label="Nam">{reportData.year}</Descriptions.Item>
                    <Descriptions.Item label="Thang">{reportData.month || '-'}</Descriptions.Item>
                    <Descriptions.Item label="Co so">{reportData.facilityName || '-'}</Descriptions.Item>
                    <Descriptions.Item label="Trang thai">
                      <Tag color={reportData.status === 2 ? 'green' : reportData.status === 1 ? 'blue' : 'default'}>
                        {reportData.status === 2 ? 'Da gui' : reportData.status === 1 ? 'Da duyet' : 'Nhap'}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngay gui">{reportData.sentDate ? dayjs(reportData.sentDate).format('DD/MM/YYYY HH:mm') : '-'}</Descriptions.Item>
                  </Descriptions>
                  {reportData.data && (
                    <div style={{ marginTop: 12, padding: 12, background: '#f5f5f5', borderRadius: 4, whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: 12 }}>
                      {reportData.data}
                    </div>
                  )}
                </Card>
              ) : (
                <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>Chon bao cao va nhan Xem</div>
              )}
            </Card>
          ),
        },
        {
          key: 'vaccines', label: 'Danh muc vaccine',
          children: (
            <Card extra={<Button icon={<ReloadOutlined />} onClick={fetchVaccines} />}>
              <Table dataSource={vaccines} rowKey="id" size="small" pagination={false} columns={[
                { title: 'Ma', dataIndex: 'code', width: 80 },
                { title: 'Ten', dataIndex: 'name' },
                { title: 'Hang SX', dataIndex: 'manufacturer' },
                { title: 'Khang nguyen', dataIndex: 'antigenList' },
                { title: 'Bao quan', dataIndex: 'storageCondition' },
                { title: 'Lieu/lo', dataIndex: 'dosesPerVial', width: 60 },
                { title: 'TT', dataIndex: 'isActive', width: 60, render: (v: boolean) => <Tag color={v ? 'green' : 'red'}>{v ? 'HD' : 'Tat'}</Tag> },
              ]} />
            </Card>
          ),
        },
      ]} />

      {/* Add subject modal */}
      <Modal title="Them doi tuong tiem chung" open={subjectModal} onCancel={() => setSubjectModal(false)} onOk={() => subjectForm.submit()} okText="Luu">
        <Form form={subjectForm} layout="vertical" onFinish={handleCreateSubject}>
          <Form.Item name="fullName" label="Ho ten" rules={[{ required: true }]}><Input /></Form.Item>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="dateOfBirth" label="Ngay sinh" rules={[{ required: true }]}><DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item name="gender" label="Gioi tinh" rules={[{ required: true }]}><Select options={[{ value: 1, label: 'Nam' }, { value: 2, label: 'Nu' }]} /></Form.Item></Col>
            <Col span={8}><Form.Item name="village" label="Thon/Xom"><Input /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="motherName" label="Ho ten me"><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="fatherName" label="Ho ten bo"><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="phone" label="SDT"><Input /></Form.Item></Col>
          </Row>
          <Form.Item name="address" label="Dia chi" rules={[{ required: true }]}><Input /></Form.Item>
        </Form>
      </Modal>

      {/* Vaccinate modal */}
      <Modal title="Ghi nhan tiem chung" open={vaccinateModal} onCancel={() => setVaccinateModal(false)} onOk={() => vaccinateForm.submit()} okText="Luu">
        <Form form={vaccinateForm} layout="vertical" onFinish={handleVaccinate}>
          <Row gutter={12}>
            <Col span={16}>
              <Form.Item name="vaccineId" label="Vaccine" rules={[{ required: true }]}>
                <Select options={vaccines.map(v => ({ value: v.id, label: `${v.code} - ${v.name}` }))} showSearch optionFilterProp="label" />
              </Form.Item>
            </Col>
            <Col span={8}><Form.Item name="doseNumber" label="Mui thu" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} min={1} /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="batchNumber" label="So lo"><Input /></Form.Item></Col>
            <Col span={8}>
              <Form.Item name="injectionSite" label="Vi tri tiem">
                <Select options={[{ value: 'Dui trai', label: 'Dui trai' }, { value: 'Dui phai', label: 'Dui phai' }, { value: 'Canh tay trai', label: 'Canh tay trai' }, { value: 'Canh tay phai', label: 'Canh tay phai' }]} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="route" label="Duong dung">
                <Select options={[{ value: 'IM', label: 'Tiem bap (IM)' }, { value: 'SC', label: 'Tiem duoi da (SC)' }, { value: 'ID', label: 'Tiem trong da (ID)' }, { value: 'Oral', label: 'Uong' }]} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Create stock issue modal */}
      <Modal title="Tao phieu xuat vaccine" open={issueModal} onCancel={() => setIssueModal(false)} onOk={() => issueForm.submit()} okText="Luu">
        <Form form={issueForm} layout="vertical" onFinish={handleCreateIssue}>
          <Form.Item name="issueType" label="Loai xuat" rules={[{ required: true }]}>
            <Select options={ISSUE_TYPES} />
          </Form.Item>
          <Form.Item name="vaccineId" label="Vaccine" rules={[{ required: true }]}>
            <Select options={vaccines.map(v => ({ value: v.id, label: `${v.code} - ${v.name}` }))} showSearch optionFilterProp="label" />
          </Form.Item>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="quantity" label="So luong" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} min={1} /></Form.Item></Col>
            <Col span={16}><Form.Item name="batchNumber" label="So lo"><Input /></Form.Item></Col>
          </Row>
          <Form.Item name="reason" label="Ly do"><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="notes" label="Ghi chu"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>
    </Spin>
  );
}
