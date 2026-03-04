import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Tag, Spin, message, Modal, Tabs, Input, Space, Form, Row, Col, InputNumber, DatePicker, Select, Progress } from 'antd';
import { SearchOutlined, ReloadOutlined, PlusOutlined, WarningOutlined, PrinterOutlined, LockOutlined, UnlockOutlined, CheckOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { pharmacyApi } from '../api/pharmacy';
import type {
  MedicineDto, StockReceiptDto, DispensingDto, StockReceiptItemDto,
  LowerLevelIssueDto, UpperLevelReceiptDto, InspectionReportDto,
  StockTakeReportDto, DisposalIssueDto, RetailSaleDto, UpperProcurementDto,
  StockCardDto, DocumentLockDto, PrescriptionApprovalDto
} from '../api/pharmacy';

const STATUS_MAP: Record<number, { color: string; text: string }> = {
  0: { color: 'orange', text: 'Cho duyet' },
  1: { color: 'green', text: 'Da duyet' },
  2: { color: 'red', text: 'Da huy' },
};

export default function Pharmacy() {
  const [loading, setLoading] = useState(false);
  const [medicines, setMedicines] = useState<MedicineDto[]>([]);
  const [medTotal, setMedTotal] = useState(0);
  const [receipts, setReceipts] = useState<StockReceiptDto[]>([]);
  const [pendingDispensing, setPendingDispensing] = useState<DispensingDto[]>([]);
  const [keyword, setKeyword] = useState('');
  const [receiptModal, setReceiptModal] = useState(false);
  const [receiptForm] = Form.useForm();
  const [receiptItems, setReceiptItems] = useState<StockReceiptItemDto[]>([]);
  const [addItemForm] = Form.useForm();
  const [addItemModal, setAddItemModal] = useState(false);

  // New state for new tabs
  const [lowerLevelIssues, setLowerLevelIssues] = useState<LowerLevelIssueDto[]>([]);
  const [upperLevelReceipts, setUpperLevelReceipts] = useState<UpperLevelReceiptDto[]>([]);
  const [inspectionReports, setInspectionReports] = useState<InspectionReportDto[]>([]);
  const [stockTakeReports, setStockTakeReports] = useState<StockTakeReportDto[]>([]);
  const [disposalIssues, setDisposalIssues] = useState<DisposalIssueDto[]>([]);
  const [retailSales, setRetailSales] = useState<RetailSaleDto[]>([]);
  const [upperProcurements, setUpperProcurements] = useState<UpperProcurementDto[]>([]);
  const [stockCard, setStockCard] = useState<StockCardDto | null>(null);
  const [documentLocks, setDocumentLocks] = useState<DocumentLockDto[]>([]);
  const [pendingPrescriptions, setPendingPrescriptions] = useState<PrescriptionApprovalDto[]>([]);

  // Modals
  const [lowerLevelModal, setLowerLevelModal] = useState(false);
  const [lowerLevelForm] = Form.useForm();
  const [disposalModal, setDisposalModal] = useState(false);
  const [disposalForm] = Form.useForm();
  const [retailSaleModal, setRetailSaleModal] = useState(false);
  const [retailSaleForm] = Form.useForm();
  const [procurementModal, setProcurementModal] = useState(false);
  const [procurementForm] = Form.useForm();
  const [stockCardForm] = Form.useForm();

  const fetchMedicines = useCallback(async () => {
    setLoading(true);
    try {
      const res = await pharmacyApi.searchMedicines({ keyword, pageSize: 50 });
      setMedicines(res.data.items);
      setMedTotal(res.data.total);
    } catch { setMedicines([]); } finally { setLoading(false); }
  }, [keyword]);

  const fetchReceipts = useCallback(async () => {
    try { const res = await pharmacyApi.getStockReceipts({ pageSize: 30 }); setReceipts(res.data.items); } catch { setReceipts([]); }
  }, []);

  const fetchPending = useCallback(async () => {
    try { const res = await pharmacyApi.getPendingDispensing(); setPendingDispensing(res.data); } catch { setPendingDispensing([]); }
  }, []);

  const fetchLowerLevelIssues = useCallback(async () => {
    try { const res = await pharmacyApi.getLowerLevelIssues(); setLowerLevelIssues(res.data?.items || []); } catch { setLowerLevelIssues([]); }
  }, []);

  const fetchUpperLevelReceipts = useCallback(async () => {
    try { const res = await pharmacyApi.getUpperLevelReceipts(); setUpperLevelReceipts(res.data?.items || []); } catch { setUpperLevelReceipts([]); }
  }, []);

  const fetchInspectionReports = useCallback(async () => {
    try { const res = await pharmacyApi.getInspectionReports(); setInspectionReports(res.data?.items || []); } catch { setInspectionReports([]); }
  }, []);

  const fetchStockTakeReports = useCallback(async () => {
    try { const res = await pharmacyApi.getStockTakeReports(); setStockTakeReports(res.data?.items || []); } catch { setStockTakeReports([]); }
  }, []);

  const fetchDisposalIssues = useCallback(async () => {
    try { const res = await pharmacyApi.getDisposalIssues(); setDisposalIssues(res.data?.items || []); } catch { setDisposalIssues([]); }
  }, []);

  const fetchRetailSales = useCallback(async () => {
    try { const res = await pharmacyApi.getRetailSales(); setRetailSales(res.data?.items || []); } catch { setRetailSales([]); }
  }, []);

  const fetchUpperProcurements = useCallback(async () => {
    try { const res = await pharmacyApi.getUpperProcurements(); setUpperProcurements(res.data?.items || []); } catch { setUpperProcurements([]); }
  }, []);

  const fetchPendingPrescriptions = useCallback(async () => {
    try { const res = await pharmacyApi.getPendingPrescriptions(); setPendingPrescriptions(res.data?.items || []); } catch { setPendingPrescriptions([]); }
  }, []);

  useEffect(() => { fetchMedicines(); fetchReceipts(); fetchPending(); }, [fetchMedicines, fetchReceipts, fetchPending]);

  const handleDispense = async (prescriptionId: string) => {
    try { await pharmacyApi.dispense(prescriptionId, []); message.success('Phat thuoc thanh cong'); fetchPending(); } catch { message.warning('Loi phat thuoc'); }
  };

  const handleAddItem = (values: Record<string, unknown>) => {
    setReceiptItems(prev => [...prev, {
      medicineId: values.medicineId as string || '', medicineName: values.medicineName as string,
      batchNumber: values.batchNumber as string, expiryDate: (values.expiryDate as dayjs.Dayjs)?.format('YYYY-MM-DD') || '',
      quantity: values.quantity as number, unitPrice: values.unitPrice as number,
      totalPrice: (values.quantity as number) * (values.unitPrice as number), unit: values.unit as string,
    }]);
    setAddItemModal(false); addItemForm.resetFields();
  };

  const handleCreateReceipt = async () => {
    try { await pharmacyApi.createReceipt({ items: receiptItems, receiptType: 1 }); message.success('Tao phieu nhap thanh cong'); setReceiptModal(false); setReceiptItems([]); fetchReceipts(); fetchMedicines(); } catch { message.warning('Loi tao phieu nhap'); }
  };

  const handleApprovePrescription = async (id: string) => {
    try { await pharmacyApi.approvePrescription(id); message.success('Duyet toa thanh cong'); fetchPendingPrescriptions(); } catch { message.warning('Loi duyet toa'); }
  };

  const handleFetchStockCard = async (values: Record<string, unknown>) => {
    try {
      const res = await pharmacyApi.getStockCard({
        warehouseId: values.warehouseId as string, medicineId: values.medicineId as string,
        from: (values.from as dayjs.Dayjs)?.format('YYYY-MM-DD') || '', to: (values.to as dayjs.Dayjs)?.format('YYYY-MM-DD') || '',
      });
      setStockCard(res.data);
    } catch { message.warning('Loi tai the kho'); }
  };

  const medColumns: ColumnsType<MedicineDto> = [
    { title: 'Ma', dataIndex: 'code', width: 80 },
    { title: 'Ten thuoc', dataIndex: 'name', width: 200 },
    { title: 'Hoat chat', dataIndex: 'activeIngredient', width: 150 },
    { title: 'Ham luong', dataIndex: 'strength', width: 100 },
    { title: 'DVT', dataIndex: 'unit', width: 60 },
    { title: 'Ton kho', dataIndex: 'currentStock', width: 80, render: (v: number, r: MedicineDto) => <span style={{ color: v <= r.minStock ? '#f5222d' : undefined, fontWeight: v <= r.minStock ? 700 : undefined }}>{v}</span> },
    { title: 'Toi thieu', dataIndex: 'minStock', width: 70 },
    { title: 'Han dung', dataIndex: 'expiryDate', width: 100, render: (v: string) => { if (!v) return ''; const d = dayjs(v); return <span style={{ color: d.diff(dayjs(), 'day') <= 90 ? '#f5222d' : undefined }}>{d.format('DD/MM/YYYY')}</span>; } },
    { title: 'Gia BHYT', dataIndex: 'insurancePrice', width: 100, render: (v: number) => v?.toLocaleString() },
  ];

  const receiptColumns: ColumnsType<StockReceiptDto> = [
    { title: 'So phieu', dataIndex: 'receiptNumber', width: 120 },
    { title: 'Ngay', dataIndex: 'receiptDate', width: 100, render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
    { title: 'NCC', dataIndex: 'supplierName', width: 150 },
    { title: 'Tong tien', dataIndex: 'totalAmount', width: 120, render: (v: number) => v?.toLocaleString() },
    { title: 'Trang thai', dataIndex: 'status', width: 100, render: (v: number) => <Tag color={STATUS_MAP[v]?.color}>{STATUS_MAP[v]?.text}</Tag> },
  ];

  const dispensingColumns: ColumnsType<DispensingDto> = [
    { title: 'Ho ten BN', dataIndex: 'patientName' },
    { title: 'Ngay', dataIndex: 'dispensedDate', render: (v: string) => v ? dayjs(v).format('DD/MM HH:mm') : '' },
    { title: 'Trang thai', dataIndex: 'status', width: 100, render: (v: number) => <Tag color={STATUS_MAP[v]?.color}>{STATUS_MAP[v]?.text}</Tag> },
    { title: '', width: 100, render: (_: unknown, r: DispensingDto) => r.status === 0 ? <Button size="small" type="primary" onClick={() => handleDispense(r.prescriptionId)}>Phat thuoc</Button> : null },
  ];

  const lowStockCount = medicines.filter(m => m.currentStock <= m.minStock).length;
  const expiringCount = medicines.filter(m => m.expiryDate && dayjs(m.expiryDate).diff(dayjs(), 'day') <= 90).length;

  return (
    <Spin spinning={loading}>
      <Tabs items={[
        {
          key: 'stock', label: 'Ton kho',
          children: (
            <Card>
              <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={8}><Card size="small"><div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Tong loai thuoc</span><strong>{medTotal}</strong></div></Card></Col>
                <Col span={8}><Card size="small"><div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#f5222d' }}><WarningOutlined /> Duoi dinh muc</span><strong style={{ color: '#f5222d' }}>{lowStockCount}</strong></div></Card></Col>
                <Col span={8}><Card size="small"><div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#faad14' }}><WarningOutlined /> Sap het han</span><strong style={{ color: '#faad14' }}>{expiringCount}</strong></div></Card></Col>
              </Row>
              <Space style={{ marginBottom: 16 }}>
                <Input placeholder="Tim thuoc..." prefix={<SearchOutlined />} value={keyword} onChange={e => setKeyword(e.target.value)} onPressEnter={() => fetchMedicines()} style={{ width: 250 }} />
                <Button icon={<ReloadOutlined />} onClick={fetchMedicines} />
              </Space>
              <Table columns={medColumns} dataSource={medicines} rowKey="id" size="small" pagination={{ total: medTotal, pageSize: 50 }} scroll={{ x: 1040 }} />
            </Card>
          ),
        },
        {
          key: 'receipt', label: 'Nhap kho',
          children: (
            <Card extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { setReceiptItems([]); setReceiptModal(true); }}>Tao phieu nhap</Button>}>
              <Table columns={receiptColumns} dataSource={receipts} rowKey="id" size="small" pagination={{ pageSize: 20 }} />
            </Card>
          ),
        },
        {
          key: 'dispensing', label: 'Phat thuoc',
          children: (
            <Card extra={<Button icon={<ReloadOutlined />} onClick={fetchPending}>Lam moi</Button>}>
              <Table columns={dispensingColumns} dataSource={pendingDispensing} rowKey="id" size="small" pagination={{ pageSize: 20 }} />
            </Card>
          ),
        },
        {
          key: 'lower-level', label: 'Xuat tuyen duoi',
          children: (
            <Card extra={<Space><Button type="primary" icon={<PlusOutlined />} onClick={() => { lowerLevelForm.resetFields(); setLowerLevelModal(true); }}>Tao phieu xuat</Button><Button icon={<ReloadOutlined />} onClick={fetchLowerLevelIssues} /></Space>}>
              <Table dataSource={lowerLevelIssues} rowKey="id" size="small" pagination={{ pageSize: 20 }}
                columns={[
                  { title: 'So phieu', dataIndex: 'issueCode', width: 120 },
                  { title: 'Kho xuat', dataIndex: 'fromWarehouseName' },
                  { title: 'Don vi nhan', dataIndex: 'toFacilityName' },
                  { title: 'Ngay xuat', dataIndex: 'issueDate', width: 100, render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
                  { title: 'Tong tien', dataIndex: 'totalAmount', width: 120, render: (v: number) => v?.toLocaleString() },
                  { title: 'TT', dataIndex: 'status', width: 80, render: (v: number) => <Tag color={STATUS_MAP[v]?.color}>{STATUS_MAP[v]?.text}</Tag> },
                ]}
              />
            </Card>
          ),
        },
        {
          key: 'upper-receipt', label: 'Nhap tuyen tren',
          children: (
            <Card extra={<Button icon={<ReloadOutlined />} onClick={fetchUpperLevelReceipts} />}>
              <Table dataSource={upperLevelReceipts} rowKey="id" size="small" pagination={{ pageSize: 20 }}
                columns={[
                  { title: 'So phieu', dataIndex: 'receiptCode', width: 120 },
                  { title: 'Don vi cap', dataIndex: 'fromFacilityName' },
                  { title: 'Ngay nhap', dataIndex: 'receiptDate', width: 100, render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
                  { title: 'Tong tien', dataIndex: 'totalAmount', width: 120, render: (v: number) => v?.toLocaleString() },
                  { title: 'TT', dataIndex: 'status', width: 80, render: (v: number) => <Tag color={STATUS_MAP[v]?.color}>{STATUS_MAP[v]?.text}</Tag> },
                  { title: '', width: 100, render: (_: unknown, r: UpperLevelReceiptDto) => r.status === 0 ? <Button size="small" type="primary" onClick={async () => { try { await pharmacyApi.receiveFromUpperLevel(r.id); message.success('Xac nhan nhan hang'); fetchUpperLevelReceipts(); } catch { message.warning('Loi'); } }}>Nhan</Button> : null },
                ]}
              />
            </Card>
          ),
        },
        {
          key: 'inspection', label: 'BB Kiem nhap',
          children: (
            <Card extra={<Button icon={<ReloadOutlined />} onClick={fetchInspectionReports} />}>
              <Table dataSource={inspectionReports} rowKey="id" size="small" pagination={{ pageSize: 20 }}
                columns={[
                  { title: 'So BB', dataIndex: 'reportCode', width: 120 },
                  { title: 'Kho', dataIndex: 'warehouseName' },
                  { title: 'NCC', dataIndex: 'supplierName' },
                  { title: 'Ngay', dataIndex: 'inspectionDate', width: 100, render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
                  { title: 'TT', dataIndex: 'status', width: 80, render: (v: number) => <Tag color={STATUS_MAP[v]?.color}>{STATUS_MAP[v]?.text}</Tag> },
                  { title: '', width: 80, render: () => <Button size="small" icon={<PrinterOutlined />} /> },
                ]}
              />
            </Card>
          ),
        },
        {
          key: 'stocktake', label: 'Kiem ke',
          children: (
            <Card extra={<Button icon={<ReloadOutlined />} onClick={fetchStockTakeReports} />}>
              <Table dataSource={stockTakeReports} rowKey="id" size="small" pagination={{ pageSize: 20 }}
                columns={[
                  { title: 'Ma KK', dataIndex: 'stockTakeCode', width: 120 },
                  { title: 'Kho', dataIndex: 'warehouseName' },
                  { title: 'Ngay KK', dataIndex: 'stockTakeDate', width: 100, render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
                  { title: 'TL', dataIndex: 'hasDisposal', width: 60, render: (v: boolean) => v ? <Tag color="red">Co</Tag> : <Tag>Khong</Tag> },
                  { title: 'TT', dataIndex: 'status', width: 80, render: (v: number) => <Tag color={STATUS_MAP[v]?.color}>{STATUS_MAP[v]?.text}</Tag> },
                  { title: '', width: 80, render: () => <Button size="small" icon={<PrinterOutlined />} /> },
                ]}
              />
            </Card>
          ),
        },
        {
          key: 'disposal', label: 'Thanh ly',
          children: (
            <Card extra={<Space><Button type="primary" icon={<PlusOutlined />} onClick={() => { disposalForm.resetFields(); setDisposalModal(true); }}>Tao phieu TL</Button><Button icon={<ReloadOutlined />} onClick={fetchDisposalIssues} /></Space>}>
              <Table dataSource={disposalIssues} rowKey="id" size="small" pagination={{ pageSize: 20 }}
                columns={[
                  { title: 'So phieu', dataIndex: 'issueCode', width: 120 },
                  { title: 'Kho', dataIndex: 'warehouseName' },
                  { title: 'Ngay', dataIndex: 'issueDate', width: 100, render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
                  { title: 'Ly do', dataIndex: 'reason' },
                  { title: 'Tong tien', dataIndex: 'totalAmount', width: 120, render: (v: number) => v?.toLocaleString() },
                  { title: 'TT', dataIndex: 'status', width: 80, render: (v: number) => <Tag color={STATUS_MAP[v]?.color}>{STATUS_MAP[v]?.text}</Tag> },
                ]}
              />
            </Card>
          ),
        },
        {
          key: 'retail', label: 'Ban thuoc',
          children: (
            <Card extra={<Space><Button type="primary" icon={<PlusOutlined />} onClick={() => { retailSaleForm.resetFields(); setRetailSaleModal(true); }}>Ban thuoc</Button><Button icon={<ReloadOutlined />} onClick={fetchRetailSales} /></Space>}>
              <Table dataSource={retailSales} rowKey="id" size="small" pagination={{ pageSize: 20 }}
                columns={[
                  { title: 'So', dataIndex: 'saleCode', width: 120 },
                  { title: 'Khach hang', dataIndex: 'patientName' },
                  { title: 'Ngay', dataIndex: 'saleDate', width: 100, render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
                  { title: 'Tong tien', dataIndex: 'totalAmount', width: 120, render: (v: number) => v?.toLocaleString() },
                  { title: 'TT hoan', dataIndex: 'paymentMethod', width: 100 },
                  { title: '', width: 80, render: () => <Button size="small" icon={<PrinterOutlined />} /> },
                ]}
              />
            </Card>
          ),
        },
        {
          key: 'procurement', label: 'Du tru',
          children: (
            <Card extra={<Space><Button type="primary" icon={<PlusOutlined />} onClick={() => { procurementForm.resetFields(); setProcurementModal(true); }}>Tao du tru</Button><Button icon={<ReloadOutlined />} onClick={fetchUpperProcurements} /></Space>}>
              <Table dataSource={upperProcurements} rowKey="id" size="small" pagination={{ pageSize: 20 }}
                columns={[
                  { title: 'Ma', dataIndex: 'requestCode', width: 120 },
                  { title: 'Ngay', dataIndex: 'requestDate', width: 100, render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
                  { title: 'Ghi chu', dataIndex: 'notes' },
                  { title: 'TT', dataIndex: 'status', width: 100, render: (v: number) => v === 0 ? <Tag color="orange">Chua gui</Tag> : <Tag color="green">Da gui</Tag> },
                  { title: '', width: 100, render: (_: unknown, r: UpperProcurementDto) => r.status === 0 ? <Button size="small" type="primary" onClick={async () => { try { await pharmacyApi.sendUpperProcurement(r.id); message.success('Da gui du tru'); fetchUpperProcurements(); } catch { message.warning('Loi'); } }}>Gui</Button> : null },
                ]}
              />
            </Card>
          ),
        },
        {
          key: 'stockcard', label: 'The kho',
          children: (
            <Card>
              <Form form={stockCardForm} layout="inline" onFinish={handleFetchStockCard} style={{ marginBottom: 16 }}>
                <Form.Item name="warehouseId" label="Kho" rules={[{ required: true }]}><Input placeholder="ID kho" style={{ width: 200 }} /></Form.Item>
                <Form.Item name="medicineId" label="Thuoc" rules={[{ required: true }]}><Input placeholder="ID thuoc" style={{ width: 200 }} /></Form.Item>
                <Form.Item name="from" label="Tu"><DatePicker format="DD/MM/YYYY" /></Form.Item>
                <Form.Item name="to" label="Den"><DatePicker format="DD/MM/YYYY" /></Form.Item>
                <Form.Item><Button type="primary" htmlType="submit" icon={<SearchOutlined />}>Xem</Button></Form.Item>
              </Form>
              {stockCard && (
                <>
                  <p><strong>{stockCard.medicineName}</strong> ({stockCard.unit})</p>
                  <Table dataSource={stockCard.entries} rowKey={(_, i) => String(i)} size="small" pagination={false}
                    columns={[
                      { title: 'Ngay', dataIndex: 'date', width: 100, render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
                      { title: 'Chung tu', dataIndex: 'documentCode', width: 120 },
                      { title: 'Loai', dataIndex: 'transactionType', width: 80 },
                      { title: 'Nhap', dataIndex: 'quantityIn', width: 80 },
                      { title: 'Xuat', dataIndex: 'quantityOut', width: 80 },
                      { title: 'Ton', dataIndex: 'balance', width: 80 },
                      { title: 'Lo', dataIndex: 'batchNumber', width: 100 },
                    ]}
                  />
                </>
              )}
            </Card>
          ),
        },
        {
          key: 'approval', label: 'Duyet toa',
          children: (
            <Card extra={<Button icon={<ReloadOutlined />} onClick={fetchPendingPrescriptions} />}>
              <Table dataSource={pendingPrescriptions} rowKey="prescriptionId" size="small" pagination={{ pageSize: 20 }}
                columns={[
                  { title: 'BN', dataIndex: 'patientName' },
                  { title: 'BS', dataIndex: 'doctorName' },
                  { title: 'Ngay', dataIndex: 'prescriptionDate', width: 100, render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
                  { title: 'Chan doan', dataIndex: 'diagnosis' },
                  { title: 'So thuoc', width: 70, render: (_: unknown, r: PrescriptionApprovalDto) => r.items?.length || 0 },
                  { title: '', width: 100, render: (_: unknown, r: PrescriptionApprovalDto) => <Button size="small" type="primary" icon={<CheckOutlined />} onClick={() => handleApprovePrescription(r.prescriptionId)}>Duyet</Button> },
                ]}
                expandable={{
                  expandedRowRender: (r: PrescriptionApprovalDto) => (
                    <Table dataSource={r.items} rowKey="medicineId" size="small" pagination={false}
                      columns={[
                        { title: 'Thuoc', dataIndex: 'medicineName' },
                        { title: 'DVT', dataIndex: 'unit', width: 60 },
                        { title: 'SL', dataIndex: 'quantity', width: 60 },
                        { title: 'Lieu', dataIndex: 'dosage' },
                        { title: 'Cach dung', dataIndex: 'usage' },
                        { title: 'So ngay', dataIndex: 'daysSupply', width: 60 },
                      ]}
                    />
                  ),
                }}
              />
            </Card>
          ),
        },
        {
          key: 'lock', label: 'Khoa so',
          children: (
            <Card extra={<Button icon={<ReloadOutlined />} onClick={() => { /* fetch locks */ }} />}>
              <Table dataSource={documentLocks} rowKey={(r) => `${r.warehouseId}_${r.year}_${r.month}`} size="small" pagination={false}
                columns={[
                  { title: 'Kho', dataIndex: 'warehouseName' },
                  { title: 'Nam', dataIndex: 'year', width: 60 },
                  { title: 'Thang', dataIndex: 'month', width: 60 },
                  { title: 'Trang thai', dataIndex: 'isLocked', width: 100, render: (v: boolean) => v ? <Tag color="red"><LockOutlined /> Da khoa</Tag> : <Tag color="green"><UnlockOutlined /> Mo</Tag> },
                  { title: 'Ngay khoa', dataIndex: 'lockedAt', width: 120, render: (v: string) => v ? dayjs(v).format('DD/MM/YYYY HH:mm') : '' },
                ]}
              />
            </Card>
          ),
        },
        {
          key: 'report', label: 'Bao cao',
          children: (
            <Card title="Bao cao duoc">
              <Space orientation="vertical">
                <Button icon={<PrinterOutlined />}>Bao cao ton kho</Button>
                <Button icon={<PrinterOutlined />}>Bao cao nhap xuat</Button>
                <Button icon={<PrinterOutlined />}>Bao cao thuoc sap het han</Button>
                <Button icon={<PrinterOutlined />}>Bao cao phat thuoc hang ngay</Button>
                <Button icon={<PrinterOutlined />}>The kho</Button>
              </Space>
            </Card>
          ),
        },
      ]} />

      {/* Receipt Modal */}
      <Modal title="Tao phieu nhap kho" open={receiptModal} onCancel={() => setReceiptModal(false)} onOk={handleCreateReceipt} okText="Luu" width={800}>
        <Button type="dashed" icon={<PlusOutlined />} onClick={() => { addItemForm.resetFields(); setAddItemModal(true); }} style={{ marginBottom: 16 }}>Them thuoc</Button>
        <Table dataSource={receiptItems} rowKey={(_, i) => String(i)} size="small" pagination={false}
          columns={[
            { title: 'Ten thuoc', dataIndex: 'medicineName' },
            { title: 'DVT', dataIndex: 'unit', width: 60 },
            { title: 'SL', dataIndex: 'quantity', width: 60 },
            { title: 'Don gia', dataIndex: 'unitPrice', width: 100, render: (v: number) => v?.toLocaleString() },
            { title: 'Thanh tien', dataIndex: 'totalPrice', width: 100, render: (v: number) => v?.toLocaleString() },
            { title: 'Lo', dataIndex: 'batchNumber', width: 100 },
            { title: 'Han dung', dataIndex: 'expiryDate', width: 100 },
          ]}
        />
      </Modal>

      <Modal title="Them thuoc vao phieu nhap" open={addItemModal} onCancel={() => setAddItemModal(false)} onOk={() => addItemForm.submit()} okText="Them">
        <Form form={addItemForm} layout="vertical" onFinish={handleAddItem}>
          <Form.Item name="medicineName" label="Ten thuoc" rules={[{ required: true }]}><Input /></Form.Item>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="unit" label="DVT" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="quantity" label="So luong" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} min={1} /></Form.Item></Col>
            <Col span={8}><Form.Item name="unitPrice" label="Don gia" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} min={0} /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="batchNumber" label="So lo" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="expiryDate" label="Han dung" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>

      {/* Lower Level Issue Modal */}
      <Modal title="Xuat thuoc tuyen duoi" open={lowerLevelModal} onCancel={() => setLowerLevelModal(false)} onOk={() => lowerLevelForm.submit()} okText="Xuat">
        <Form form={lowerLevelForm} layout="vertical" onFinish={async (v) => { try { await pharmacyApi.createLowerLevelIssue({ fromWarehouseId: v.fromWarehouseId, toFacilityId: v.toFacilityId, notes: v.notes, items: [] }); message.success('Xuat thanh cong'); setLowerLevelModal(false); fetchLowerLevelIssues(); } catch { message.warning('Loi'); } }}>
          <Form.Item name="fromWarehouseId" label="Kho xuat" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="toFacilityId" label="Don vi nhan" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="notes" label="Ghi chu"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>

      {/* Disposal Modal */}
      <Modal title="Xuat thanh ly" open={disposalModal} onCancel={() => setDisposalModal(false)} onOk={() => disposalForm.submit()} okText="Xuat">
        <Form form={disposalForm} layout="vertical" onFinish={async (v) => { try { await pharmacyApi.createDisposalIssue({ warehouseId: v.warehouseId, reason: v.reason, items: [] }); message.success('Tao phieu TL thanh cong'); setDisposalModal(false); fetchDisposalIssues(); } catch { message.warning('Loi'); } }}>
          <Form.Item name="warehouseId" label="Kho" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="reason" label="Ly do" rules={[{ required: true }]}><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>

      {/* Retail Sale Modal */}
      <Modal title="Ban thuoc" open={retailSaleModal} onCancel={() => setRetailSaleModal(false)} onOk={() => retailSaleForm.submit()} okText="Ban">
        <Form form={retailSaleForm} layout="vertical" onFinish={async (v) => { try { await pharmacyApi.createRetailSale({ patientName: v.patientName, paymentMethod: v.paymentMethod, warehouseId: v.warehouseId, items: [] }); message.success('Ban thuoc thanh cong'); setRetailSaleModal(false); fetchRetailSales(); } catch { message.warning('Loi'); } }}>
          <Form.Item name="patientName" label="Ten khach hang"><Input /></Form.Item>
          <Form.Item name="warehouseId" label="Kho" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="paymentMethod" label="Phuong thuc thanh toan"><Select options={[{ value: 'cash', label: 'Tien mat' }, { value: 'transfer', label: 'Chuyen khoan' }, { value: 'card', label: 'The' }]} /></Form.Item>
        </Form>
      </Modal>

      {/* Procurement Modal */}
      <Modal title="Du tru tuyen tren" open={procurementModal} onCancel={() => setProcurementModal(false)} onOk={() => procurementForm.submit()} okText="Tao">
        <Form form={procurementForm} layout="vertical" onFinish={async (v) => { try { await pharmacyApi.createUpperProcurement({ notes: v.notes, items: [] }); message.success('Tao du tru thanh cong'); setProcurementModal(false); fetchUpperProcurements(); } catch { message.warning('Loi'); } }}>
          <Form.Item name="notes" label="Ghi chu"><Input.TextArea rows={3} /></Form.Item>
        </Form>
      </Modal>
    </Spin>
  );
}
