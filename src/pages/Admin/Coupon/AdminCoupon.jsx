import React, { useEffect, useRef, useState } from 'react';
import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
} from '@ant-design/icons';

import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table
} from 'antd';
import Highlighter from 'react-highlight-words';
import '../../../css/AdminGenre.css';
import {
  APICreateCoupon,
  APIGetAllCoupon,
  APIGetCouponDetail,
  APIDeleteCoupon,
} from '../../../services/service.api';
import dayjs from 'dayjs';
const AdminCoupon = () => {
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);
  const [listCoupon, setListCoupon] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [formUpdate] = Form.useForm();
  const [couponDetail, setCouponDetail] = useState(null);
  const [isModalUpdateOpen, setIsModalUpdateOpen] = useState(false);

  const handleChangeStatus = (value) => {
    // console.log(`selected ${value}`);
  }

  const showModalUpdate = async (uuid) => {
    try {
      const res = await APIGetCouponDetail({ uuid });
      // console.log('update', res);
      if (res && res.status === 200) {
        const couponDetail = res.data.data;
        setCouponDetail(couponDetail);
        formUpdate.setFieldsValue({
          code: couponDetail.code,
          quantity:couponDetail.quantity,
          discount:couponDetail.discount,
          startDate: dayjs(couponDetail.startDate, 'YYYY-MM-DD'),
          endDate: dayjs(couponDetail.endDate, 'YYYY-MM-DD'),
          status: couponDetail.status,
        });
        setIsModalUpdateOpen(true);
      } else {
        message.error('Không tìm thấy thông tin chi tiết.');
      }
    } catch (error) {
      if (error.response) {
        const errorMessage =
          error.response.data?.error?.errorMessage ||
          'Đã xảy ra lỗi khi lấy thông tin chi tiết.';
        message.error(errorMessage);
      } else {
        message.error('Đã xảy ra lỗi khi lấy thông tin chi tiết.');
      }
    }
  };

  const formatToDateString = (dateObj) => {
    return dayjs(dateObj).format('YYYY-MM-DD');
  };
  const onFinishUpdateDirectorInfor = async (values) => {
    const { startDate,endDate, ...restValues } = values;
    const startDateFormat = formatToDateString(startDate);
    const endDateFormat = formatToDateString(endDate);
    try {
      const res = await APICreateCoupon({
        uuid: couponDetail?.uuid,
        code: restValues.code,
        quantity:restValues.quantity,
        discount:restValues.discount,
        startDate: startDateFormat,
        endDate: endDateFormat,
        status: restValues.status,
      });
      if (res && res.status === 200) {
        message.success(res.data.error.errorMessage);
        form.resetFields();
        getAllDirector();
        handleCancelUpdate();
      }
    } catch (error) {
      if (error.response) {
        const errorMessage =
          error.response.data?.error?.errorMessage ||
          'Đã xảy ra lỗi khi update.';
        message.error(errorMessage);
      } else if (error.request) {
        message.error(
          'Không nhận được phản hồi từ máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.'
        );
      } else {
        message.error('Đã xảy ra lỗi. Vui lòng thử lại sau.');
      }
    }
  };

  const getAllDirector = async () => {
    try {
      const res = await APIGetAllCoupon({ pageSize: 1000, page: 1 });
      // console.log(res.data.data);
      if (res && res.data && res.data.data) {
        // Lọc các region có status khác "0"
        const filteredCoupons = res.data?.data?.items.filter(
          (coupon) => coupon.status !== 0
        );
        setListCoupon(filteredCoupons); // Cập nhật danh sách coupon đã lọc
        form.resetFields();
        handleCancel();
      }
    } catch (error) {
      message.error('Đã xảy ra lỗi khi lấy danh sách khuyến mãi.');
    }
  };
  const onFinish = async (values) => {
    const { startDate,endDate, ...restValues } = values;
    const startDateFormat = formatToDateString(startDate);
    const endDateFormat = formatToDateString(endDate);
    const dataDirector = {
      ...restValues,
      startDate: startDateFormat,
      endDate: endDateFormat,
    };
    try {
      const res = await APICreateCoupon(dataDirector);
      // console.log(res);
      if (res && res.status === 200) {
        message.success(res.data.error.errorMessage);
        form.resetFields();
        getAllDirector();
      }
      // console.log("Success:", values);
    } catch (error) {
      if (error.response) {
        const errorMessage =
          error.response.data?.error?.errorMessage ||
          'Đã xảy ra lỗi khi thêm mới.';
        message.error(errorMessage);
      } else if (error.request) {
        message.error(
          'Không nhận được phản hồi từ máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.'
        );
      } else {
        message.error('Đã xảy ra lỗi. Vui lòng thử lại sau.');
      }
    }
  };
  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };
  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleCancelUpdate = () => {
    setIsModalUpdateOpen(false);
  };

  const onClose = () => {
    setOpen(false);
    setIsModalUpdateOpen(false);
  };
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText('');
  };
  const confirm = async (uuid) => {
    try {
      const res = await APIDeleteCoupon({ uuid, status: 0 });
      if (res && res.status === 200) {
        message.success('Đã xoá thành công.');
        getAllDirector(); // Cập nhật lại danh sách coupon sau khi xoá
      } else {
        message.error('Xoá thất bại.');
      }
    } catch (error) {
      if (error.response) {
        const errorMessage =
          error.response.data?.error?.errorMessage ||
          'Đã xảy ra lỗi khi cập nhật status.';
        message.error(errorMessage);
      } else if (error.request) {
        message.error(
          'Không nhận được phản hồi từ máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.'
        );
      } else {
        message.error('Đã xảy ra lỗi. Vui lòng thử lại sau.');
      }
    }
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Tìm kiếm khuyến mãi`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Tìm kiếm
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Đặt lại
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Lọc
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            Đóng
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      )
  });
  const listCouponMap = listCoupon.map((coupon, index) => ({
    key: index + 1,
    ...coupon
  }));
  const columns = [
    {
      title: 'STT',
      dataIndex: 'key',
      width: 20
    },
    {
      title: 'Mã khuyến mãi',
      dataIndex: 'code',
      key: 'code',
      ...getColumnSearchProps('code'),
      width: 40,
      sorter: (a, b) => a.code.length - b.code.length,
      sortDirections: ['descend', 'ascend'],
      render: (coupon, record) => {
        return (
          <div>
            {coupon} {/* Hiển thị tên quốc gia */}
          </div>
        );
      }
    },
    {
      title: 'Phần trăm giảm giá',
      dataIndex: 'discount',
      key: 'discount',
      width: 40,
      render: (discount, record) => {
        return (
          <div>
            {discount}%
          </div>
        )
      }
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 30
    },
    {
      title: 'Thời gian áp dụng',
      // dataIndex: 'startDate',
      key: 'timeApplication',
      render: (_, record) => {
        const startDate = dayjs(record.startDate).format('DD/MM/YYYY');
        const endDate = dayjs(record.endDate).format('DD/MM/YYYY');
        return `${startDate} - ${endDate}`;
      },
      width: 50,
    },
    {
      title: 'Đã sử dụng',
      dataIndex: 'used',
      key: 'used',
      width: 30
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 30,
      render: (status) =>{
        let statusText;
        let colorClass;
        switch (status) {
          case 1:
            statusText = 'Kích hoạt';
            colorClass = 'bg-green-100 text-green-600 border-green-600';
            break;
          case 2:
            statusText = 'Ẩn';
            colorClass = 'bg-gray-100 text-gray-600 border-gray-600';
            break;
          default:
            statusText = '';
            colorClass = '';
        }
        return <div className={` inline-block rounded-md border ${colorClass}`}>{statusText}</div>;
      }
      
    },
    {
      title: '',
      width: 50,
      render: (record) => (
        <div className="flex gap-4">
          <Popconfirm
            title="Xoá khuyến mãi"
            description="Bạn muốn xoá khuyến mãi này?"
            onConfirm={() => confirm(record.uuid)}
            okText={<>Có</>}
            cancelText="Không"
          >
            <Button danger>
              <DeleteOutlined />
            </Button>
          </Popconfirm>
          <Button
            type="text"
            className="bg-blue-700 text-white"
            onClick={() => showModalUpdate(record.uuid)}
          >
            <EditOutlined />
          </Button>
        </div>
      )
    }
  ];
  useEffect(() => {
    getAllDirector();
  }, []);
  return (
    <>
      <Button className="float-end mb-4" type="primary" onClick={showModal}>
        Thêm mới khuyến mãi
      </Button>
      <Modal
        title="Thêm mới khuyến mãi"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={<></>}
      >
        <Form
          form={form}
          name="basic"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          style={{ maxWidth: 600 }}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item
            label="Mã khuyến mãi"
            name="code"
            rules={[{ required: true, message: 'Hãy nhập mã khuyến mãi!' }]}
          >
            <Input placeholder='Nhập mã khuyến mãi' />
          </Form.Item>
          <Form.Item label="Phần trăm" name="discount" rules={[{ required: true, message: 'Hãy nhập phần trăm' },
          { type: 'number', min: 1,max:99, message: 'Giá khuyến mãi phải lớn hơn 0, nhỏ hơn 100' },
          ]}>
            <InputNumber
              placeholder="Nhập phần trăm"
              className='w-full'
              min={1}
              max={100}
            />
          </Form.Item>
          <Form.Item label="Số lượng" name="quantity" rules={[{ required: true, message: 'Hãy nhập số lượng' }]}>
            <Input
              placeholder="Nhập số lượng"
            />
          </Form.Item>
          <Form.Item label="Trạng thái" name="status" rules={[{ required: true, message: 'Hãy chọn trạng thái' }]}>
            <Select
              defaultValue="Chọn trạng thái"
              onChange={handleChangeStatus}
              options={[
                { value: 1, label: 'Kích hoạt' },
                { value: 2, label: 'Ẩn' },
                
              ]}
              allowClear
            />
          </Form.Item>
          <Form.Item label="Ngày bắt đầu" name="startDate" rules={[{ required: true, message: 'Hãy chọn ngày bắt đầu' }]}>
            <DatePicker 
            placeholder="Ngày bắt đầu"
            variant="filled"
            className="w-full"/>
          </Form.Item>
          <Form.Item label="Ngày kết thúc" name="endDate" rules={[{ required: true, message: 'Hãy chọn ngày kết thúc' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                const startDate = getFieldValue("startDate");
                if (!value || !startDate || dayjs(value).isAfter(startDate)) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("Ngày kết thúc phải lớn hơn ngày bắt đầu!")
                );
              },
            }),
          ]}>
            <DatePicker 
            placeholder="Ngày kết thúc"
            variant="filled"
            className="w-full"/>
          </Form.Item>
          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit">
              Thêm mới
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Cập nhật khuyến mãi"
        open={isModalUpdateOpen}
        onCancel={() => setIsModalUpdateOpen(false)}
        footer={
          <Button onClick={() => setIsModalUpdateOpen(false)}>Đóng</Button>
        }
      >
        <Form
          form={formUpdate}
          name="basic"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          style={{ maxWidth: 600 }}
          initialValues={{ remember: true }}
          onFinish={onFinishUpdateDirectorInfor}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item
            label="Mã khuyến mãi"
            name="code"
            rules={[{ required: true, message: 'Hãy nhập mã khuyến mãi!' }]}
          >
            <Input placeholder='Nhập mã khuyến mãi' />
          </Form.Item>
          <Form.Item label="Phần trăm" name="discount" rules={[{ required: true, message: 'Hãy nhập phần trăm' },
          { type: 'number', min: 1,max:99, message: 'Giá khuyến mãi phải lớn hơn 0, nhỏ hơn 100' },
          ]}>
            <InputNumber
              placeholder="Nhập phần trăm"
              className='w-full'
              min={1}
              max={100}
            />
          </Form.Item>
          <Form.Item label="Số lượng" name="quantity" rules={[{ required: true, message: 'Hãy nhập số lượng' }]}>
            <Input
              placeholder="Nhập số lượng"
            />
          </Form.Item>
          <Form.Item label="Trạng thái" name="status" rules={[{ required: true, message: 'Hãy chọn trạng thái' }]}>
            <Select
              defaultValue="Chọn trạng thái"
              onChange={handleChangeStatus}
              options={[
                { value: 1, label: 'Kích hoạt' },
                { value: 2, label: 'Ẩn' },
                
              ]}
              allowClear
            />
          </Form.Item>
          <Form.Item label="Ngày bắt đầu" name="startDate" rules={[{ required: true, message: 'Hãy chọn ngày bắt đầu' }]}>
            <DatePicker 
            placeholder="Ngày bắt đầu"
            variant="filled"
            className="w-full"/>
          </Form.Item>
          <Form.Item label="Ngày kết thúc" name="endDate" rules={[{ required: true, message: 'Hãy chọn ngày kết thúc' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                const startDate = getFieldValue("startDate");
                if (!value || !startDate || dayjs(value).isAfter(startDate)) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("Ngày kết thúc phải lớn hơn ngày bắt đầu!")
                );
              },
            }),
          ]}>
            <DatePicker 
            placeholder="Ngày kết thúc"
            variant="filled"
            className="w-full"/>
          </Form.Item>
          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit">
              Cập nhật
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Table
        columns={columns}
        dataSource={listCouponMap}
        scroll={{ x: 1000, y: 500 }}
        pagination={{
          showTotal: (total, range) => {
            return `${range[0]}-${range[1]} of ${total} items`;
          },
          defaultPageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['5', '10', '20']
        }}
      />
    </>
  );
};

export default AdminCoupon;
