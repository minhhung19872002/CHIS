import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Tag, Spin, message, Modal, Tabs, Input, Space, Form, Row, Col, DatePicker, Select, Descriptions } from 'antd';
import { SearchOutlined, ReloadOutlined, PlusOutlined, TeamOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { populationApi } from '../api/population';
import type { HouseholdDto, HouseholdMemberDto, BirthCertificateDto, DeathCertificateDto } from '../api/population';

export default function Population() {
  const [loading, setLoading] = useState(false);
  const [households, setHouseholds] = useState<HouseholdDto[]>([]);
  const [hhTotal, setHhTotal] = useState(0);
  const [births, setBirths] = useState<BirthCertificateDto[]>([]);
  const [deaths, setDeaths] = useState<DeathCertificateDto[]>([]);
  const [keyword, setKeyword] = useState('');
  const [hhModal, setHhModal] = useState(false);
  const [memberModal, setMemberModal] = useState(false);
  const [birthModal, setBirthModal] = useState(false);
  const [deathModal, setDeathModal] = useState(false);
  const [selectedHh, setSelectedHh] = useState<HouseholdDto | null>(null);
  const [hhForm] = Form.useForm();
  const [memberForm] = Form.useForm();
  const [birthForm] = Form.useForm();
  const [deathForm] = Form.useForm();

  const fetchHouseholds = useCallback(async () => {
    setLoading(true);
    try {
      const res = await populationApi.searchHouseholds({ keyword, pageSize: 30 });
      setHouseholds(res.data.items);
      setHhTotal(res.data.total);
    } catch {
      setHouseholds([]);
    } finally {
      setLoading(false);
    }
  }, [keyword]);

  const fetchBirths = useCallback(async () => {
    try {
      const res = await populationApi.getBirthCertificates({ year: dayjs().year() });
      setBirths(res.data.items);
    } catch {
      setBirths([]);
    }
  }, []);

  const fetchDeaths = useCallback(async () => {
    try {
      const res = await populationApi.getDeathCertificates({ year: dayjs().year() });
      setDeaths(res.data.items);
    } catch {
      setDeaths([]);
    }
  }, []);

  useEffect(() => { fetchHouseholds(); fetchBirths(); fetchDeaths(); }, [fetchHouseholds, fetchBirths, fetchDeaths]);

  const handleCreateHousehold = async (values: Record<string, unknown>) => {
    try {
      await populationApi.createHousehold({
        householdCode: values.householdCode as string,
        headName: values.headName as string,
        address: values.address as string,
        wardId: values.wardId as string,
        villageGroup: values.villageGroup as string,
        phone: values.phone as string,
      } as Partial<HouseholdDto>);
      message.success('Tao ho khau thanh cong');
      setHhModal(false);
      hhForm.resetFields();
      fetchHouseholds();
    } catch {
      message.warning('Loi tao ho khau');
    }
  };

  const handleAddMember = async (values: Record<string, unknown>) => {
    if (!selectedHh) return;
    try {
      await populationApi.addMember(selectedHh.id, {
        fullName: values.fullName as string,
        dateOfBirth: (values.dateOfBirth as dayjs.Dayjs)?.format('YYYY-MM-DD'),
        gender: values.gender as number,
        relationship: values.relationship as string,
        idNumber: values.idNumber as string,
        insuranceNumber: values.insuranceNumber as string,
      });
      message.success('Them thanh vien thanh cong');
      setMemberModal(false);
      memberForm.resetFields();
      fetchHouseholds();
    } catch {
      message.warning('Loi them thanh vien');
    }
  };

  const handleCreateBirth = async (values: Record<string, unknown>) => {
    try {
      await populationApi.createBirth({
        childName: values.childName as string,
        dateOfBirth: (values.dateOfBirth as dayjs.Dayjs)?.format('YYYY-MM-DD'),
        gender: values.gender as number,
        birthWeight: values.birthWeight as number,
        birthPlace: values.birthPlace as string,
        motherName: values.motherName as string,
        fatherName: values.fatherName as string,
      });
      message.success('Ghi nhan khai sinh thanh cong');
      setBirthModal(false);
      birthForm.resetFields();
      fetchBirths();
    } catch {
      message.warning('Loi ghi nhan khai sinh');
    }
  };

  const handleCreateDeath = async (values: Record<string, unknown>) => {
    try {
      await populationApi.createDeath({
        deceasedName: values.deceasedName as string,
        dateOfDeath: (values.dateOfDeath as dayjs.Dayjs)?.format('YYYY-MM-DD'),
        causeOfDeath: values.causeOfDeath as string,
        icdCode: values.icdCode as string,
        age: values.age as number,
        gender: values.gender as number,
        address: values.address as string,
        deathPlace: values.deathPlace as string,
        reporterName: values.reporterName as string,
      });
      message.success('Ghi nhan tu vong thanh cong');
      setDeathModal(false);
      deathForm.resetFields();
      fetchDeaths();
    } catch {
      message.warning('Loi ghi nhan tu vong');
    }
  };

  const hhColumns: ColumnsType<HouseholdDto> = [
    { title: 'Ma ho', dataIndex: 'householdCode', width: 100 },
    { title: 'Chu ho', dataIndex: 'headName', width: 150 },
    { title: 'Dia chi', dataIndex: 'address', width: 200 },
    { title: 'Thon/To', dataIndex: 'villageGroup', width: 100 },
    { title: 'So TV', dataIndex: 'memberCount', width: 60, align: 'center' },
    {
      title: '', width: 100,
      render: (_: unknown, r: HouseholdDto) => (
        <Button size="small" onClick={() => { setSelectedHh(r); }}>Chi tiet</Button>
      ),
    },
  ];

  const memberColumns: ColumnsType<HouseholdMemberDto> = [
    { title: 'Ho ten', dataIndex: 'fullName' },
    { title: 'Ngay sinh', dataIndex: 'dateOfBirth', render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
    { title: 'Gioi', dataIndex: 'gender', render: (v: number) => v === 1 ? 'Nam' : 'Nu', width: 50 },
    { title: 'Quan he', dataIndex: 'relationship', width: 80 },
    { title: 'CCCD', dataIndex: 'idNumber', width: 120 },
    { title: 'BHYT', dataIndex: 'insuranceNumber', width: 120 },
  ];

  return (
    <Spin spinning={loading}>
      <Tabs items={[
        {
          key: 'households', label: 'Ho khau',
          children: (
            <Card extra={
              <Space>
                <Input placeholder="Tim kiem..." prefix={<SearchOutlined />} value={keyword} onChange={e => setKeyword(e.target.value)} onPressEnter={() => fetchHouseholds()} style={{ width: 220 }} />
                <Button type="primary" icon={<PlusOutlined />} onClick={() => { hhForm.resetFields(); setHhModal(true); }}>Them ho</Button>
                <Button icon={<ReloadOutlined />} onClick={fetchHouseholds} />
              </Space>
            }>
              <Table columns={hhColumns} dataSource={households} rowKey="id" size="small" pagination={{ total: hhTotal, pageSize: 30 }} scroll={{ x: 810 }} />
              {selectedHh && (
                <Card size="small" title={`Ho khau: ${selectedHh.headName}`} style={{ marginTop: 16 }}
                  extra={<Button size="small" type="primary" icon={<PlusOutlined />} onClick={() => { memberForm.resetFields(); setMemberModal(true); }}>Them TV</Button>}>
                  <Table columns={memberColumns} dataSource={selectedHh.members} rowKey="id" size="small" pagination={false} />
                </Card>
              )}
            </Card>
          ),
        },
        {
          key: 'births', label: 'Khai sinh',
          children: (
            <Card extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { birthForm.resetFields(); setBirthModal(true); }}>Ghi nhan</Button>}>
              <Table dataSource={births} rowKey="id" size="small" pagination={{ pageSize: 20 }} columns={[
                { title: 'Ho ten', dataIndex: 'childName' },
                { title: 'Ngay sinh', dataIndex: 'dateOfBirth', render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
                { title: 'Gioi', dataIndex: 'gender', render: (v: number) => v === 1 ? 'Nam' : 'Nu' },
                { title: 'Can nang', dataIndex: 'birthWeight', render: (v: number) => v ? `${v}g` : '' },
                { title: 'Noi sinh', dataIndex: 'birthPlace' },
                { title: 'Me', dataIndex: 'motherName' },
              ]} />
            </Card>
          ),
        },
        {
          key: 'deaths', label: 'Tu vong',
          children: (
            <Card extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { deathForm.resetFields(); setDeathModal(true); }}>Ghi nhan</Button>}>
              <Table dataSource={deaths} rowKey="id" size="small" pagination={{ pageSize: 20 }} columns={[
                { title: 'Ho ten', dataIndex: 'deceasedName' },
                { title: 'Ngay mat', dataIndex: 'dateOfDeath', render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
                { title: 'Nguyen nhan', dataIndex: 'causeOfDeath' },
                { title: 'ICD', dataIndex: 'icdCode', width: 80 },
                { title: 'Tuoi', dataIndex: 'age', width: 50 },
              ]} />
            </Card>
          ),
        },
        {
          key: 'elderly', label: 'Nguoi cao tuoi',
          children: (
            <Card title="Quan ly nguoi cao tuoi (tu 60 tuoi)">
              <p>Trich loc tu dan so theo do tuoi tu 60 tro len.</p>
              <Button type="primary" icon={<TeamOutlined />}>Xem danh sach</Button>
            </Card>
          ),
        },
      ]} />

      <Modal title="Them ho khau" open={hhModal} onCancel={() => setHhModal(false)} onOk={() => hhForm.submit()} okText="Luu">
        <Form form={hhForm} layout="vertical" onFinish={handleCreateHousehold}>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="householdCode" label="Ma ho" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="headName" label="Chu ho" rules={[{ required: true }]}><Input /></Form.Item></Col>
          </Row>
          <Form.Item name="address" label="Dia chi" rules={[{ required: true }]}><Input /></Form.Item>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="villageGroup" label="Thon/To"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="phone" label="SDT"><Input /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>

      <Modal title="Them thanh vien" open={memberModal} onCancel={() => setMemberModal(false)} onOk={() => memberForm.submit()} okText="Luu">
        <Form form={memberForm} layout="vertical" onFinish={handleAddMember}>
          <Form.Item name="fullName" label="Ho ten" rules={[{ required: true }]}><Input /></Form.Item>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="dateOfBirth" label="Ngay sinh" rules={[{ required: true }]}><DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="gender" label="Gioi tinh" rules={[{ required: true }]}><Select options={[{ value: 1, label: 'Nam' }, { value: 2, label: 'Nu' }]} /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="relationship" label="Quan he" rules={[{ required: true }]}><Select options={[{ value: 'Chu ho', label: 'Chu ho' }, { value: 'Vo/Chong', label: 'Vo/Chong' }, { value: 'Con', label: 'Con' }, { value: 'Chau', label: 'Chau' }, { value: 'Khac', label: 'Khac' }]} /></Form.Item></Col>
            <Col span={12}><Form.Item name="idNumber" label="CCCD"><Input /></Form.Item></Col>
          </Row>
          <Form.Item name="insuranceNumber" label="So BHYT"><Input /></Form.Item>
        </Form>
      </Modal>

      <Modal title="Khai sinh" open={birthModal} onCancel={() => setBirthModal(false)} onOk={() => birthForm.submit()} okText="Luu">
        <Form form={birthForm} layout="vertical" onFinish={handleCreateBirth}>
          <Form.Item name="childName" label="Ho ten tre" rules={[{ required: true }]}><Input /></Form.Item>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="dateOfBirth" label="Ngay sinh" rules={[{ required: true }]}><DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item name="gender" label="Gioi tinh" rules={[{ required: true }]}><Select options={[{ value: 1, label: 'Nam' }, { value: 2, label: 'Nu' }]} /></Form.Item></Col>
            <Col span={8}><Form.Item name="birthWeight" label="Can nang (g)"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="motherName" label="Ho ten me" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="fatherName" label="Ho ten cha"><Input /></Form.Item></Col>
          </Row>
          <Form.Item name="birthPlace" label="Noi sinh" rules={[{ required: true }]}><Input /></Form.Item>
        </Form>
      </Modal>

      <Modal title="Ghi nhan tu vong" open={deathModal} onCancel={() => setDeathModal(false)} onOk={() => deathForm.submit()} okText="Luu">
        <Form form={deathForm} layout="vertical" onFinish={handleCreateDeath}>
          <Form.Item name="deceasedName" label="Ho ten nguoi mat" rules={[{ required: true }]}><Input /></Form.Item>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="dateOfDeath" label="Ngay mat" rules={[{ required: true }]}><DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item name="age" label="Tuoi" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item name="gender" label="Gioi tinh" rules={[{ required: true }]}><Select options={[{ value: 1, label: 'Nam' }, { value: 2, label: 'Nu' }]} /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="causeOfDeath" label="Nguyen nhan tu vong" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="icdCode" label="Ma ICD"><Input /></Form.Item></Col>
          </Row>
          <Form.Item name="address" label="Dia chi" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="deathPlace" label="Noi mat"><Input /></Form.Item>
          <Form.Item name="reporterName" label="Nguoi bao tin" rules={[{ required: true }]}><Input /></Form.Item>
        </Form>
      </Modal>
    </Spin>
  );
}

function InputNumber(props: { style?: React.CSSProperties; min?: number }) {
  return <Input type="number" {...props} />;
}
