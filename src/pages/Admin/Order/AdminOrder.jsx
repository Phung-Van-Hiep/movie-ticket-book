import React, { useEffect, useRef, useState } from 'react';
import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
  TableOutlined
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
  APIGetALLBill,
  APIGetDirectorDetail,
} from '../../../services/service.api';


const AdminOrder = () => {
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);
  const [listBill, setListBill] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [formUpdate] = Form.useForm();
  const [directorDetail, setDirectorDetail] = useState(null);
  const [isModalUpdateOpen, setIsModalUpdateOpen] = useState(false);
  

  // const showModalUpdate = async (uuid) => {
  //   try {
  //     const res = await APIGetDirectorDetail({ uuid });
  //     // console.log('update', res);
  //     if (res && res.status === 200) {
  //       const directorDetail = res.data.data;
  //       setDirectorDetail(directorDetail);
  //       //  console.log("Lam gi thi lam ",directorDetail.imageUrl);
  //       const imageUrl = `${
  //         import.meta.env.VITE_BACKEND_URL
  //       }/resources/images/${directorDetail.imageUrl}`;
  //       formUpdate.setFieldsValue({
  //         directorName: directorDetail.directorName,
  //         birthday: moment(directorDetail.birthday, 'YYYY-MM-DD'),
  //         description: directorDetail.description,
  //         imageUrl: directorDetail.imageUrl
  //       });
  //       setFileList([{ url: imageUrl }]);
  //       setIsModalUpdateOpen(true);
  //       // setFileList([]);
  //       setPreviewImage('');
  //     } else {
  //       message.error('Không tìm thấy thông tin chi tiết.');
  //     }
  //   } catch (error) {
  //     if (error.response) {
  //       const errorMessage =
  //         error.response.data?.error?.errorMessage ||
  //         'Đã xảy ra lỗi khi lấy thông tin chi tiết.';
  //       message.error(errorMessage);
  //     } else {
  //       message.error('Đã xảy ra lỗi khi lấy thông tin chi tiết.');
  //     }
  //   }
  // };

  const onFinishUpdateDirectorInfor = async (values) => {
    const { birthday, ...restValues } = values;
    const birthdayObj = new Date(birthday);
    const birthdayFormat = formatToDateString(birthdayObj);
    try {
      const res = await APICreateDirector({
        uuid: directorDetail.uuid,
        directorName: restValues.directorName,
        birthday: birthdayFormat,
        description: restValues.description,
        imagesUuid // Gửi URL của ảnh nếu có
      });
      if (res && res.status === 200) {
        message.success(res.data.error.errorMessage);
        form.resetFields();
        setFileList([]);
        setImagesUuid('');
        getAllBill();
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

  const getAllBill = async () => {
    try {
      const res = await APIGetALLBill({ pageSize: 1000, page: 1 });
      // console.log(res.data.data);
      if (res && res.data && res.data.data) {
        // Lọc các region có status khác "0"
        const filteredDirectors = res.data?.data?.items.filter(
          (bill) => bill.status !== 0
        );
        setListBill(filteredDirectors); // Cập nhật danh sách bill đã lọc
        form.resetFields();
        handleCancel();
      }
    } catch (error) {
      message.error('Đã xảy ra lỗi khi lấy danh sách đơn hàng.');
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
          placeholder={`Tìm kiếm đơn hàng`}
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
  const listBillMap = listBill.map((bill, index) => ({
    key: index + 1,
    ...bill
  }));
  const columns = [
    {
      title: 'STT',
      dataIndex: 'key',
      width: 30
    },
    {
      title: 'Mã đơn hàng',
      dataIndex: 'code',
      key: 'code',
      ...getColumnSearchProps('code'),
      width: 50,
      sorter: (a, b) => a.code.length - b.code.length,
      sortDirections: ['descend', 'ascend'],
      render: (bill, record) => {
        return (
          <div>
            {bill} {/* Hiển thị tên quốc gia */}
          </div>
        );
      }
    },
    {
      title: 'Tên bộ phim',
      dataIndex: 'movieName',
      key: 'movieName',
      width: 50
    },
    {
      title: 'Rạp chiếu',
      dataIndex: 'cinemaName',
      key: 'cinemaName',
      width: 50
    },
    {
      title: 'Phòng chiếu',
      dataIndex: 'screenName',
      key: 'screenName',
      width: 50
    },
    {
      title: 'Trạng thái',
      dataIndex: 'state',
      key: 'state',
      width: 50,
      render: (status) =>{
        let statusText;
        let colorClass;
        switch (status) {
          case 1:
            statusText = 'Đã thanh toán';
            colorClass = 'bg-green-100 text-green-600 border-green-600';
            break;
          case 2:
            statusText = 'Chưa thanh toán';
            colorClass = 'bg-red-100 text-red-600 border-red-600';
            break;
          default:
            statusText = '';
            colorClass = '';
        }
        return <div className={` inline-block rounded-md border ${colorClass}`}>{statusText}</div>;
      }
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'payPrice',
      key: 'payPrice',
      width: 50
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'showDate',
      key: 'showDate',
      width: 50
    },
    {
      title: 'Thời gian chiếu',
      key: 'timeRange',
      width: 60,
      render: (text, record) =>
        <div className="bg-pink-100 text-pink-600 px-2 py-1 rounded-md border border-pink-600 inline-block">
          {record.startTime} - {record.endTime}
        </div>
    },
    {
      title: '',
      width: 50,
      render: (record) => (
        <div className="flex gap-4">
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
    getAllBill();
  }, []);
  return (
    <>
      <Modal
        title="Cập nhật đơn hàng"
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
            label="Tên đơn hàng"
            name="directorName"
            rules={[{ required: true, message: 'Hãy nhập tên đơn hàng!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Ngày sinh"
            name="birthday"
            rules={[
              {
                required: true,
                message: 'Hãy nhập ngày sinh của bạn!'
              }
            ]}
          >
            <DatePicker
              placeholder="Ngày sinh"
              variant="filled"
              className="w-full"
            />
          </Form.Item>

          <Form.Item label="Mô tả" name="description" rules={[]}>
            <Input.TextArea
              placeholder="Nhập mô tả...."
              autoSize={{ minRows: 2, maxRows: 6 }}
              onChange={(e) => {
                // Optional: Handle text area change if needed
              }}
            />
          </Form.Item>
          <Form.Item label="Image" name="imageUrl" rules={[]}>
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
        dataSource={listBillMap}
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

export default AdminOrder;
