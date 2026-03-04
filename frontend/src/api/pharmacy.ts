import client from './client';

export interface MedicineDto {
  id: string;
  code: string;
  name: string;
  activeIngredient: string;
  dosageForm: string;
  strength: string;
  unit: string;
  manufacturer?: string;
  country?: string;
  insuranceCode?: string;
  insurancePrice?: number;
  retailPrice?: number;
  currentStock: number;
  minStock: number;
  maxStock: number;
  expiryDate?: string;
  batchNumber?: string;
  isActive: boolean;
}

export interface StockReceiptDto {
  id: string;
  receiptNumber: string;
  receiptDate: string;
  receiptType: number;
  supplierId?: string;
  supplierName?: string;
  sourceWarehouse?: string;
  totalAmount: number;
  status: number;
  items: StockReceiptItemDto[];
  note?: string;
}

export interface StockReceiptItemDto {
  id?: string;
  medicineId: string;
  medicineName: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  unit: string;
}

export interface DispensingDto {
  id: string;
  prescriptionId: string;
  patientName: string;
  dispensedDate: string;
  dispensedBy: string;
  status: number;
  items: DispensingItemDto[];
}

export interface DispensingItemDto {
  medicineId: string;
  medicineName: string;
  quantity: number;
  batchNumber: string;
  unit: string;
}

export interface StockSearchDto {
  keyword?: string;
  isLowStock?: boolean;
  isExpiring?: boolean;
  pageIndex?: number;
  pageSize?: number;
}

// New DTOs
export interface LowerLevelIssueDto {
  id: string;
  issueCode?: string;
  fromWarehouseId: string;
  fromWarehouseName?: string;
  toFacilityId: string;
  toFacilityName?: string;
  issueDate: string;
  items: LowerLevelIssueItemDto[];
  status: number;
  notes?: string;
  totalAmount: number;
}

export interface LowerLevelIssueItemDto {
  medicineId: string;
  medicineName?: string;
  unit?: string;
  quantity: number;
  unitPrice: number;
  batchNumber?: string;
  expiryDate?: string;
}

export interface UpperLevelReceiptDto {
  id: string;
  receiptCode?: string;
  fromFacilityId?: string;
  fromFacilityName?: string;
  receiptDate: string;
  status: number;
  totalAmount: number;
}

export interface InspectionReportDto {
  id: string;
  reportCode?: string;
  warehouseId: string;
  warehouseName?: string;
  supplierId?: string;
  supplierName?: string;
  inspectionDate: string;
  template?: string;
  notes?: string;
  status: number;
}

export interface StockTakeReportDto {
  id: string;
  stockTakeCode?: string;
  warehouseId: string;
  warehouseName?: string;
  year: number;
  month: number;
  stockTakeDate: string;
  hasDisposal: boolean;
  status: number;
  notes?: string;
}

export interface DisposalIssueDto {
  id: string;
  issueCode?: string;
  warehouseId: string;
  warehouseName?: string;
  issueDate: string;
  reason?: string;
  approvedBy?: string;
  status: number;
  totalAmount: number;
}

export interface RetailSaleDto {
  id: string;
  saleCode?: string;
  patientId?: string;
  patientName?: string;
  saleDate: string;
  totalAmount: number;
  paymentMethod?: string;
  status: number;
}

export interface UpperProcurementDto {
  id: string;
  requestCode?: string;
  facilityId?: string;
  facilityName?: string;
  requestDate: string;
  status: number;
  sentDate?: string;
  notes?: string;
}

export interface StockCardDto {
  medicineId: string;
  medicineName?: string;
  unit?: string;
  entries: StockCardEntryDto[];
}

export interface StockCardEntryDto {
  date: string;
  documentCode?: string;
  transactionType?: string;
  quantityIn: number;
  quantityOut: number;
  balance: number;
  batchNumber?: string;
  notes?: string;
}

export interface DocumentLockDto {
  warehouseId: string;
  warehouseName?: string;
  year: number;
  month: number;
  isLocked: boolean;
  lockedAt?: string;
  lockedBy?: string;
}

export interface PrescriptionApprovalDto {
  prescriptionId: string;
  prescriptionCode?: string;
  patientId: string;
  patientName?: string;
  doctorName?: string;
  prescriptionDate: string;
  diagnosis?: string;
  items: PrescriptionApprovalItemDto[];
  status: number;
}

export interface PrescriptionApprovalItemDto {
  medicineId: string;
  medicineName?: string;
  unit?: string;
  quantity: number;
  dosage?: string;
  usage?: string;
  daysSupply?: number;
}

export interface DailyDispenseReportDto {
  date: string;
  warehouseId?: string;
  warehouseName?: string;
  totalPrescriptions: number;
  totalAmount: number;
  items: { medicineId: string; medicineName?: string; unit?: string; quantity: number; amount: number }[];
}

export const pharmacyApi = {
  // Existing
  searchMedicines: (params: StockSearchDto) =>
    client.get<{ items: MedicineDto[]; total: number }>('/pharmacy/stock', { params }),
  getMedicineById: (id: string) => client.get<MedicineDto>(`/pharmacy/medicines/${id}`),
  getStockReceipts: (params: { fromDate?: string; toDate?: string; type?: number; pageIndex?: number; pageSize?: number }) =>
    client.get<{ items: StockReceiptDto[]; total: number }>('/pharmacy/receipts', { params }),
  createReceipt: (data: Partial<StockReceiptDto>) =>
    client.post<StockReceiptDto>('/pharmacy/receipts', data),
  approveReceipt: (id: string) => client.post(`/pharmacy/receipts/${id}/approve`),
  getPendingDispensing: () =>
    client.get<DispensingDto[]>('/pharmacy/dispensing/pending'),
  dispense: (prescriptionId: string, items: DispensingItemDto[]) =>
    client.post('/pharmacy/dispensing', { prescriptionId, items }),
  getStockReport: (params?: { groupBy?: string }) =>
    client.get('/pharmacy/reports/stock', { params }),
  getExpiryReport: (daysAhead?: number) =>
    client.get('/pharmacy/reports/expiry', { params: { daysAhead } }),
  transferToStation: (data: { toFacilityId: string; items: { medicineId: string; quantity: number }[] }) =>
    client.post('/pharmacy/transfer', data),
  getUpperLevelStock: () => client.get<MedicineDto[]>('/pharmacy/upper-level/stock'),
  requestFromUpperLevel: (items: { medicineId: string; quantity: number }[]) =>
    client.post('/pharmacy/upper-level/request', { items }),

  // Xuat tuyen duoi
  createLowerLevelIssue: (data: { fromWarehouseId: string; toFacilityId: string; notes?: string; items: LowerLevelIssueItemDto[] }) =>
    client.post<LowerLevelIssueDto>('/pharmacy/lower-level-issues', data),
  getLowerLevelIssues: (params?: { facilityId?: string; pageIndex?: number; pageSize?: number }) =>
    client.get<{ items: LowerLevelIssueDto[]; totalCount: number }>('/pharmacy/lower-level-issues', { params }),

  // Nhap tuyen tren
  receiveFromUpperLevel: (receiptId: string) =>
    client.post(`/pharmacy/upper-level-receipts/${receiptId}/receive`),
  getUpperLevelReceipts: (params?: { facilityId?: string; pageIndex?: number; pageSize?: number }) =>
    client.get<{ items: UpperLevelReceiptDto[]; totalCount: number }>('/pharmacy/upper-level-receipts', { params }),

  // Bien ban kiem nhap
  createInspectionReport: (data: { warehouseId: string; supplierId?: string; template?: string; notes?: string; items: unknown[] }) =>
    client.post<InspectionReportDto>('/pharmacy/inspection-reports', data),
  getInspectionReports: (params?: { warehouseId?: string; pageIndex?: number; pageSize?: number }) =>
    client.get<{ items: InspectionReportDto[]; totalCount: number }>('/pharmacy/inspection-reports', { params }),

  // Kiem ke
  createStockTakeReport: (data: { warehouseId: string; year: number; month: number; notes?: string; items: unknown[] }) =>
    client.post<StockTakeReportDto>('/pharmacy/stock-take-reports', data),
  getStockTakeReports: (params?: { warehouseId?: string; year?: number; pageIndex?: number; pageSize?: number }) =>
    client.get<{ items: StockTakeReportDto[]; totalCount: number }>('/pharmacy/stock-take-reports', { params }),

  // Thanh ly
  createDisposalIssue: (data: { warehouseId: string; reason?: string; items: unknown[] }) =>
    client.post<DisposalIssueDto>('/pharmacy/disposal-issues', data),
  getDisposalIssues: (params?: { warehouseId?: string; pageIndex?: number; pageSize?: number }) =>
    client.get<{ items: DisposalIssueDto[]; totalCount: number }>('/pharmacy/disposal-issues', { params }),

  // Ban thuoc
  createRetailSale: (data: { patientId?: string; patientName?: string; paymentMethod?: string; warehouseId: string; items: unknown[] }) =>
    client.post<RetailSaleDto>('/pharmacy/retail-sales', data),
  getRetailSales: (params?: { from?: string; to?: string; pageIndex?: number; pageSize?: number }) =>
    client.get<{ items: RetailSaleDto[]; totalCount: number }>('/pharmacy/retail-sales', { params }),

  // Du tru tuyen tren
  createUpperProcurement: (data: { facilityId?: string; notes?: string; items: unknown[] }) =>
    client.post<UpperProcurementDto>('/pharmacy/upper-procurements', data),
  sendUpperProcurement: (id: string) =>
    client.post(`/pharmacy/upper-procurements/${id}/send`),
  getUpperProcurements: (params?: { pageIndex?: number; pageSize?: number }) =>
    client.get<{ items: UpperProcurementDto[]; totalCount: number }>('/pharmacy/upper-procurements', { params }),

  // The kho
  getStockCard: (params: { warehouseId: string; medicineId: string; from: string; to: string }) =>
    client.get<StockCardDto>('/pharmacy/stock-card', { params }),

  // Khoa so
  lockDocumentPeriod: (params: { warehouseId: string; year: number; month: number }) =>
    client.post('/pharmacy/document-locks/lock', null, { params }),
  unlockDocumentPeriod: (params: { warehouseId: string; year: number; month: number }) =>
    client.post('/pharmacy/document-locks/unlock', null, { params }),
  getDocumentLocks: (warehouseId: string) =>
    client.get<DocumentLockDto[]>('/pharmacy/document-locks', { params: { warehouseId } }),

  // Duyet toa
  approvePrescription: (prescriptionId: string) =>
    client.post(`/pharmacy/prescriptions/${prescriptionId}/approve`),
  getPendingPrescriptions: (params?: { pageIndex?: number; pageSize?: number }) =>
    client.get<{ items: PrescriptionApprovalDto[]; totalCount: number }>('/pharmacy/prescriptions/pending', { params }),

  // Bao cao
  getDailyDispenseReport: (params: { date: string; warehouseId?: string }) =>
    client.get<DailyDispenseReportDto>('/pharmacy/reports/daily-dispense', { params }),
  getLowerLevelStock: (facilityId?: string) =>
    client.get('/pharmacy/lower-level-stock', { params: { facilityId } }),
};
