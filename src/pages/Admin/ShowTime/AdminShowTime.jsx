import React, { useEffect, useRef, useState } from 'react';
import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
  TableOutlined
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
  Table,
  TimePicker
} from 'antd';
import Highlighter from 'react-highlight-words';
import '../../../css/AdminGenre.css';
import {
  APICreateDirector,
  APIGetAllDirector,
  APIGetDirectorDetail,
  APIDeleteDirector,
  APIUploadImage,
  APIGetAllCinemas,
  APIGetAllScreen,
  APIGetAllMovies
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

const AdminShowTime = () => {
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
  const [listCinemas, setListCinemas] = useState([]);
  const [listScreen, setListScreen] = useState([]);
  const [listMovies, setListMovies] = useState([]);
  const [cinemaSelected, setCinemaSelected] = useState(false);
  const [selectedCinemaUuid, setSelectedCinemaUuid] = useState(null);
  const [showText, setShowText] = useState(false);
  const [cinemaLabel, setCinemaLabel] = useState('');
const [screenLabel, setScreenLabel] = useState('');
const [selectedCinemaLabel, setSelectedCinemaLabel] = useState('');
const [selectedScreenLabel, setSelectedScreenLabel] = useState('');
const handleSerchShowTime = () => {
  setSelectedCinemaLabel(cinemaLabel);
  setSelectedScreenLabel(screenLabel);
  setShowText(true);
};
  const handleChangeStatus = (value) => {
    console.log(`selected ${value}`);
  }

  const handleChangeCinemas = (value, option) => {
    setSelectedCinemaUuid(value);
    setCinemaLabel(option?.label || '');
    getAllScreen(value);
    setCinemaSelected(!!value);
  };
  const handleChangeScreen = (value, option) => {
    setScreenLabel(option?.label || '');
  };
  const handlePreviewCreateImage = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }

    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
  };
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

  const showModalUpdate = async (uuid) => {
    try {
      const res = await APIGetDirectorDetail({ uuid });
      // console.log('update', res);
      if (res && res.status === 200) {
        const directorDetail = res.data.data;
        setDirectorDetail(directorDetail);
        //  console.log("Lam gi thi lam ",directorDetail.imageUrl);
        const imageUrl = `${import.meta.env.VITE_BACKEND_URL
          }/resources/images/${directorDetail.imageUrl}`;
        formUpdate.setFieldsValue({
          directorName: directorDetail.directorName,
          birthday: moment(directorDetail.birthday, 'YYYY-MM-DD'),
          description: directorDetail.description,
          imageUrl: directorDetail.imageUrl
        });
        setFileList([{ url: imageUrl }]);
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

  const formatToDateString = (dateObj) => moment(dateObj).format('YYYY-MM-DD');

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
        form.resetFields();
        handleCancel();
      }
    } catch (error) {
      message.error('Đã xảy ra lỗi khi lấy danh sách suất chiếu.');
    }
  };
  const onFinish = async (values) => {
    const { birthday, ...restValues } = values;
    // console.log("Check ngày", restValues)
    const birthdayFormat = formatToDateString(new Date(birthday));
    const dataDirector = {
      ...restValues,
      birthday: birthdayFormat,
      imagesUuid
    };
    try {
      const res = await APICreateDirector(dataDirector);
      // console.log(res);
      if (res && res.status === 200) {
        message.success(res.data.error.errorMessage);
        form.resetFields();
        setFileList([]);
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
    // console.log('Failed:', errorInfo);
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
  const fetchData = async (apiCall, mapDataToOptions, setState, cinemaUuid = undefined) => {
    try {
      const res = await apiCall({ pageSize: 1000, page: 1, cinemaUuid });
      // console.log("Check res ", res);

      if (res && res.data && Array.isArray(res.data.data.items)) {
        const dataItems = res.data.data.items.filter(item => [1, 2, 3, 4].includes(item.status));// Chỉ lấy những mục có status là 1
        const options = dataItems.map(mapDataToOptions);
        setState(options); // Cập nhật state
      } else {
        message.error('Không có dữ liệu hợp lệ.');
      }
    } catch (error) {
      message.error('Đã xảy ra lỗi khi lấy dữ liệu.');
    }
  };
  const getAllCinemas = async () => {
    fetchData(
      APIGetAllCinemas,
      (cinema) => ({ value: cinema.uuid, label: cinema.cinemaName }),
      setListCinemas,
    );
  };
  const getAllScreen = async (cinemaUuid) => {
    fetchData(
      APIGetAllScreen,
      (screen) => ({ value: screen.uuid, label: screen.screenName }),
      setListScreen,
      cinemaUuid
    );
  };
  const getAllMovies = async () => {
    fetchData(
      APIGetAllMovies,
      (movie) => ({ value: movie.uuid, label: movie.title }),
      setListMovies
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
          placeholder={`Tìm kiếm suất chiếu`}
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
      title: 'Tên phòng chiếu',
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
      title: 'Loại phòng chiếu',
      dataIndex: 'screenType',
      key: 'screenType',
      width: 50
    },
    {
      title: 'Số hàng',
      dataIndex: 'rowScreen',
      key: 'rowScreen',
      width: 50
    },
    {
      title: 'Số cột',
      dataIndex: 'colScreen',
      key: 'colScreen',
      width: 50
    },

    {
      title: '',
      width: 50,
      render: (record) => (
        <div className="flex gap-4">
          <Popconfirm
            title="Xoá suất chiếu"
            description="Bạn muốn xoá suất chiếu này?"
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
    getAllCinemas();
    getAllScreen();
    getAllMovies();
  }, []);
  return (
    <>
      <div>
        <Button className="float-end mb-4" type="primary" onClick={showModal}>
          Thêm mới suất chiếu
        </Button>
        <Form
          name="basic"
          layout="inline"
          onFinish={handleSerchShowTime}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Row gutter={16} align="middle" style={{ width: '100%' }}>
            <Col>
              <Form.Item
                label="Rạp chiếu"
                name="cinemaUuid"
              >
                <Select
                  showSearch
                  defaultValue=""
                  options={listCinemas}
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  allowClear
                  onChange={handleChangeCinemas}
                  style={{ width: 200 }}
                />
              </Form.Item>
            </Col>
            <Col>
              <Form.Item
                label="Phòng chiếu"
                name="screenUuid"
              >
                <Select
                  showSearch
                  defaultValue=""
                  onChange={handleChangeScreen}
                  options={listScreen}
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  allowClear
                  disabled={!cinemaSelected} // Vô hiệu hóa nếu chưa chọn rạp chiếu
                  className={!cinemaSelected ? 'cursor-no-drop' : ''} // Thêm lớp cursor-no-drop nếu bị vô hiệu hóa
                  style={{ width: 200 }}
                />
              </Form.Item>
            </Col>
            <Col>
              <Form.Item
                label="Ngày chiếu"
                name="showDate"
              >
                <DatePicker
                  defaultValue={moment()}
                  variant="filled"
                  className="w-full"
                  style={{ width: 120 }} />
              </Form.Item>
            </Col>
            <Col flex="auto">
              <Button type="primary" htmlType="submit" style={{ float: 'left' }}>
                Tìm kiếm
              </Button>
            </Col>
          </Row>
        </Form>
        {showText && (
          <div className="text-center mt-20">
            <div className="text-white text-6xl font-semibold bg-blue-700 p-4 rounded-lg">
           Rạp: {selectedCinemaLabel}
            </div>
            <div className="text-yellow-500 text-3xl font-semibold mt-10 text-left ml-10">
            {selectedScreenLabel}
            </div>
          </div>
        )}
      </div>
      <Modal
        title="Thêm mới suất chiếu"
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
            label="Rạp phim"
            name="cinemaUuid"
            rules={[{ required: true, message: 'Hãy chọn rạp phim!' }]}
          >
            <Select
              showSearch
              defaultValue=""
              onChange={handleChangeCinemas}
              options={listCinemas}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              allowClear
            />
          </Form.Item>
          <Form.Item
            label="Phòng chiếu"
            name="screenUuid"
            rules={[{ required: true, message: 'Hãy chọn phòng chiếu!' }]}
          >
            <Select
              showSearch
              defaultValue=""
              // onChange={handleChangeCinemas}
              options={listScreen}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              disabled={!cinemaSelected} // Vô hiệu hóa nếu chưa chọn rạp chiếu
              className={!cinemaSelected ? 'cursor-no-drop' : ''} // Thêm lớp cursor-no-drop nếu bị vô hiệu hóa
              allowClear
            />
          </Form.Item>
          <Form.Item
            label="Tên phim"
            name="moviesUuid"
            rules={[{ required: true, message: 'Hãy chọn phim chiếu!' }]}
          >
            <Select
              showSearch
              defaultValue=""
              // onChange={handleChangeCinemas}
              options={listMovies}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              allowClear
            />
          </Form.Item>
          <Form.Item
            label="Ngày chiếu phim"
            name="movieDate"
            rules={[
              {
                required: true,
                message: 'Hãy nhập ngày chiếu phim!'
              }
            ]}
          >
            <DatePicker
              // placeholder="Ngày sinh"
              variant="filled"
              className="w-full"
            />
          </Form.Item>
          <Form.Item
            label="Hình thức phim"
            name="moviesType"
            rules={[
              {
                required: true,
                message: 'Hãy chọn hình thức phim!'
              }
            ]}
          >
            <Select
              defaultValue=""
              onChange={handleChangeStatus}
              options={[
                { value: 1, label: '2D' },
                { value: 2, label: '3D' },
                { value: 3, label: 'IMAX' }
              ]}
            />
          </Form.Item>
          <Form.Item label="Hình thức dịch"
            name="transForm"
            rules={[{ required: true, message: 'Hãy chọn hình thức dịch' }]}>
            <Select
              defaultValue=""
              onChange={handleChangeStatus}
              options={[
                { value: 1, label: 'Phụ đề' },
                { value: 2, label: 'Lồng tiếng' },
              ]}
            />
          </Form.Item>
          <Form.Item label="Thời gian chiếu"
            name="showTime"
            rules={[{ required: true, message: 'Hãy nhập thời gian chiếu' }]}>
            <TimePicker.RangePicker />
          </Form.Item>
          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit">
              Thêm mới
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Cập nhật suất chiếu"
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
            label="Tên suất chiếu"
            name="directorName"
            rules={[{ required: true, message: 'Hãy nhập tên suất chiếu!' }]}
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
            <Upload
              action="https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload"
              listType="picture-circle"
              fileList={fileList}
              onPreview={handlePreviewCreateImage}
              onChange={handleChangeCreateImage}
              customRequest={dummyRequestCreateImageCast}
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
      <div className='mt-10'>
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
            pageSizeOptions: ['5', '10', '20'],
          }}
        />
      </div>
    </>
  );
};

export default AdminShowTime;
