import React, { useEffect, useRef, useState } from 'react';
import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined
} from '@ant-design/icons';

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
import '../../../css/AdminGenre.css';
import {
  APICreateMovies,
  APIGetMoviesDetail,
  APIGetAllDirector,
  APIGetAllGenre,
  APIGetAllCast,
  APIGetAllRegion,
  APIGetAllMovies,
  APIUploadImage,
  APIDeleteMovie
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

const AdminMovies = () => {
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);
  const [listMovies, setListMovies] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [formUpdate] = Form.useForm();
  const [moviesDetail, setMoviesDetail] = useState(null);
  const [isModalUpdateOpen, setIsModalUpdateOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [fileList, setFileList] = useState([]);
  const [imagesUuid, setImagesUuid] = useState('');
  const [listDirector, setListDirector] = useState([]);
  const [listGenre, setListGenre] = useState([]);
  const [listRegion, setListRegion] = useState([]);
  const [listCast, setListCast] = useState([]);
  const handleChangeStatus = (value) => {
    // console.log(`selected ${value}`);
  };
  const handleChangeDirector = (value) => {
    // console.log(`selected ${value}`);
  };
  const handleChangeGenre = (value) => {
    // console.log(`selected ${value}`);
  };
  const handleChangeRegion = (value) => {
    // console.log(`selected ${value}`);
  };
  const handleChangeCast = (value) => {
    // console.log(`selected ${value}`);
  };
  // const baseURL = import.meta.env.VITE_BASE_URL; // Lấy base URL từ biến môi trường
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
  const formatToDateString = (dateObj) => dayjs(dateObj).format('YYYY-MM-DD');

  const showModalUpdate = async (uuid) => {
    try {
      const res = await APIGetMoviesDetail({ uuid });
      if (res && res.status === 200) {
        const moviesDetail = res.data.data;
        setMoviesDetail(moviesDetail);
        const imageUrl = moviesDetail.imageUrl
          ? `${import.meta.env.VITE_BACKEND_URL}/resources/poster/${moviesDetail.imageUrl}`
          : null;
  
        formUpdate.setFieldsValue({
          title: moviesDetail.title,
          realeaseDate: dayjs(moviesDetail.realeaseDate, 'YYYY-MM-DD'),
          description: moviesDetail.description,
          averageReview: moviesDetail.averageReview,
          cast: moviesDetail.cast.map((item) => item.uuid),
          director: moviesDetail.director.uuid,
          duration: moviesDetail.duration,
          engTitle: moviesDetail.engTitle,
          genre: moviesDetail.genre.map((item) => item.uuid),
          imageUrl: moviesDetail.imageUrl,
          rated: moviesDetail.rated,
          region: moviesDetail.region.map((item) => item.uuid),
          trailer: moviesDetail.trailer,
          status: moviesDetail.status,
        });
  
        // Set file list only if imageUrl exists
        setFileList(imageUrl ? [{ url: imageUrl }] : []);
        setIsModalUpdateOpen(true);
        setPreviewImage('');
      } else {
        message.error('Không tìm thấy thông tin chi tiết.');
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.error?.errorMessage || 'Đã xảy ra lỗi khi lấy thông tin chi tiết.';
      message.error(errorMessage);
    }
  };
  
  const onFinishUpdateMoviesInfor = async (values) => {
    const { realeaseDate, region, imageUrl,director, ...restValues } = values;
    const realeaseFormat = formatToDateString(new Date(realeaseDate));
    let tempImagesUuid = imageUrl;
  
    // Kiểm tra nếu không có file trong fileList
    if (fileList.length === 0) {
      tempImagesUuid = null;
    } else if (fileList[0].originFileObj) {
      // Có file mới được tải lên
      try {
        const uploadResponse = await APIUploadImage(fileList[0].originFileObj, '2');
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
  
    // Đổi tên region thành regionUuid trước khi gửi lên API
    const dataMovie = {
      uuid: moviesDetail?.uuid,
      ...restValues,
      realeaseDate: realeaseFormat,
      regionUuid: region,
      directorUuid: director,
      imagesUuid: tempImagesUuid // Gửi imagesUuid, có thể là null nếu không có ảnh
    };
  
    try {
      const res = await APICreateMovies(dataMovie);
      if (res && res.status === 200) {
        message.success(res.data.error.errorMessage);
        form.resetFields();
        setFileList([]); // Dọn dẹp file list sau khi cập nhật
        setImagesUuid(''); // Xóa imagesUuid đã lưu
        getAllMovies();
        handleCancelUpdate();
      }
    } catch (error) {
      if (error.response) {
        const errorMessage = error.response.data?.error?.errorMessage || 'Đã xảy ra lỗi khi update.';
        message.error(errorMessage);
      } else {
        message.error('Đã xảy ra lỗi. Vui lòng thử lại sau.');
      }
    }
  };

  const getAllMovies = async () => {
    try {
      const res = await APIGetAllMovies({ pageSize: 1000, page: 1 });
      if (res && res.data && res.data.data) {
        // Lọc các region có status khác "0"
        const filteredMovies = res.data?.data?.items.filter(
          (movies) => movies.status !== 0
        );
        setListMovies(filteredMovies);
        // form.resetFields();
        handleCancel();
      }
    } catch (error) {
      message.error('Đã xảy ra lỗi khi lấy danh sách phim.');
    }
  };
  const onFinish = async (values) => {
    const { realeaseDate, ...restValues } = values;
    const realeaseFormat = formatToDateString(new Date(realeaseDate));
    let tempImagesUuid = imagesUuid;
    if (fileList.length > 0) {
      const uploadResponse = await APIUploadImage(fileList[0].originFileObj, '2');
      if (uploadResponse && uploadResponse.status === 200) {
        tempImagesUuid = uploadResponse.data.data; // Use the returned UUID from the image upload
      }
    }
    const dataMovie = {
      ...restValues,
      realeaseDate: realeaseFormat,
      imagesUuid: tempImagesUuid
    };
    try {
      const res = await APICreateMovies(dataMovie);
      if (res && res.status === 200) {
        message.success(res.data.error.errorMessage);
        form.resetFields();
        setFileList([]);
        setImagesUuid('');
        getAllMovies();
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
    // console.log('Failed:', errorInfo);
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
    // form.resetFields();
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
      const res = await APIDeleteMovie({ uuid, status: 0 });
      if (res && res.status === 200) {
        message.success('Đã xoá thành công.');
        getAllMovies(); // Cập nhật lại danh sách director sau khi xoá
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
  const fetchData = async (apiCall, mapDataToOptions, setState) => {
    try {
      const res = await apiCall({ pageSize: 1000, page: 1 });
      if (res && res.data && Array.isArray(res.data.data.items)) {
        const dataItems = res.data.data.items.filter(item => item.status === 1); // Chỉ lấy những mục có status là 1
        const options = dataItems.map(mapDataToOptions);

        setState(options); // Cập nhật state
      } else {
        message.error('Không có dữ liệu hợp lệ.');
      }
    } catch (error) {
      message.error('Đã xảy ra lỗi khi lấy dữ liệu.');
    }
  };

  // Sử dụng cho danh sách đạo diễn
  const getAllDirector = () => {
    fetchData(
      APIGetAllDirector,
      (director) => ({ value: director.uuid, label: director.directorName }),
      setListDirector
    );
  };

  // Sử dụng cho danh sách thể loại
  const getAllGenre = () => {
    fetchData(
      APIGetAllGenre,
      (genre) => ({ value: genre.uuid, label: genre.genreName }),
      setListGenre
    );
  };

  const getAllRegion = () => {
    fetchData(
      APIGetAllRegion,
      (region) => ({ value: region.uuid, label: region.regionName }),
      setListRegion
    );
  };
  const getAllCast = () => {
    fetchData(
      APIGetAllCast,
      (cast) => ({ value: cast.uuid, label: cast.castName }),
      setListCast
    );
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
          placeholder={`Tìm kiếm phim`}
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
  const listMoviesMap = listMovies.map((movies, index) => ({
    key: index + 1,
    ...movies,
  }));
  const columns = [
    {
      title: 'STT',
      dataIndex: 'key'
      // width: 30
    },

    {
      title: 'Tên phim',
      dataIndex: 'title',
      key: 'title',
      ...getColumnSearchProps('title'),
      // width: 50,
      sorter: (a, b) => a.title.length - b.title.length,
      sortDirections: ['descend', 'ascend'],
      render: (title, record) => {
        return <div>{title}</div>;
      }
    },
    {
      title: 'Ngày phát hành',
      dataIndex: 'realeaseDate',
      key: 'realeaseDate',
      render: (text) => {
        return (
          <span className="bg-red-100 text-red-600 px-2 py-1 rounded-md border border-red-600">
            {text}
          </span>
        );
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'timeCreated',
      key: 'timeCreated',
      render: (text) => {
        const date = new Date(text);
        const formattedDate = date.toISOString().split('T')[0]; // Lấy định dạng YYYY-MM-DD
        return (
          <span className="bg-green-100 text-green-600 px-2 py-1 rounded-md border border-green-600">
            {formattedDate}
          </span>
        );
      },
    },
    {
      title: 'Trạng thái phim',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status) => {
        let statusText;
        switch (status) {
          case 1:
            statusText = 'Đang chiếu';
            break;
          case 2:
            statusText = 'Sắp chiếu';
            break;
          case 3:
            statusText = 'Chiếu sớm';
            break;
          case 4:
            statusText = 'Không còn chiếu';
          default:
            statusText = 'Không sử dụng'; // Giá trị mặc định nếu không khớp với bất kỳ trạng thái nào
        }
        return <div className="truncate-description">{statusText}</div>;
      }
    },
    {
      title: '',
      width: 50,
      render: (record) => (
        <div className="flex gap-4">
          <Popconfirm
            title="Xoá phim"
            description="Bạn muốn xoá phim này?"
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
    getAllMovies();
    getAllDirector();
    getAllGenre();
    getAllCast();
    getAllRegion();
  }, []);

  return (
    <>
      <Button className="float-end mb-4" type="primary" onClick={showModal}>
        Thêm mới phim
      </Button>
      <Modal
        title="Thêm mới phim"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        width={1200}
        footer={<></>}
      >
        <Form
          form={form}
          name="basic"
          // labelCol={{ span: 8 }}
          // wrapperCol={{ span: 24 }}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Row gutter={16}>
            <Col className="gutter-row" span={12}>
              <Form.Item
                label="Tên phim"
                name="title"
                rules={[{ required: true, message: 'Hãy nhập tên phim!' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={12}>
              <Form.Item
                label="Tên Phim (Tiếng Anh)"
                name="engTitle"
                rules={[
                  {
                    required: true,
                    message: 'Hãy nhập tên phim của bạn!'
                  }
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col className="gutter-row" span={12}>
              <Form.Item
                label="Trailer"
                name="trailer"
                rules={[{ required: true, message: 'Hãy nhập tên Trailer!' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={12}>
              <Form.Item
                label="Thời lượng phim"
                name="duration"
                rules={[
                  {
                    required: true,
                    message: 'Hãy nhập thời lượng phim của bạn!'
                  },
                  { type: 'number', min: 1, max: 300, message: 'Thời lượng phim phải từ 1 phút trở lên' }
                ]}
                
              >
                <InputNumber className="w-full" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col className="gutter-row" span={12}>
              <Form.Item
                label="Độ tuổi"
                name="rated"
                rules={[{ required: true, message: 'Hãy chọn độ tuổi!' }]}
              >
                <Select
                  onChange={handleChangeStatus}
                  options={[
                    { value: 1, label: 'P' },
                    { value: 2, label: 'T13' },
                    { value: 3, label: 'T16' },
                    { value: 4, label: 'T18' }
                  ]}
                />
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={12}>
              <Form.Item
                label="Đánh giá trung bình"
                name="averageReview"
                rules={[
                  {
                    required: true,
                    message: 'Hãy nhập đánh giá trung bình!'
                  },
                  { type: 'number', min: 1, max: 10, message: 'Đánh giá trung bình từ 1-10'}
                ]}
              >
                <InputNumber className="w-full" placeholder="" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col className="gutter-row" span={12}>
              <Form.Item
                label="Thể loại phim"
                name="genre"
                rules={[{ required: true, message: 'Hãy chọn thể loại phim!' }]}
              >
                <Select
                  showSearch
                  onChange={handleChangeGenre}
                  options={listGenre}
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  allowClear
                  mode="tags"
                />
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={12}>
              <Form.Item
                label="Trạng Thái"
                name="status"
                rules={[
                  {
                    required: true,
                    message: 'Hãy nhập trạng thái phim của bạn!'
                  }
                ]}
              >
                <Select
                  onChange={handleChangeStatus}
                  options={[
                    { value: 1, label: 'Đang chiếu' },
                    { value: 2, label: 'Sắp chiếu' },
                    { value: 3, label: 'Chiếu sớm' },
                    { value: 4, label: 'Không còn chiếu' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col className="gutter-row" span={12}>
              <Form.Item
                label="Quốc gia"
                name="regionUuid"
                rules={[{ required: true, message: 'Hãy chọn quốc gia!' }]}
              >
                <Select
                  showSearch
                  onChange={handleChangeRegion}
                  options={listRegion}
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  allowClear
                  mode="tags"
                />
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={12}>
              <Form.Item
                label="Diễn viên"
                name="cast"
                rules={[{ required: true, message: 'Hãy chọn các diễn viên tham gia bộ phim!' }]}
              >
                <Select
                  showSearch
                  onChange={handleChangeCast}
                  options={listCast}
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  allowClear
                  mode="tags"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col className="gutter-row" span={12}>
              <Form.Item
                label="Ngày phát hành"
                name="realeaseDate"
                rules={[
                  {
                    required: true,
                    message: 'Hãy nhập ngày phát hành của phim!'
                  }
                ]}
              >
                <DatePicker
                  // placeholder="Ngày sinh"
                  variant="filled"
                  className="w-full"
                />
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={12}>
              <Form.Item
                label="Đạo diễn"
                name="directorUuid"
                rules={[
                  {
                    required: true,
                    message: 'Hãy chọn đạo diễn phim của bạn!'
                  }
                ]}
              >
                <Select
                  showSearch
                  onChange={handleChangeDirector}
                  options={listDirector}
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  allowClear
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col className="gutter-row" span={12}>
              <Form.Item
                label="Mô Tả"
                name="description"
                rules={[
                  {
                    required: true,
                    message: 'Hãy nhập mô tả phim của bạn!'
                  }
                ]}

              >
                <Input.TextArea
                  placeholder="Nhập mô tả...."
                  autoSize={{ minRows: 3, maxRows: 8 }}
                />
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={12}>
              <Form.Item label="Ảnh phim" name="imageUrl" rules={[]}>
                <Upload
                  listType="picture-card"
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
                      afterOpenChange: (visible) =>
                        !visible && setPreviewImage('')
                    }}
                    src={previewImage}
                  />
                )}
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
        title="Cập nhật phim"
        open={isModalUpdateOpen}
        onCancel={() => {
          setIsModalUpdateOpen(false)
          setFileList([])
        }}
        footer={
          <Button onClick={() => setIsModalUpdateOpen(false)}>Đóng</Button>
        }
        width={1200}
      >
        <Form
          form={formUpdate}
          name="basic1"
          // labelCol={{ span: 8 }}
          // wrapperCol={{ span: 16 }}
          initialValues={{ remember: true }}
          onFinish={onFinishUpdateMoviesInfor}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Row gutter={16}>
            <Col className="gutter-row" span={12}>
              <Form.Item
                label="Tên phim"
                name="title"
                rules={[{ required: true, message: 'Hãy nhập tên phim!' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={12}>
              <Form.Item
                label="Tên Phim (Tiếng Anh)"
                name="engTitle"
                rules={[
                  {
                    required: true,
                    message: 'Hãy nhập tên phim của bạn!'
                  }
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col className="gutter-row" span={12}>
              <Form.Item
                label="Trailer"
                name="trailer"
                rules={[{ required: true, message: 'Hãy nhập tên Trailer!' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={12}>
              <Form.Item
                label="Thời lượng phim"
                name="duration"
                rules={[
                  {
                    required: true,
                    message: 'Hãy nhập thời lượng phim của bạn!'
                  },
                  { type: 'number', min: 1, max: 300, message: 'Thời lượng phim phải từ 1 phút trở lên' }
                ]}
              >
                <InputNumber className="w-full" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col className="gutter-row" span={12}>
              <Form.Item
                label="Độ tuổi"
                name="rated"
                rules={[{ required: true, message: 'Hãy chọn độ tuổi!' }]}
              >
                <Select
                  onChange={handleChangeStatus}
                  options={[
                    { value: 1, label: 'P' },
                    { value: 2, label: 'T13' },
                    { value: 3, label: 'T16' },
                    { value: 4, label: 'T18' }
                  ]}
                />
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={12}>
              <Form.Item
                label="Đánh giá trung bình"
                name="averageReview"
                rules={[
                  {
                    required: true,
                    message: 'Hãy nhập đánh giá trung bình!'
                  },
                  { type: 'number', min: 1, max: 10, message: 'Đánh giá trung bình từ 1-10'}
                ]}
              >
                <InputNumber className="w-full" placeholder="" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col className="gutter-row" span={12}>
              <Form.Item
                label="Thể loại phim"
                name="genre"
                rules={[{ required: true, message: 'Hãy chọn thể loại phim!' }]}
              >
                <Select
                  showSearch
                  onChange={handleChangeGenre}
                  options={listGenre}
                  filterOption={(input, option) =>
                    (option?.label ?? '')?.toLowerCase()?.includes(input?.toLowerCase())
                  }
                  allowClear
                  mode="multiple"
                />
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={12}>
              <Form.Item
                label="Trạng Thái"
                name="status"
                rules={[
                  {
                    required: true,
                    message: 'Hãy nhập trạng thái phim của bạn!'
                  }
                ]}
              >
                <Select
                  onChange={handleChangeStatus}
                  options={[
                    { value: 1, label: 'Đang chiếu' },
                    { value: 2, label: 'Sắp chiếu' },
                    { value: 3, label: 'Chiếu sớm' },
                    { value: 4, label: 'Không còn chiếu' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col className="gutter-row" span={12}>
              <Form.Item
                label="Quốc gia"
                name="region"
                rules={[{ required: true, message: 'Hãy chọn quốc gia!' }]}
              >
                <Select
                  showSearch
                  onChange={handleChangeRegion}
                  options={listRegion}
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  allowClear
                  mode="multiple"
                />
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={12}>
              <Form.Item
                label="Diễn viên"
                name="cast"
                rules={[{ required: true, message: 'Hãy chọn các diễn viên tham gia bộ phim!' }]}
              >
                <Select
                  showSearch
                  onChange={handleChangeCast}
                  options={listCast}
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  allowClear
                  mode="multiple"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col className="gutter-row" span={12}>
              <Form.Item
                label="Ngày phát hành"
                name="realeaseDate"
                rules={[
                  {
                    required: true,
                    message: 'Hãy nhập ngày phát hành của phim!'
                  }
                ]}
              >
                <DatePicker
                  // placeholder="Ngày sinh"
                  variant="filled"
                  className="w-full"
                />
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={12}>
              <Form.Item
                label="Đạo diễn"
                name="director"
                rules={[
                  {
                    required: true,
                    message: 'Hãy chọn đạo diễn phim của bạn!'
                  }
                ]}
              >
                <Select
                  showSearch
                  onChange={handleChangeDirector}
                  options={listDirector}
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  allowClear
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col className="gutter-row" span={12}>
              <Form.Item
                label="Mô Tả"
                name="description"
                rules={[
                  {
                    required: true,
                    message: 'Hãy nhập mô tả phim của bạn!'
                  }
                ]}

              >
                <Input.TextArea
                  placeholder="Nhập mô tả...."
                  autoSize={{ minRows: 3, maxRows: 8 }}
                />
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={12}>
              <Form.Item label="Ảnh phim" name="imageUrl" rules={[]}>
                <Upload
                  listType="picture-card"
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
                      afterOpenChange: (visible) =>
                        !visible && setPreviewImage('')
                    }}
                    src={previewImage}
                  />
                )}
              </Form.Item>
            </Col>
          </Row>
          <div className="flex justify-center mt-10">
          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit" form="basic1" >
              Cập nhật
            </Button>
          </Form.Item>
        </div>
        </Form>
      </Modal>
      <Table
        columns={columns}
        dataSource={listMoviesMap}
        scroll={{ x: 500 }}
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

export default AdminMovies;
