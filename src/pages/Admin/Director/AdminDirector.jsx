import React, { useEffect, useRef, useState } from 'react';
import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined
} from '@ant-design/icons';

import {
  Button,
  DatePicker,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Space,
  Table
} from 'antd';
import Highlighter from 'react-highlight-words';
import '../../../css/AdminGenre.css';
import {
  APICreateDirector,
  APIGetAllDirector,
  APIGetDirectorDetail,
  APIDeleteDirector,
  APIUploadImage
} from '../../../services/service.api';
import { PlusOutlined } from '@ant-design/icons';
import { Image, Upload } from 'antd';
import dayjs from 'dayjs';
const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

const AdminDirector = () => {
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);
  const [listDirector, setListDirector] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [formUpdate] = Form.useForm();
  const [directorDetail, setDirectorDetail] = useState(null);
  const [isModalUpdateOpen, setIsModalUpdateOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [fileList, setFileList] = useState([]);
  const [imagesUuid, setImagesUuid] = useState('');

  const handlePreviewCreateImage = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }

    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
  };
  // console.log('fileList,', fileList);
  const dummyRequestCreateImageCast = async ({ file, onSuccess }) => {
    const res = await APIUploadImage(file, '3');
    if (res && res.status === 200) {

      setImagesUuid(res.data.data);
    }
    onSuccess('ok');
  };
  const handleChangeCreateImage = ({ fileList: newFileList }) =>
    setFileList(newFileList);

  const uploadButton = (
    <button style={{ border: 0, background: 'none' }} type="button">
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );
  const formatToDateString = (dateObj) => {
    return dayjs(dateObj).format('YYYY-MM-DD');
  };

  const showModalUpdate = async (uuid) => {
    try {
      const res = await APIGetDirectorDetail({ uuid });
      if (res && res.status === 200) {
        const directorDetail = res.data.data;
        setDirectorDetail(directorDetail);
        //  console.log("Lam gi thi lam ",directorDetail.imageUrl);
        const imageUrl = directorDetail.imageUrl ? `${import.meta.env.VITE_BACKEND_URL
          }/resources/images/${directorDetail.imageUrl}`:null;
        formUpdate.setFieldsValue({
          directorName: directorDetail.directorName,
          birthday: directorDetail.birthday ? dayjs(directorDetail.birthday) : null,
          description: directorDetail.description,
          imageUrl: directorDetail.imageUrl
        });
        setFileList(imageUrl ? [{ url: imageUrl }] : []);
        setIsModalUpdateOpen(true);
        // setFileList([]);
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

  const onFinishUpdateDirectorInfor = async (values) => {
    const { birthday,imageUrl, ...restValues } = values;
    const birthdayFormat = birthday ? formatToDateString(birthday) : null;
    let tempImagesUuid = imageUrl;
    // Kiểm tra nếu không có file trong fileList
    if (fileList.length === 0) {
      tempImagesUuid = null;
    } else if (fileList[0].originFileObj) {
      // Có file mới được tải lên
      try {
        const uploadResponse = await APIUploadImage(fileList[0].originFileObj, '3');
        if (uploadResponse?.status === 200) {
          tempImagesUuid = uploadResponse.data.data;
          setImagesUuid(tempImagesUuid); // Lưu lại imagesUuid mới
        } else {
          message.error('Upload ảnh không thành công. Vui lòng thử lại.');
          return;
        }
      } catch {
        message.error('Lỗi khi upload ảnh. Vui lòng kiểm tra kết nối mạng và thử lại.');
        return;
      }
    }
    try {
      const res = await APICreateDirector({
        uuid: directorDetail.uuid,
        directorName: restValues.directorName,
        birthday: birthdayFormat,
        description: restValues.description,
        imagesUuid:tempImagesUuid // Gửi URL của ảnh nếu có
      });
      if (res && res.status === 200) {
        message.success(res.data.error.errorMessage);
        form.resetFields();
        setFileList([]);
        setImagesUuid('');
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
      const res = await APIGetAllDirector({ pageSize: 1000, page: 1 });
      if (res && res.data && res.data.data) {
        // Lọc các region có status khác "0"
        const filteredDirectors = res.data?.data?.items.filter(
          (director) => director.status !== 0
        );
        setListDirector(filteredDirectors); // Cập nhật danh sách director đã lọc
        // form.resetFields();
        handleCancel();
      }
    } catch (error) {
      message.error('Đã xảy ra lỗi khi lấy danh sách đạo diễn.');
    }
  };
  const onFinish = async (values) => {
    const { birthday, ...restValues } = values;
    const birthdayFormat = birthday ? formatToDateString(birthday) : null;
    let tempImagesUuid = imagesUuid
    if(fileList.length > 0) {
      const resupload = await APIUploadImage(fileList[0].originFileObj, '3');
      if (resupload && resupload.status === 200) {
        tempImagesUuid = resupload.data.data;
      }
    }
    const dataDirector = {
      ...restValues,
      birthday: birthdayFormat,
      imagesUuid: tempImagesUuid
    };
    try {
      const res = await APICreateDirector(dataDirector);
      if (res && res.status === 200) {
        message.success(res.data.error.errorMessage);
        form.resetFields();
        setFileList([]);
        setImagesUuid('');
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
    setFileList([]);
  };

  const handleOk = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    // form.resetFields();
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
      const res = await APIDeleteDirector({ uuid, status: 0 });
      if (res && res.status === 200) {
        message.success('Đã xoá thành công.');
        getAllDirector(); // Cập nhật lại danh sách director sau khi xoá
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
          placeholder={`Tìm kiếm đạo diễn`}
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
    filterDropdownProps: {
      onOpenChange: (visible) => {
        if (visible) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
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
  const listDirectorMap = listDirector.map((director, index) => ({
    key: index + 1,
    ...director
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
          ? `${import.meta.env.VITE_BACKEND_URL}/resources/images/${record?.imageUrl
          }`
          : null;
        return fullURL ? (
          <Image
            width={70}
            height={70}
            src={fullURL}
            alt="Ảnh đạo diễn"
            style={{ borderRadius: '50%', objectFit: 'cover' }}
          />
        ) : null;
      }
    },
    {
      title: 'Tên đạo diễn',
      dataIndex: 'directorName',
      key: 'directorName',
      ...getColumnSearchProps('directorName'),
      width: 50,
      sorter: (a, b) => a.directorName.length - b.directorName.length,
      sortDirections: ['descend', 'ascend'],
      render: (director, record) => {
        return (
          <div>
            {director} {/* Hiển thị tên quốc gia */}
          </div>
        );
      }
    },
    {
      title: 'Ngày sinh',
      dataIndex: 'birthday',
      key: 'birthday',
      width: 50
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      width: 100,
      render: (description) => (
        <div className="truncate-description">{description}</div>
      )
    },

    {
      title: '',
      width: 50,
      render: (record) => (
        <div className="flex gap-4">
          <Popconfirm
            title="Xoá đạo diễn"
            description="Bạn muốn xoá đạo diễn này?"
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
        Thêm mới đạo diễn
      </Button>
      <Modal
        title="Thêm mới đạo diễn"
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
            label="Tên đạo diễn"
            name="directorName"
            rules={[{ required: true, message: 'Hãy nhập tên đạo diễn!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Ngày sinh"
            name="birthday"
            rules={[]}
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
            />
          </Form.Item>
          <Form.Item label="Image" name="imageUrl" rules={[]}>
            <Upload
              listType="picture-circle"
              fileList={fileList}
              onPreview={handlePreviewCreateImage}
              onChange={handleChangeCreateImage}
              beforeUpload={(file) => {
                setFileList([file]);
                return false;
              }}
            >
              {fileList.length >= 1 ? null : uploadButton}
            </Upload>
            {previewImage && (
              <Image
                wrapperStyle={{ display: 'none' }}
                preview={{
                  visible: previewOpen,
                  onVisibleChange: (visible) => setPreviewOpen(visible),
                  afterOpenChange: (visible) => !visible && setPreviewImage('')
                }}
                src={previewImage}
              />
            )}
          </Form.Item>
          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit">
              Thêm mới
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Cập nhật đạo diễn"
        open={isModalUpdateOpen}
        onCancel={() => setIsModalUpdateOpen(false)}
        footer={
          <Button onClick={() => setIsModalUpdateOpen(false)}>Đóng</Button>
        }
      >
        <Form
          form={formUpdate}
          name="basic1"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          style={{ maxWidth: 600 }}
          initialValues={{ remember: true }}
          onFinish={onFinishUpdateDirectorInfor}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item
            label="Tên đạo diễn"
            name="directorName"
            rules={[{ required: true, message: 'Hãy nhập tên đạo diễn!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Ngày sinh"
            name="birthday"
            rules={[]}
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
            <Upload
              listType="picture-circle"
              fileList={fileList}
              onPreview={handlePreviewCreateImage}
              onChange={handleChangeCreateImage}
              beforeUpload={(file) => {
                setFileList([file]);
                return false;
              }}
            >
              {fileList.length >= 1 ? null : uploadButton}
            </Upload>
            {previewImage && (
              <Image
                wrapperStyle={{ display: 'none' }}
                preview={{
                  visible: previewOpen,
                  onVisibleChange: (visible) => setPreviewOpen(visible),
                  afterOpenChange: (visible) => !visible && setPreviewImage('')
                }}
                src={previewImage}
              />
            )}
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
        dataSource={listDirectorMap}
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

export default AdminDirector;
