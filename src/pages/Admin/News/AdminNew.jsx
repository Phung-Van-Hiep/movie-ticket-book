import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
  TableOutlined
} from '@ant-design/icons';
import { Editor } from '@tinymce/tinymce-react'; // Import TinyMCE Editor
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Table
} from 'antd';
import Highlighter from 'react-highlight-words';
import '../../../css/AdminNew.css';
import {
  APICreateNews,
  APIGetAllNews,
  APIGetNewsDetail,
  APIDeleteNews,
  APIUploadImage,
  APIDeleteCast,
} from '../../../services/service.api';
import { PlusOutlined } from '@ant-design/icons';
import { Image, Upload } from 'antd';
const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

const AdminNew = () => {
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);
  const [listNews, setListNews] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [formUpdate] = Form.useForm();
  const [newsDetail, setNewsDetail] = useState(null);
  const [isModalUpdateOpen, setIsModalUpdateOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [fileList, setFileList] = useState([]);
  const [imagesUuid, setImagesUuid] = useState('');
  const [content, setContent] = useState("");
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
      const res = await APIGetNewsDetail({ uuid });
      // console.log('update', res);
      if (res && res.status === 200) {
        const newsDetail = res.data.data;
        setNewsDetail(newsDetail);
        //  console.log("Lam gi thi lam ",newsDetail.imageUrl);
        const imageUrl = newsDetail.imageUrl
          ? `${import.meta.env.VITE_BACKEND_URL}/resources/images/${newsDetail.imageUrl}`
          : null;
        formUpdate.setFieldsValue({
          title: newsDetail.title,
          shortTitle: newsDetail.shortTitle,
          status: newsDetail.status,
          content: newsDetail.content,
          imageUrl: newsDetail.imageUrl
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

  const onFinishUpdateNewsInfor = async (values) => {
    const { content, imageUrl, ...restValues } = values;
    // console.log("Có vào đây không ", content)
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
      const res = await APICreateNews({
        uuid: newsDetail?.uuid,
        title: restValues.title,
        shortTitle: newsDetail.shortTitle,
        status: restValues.status,
        content: content?.level?.content || newsDetail.content,
        imagesUuid: tempImagesUuid  // Gửi URL của ảnh nếu có
      });
      if (res && res.status === 200) {
        message.success(res.data.error.errorMessage);
        form.resetFields();
        setFileList([]);
        setImagesUuid('');
        getAllNews();
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

  const getAllNews = async () => {
    try {
      const res = await APIGetAllNews({ pageSize: 1000, page: 1 });
      // console.log(res.data.data);
      if (res && res.data && res.data.data) {
        // Lọc các region có status khác "0"
        const filteredNews = res.data?.data?.items.filter(
          (news) => news.status !== 0
        );
        setListNews(filteredNews); // Cập nhật danh sách news đã lọc
        form.resetFields();
        handleCancel();
      }
    } catch (error) {
      message.error('Đã xảy ra lỗi khi lấy danh sách tin tức.');
    }
  };
  const onFinish = async (values) => {
    // console.log("đã chạy vào đây chưa thế", values)
    const { content, ...restValues } = values;
    let tempImagesUuid = imagesUuid;
    if (fileList.length > 0) {
      const uploadResponse = await APIUploadImage(fileList[0].originFileObj, '3');
      if (uploadResponse && uploadResponse.status === 200) {
        tempImagesUuid = uploadResponse.data.data; // Use the returned UUID from the image upload
      }
    }
    const dataNews = {
      ...restValues,
      content: content?.level?.content, // Lưu nội dung trực tiếp từ TinyMCE
      imagesUuid: tempImagesUuid
      // timeCreated: "2024-11-12"
    };
    // console.log("data", dataNews)
    try {
      const res = await APICreateNews(dataNews);
      // console.log(res);
      if (res && res.status === 200) {
        message.success(res.data.error.errorMessage);
        form.resetFields();
        setFileList([]);
        setImagesUuid('');
        getAllNews();
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
      const res = await APIDeleteNews({ uuid, status: 0 });
      if (res && res.status === 200) {
        message.success('Đã xoá thành công.');
        getAllNews(); // Cập nhật lại danh sách news sau khi xoá
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
          placeholder={`Tìm kiếm tin tức`}
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
  const listNewsMap = listNews.map((news, index) => ({
    key: index + 1,
    ...news
  }));
  const columns = [
    {
      title: 'STT',
      dataIndex: 'key',
      width: 50
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      ...getColumnSearchProps('title'),
      width: 150,
      sorter: (a, b) => a.title.length - b.title.length,
      sortDirections: ['descend', 'ascend'],
      render: (news, record) => {
        return (
          <div>
            {news} {/* Hiển thị tên quốc gia */}
          </div>
        );
      }
    },

    {
      title: 'Lượt xem',
      dataIndex: 'view',
      key: 'view',
      width: 50
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'timeCreated',
      key: 'timeCreated',
      width: 100,
      render: (text) => {
        const date = new Date(text);
        const formattedDate = date.toISOString().split('T')[0]; // Lấy định dạng YYYY-MM-DD
        return (         
        <span className="bg-green-100 text-green-600 px-2 py-1 rounded-md border border-green-600">
          {formattedDate}
        </span>)

      },
    },

    {
      title: '',
      width: 50,
      render: (record) => (
        <div className="flex gap-4">
          <Popconfirm
            title="Xoá tin tức"
            description="Bạn muốn xoá tin tức này?"
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
    getAllNews();
  }, []);
  return (
    <>
      <Button className="float-end mb-4" type="primary" onClick={showModal}>
        Thêm mới tin tức
      </Button>
      <Modal
        title="Thêm mới tin tức"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={<></>}
        width={1200}
        destroyOnClose={true}
      >
        <Form
          form={form}
          name="basic"
          // labelCol={{ span: 8 }}
          // wrapperCol={{ span: 16 }}
          // style={{ maxWidth: 600 }}
          initialValues={{ remember: true, status:2 }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Row gutter={16}>
            <Col className="gutter-row" span={16}>
              <Form.Item
                label="Tiêu đề"
                name="title"
                rules={[{ required: true, message: 'Hãy nhập tiêu đề cho tin tức!' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={6}>
              <Form.Item
                label="Trạng thái"
                name="status"
                // rules={[{ required: true, message: 'Hãy chọn trạng thái!' }]}
              >
                <Select
                  placeholder="Chọn trạng thái"
                  options={[
                    // { value: 1, label: 'Xuất bản' },
                    { value: 2, label: 'Nháp' },
                  ]}
                  defaultValue={2}
                  disabled={true}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item label="Nội dung" name="content" rules={[{ required: true, message: 'Hãy nhập nội dung tin tức!' }]}>
                <Editor
                  key={isModalOpen ? "editorCreate" : "editorUpdate"}
                  apiKey="qjczy5r2hhn67vhifshnfy0vxjjxtjdt9fi9k2ishabkzevm"  // Thêm API Key của bạn nếu cần
                  value={content ? String(content) : ""} // Chuyển đổi content thành chuỗi nếu cần
                  onEditorChange={(newContent) => setContent(String(newContent))}  // Cập nhật giá trị khi thay đổi
                  init={{
                    readonly: false, // Đảm bảo rằng chế độ chỉ đọc bị vô hiệu hóa
                    height: 500,
                    menubar: false,
                    plugins: [
                      'advlist',
                      'autolink',
                      'lists',
                      'link',
                      'image',
                      'preview',
                    ],
                    toolbar: 'undo redo | styles | formatselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image',
                  }}
                />
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={6}>
              <Form.Item label="Hình ảnh" name="imagesUuid" rules={[]}>
                <Upload
                  listType="picture-card"
                  fileList={fileList}
                  onPreview={handlePreviewCreateImage}
                  onChange={handleChangeCreateImage}
                  beforeUpload={(file) => {
                    setFileList([file]);
                    return false; // Prevents automatic upload
                  }}
                  className="w-full h-64"
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
            </Col>
            <Col className="gutter-row" span={16}>
              {/* Danh mục */}
              <Form.Item
                label="Mô tả"
                name="shortTitle"
                rules={[{ required: true, message: 'Hãy nhập tiêu đề ngắn cho tin tức!' }]}
              >
                <Input.TextArea
                  placeholder="Nhập tiêu đề...."
                  autoSize={{ minRows: 1, maxRows: 2 }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit">
              Thêm mới
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Cập nhật tin tức"
        open={isModalUpdateOpen}
        onCancel={() => setIsModalUpdateOpen(false)}
        footer={
          <Button onClick={() => setIsModalUpdateOpen(false)}>Đóng</Button>
        }
        width={1200}
        destroyOnClose={true}
      >
        <Form
          form={formUpdate}
          name="basic1"
          // labelCol={{ span: 8 }}
          // wrapperCol={{ span: 16 }}
          // style={{ maxWidth: 600 }}
          initialValues={{ remember: true }}
          onFinish={onFinishUpdateNewsInfor}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Row gutter={16}>
            <Col className="gutter-row" span={16}>
              <Form.Item
                label="Tiêu đề"
                name="title"
                rules={[{ required: true, message: 'Hãy nhập tiêu đề cho tin tức!' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={6}>
              <Form.Item
                label="Trạng thái"
                name="status"
                rules={[{ required: true, message: 'Hãy chọn trạng thái!' }]}
              >
                <Select
                  placeholder="Chọn trạng thái"
                  options={[
                    { value: 1, label: 'Xuất bản' },
                    { value: 2, label: 'Nháp' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item label="Nội dung" name="content" rules={[{ required: true, message: 'Hãy nhập nội dung tin tức!' }]}>
                <Editor
                  key={isModalUpdateOpen ? "editorUpdate" : "editorCreate"}
                  apiKey="qjczy5r2hhn67vhifshnfy0vxjjxtjdt9fi9k2ishabkzevm"
                  value={content ? String(content) : ""} // Chuyển đổi content thành chuỗi nếu cần
                  onEditorChange={(newContent) => setContent(String(newContent))}  // Cập nhật giá trị khi thay đổi
                  init={{
                    readonly: false,
                    height: 500,
                    menubar: false,
                    plugins: [
                      'advlist',
                      'autolink',
                      'lists',
                      'link',
                      'image',
                      'preview',
                    ],
                    toolbar: 'undo redo | styles | formatselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image',
                  }}
                />
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={6}>
              <Form.Item label="Hình ảnh" name="imageUrl" rules={[]}>
                <Upload
                  listType="picture-card"
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
            </Col>
            <Col className="gutter-row" span={16}>
              <Form.Item
                label="Mô tả ngắn"
                name="shortTitle"
                rules={[{ required: true, message: 'Hãy nhập tiêu đề ngắn cho tin tức!' }]}
              >
                <Input.TextArea
                  placeholder="Nhập tiêu đề...."
                  autoSize={{ minRows: 1, maxRows: 2 }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit">
              Cập nhật
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Table
        columns={columns}
        dataSource={listNewsMap}
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

export default AdminNew;
