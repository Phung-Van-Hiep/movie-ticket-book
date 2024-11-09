import React, { useEffect, useRef, useState } from 'react';
import { DeleteOutlined, EditOutlined, SearchOutlined } from '@ant-design/icons';
import { Avatar, Button, Col, DatePicker, Form, Input, message, Modal, Popconfirm, Radio, Row, Select, Space, Table } from 'antd';
import Highlighter from 'react-highlight-words';
import '../../../css/AdminGenre.css';
import {
  APIRegister,
  APIGetAllUser,
  APIUpdateUser,
  APIGetUserDetail,
  APIDeleteUser,
  APIUploadImage
} from '../../../services/service.api';
import { PlusOutlined } from '@ant-design/icons';
import { Image, Upload } from 'antd';
import moment from 'moment';
const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

const AdminCast = () => {
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);
  const [listCast, setListCast] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [formUpdate] = Form.useForm();
  const [userDetail, setUserDetail] = useState(null);
  const [isModalUpdateOpen, setIsModalUpdateOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [fileList, setFileList] = useState([]);
  const [imagesUuid, setImagesUuid] = useState('');
  const [value, setValue] = useState(1);
  const onChange = (e) => {
    setValue(e.target.value);
  };
  const handleFullnameChange = (e) => {
    const inputValue = e.target.value;
    // Chỉ xử lý khi người dùng dừng nhập
    const formattedValue = inputValue.replace(/\s{2,}/g, ' ');
    form.setFieldsValue({ fullname: formattedValue });
  };
  const handlePreviewCreateImage = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }

    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
  };
  // console.log('fileList,', fileList);
  const handleChangeCreateImage = ({ fileList: newFileList }) =>
    setFileList(newFileList);
  const uploadButton = (
    <button style={{ border: 0, background: 'none' }} type="button">
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );
  const showModalUpdate = async (uuid) => {
    try {
      const res = await APIGetUserDetail({ uuid });
      if (res && res.status === 200) {
        const userDetail = res.data.data;
        console.log("update gi do ", userDetail);
        setUserDetail(userDetail);
        const birthdayFormat = 'YYYY-MM-DD';
        const imageUrl = `${import.meta.env.VITE_BACKEND_URL
          }/resources/images/${userDetail.imageUrl}`;
        formUpdate.setFieldsValue({
          fullname: userDetail.fullname,
          email: userDetail.email,
          gender: userDetail.gender,
          phoneNumber: userDetail.phoneNumber,
          birthday: userDetail.birthday
            ? moment(userDetail.birthday, birthdayFormat)
            : null,
          imageUrl: userDetail.imageUrl,
          status: userDetail.status
        });
        setFileList([{ url: imageUrl }]);
        setIsModalUpdateOpen(true);
        setPreviewImage('');
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
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const onFinishUpdateCastInfor = async (values) => {
    const { birthday, ...restValues } = values;
    const birthdayObj = new Date(birthday);
    const birthdayFormat = formatToDateString(birthdayObj);
    console.log("Checking", restValues)
    // console.log(birthdayFormat);
    // let tempImagesUuid = imagesUuid;
    // if (fileList.length > 0) {
    //   const uploadResponse = await APIUploadImage(fileList[0].originFileObj, '3');
    //   if (uploadResponse && uploadResponse.status === 200) {
    //     tempImagesUuid = uploadResponse.data.data; // Use the returned UUID from the image upload
    //   }
    // }
    try {
      const res = await APIUpdateUser({
        uuid: userDetail?.uuid,
        fullname: restValues.fullname,
        birthday: birthdayFormat,
        phoneNumber: restValues.phoneNumber,
        gender: restValues.gender,
        // imagesUuid: tempImagesUuid
        status: restValues.status,
        role: userDetail.role,
      });
      if (res && res.status === 200) {
        message.success(res.data.error.errorMessage);
        form.resetFields();
        setFileList([]);
        setImagesUuid('');
        getAllUser();
        handleCancelUpdate();
      }
      // console.log("Success:", values);
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

  const getAllUser = async () => {
    try {
      const res = await APIGetAllUser({ pageSize: 1000, page: 1 });
      if (res && res.data && res.data.data) {
        // Lọc các cast có status khác "0"
        const filteredCasts = res.data?.data?.items.filter(
          (cast) => cast.status !== 0
        );
        setListCast(filteredCasts); // Cập nhật danh sách cast đã lọc
        form.resetFields();
        handleCancel();
      }
    } catch (error) {
      message.error('Đã xảy ra lỗi khi lấy danh sách diễn viên.');
    }
  };
  const onFinish = async (values) => {
    const { birthday, ...restValues } = values;
    const birthdayFormat = formatToDateString(new Date(birthday));
    // let tempImagesUuid = imagesUuid;
    // if (fileList.length > 0) {
    //   const uploadResponse = await APIUploadImage(fileList[0].originFileObj, '3');
    //   if (uploadResponse && uploadResponse.status === 200) {
    //     tempImagesUuid = uploadResponse.data.data; // Use the returned UUID from the image upload
    //   }
    // }
    const dataUser = {
      ...restValues,
      birthday: birthdayFormat,
      // imagesUuid: tempImagesUuid
    };
    try {
      const res = await APIRegister(dataUser);
      if (res && res.status === 200) {
        message.success(res.data.error.errorMessage);
        form.resetFields();
        setFileList([]);
        setImagesUuid('');
        getAllUser();
      }
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
    setFileList([]);
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
    setFileList([]);
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
      const res = await APIDeleteUser({ uuid, status: 0 });
      if (res && res.status === 200) {
        message.success('Đã xoá thành công.');
        getAllUser(); // Cập nhật lại danh sách user sau khi xoá
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
          placeholder={`Tìm kiếm tên diễn viên`}
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
  const listCastMap = listCast.map((cast, index) => ({
    key: index + 1,
    ...cast
  }));
  const columns = [
    {
      title: 'STT',
      dataIndex: 'key',
      width: 50
    },
    {
      title: 'Ảnh đại diện',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      width: 60,
      render: (text, record) => {
        const fullURL = record?.imageUrl
          ? `${import.meta.env.VITE_BACKEND_URL}/resources/images/${record?.imageUrl}`
          : null;

        return fullURL ? (
          <Image
            width={70}
            height={70}
            src={fullURL}
            alt="Ảnh diễn viên"
            className="rounded-full object-cover"
          />
        ) : (
          <Avatar className="flex items-center justify-center w-16 h-16 bg-slate-400 text-white rounded-full text-lg font-semibold">
            {record?.fullname?.charAt(0).toUpperCase() || '?'}
          </Avatar>
        );
      }
    },
    {
      title: 'Họ tên',
      dataIndex: 'fullname',
      key: 'fullname',
      ...getColumnSearchProps('fullname'),
      width: 70,
      sorter: (a, b) => a.fullname.length - b.fullname.length,
      sortDirections: ['descend', 'ascend'],
      render: (fullname, record) => {
        return (
          <div
          // className="hover:text-[#4096ff] cursor-pointer"
          // onClick={() => showDrawer(record.uuid)} // Gọi hàm showDrawer với uuid
          >
            {fullname} {/* Hiển thị tên diễn viên */}
          </div>
        );
      }
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 50
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      width: 50
    },
    {
      title: 'Quyền',
      dataIndex: 'role',
      key: 'role',
      width: 50,
      render: (role) => (role === 0 ? 'Admin' : 'User')
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 50,
      render: (status) => (status === 1 ? 'Hoạt động' : 'Đang khoá')
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'timeCreated',
      key: 'timeCreated',
      width: 50
    },
    {
      title: '',
      width: 50,
      render: (record) => (
        <div className="flex gap-4">
          <Popconfirm
            title="Xoá diễn viên"
            description="Bạn muốn xoá diễn viên này?"
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
    getAllUser();
  }, []);
  return (
    <>
      <Button className="float-end mb-4" type="primary" onClick={showModal}>
        Thêm mới người dùng
      </Button>
      <Modal
        title="Thêm mới người dùng"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={<></>}
        width={900}
        height={700}
      >
        <Form
          form={form}
          name="basic"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          // style={{ maxWidth: 600 }}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                label={<div className="font-semibold">Email</div>}
                name="email"
                rules={[
                  {
                    required: true,
                    message: "Xin hãy nhập Email của bạn!",
                  },
                  {
                    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Vui lòng nhập địa chỉ Email hợp lệ!",
                  },
                ]}
              >
                <Input placeholder="Nhập Email...." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={<div className="font-semibold">Họ Tên</div>}
                name="fullName"
                rules={[
                  {
                    required: true,
                    message: "Xin hãy nhập họ và tên bạn!",
                  },
                  {
                    pattern: /^[\p{L}\s]+$/u,
                    message: "Họ tên chỉ được dùng ký tự!",
                  },
                ]}
              >
                <Input
                  placeholder="Nhập Họ Tên...."
                  onChange={handleFullnameChange}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                label={<div className="font-semibold">Số điện thoại</div>}
                name="phoneNumber"
                rules={[
                  {
                    required: true,
                    message: "Xin hãy nhập số điện thoại của bạn!",
                  },
                  {
                    pattern: /^0\d{9}$/,
                    message:
                      "Số điện thoại phải bắt đầu bằng số 0 và có đúng 10 chữ số!",
                  },
                ]}
              >
                <Input placeholder="Nhập số điện thoại..." />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label={<div className="font-semibold">Ngày sinh</div>}
                name="birthday"
                rules={[
                  {
                    required: true,
                    message: "Hãy nhập ngày sinh của bạn!",
                  },
                ]}
              >
                <DatePicker
                  placeholder="Ngày sinh"
                  variant="filled"
                  className="w-full"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                label={<div className="font-semibold">Mật khẩu</div>}
                name="password"
                rules={[
                  {
                    required: true,
                    message: "Xin hãy nhập password của bạn!",
                  },
                ]}
              >
                <Input.Password placeholder="Nhập mật khẩu..." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={
                  <div className="font-semibold">Xác nhận mật khẩu </div>
                }
                name="password2"
                rules={[
                  {
                    required: true,
                    message: "Xin hãy nhập lại password của bạn!",
                  },
                ]}
              >
                <Input.Password placeholder="Xác nhận mật khẩu..." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={<div className="font-semibold">Giới tính</div>}
                name="gender"
                rules={[
                  { required: true, message: "Hãy chọn giới tính của bạn" },
                ]}
              >
                <Radio.Group onChange={onChange} value={value}>
                  <Radio value={0}>Nam</Radio>
                  <Radio value={1}>Nữ</Radio>
                  <Radio value={2}>Khác</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>

          <div className="flex justify-center mt-10">
            <Button type="primary" htmlType="submit" form="basic">
              Thêm mới
            </Button>
          </div>
        </Form>
      </Modal>
      <Modal
        title="Cập nhật người dùng"
        open={isModalUpdateOpen}
        onCancel={() => setIsModalUpdateOpen(false)}
        footer={
          <Button onClick={() => setIsModalUpdateOpen(false)}>Đóng</Button>
        }
        width={700}
        height={500}
      >
        <Form
          form={formUpdate}
          name="basic"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          style={{ maxWidth: 600 }}
          initialValues={{ remember: true }}
          onFinish={onFinishUpdateCastInfor}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Row gutter={[16, 16]}>
            <Col span={11}>
              <Form.Item
                label={<div className="font-semibold">Họ Tên</div>}
                name="fullname"
                rules={[
                  { required: true, message: "Xin hãy nhập họ và tên bạn!" },
                  { pattern: /^[\p{L}\s]+$/u, message: "Họ tên chỉ được dùng ký tự!" },
                ]}
              >
                <Input placeholder="Nhập Họ Tên...." onChange={handleFullnameChange} />
              </Form.Item>
            </Col>
            <Col span={13}>
              <Form.Item
                label={<div className="font-semibold">Giới tính</div>}
                name="gender"
                rules={[{ required: true, message: "Hãy chọn giới tính của bạn" }]}
              >
                <Radio.Group onChange={onChange} value={value}>
                  <Radio value={0}>Nam</Radio>
                  <Radio value={1}>Nữ</Radio>
                  <Radio value={2}>Khác</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={11}>
              <Form.Item
                label={<div className="font-semibold">Email</div>}
                name="email"
                rules={[
                  { required: true, message: "Xin hãy nhập Email của bạn!" },
                  { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Vui lòng nhập địa chỉ Email hợp lệ!" },
                ]}
              >
                <Input placeholder="Nhập Email...." />
              </Form.Item>
            </Col>
            <Col span={13}>
              <Form.Item
                label={<div className="font-semibold">Số điện thoại</div>}
                name="phoneNumber"
                rules={[
                  { required: true, message: "Xin hãy nhập số điện thoại của bạn!" },
                  { pattern: /^0\d{9}$/, message: "Số điện thoại phải bắt đầu bằng số 0 và có đúng 10 chữ số!" },
                ]}
              >
                <Input placeholder="Nhập số điện thoại..." />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={11}>
              <Form.Item
                label={<div className="font-semibold">Ngày sinh</div>}
                name="birthday"
                rules={[{ required: true, message: "Hãy nhập ngày sinh của bạn!" }]}
              >
                <DatePicker placeholder="Ngày sinh" className="w-full" />
              </Form.Item>
            </Col>
            <Col span={13}>
              <Form.Item
                label="Trạng thái"
                name="status"
                rules={[{ required: true, message: 'Hãy chọn trạng thái!' }]}
              >
                <Select
                  defaultValue=""
                  options={[
                    { value: 1, label: 'Hoạt động' },
                    { value: 2, label: 'Đã khoá' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
          <div className="flex justify-center mt-10">
            <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
              <Button type="primary" htmlType="submit" form="basic" >
                Cập nhật
              </Button>
            </Form.Item>
          </div>
        </Form>
      </Modal>
      <Table
        columns={columns}
        dataSource={listCastMap}
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

export default AdminCast;