import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Tag, Spin, message, Modal, Tabs, Input, Space, Form, Row, Col, Select, Popconfirm } from 'antd';
import { PlusOutlined, ReloadOutlined, SearchOutlined, EditOutlined, KeyOutlined, DeleteOutlined } from '@ant-design/icons';
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
  const [editingUser, setEditingUser] = useState<UserDto | null>(null);
  const [editingRole, setEditingRole] = useState<RoleDto | null>(null);
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

  const handleSaveUser = async (values: Record<string, unknown>) => {
    try {
      const data = {
        username: values.username as string, fullName: values.fullName as string,
        email: values.email as string, phoneNumber: values.phoneNumber as string,
        roles: values.roles as string[], password: values.password as string,
      };
      if (editingUser) {
        await systemApi.updateUser(editingUser.id, data);
        message.success('Cập nhật thành công');
      } else {
        await systemApi.createUser(data);
        message.success('Tạo tài khoản thành công');
      }
      setUserModal(false); userForm.resetFields(); setEditingUser(null); fetchUsers();
    } catch { message.warning('Lỗi lưu dữ liệu'); }
  };

  const handleEditUser = (record: UserDto) => {
    setEditingUser(record);
    userForm.setFieldsValue(record);
    setUserModal(true);
  };

  const handleDeleteUser = async (id: string) => {
    try { await systemApi.deleteUser(id); message.success('Xóa thành công'); fetchUsers(); } catch { message.warning('Lỗi xóa'); }
  };

  const handleResetPassword = async (id: string) => {
    try { await systemApi.resetPassword(id); message.success('Reset mật khẩu thành công'); } catch { message.warning('Lỗi reset'); }
  };

  const handleSaveRole = async (values: Record<string, unknown>) => {
    try {
      const data = { name: values.name as string, description: values.description as string, permissions: values.permissions as string[] || [] };
      if (editingRole) {
        await systemApi.updateRole(editingRole.id, data);
        message.success('Cập nhật thành công');
      } else {
        await systemApi.createRole(data);
        message.success('Tạo vai trò thành công');
      }
      setRoleModal(false); roleForm.resetFields(); setEditingRole(null); fetchRoles();
    } catch { message.warning('Lỗi lưu dữ liệu'); }
  };

  const handleUpdateConfig = async (key: string, value: string) => {
    try { await systemApi.updateConfig(key, value); message.success('Cập nhật cấu hình thành công'); fetchConfigs(); } catch { message.warning('Lỗi cập nhật'); }
  };

  const userColumns: ColumnsType<UserDto> = [
    { title: 'Tên đăng nhập', dataIndex: 'username', width: 120 },
    { title: 'Họ tên', dataIndex: 'fullName', width: 150 },
    { title: 'Email', dataIndex: 'email', width: 180 },
    { title: 'SĐT', dataIndex: 'phoneNumber', width: 100 },
    { title: 'Vai trò', dataIndex: 'roles', width: 120, render: (v: string[]) => v?.map(r => <Tag key={r}>{r}</Tag>) },
    { title: 'Trạng thái', dataIndex: 'isActive', width: 80, render: (v: boolean) => v ? <Tag color="green">HĐ</Tag> : <Tag>Khóa</Tag> },
    { title: 'Đăng nhập cuối', dataIndex: 'lastLogin', width: 120, render: (v: string) => v ? dayjs(v).format('DD/MM HH:mm') : '' },
    {
      title: '', width: 140, fixed: 'right',
      render: (_: unknown, r: UserDto) => (
        <Space size="small">
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEditUser(r)} />
          <Popconfirm title="Reset mật khẩu?" onConfirm={() => handleResetPassword(r.id)} okText="Reset" cancelText="Hủy">
            <Button size="small" icon={<KeyOutlined />} />
          </Popconfirm>
          <Popconfirm title="Xóa người dùng này?" onConfirm={() => handleDeleteUser(r.id)} okText="Xóa" cancelText="Hủy">
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const auditColumns: ColumnsType<AuditLogDto> = [
    { title: 'Thời gian', dataIndex: 'timestamp', width: 130, render: (v: string) => dayjs(v).format('DD/MM HH:mm:ss') },
    { title: 'User', dataIndex: 'username', width: 100 },
    { title: 'Hành động', dataIndex: 'action', width: 100, render: (v: string) => <Tag color={v === 'POST' ? 'green' : v === 'PUT' ? 'blue' : v === 'DELETE' ? 'red' : 'default'}>{v}</Tag> },
    { title: 'Module', dataIndex: 'module', width: 100 },
    { title: 'Đối tượng', dataIndex: 'entityType', width: 100 },
    { title: 'Chi tiết', dataIndex: 'details', ellipsis: true },
  ];

  return (
    <Spin spinning={loading}>
      <Tabs items={[
        {
          key: 'users', label: 'Người dùng',
          children: (
            <Card extra={
              <Space>
                <Input placeholder="Tìm kiếm..." prefix={<SearchOutlined />} value={keyword} onChange={e => setKeyword(e.target.value)} onPressEnter={() => fetchUsers()} style={{ width: 200 }} allowClear />
                <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingUser(null); userForm.resetFields(); setUserModal(true); }}>Thêm</Button>
                <Button icon={<ReloadOutlined />} onClick={fetchUsers} />
              </Space>
            }>
              <Table columns={userColumns} dataSource={users} rowKey="id" size="small" pagination={{ total: uTotal, pageSize: 30 }} scroll={{ x: 1100 }} />
            </Card>
          ),
        },
        {
          key: 'roles', label: 'Vai trò',
          children: (
            <Card extra={
              <Space>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingRole(null); roleForm.resetFields(); setRoleModal(true); }}>Thêm</Button>
                <Button icon={<ReloadOutlined />} onClick={fetchRoles} />
              </Space>
            }>
              <Table dataSource={roles} rowKey="id" size="small" pagination={false} columns={[
                { title: 'Tên', dataIndex: 'name', width: 150 },
                { title: 'Mô tả', dataIndex: 'description' },
                { title: 'Quyền', dataIndex: 'permissions', width: 80, align: 'right' as const, render: (v: string[]) => v?.length || 0 },
                {
                  title: '', width: 80,
                  render: (_: unknown, r: RoleDto) => (
                    <Space size="small">
                      <Button size="small" icon={<EditOutlined />} onClick={() => { setEditingRole(r); roleForm.setFieldsValue(r); setRoleModal(true); }} />
                      <Popconfirm title="Xóa vai trò này?" onConfirm={async () => { try { await systemApi.deleteRole(r.id); message.success('Xóa thành công'); fetchRoles(); } catch { message.warning('Lỗi xóa'); } }} okText="Xóa" cancelText="Hủy">
                        <Button size="small" danger icon={<DeleteOutlined />} />
                      </Popconfirm>
                    </Space>
                  ),
                },
              ]} />
            </Card>
          ),
        },
        {
          key: 'configs', label: 'Cấu hình',
          children: (
            <Card extra={<Button icon={<ReloadOutlined />} onClick={fetchConfigs} />}>
              <Table dataSource={configs} rowKey="key" size="small" pagination={false} columns={[
                { title: 'Key', dataIndex: 'key', width: 200 },
                { title: 'Giá trị', dataIndex: 'value', width: 200, render: (v: string, r: SystemConfigDto) => (
                  <Input size="small" defaultValue={v} onBlur={e => { if (e.target.value !== v) handleUpdateConfig(r.key, e.target.value); }} />
                )},
                { title: 'Mô tả', dataIndex: 'description' },
                { title: 'Nhóm', dataIndex: 'category', width: 100 },
              ]} />
            </Card>
          ),
        },
        {
          key: 'audit', label: 'Nhật ký',
          children: (
            <Card extra={<Button icon={<ReloadOutlined />} onClick={fetchAudit} />}>
              <Table columns={auditColumns} dataSource={auditLogs} rowKey="id" size="small" pagination={{ total: aTotal, pageSize: 50 }} scroll={{ x: 760 }} />
            </Card>
          ),
        },
      ]} />

      <Modal title={editingUser ? 'Sửa người dùng' : 'Thêm người dùng'} open={userModal} onCancel={() => setUserModal(false)} onOk={() => userForm.submit()} okText="Lưu" cancelText="Hủy">
        <Form form={userForm} layout="vertical" onFinish={handleSaveUser}>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="username" label="Tên đăng nhập" rules={[{ required: true, message: 'Nhập tên đăng nhập' }]}><Input disabled={!!editingUser} /></Form.Item></Col>
            <Col span={12}><Form.Item name="fullName" label="Họ tên" rules={[{ required: true, message: 'Nhập họ tên' }]}><Input /></Form.Item></Col>
          </Row>
          {!editingUser && <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, min: 6, message: 'Mật khẩu tối thiểu 6 ký tự' }]}><Input.Password /></Form.Item>}
          <Row gutter={12}>
            <Col span={12}><Form.Item name="email" label="Email"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="phoneNumber" label="SĐT"><Input /></Form.Item></Col>
          </Row>
          <Form.Item name="roles" label="Vai trò">
            <Select mode="multiple" options={roles.map(r => ({ value: r.name, label: r.name }))} placeholder="Chọn vai trò" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title={editingRole ? 'Sửa vai trò' : 'Thêm vai trò'} open={roleModal} onCancel={() => setRoleModal(false)} onOk={() => roleForm.submit()} okText="Lưu" cancelText="Hủy">
        <Form form={roleForm} layout="vertical" onFinish={handleSaveRole}>
          <Form.Item name="name" label="Tên vai trò" rules={[{ required: true, message: 'Nhập tên vai trò' }]}><Input /></Form.Item>
          <Form.Item name="description" label="Mô tả"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>
    </Spin>
  );
}
