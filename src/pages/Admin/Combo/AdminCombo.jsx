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
  APICreateCombo,
  APIGetAllCombo,
  APIGetComboDetail,
  APIDeleteCombo,
  APIUploadImage,
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

const AdminCombo = () => {
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);
  const [listCombo, setListCombo] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [formUpdate] = Form.useForm();
  const [comboDetail, setComboDetail] = useState(null);
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
      const res = await APIGetComboDetail({ uuid });
      if (res && res.status === 200) {
        const comboDetail = res.data.data;
        setComboDetail(comboDetail);
        const imageUrl = comboDetail.imageUrl
          ? `${import.meta.env.VITE_BACKEND_URL}/resources/images/${comboDetail.imageUrl}`
          : null;
        formUpdate.setFieldsValue({
          comboName: comboDetail.comboName,
          comboItems: comboDetail.comboItems,
          price:comboDetail.price,
          imageUrl: comboDetail.imageUrl
        });
        setFileList(imageUrl ? [{ url: imageUrl }] : []);
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
  const onFinishUpdateComboInfor = async (values) => {
    const { imageUrl, ...restValues } = values;
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
      const res = await APICreateCombo({
        uuid: comboDetail?.uuid,
        comboName: restValues.comboName,
        comboItems: restValues.comboItems,
        price:restValues.price,
        imagesUuid:tempImagesUuid, // Gửi URL của ảnh nếu có
        status: 1
      });
      if (res && res.status === 200) {
        message.success(res.data.error.errorMessage);
        form.resetFields();
        setFileList([]);
        setImagesUuid('');
        getAllCombo();
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

  const getAllCombo = async () => {
    try {
      const res = await APIGetAllCombo({ pageSize: 1000, page: 1 });
      if (res && res.data && res.data.data) {
        // Lọc các region có status khác "0"
        const filteredCombo = res.data?.data?.items.filter(
          (combo) => combo.status !== 0
        );
        setListCombo(filteredCombo); // Cập nhật danh sách combo đã lọc
        form.resetFields();
        handleCancel();
      }
    } catch (error) {
      message.error('Đã xảy ra lỗi khi lấy danh sách combo.');
    }
  };
  const onFinish = async (values) => {
    const {...restValues } = values;
    let tempImagesUuid = imagesUuid;
    if (fileList.length > 0) {
      const uploadResponse = await APIUploadImage(fileList[0].originFileObj, '3');
      if (uploadResponse && uploadResponse.status === 200) {
        tempImagesUuid = uploadResponse.data.data; // Use the returned UUID from the image upload
      }
    }
    const dataCombo = {
      ...restValues,
      imagesUuid:tempImagesUuid
    };
    try {
      const res = await APICreateCombo(dataCombo);
      if (res && res.status === 200) {
        message.success(res.data.error.errorMessage);
        form.resetFields();
        setFileList([]);
        getAllCombo();
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
      const res = await APIDeleteCombo({ uuid, status: 0 });
      if (res && res.status === 200) {
        message.success('Đã xoá thành công.');
        getAllCombo(); // Cập nhật lại danh sách combo sau khi xoá
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
          placeholder={`Tìm kiếm combo`}
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
  const listComboMap = listCombo.map((combo, index) => ({
    key: index + 1,
    ...combo
  }));
  const columns = [
    {
      title: 'STT',
      dataIndex: 'key',
      width: 50
    },
    // {
    //   title: 'Ảnh combo-nước uống',
    //   dataIndex: 'imageUrl',
    //   key: 'imageUrl',
    //   width: 60,
    //   render: (text, record) => {
    //     console.log("Check record: ", record)
    //     const fullURL = record?.imageUrl
    //       ? `${import.meta.env.VITE_BACKEND_URL}/resources/images/${
    //           record?.imageUrl
    //         }`
    //       : null;
    //        console.log("Đây có phải là ảnh không" , fullURL)
    //     return fullURL ? (
    //       <Image
    //         width={70}
    //         height={70}
    //         src={fullURL}
    //         alt="Ảnh diễn viên"
    //         style={{ borderRadius: '50%', objectFit: 'cover' }}
    //       />
    //     ) : null;
    //   }
    // },
    {
      title: 'Tên combo - nước uống',
      dataIndex: 'comboName',
      key: 'comboName',
      ...getColumnSearchProps('comboName'),
      width: 100,
      sorter: (a, b) => a.comboName.length - b.comboName.length,
      sortDirections: ['descend', 'ascend'],
      render: (combo, record) => {
        return (
          <div>
            {combo} {/* Hiển thị tên quốc gia */}
          </div>
        );
      }
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'timeCreated',
      key: 'timeCreated',
      width: 100,
      render: (text) => {
        const date = new Date(text);
        const formattedDate = date.toISOString().split('T')[0]; // Lấy định dạng YYYY-MM-DD
        return formattedDate;
      },
    },

    {
      title: '',
      width: 50,
      render: (record) => (
        <div className="flex gap-4">
          <Popconfirm
            title="Xoá combo"
            description="Bạn muốn xoá combo này?"
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
    getAllCombo();
  }, []);
  return (
    <>
      <Button className="float-end mb-4" type="primary" onClick={showModal}>
        Thêm mới combo
      </Button>
      <Modal
        title="Thêm mới combo"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={<></>}
        width={700}
      >
        <Form
          form={form}
          name="basic"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item
            label="Tên combo - nước uống"
            name="comboName"
            rules={[{ required: true, message: 'Hãy nhập tên combo!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Giá tiền"
            name="price"
            rules={[
              {
                required: true,
                message: 'Hãy nhập giá tiền của combo!'
              }
            ]}
          >
            <InputNumber
                  placeholder="Nhập giá tiền"
                  className='w-full'
            />
          </Form.Item>
          <Form.Item label="Các loại vật phẩm" name="comboItems"
            rules={[{
              required: true,
              message: 'Hãy nhập loại vật phẩm có trong combo!'
            }]}>
            <Input.TextArea
              placeholder="Nhập các loại vật phẩm...."
              autoSize={{ minRows: 2, maxRows: 6 }}
            />
          </Form.Item>
          <Form.Item label="Ảnh combo" name="imagesUuid" rules={[]}>
            <Upload
              listType="picture-circle"
              fileList={fileList}
              onPreview={handlePreviewCreateImage}
              onChange={handleChangeCreateImage}
              beforeUpload={(file) => {
                setFileList([file]);
                return false; // Prevents automatic upload
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
        title="Cập nhật combo"
        open={isModalUpdateOpen}
        onCancel={() => setIsModalUpdateOpen(false)}
        footer={
          <Button onClick={() => setIsModalUpdateOpen(false)}>Đóng</Button>
        }
        width={700}
      >
        <Form
          form={formUpdate}
          name="basic1"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          style={{ maxWidth: 600 }}
          initialValues={{ remember: true }}
          onFinish={onFinishUpdateComboInfor}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item
            label="Tên combo - nước uống"
            name="comboName"
            rules={[{ required: true, message: 'Hãy nhập tên combo!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Giá tiền"
            name="price"
            rules={[
              {
                required: true,
                message: 'Hãy nhập giá tiền của combo!'
              }
            ]}
          >
            <InputNumber
                  placeholder="Nhập giá tiền"
                  className='w-full'
            />
          </Form.Item>
          <Form.Item label="Các loại vật phẩm" name="comboItems"
            rules={[{
              required: true,
              message: 'Hãy nhập loại vật phẩm có tronf combo!'
            }]}>
            <Input.TextArea
              placeholder="Nhập các loại vật phẩm...."
              autoSize={{ minRows: 2, maxRows: 6 }}
            />
          </Form.Item>
          <Form.Item label="Ảnh combo" name="imageUrl" rules={[]}>
            <Upload
              listType="picture-circle"
              fileList={fileList}
              onPreview={handlePreviewCreateImage}
              onChange={handleChangeCreateImage}
              beforeUpload={(file) => {
                setFileList([file]);
                return false; // Prevents automatic upload
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
        dataSource={listComboMap}
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

export default AdminCombo;
