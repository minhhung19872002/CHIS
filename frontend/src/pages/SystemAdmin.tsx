import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Tag, Spin, message, Modal, Tabs, Input, Space, Form, Row, Col, Select, Switch, DatePicker } from 'antd';
import { PlusOutlined, ReloadOutlined, SearchOutlined, EditOutlined, KeyOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { systemApi } from '../api/system';
import type { UserDto, RoleDto, SystemConfigDto, AuditLogDto } from '../api/system';

export default function SystemAdmin() {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<UserDto[]>([]);
  const [uTotal, setUTotal] = useState(0);
  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [configs, setConfigs] = useState<SystemConfigDto[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogDto[]>([]);
  const [aTotal, setATotal] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [userModal, setUserModal] = useState(false);
  const [roleModal, setRoleModal] = useState(false);
  const [userForm] = Form.useForm();
  const [roleForm] = Form.useForm();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try { const res = await systemApi.getUsers({ keyword, pageSize: 30 }); setUsers(res.data.items); setUTotal(res.data.total); } catch { setUsers([]); } finally { setLoading(false); }
  }, [keyword]);
  const fetchRoles = useCallback(async () => {
    try { const res = await systemApi.getRoles(); setRoles(res.data); } catch { setRoles([]); }
  }, []);
  const fetchConfigs = useCallback(async () => {
    try { const res = await systemApi.getConfigs(); setConfigs(res.data); } catch { setConfigs([]); }
  }, []);
  const fetchAudit = useCallback(async () => {
    try { const res = await systemApi.getAuditLogs({ pageSize: 50 }); setAuditLogs(res.data.items); setATotal(res.data.total); } catch { setAuditLogs([]); }
  }, []);
  useEffect(() => { fetchUsers(); fetchRoles(); fetchConfigs(); fetchAudit(); }, [fetchUsers, fetchRoles, fetchConfigs, fetchAudit]);

  const handleCreateUser = async (values: Record<string, unknown>) => {
    try {
      await systemApi.createUser({
        username: values.username as string, fullName: values.fullName as string,
        email: values.email as string, phoneNumber: values.phoneNumber as string,
        roles: values.roles as string[], password: values.password as string,
      });
      message.success('Tao tai khoan thanh cong'); setUserModal(false); userForm.resetFields(); fetchUsers();
    } catch { message.warning('Loi tao tai khoan'); }
  };

  const handleResetPassword = async (id: string) => {
    try { await systemApi.resetPassword(id); message.success('Reset mat khau thanh cong'); } catch { message.warning('Loi reset'); }
  };

  const handleCreateRole = async (values: Record<string, unknown>) => {
    try {
      await systemApi.createRole({ name: values.name as string, description: values.description as string, permissions: values.permissions as string[] || [] });
      message.success('Tao vai tro thanh cong'); setRoleModal(false); roleForm.resetFields(); fetchRoles();
    } catch { message.warning('Loi tao vai tro'); }
  };

  const handleUpdateConfig = async (key: string, value: string) => {
    try { await systemApi.updateConfig(key, value); message.success('Cap nhat cau hinh thanh cong'); fetchConfigs(); } catch { message.warning('Loi cap nhat'); }
  };

  const userColumns: ColumnsType<UserDto> = [
    { title: 'Username', dataIndex: 'username', width: 120 },
    { title: 'Ho ten', dataIndex: 'fullName', width: 150 },
    { title: 'Email', dataIndex: 'email', width: 180 },
    { title: 'SDT', dataIndex: 'phoneNumber', width: 100 },
    { title: 'Vai tro', dataIndex: 'roles', width: 120, render: (v: string[]) => v?.map(r => <Tag key={r}>{r}</Tag>) },
    { title: 'Trang thai', dataIndex: 'isActive', width: 80, render: (v: boolean) => v ? <Tag color="green">HD</Tag> : <Tag>Khoa</Tag> },
    { title: 'Dang nhap cuoi', dataIndex: 'lastLogin', width: 120, render: (v: string) => v ? dayjs(v).format('DD/MM HH:mm') : '' },
    {
      title: '', width: 80,
      render: (_: unknown, r: UserDto) => <Button size="small" icon={<KeyOutlined />} onClick={() => handleResetPassword(r.id)}>Reset</Button>,
    },
  ];

  const auditColumns: ColumnsType<AuditLogDto> = [
    { title: 'Thoi gian', dataIndex: 'timestamp', width: 130, render: (v: string) => dayjs(v).format('DD/MM HH:mm:ss') },
    { title: 'User', dataIndex: 'username', width: 100 },
    { title: 'Hanh dong', dataIndex: 'action', width: 100, render: (v: string) => <Tag color={v === 'POST' ? 'green' : v === 'PUT' ? 'blue' : v === 'DELETE' ? 'red' : 'default'}>{v}</Tag> },
    { title: 'Module', dataIndex: 'module', width: 100 },
    { title: 'Doi tuong', dataIndex: 'entityType', width: 100 },
    { title: 'Chi tiet', dataIndex: 'details' },
  ];

  return (
    <Spin spinning={loading}>
      <Tabs items={[
        {
          key: 'users', label: 'Nguoi dung',
          children: (
            <Card extra={<Space>
              <Input placeholder="Tim kiem..." prefix={<SearchOutlined />} value={keyword} onChange={e => setKeyword(e.target.value)} onPressEnter={() => fetchUsers()} style={{ width: 200 }} />
              <Button type="primary" icon={<PlusOutlined />} onClick={() => { userForm.resetFields(); setUserModal(true); }}>Them</Button>
            </Space>}>
              <Table columns={userColumns} dataSource={users} rowKey="id" size="small" pagination={{ total: uTotal, pageSize: 30 }} scroll={{ x: 960 }} />
            </Card>
          ),
        },
        {
          key: 'roles', label: 'Vai tro',
          children: (
            <Card extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { roleForm.resetFields(); setRoleModal(true); }}>Them</Button>}>
              <Table dataSource={roles} rowKey="id" size="small" pagination={false} columns={[
                { title: 'Ten', dataIndex: 'name', width: 150 },
                { title: 'Mo ta', dataIndex: 'description' },
                { title: 'Quyen', dataIndex: 'permissions', render: (v: string[]) => v?.length || 0 },
              ]} />
            </Card>
          ),
        },
        {
          key: 'configs', label: 'Cau hinh',
          children: (
            <Card extra={<Button icon={<ReloadOutlined />} onClick={fetchConfigs} />}>
              <Table dataSource={configs} rowKey="key" size="small" pagination={false} columns={[
                { title: 'Key', dataIndex: 'key', width: 200 },
                { title: 'Gia tri', dataIndex: 'value', width: 200, render: (v: string, r: SystemConfigDto) => (
                  <Input size="small" defaultValue={v} onBlur={e => { if (e.target.value !== v) handleUpdateConfig(r.key, e.target.value); }} />
                )},
                { title: 'Mo ta', dataIndex: 'description' },
                { title: 'Nhom', dataIndex: 'category', width: 100 },
              ]} />
            </Card>
          ),
        },
        {
          key: 'audit', label: 'Nhat ky',
          children: (
            <Card extra={<Button icon={<ReloadOutlined />} onClick={fetchAudit} />}>
              <Table columns={auditColumns} dataSource={auditLogs} rowKey="id" size="small" pagination={{ total: aTotal, pageSize: 50 }} scroll={{ x: 760 }} />
            </Card>
          ),
        },
      ]} />

      <Modal title="Them nguoi dung" open={userModal} onCancel={() => setUserModal(false)} onOk={() => userForm.submit()} okText="Tao">
        <Form form={userForm} layout="vertical" onFinish={handleCreateUser}>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="username" label="Ten dang nhap" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="fullName" label="Ho ten" rules={[{ required: true }]}><Input /></Form.Item></Col>
          </Row>
          <Form.Item name="password" label="Mat khau" rules={[{ required: true, min: 6 }]}><Input.Password /></Form.Item>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="email" label="Email"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="phoneNumber" label="SDT"><Input /></Form.Item></Col>
          </Row>
          <Form.Item name="roles" label="Vai tro">
            <Select mode="multiple" options={roles.map(r => ({ value: r.name, label: r.name }))} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="Them vai tro" open={roleModal} onCancel={() => setRoleModal(false)} onOk={() => roleForm.submit()} okText="Tao">
        <Form form={roleForm} layout="vertical" onFinish={handleCreateRole}>
          <Form.Item name="name" label="Ten vai tro" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="description" label="Mo ta"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>
    </Spin>
  );
}
