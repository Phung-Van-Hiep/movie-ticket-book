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
  Table
} from 'antd';
import Highlighter from 'react-highlight-words';
import '../../../css/AdminGenre.css';
import {
  APICreateScreen,
  APIGetAllScreen,
  APIGetScreenDetail,
  APIDeleteScreen,
  APIUploadImage,
  APIGetAllCinemas
} from '../../../services/service.api';
import { PlusOutlined } from '@ant-design/icons';
import { Image, Upload } from 'antd';
import moment from 'moment';
import SeatLayout from './SeatLayOut';
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
  const [listCinemas, setListCinemas] = useState([]);
  const [rows, setRows] = useState(0); // Default rows
  const [cols, setCols] = useState(0); // Default columns

  const handleChangeStatus = (value) => {
    // console.log(`selected ${value}`);
  }

  const handleChangeCinemas = (value) => {
    // console.log(`selected ${value}`);
  };

  const handleRows = (value) => {
    setRows(value);
  }
  const handleCol = (value) => {
    setCols(value);
  }
  // const showModalUpdate = async (uuid) => {
  //   try {
  //     const res = await APIGetDirectorDetail({ uuid });
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
  // const onFinishUpdateDirectorInfor = async (values) => {
  //   const { birthday, ...restValues } = values;
  //   const birthdayObj = new Date(birthday);
  //   const birthdayFormat = formatToDateString(birthdayObj);
  //   try {
  //     const res = await APICreateDirector({
  //       uuid: directorDetail.uuid,
  //       directorName: restValues.directorName,
  //       birthday: birthdayFormat,
  //       description: restValues.description,
  //       imagesUuid // Gửi URL của ảnh nếu có
  //     });
  //     if (res && res.status === 200) {
  //       message.success(res.data.error.errorMessage);
  //       form.resetFields();
  //       setFileList([]);
  //       setImagesUuid('');
  //       getAllDirector();
  //       handleCancelUpdate();
  //     }
  //   } catch (error) {
  //     if (error.response) {
  //       const errorMessage =
  //         error.response.data?.error?.errorMessage ||
  //         'Đã xảy ra lỗi khi update.';
  //       message.error(errorMessage);
  //     } else if (error.request) {
  //       message.error(
  //         'Không nhận được phản hồi từ máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.'
  //       );
  //     } else {
  //       message.error('Đã xảy ra lỗi. Vui lòng thử lại sau.');
  //     }
  //   }
  // };

  const getAllDirector = async () => {
    try {
      const res = await APIGetAllScreen({ pageSize: 1000, page: 1 });

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
      message.error('Đã xảy ra lỗi khi lấy danh sách phòng chiếu.');
    }
  };
  const onFinish = async (values) => {
    const { rows, columns, ...restValues } = values;
    const dataScreen = {
      ...restValues,
      capacity: rows * columns,
      rows: rows,
      columns: columns,
    };
    try {
      const res = await APICreateScreen(dataScreen);
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
    setCols(0);
    setRows(0);
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
  const getAllCinemas = async () => {
    try {
      const res = await APIGetAllCinemas({ pageSize: 10, page: 1 });
      if (res && res.data && Array.isArray(res.data.data.items)) {
        const cinemas = res.data.data.items;
        const cinemasOptions = cinemas.map((cinema) => ({
          value: cinema.uuid,
          label: cinema.cinemaName
        }));

        setListCinemas(cinemasOptions); // Cập nhật state
      } else {
        message.error('Không có dữ liệu đạo diễn hợp lệ.');
      }
    } catch (error) {
      message.error('Đã xảy ra lỗi khi lấy danh sách đạo diễn.');
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
          <Button
            type="text"
            className="bg-orange-400 text-white"
            onClick={() => showModalTableUpdate(record.uuid)}
          >
            <TableOutlined />
          </Button>
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
    getAllCinemas();
  }, []);
  return (
    <>
      <Button className="float-end mb-4" type="primary" onClick={showModal}>
        Thêm mới phòng chiếu
      </Button>
      <Modal
        title="Thêm mới phòng chiếu"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={<></>}
        width={1200}
        height={1200}
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
          <Row gutter={16}>
          <Col className="gutter-row" span={8}>
              <Form.Item
                label="Tên phòng chiếu"
                name="screenName"
                rules={[{ required: true, message: 'Hãy nhập tên phòng chiếu!' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={8}>
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
            </Col>
            
            <Col className="gutter-row" span={8}>
              <Form.Item
                label="Loại phòng chiếu"
                name="screenTypeUuid"
                rules={[{ required: true, message: 'Hãy chọn loại phòng chiếu!' }]}
              >
                <Select
                  defaultValue=""
                  onChange={handleChangeStatus}
                  options={[
                    { value: '1', label: '2D' },
                    { value: '2', label: '3D' },
                    { value: '3', label: 'IMAX2D' },
                    { value: '4', label: 'IMAX3D' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16} justify="center">
            <Col className="gutter-row" span={12}>
              <Form.Item label="Số hàng" name="rows" rules={[
                { required: true, message: 'Nhập số hàng' },
                { type: 'number', min: 1, max: 14, message: 'Số hàng phải từ 1 đến 14!' }
              ]}>
                <InputNumber
                  onChange={handleRows}
                  placeholder="Nhập số hàng"
                  className='w-9/12'
                  min={1}  // Minimum value
                  max={14} // Maximum value
                />
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={12}>
              <Form.Item label="Số cột" name="columns" rules={[
                { required: true, message: 'Nhập số cột' },
                { type: 'number', min: 1, max: 14, message: 'Số cột phải từ 1 đến 14!' }
              ]}>
                <InputNumber
                  onChange={handleCol}
                  placeholder="Nhập số cột"
                  className='w-9/12'
                  min={1}  // Minimum value
                  max={14} // Maximum value
                />
              </Form.Item>
            </Col>
          </Row>
          {/* Thêm phần SeatLayout ở đây */}
          <div className="seat-layout-preview">
            {rows && cols ? (
              <SeatLayout
                rows={rows}
                cols={cols}
              // Có thể thêm các props khác nếu cần
              />
            ) : null}
          </div>
          <div className="flex justify-center mt-10">
            <Button type="primary" htmlType="submit" form="basic">
              Thêm mới
            </Button>
          </div>
        </Form>
      </Modal>

      {/* <Modal
        title="Cập nhật đạo diễn"
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
            label="Tên đạo diễn"
            name="directorName"
            rules={[{ required: true, message: 'Hãy nhập tên đạo diễn!' }]}
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
          <div className="flex justify-center mt-10">
          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit" form="basic" >
              Cập nhật
            </Button>
          </Form.Item>
        </div>
        </Form>
      </Modal> */}
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
