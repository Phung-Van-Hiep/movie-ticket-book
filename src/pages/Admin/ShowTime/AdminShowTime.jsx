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
  Pagination,
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
  APICreateShowTime,
  APIGetAllShowTime,
  APIGetShowTimeDetail,
  APIDeleteShowTime,
  APIGetAllCinemas,
  APIGetAllScreen,
  APIGetAllMovies
} from '../../../services/service.api';
import dayjs from 'dayjs';

const AdminShowTime = () => {
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);
  const [listShowTime, setListShowTime] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [formUpdate] = Form.useForm();
  const [formSearch] = Form.useForm();
  const [showtimeDetail, setShowTimeDetail] = useState(null);
  const [isModalUpdateOpen, setIsModalUpdateOpen] = useState(false);
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
  const [selectedCinema, setSelectedCinema] = useState(null);
  const [selectedScreen, setSelectedScreen] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [updateButtonDisabled, setUpdateButtonDisabled] = useState(false);
  const [searchDate, setSearchDate] = useState(dayjs());
  const handlePageChange = (page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  const getPagedData = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    console.log("trong listSHowTime có gì", listShowTime[0].screens.length > 0 && listShowTime.length > 0)
    return listShowTime.slice(startIndex, endIndex);
  };
  const handleSerchShowTime = async (values) => {
    const { cinemaUuid, screenUuid, showDate } = values;

    try {
      const findDate = dayjs(showDate).format('YYYY-MM-DD');
      setSearchDate(dayjs(showDate)); // Update the searchDate state
      await getAllShowTime(cinemaUuid, screenUuid, findDate);
      setCurrentPage(1);
    } catch (error) {
      // console.error("Lỗi khi tìm kiếm suất chiếu:", error);
      message.error('Đã xảy ra lỗi khi tìm kiếm suất chiếu.');
    }
  };
  const handleChangeSearchCinemas = (value, option) => {
    setSelectedCinemaUuid(value);
    setCinemaLabel(option?.label || '');
    // setSelectedCinemaLabel('');
    // setSelectedScreenLabel('');
    getAllScreen(value);
    setCinemaSelected(!!value);
    formSearch.setFieldsValue({
      screenUuid: undefined,
    });
  };
  const handleChangeStatus = (value) => {
    console.log(`selected ${value}`);
  }

  const handleChangeCinemas = async (value) => {
    setSelectedCinemaUuid(value);
    setSelectedCinema(value);
    await getAllScreen(value);
    setCinemaSelected(!!value);
    formUpdate.setFieldsValue({
      screenUuid: undefined,
    });
  };
  const handleChangeScreen = (value, option) => {
    setSelectedScreen(value);
    setScreenLabel(option?.label || '');
  };
  const showModalUpdate = async (uuid) => {
    try {
      const res = await APIGetShowTimeDetail({ uuid });
      if (res && res.status === 200) {
        const showtimeDetail = res.data.data;
        // console.log("có một càidfjgdf", showtimeDetail)
        setShowTimeDetail(showtimeDetail);
        // const showTimeRange = [
        //   dayjs(showtimeDetail.startTime, 'HH:mm:ss'),
        //   dayjs(showtimeDetail.endTime, 'HH:mm:ss')
        // ];
        // startTime = showtimeDetail.startTime
        setSelectedCinema(showtimeDetail.cinemaUuid);
        setSelectedScreen(showtimeDetail.screenUuid);

        // Fetch the screen options for the selected cinema
        await getAllScreen(showtimeDetail.cinemaUuid);
        formUpdate.setFieldsValue({
          cinemaUuid: showtimeDetail.cinemaUuid,
          showDate: dayjs(showtimeDetail.showDate, 'YYYY-MM-DD'),
          screenUuid: showtimeDetail.screenUuid,
          moviesUuid: showtimeDetail.moviesUuid,
          languageType: showtimeDetail.languageType,
          startTime: showtimeDetail.startTime,
          endTime: showtimeDetail.endTime,
          state: showtimeDetail.state
        });
        setIsModalUpdateOpen(true);
        setUpdateButtonDisabled(showtimeDetail.state === 1 || showtimeDetail.state === 2);
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

  const formatToDateString = (dateObj) => dayjs(dateObj).format('YYYY-MM-DD');
  const onFinishUpdateShowTimeInfor = async (values) => {
    if (updateButtonDisabled) {
      message.error('Không thể cập nhật suất chiếu đang chiếu hoặc đã chiếu.');
      return;
    }
    const { showDate, ...restValues } = values;
    // Định dạng lại ngày chiếu
    const showDateFormat = dayjs(showDate).format('YYYY-MM-DD');
    // console.log("Check cái res", restValues)
    // Định dạng lại khoảng thời gian chiếu
    // const [startTime, endTime] = showTime;
    // const formattedStartTime = dayjs(startTime).format('HH:mm:ss');
    // const formattedEndTime = dayjs(endTime).format('HH:mm:ss');

    try {
      const res = await APICreateShowTime({
        uuid: showtimeDetail.uuid,
        // cinemaUuid: restValues.cinemaUuid,
        screenUuid: restValues.screenUuid,
        moviesUuid: restValues.moviesUuid,
        showDate: showDateFormat,
        startTime: restValues.startTime,
        endTime: restValues.endTime,
        languageType: restValues.languageType,
      });

      if (res && res.status === 200) {
        message.success('Cập nhật suất chiếu thành công');
        formUpdate.resetFields();
        getAllShowTime(null, null, searchDate); // Tải lại danh sách suất chiếu
        handleCancelUpdate();
        setShowText(false);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.error?.errorMessage || 'Đã xảy ra lỗi khi cập nhật suất chiếu';
      message.error(errorMessage);
    }
  };

  const getAllShowTime = async (cinemaUuid = null, screenUuid = null, finddate = searchDate) => {
    const findDate = dayjs(finddate).format('YYYY-MM-DD');
    try {
      const res = await APIGetAllShowTime({ pageSize: 1000, page: 1, cinemaUuid, screenUuid, findDate });
      if (res && res.data && res.data.data) {
        const cinemaData = res.data.data.items;
        // if(cinemaData.length > 0 &&  cinemaData[0].screens.length > 0 ){
        // console.log("gì đó", cinemaData)
        setListShowTime(cinemaData);
        // }
        form.resetFields();
        handleCancel();
      }
    } catch (error) {
      message.error('Đã xảy ra lỗi khi lấy danh sách suất chiếu.');
    }
  };
  const onFinish = async (values) => {
    const { showDate, cinemaUuid, ...restValues } = values;
    const showDateFormat = formatToDateString(new Date(showDate));
    const dataShowTime = {
      ...restValues,
      showDate: showDateFormat,
    };
    try {
      const res = await APICreateShowTime(dataShowTime);
      if (res && res.status === 200) {
        message.success(res.data.error.errorMessage);
        form.resetFields();
        getAllShowTime(null, null, searchDate);
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
  };

  const handleOk = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
    setSelectedCinemaUuid(null)
  };

  const handleCancelUpdate = () => {
    setIsModalUpdateOpen(false);
    setSelectedCinema(null);
    setSelectedScreen(null);
    setSelectedCinemaUuid(null);
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
      const res = await APIDeleteShowTime({ uuid, status: 0 });
      if (res && res.status === 200) {
        message.success('Đã xoá thành công.');
        getAllShowTime(null, null, searchDate); // Cập nhật lại danh sách showtime sau khi xoá
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
        const dataItems = res.data.data.items.filter(item => [1, 3].includes(item.status));// Chỉ lấy những mục có status là 1
        const options = dataItems.map(mapDataToOptions);
        // console.log("Lấy được type không", options);
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
    try {
      const res = await APIGetAllScreen({ pageSize: 1000, page: 1, cinemaUuid });
      if (res && res.data && Array.isArray(res.data.data.items)) {
        const dataItems = res.data.data.items.filter(item => [1, 3].includes(item.status));
        const options = dataItems.map(screen => ({
          value: screen.uuid,
          label: (
            <div className="flex items-center space-x-2">
              <span className='mr-5'>{screen.screenName}</span>
              <div className={`inline-block rounded-md border ${getColorClass(screen.screenType)}`}>
                {getScreenTypeLabel(screen.screenType)}
              </div>
            </div>
          ),
          type: screen.screenType, // Lưu type để sử dụng sau nếu cần
        }));
        // console.log("Trong này có gì", options);
        setListScreen(options);
      } else {
        setListScreen([]);
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách phòng chiếu:', error);
      setListScreen([]);
    }
  };
  const getScreenTypeLabel = (type) => {
    switch (type) {
      case 1:
        return '2D';
      case 2:
        return '3D';
      case 3:
        return 'IMAX 2D';
      case 4:
        return 'IMAX 3D';
      default:
        return 'Khác';
    }
  };
  const getColorClass = (type) => {
    switch (type) {
      case 1:
        return 'bg-blue-100 text-blue-600 border-blue-600'; // Xanh nước biển
      case 2:
        return 'bg-green-100 text-green-600 border-green-600'; // Xanh lá cây
      case 3:
        return 'bg-yellow-100 text-yellow-600 border-yellow-600'; // Vàng
      case 4:
        return 'bg-red-100 text-red-600 border-red-600'; // Đỏ
      default:
        return 'bg-gray-100 text-gray-600 border-gray-600'; // Mặc định
    }
  };
  const getAllMovies = async () => {
    fetchData(
      APIGetAllMovies,
      (movie) => ({
        value: movie.uuid,
        label: (
          <div className="flex justify-between items-center">
            <span>{movie.title}</span>
            <span className="text-gray-500 text-xl">{movie.duration} phút</span>
          </div>
        ),
        duration: movie.duration,
      }),
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
  const listShowTimeMap = listShowTime.map((showtime, index) => ({
    key: index + 1,
    ...showtime
  }));
  const columns = [
    {
      title: 'STT',
      dataIndex: 'key',
      width: 20
    },
    {
      title: 'Tên phim',
      dataIndex: 'moviesName',
      key: 'moviesName',
      ...getColumnSearchProps('moviesName'),
      width: 50,
      sorter: (a, b) => a.moviesName.length - b.moviesName.length,
      sortDirections: ['descend', 'ascend'],
      render: (movie, record) => {
        return (
          <div>
            {movie} {/* Hiển thị tên quốc gia */}
          </div>
        );
      }
    },
    {
      title: 'Hình thức dịch',
      dataIndex: 'languageType',
      key: 'languageType',
      width: 50,
      render: (languageType) => (languageType === 1 ? <span className="bg-green-100 text-green-600 px-2 py-1 rounded-md border border-green-600">Phụ đề  </span>
        : <span className="bg-violet-100 text-violet-600 px-2 py-1 rounded-md border border-violet-600"> Lồng tiếng</span>),
    },
    {
      title: 'Loại phòng chiếu',
      dataIndex: 'screenType',
      key: 'screenType',
      width: 50,
      render: (status) => {
        let statusText;
        let colorClass; // Thêm biến để xác định màu sắc

        switch (status) {
          case 1:
            statusText = '2D';
            colorClass = 'bg-blue-100 text-blue-600 border-blue-600'; // Xanh nước biển
            break;
          case 2:
            statusText = '3D';
            colorClass = 'bg-green-100 text-green-600 border-green-600'; // Xanh lá cây
            break;
          case 3:
            statusText = 'IMAX2D';
            colorClass = 'bg-yellow-100 text-yellow-600 border-yellow-600'; // Vàng
            break;
          case 4:
            statusText = 'IMAX3D';
            colorClass = 'bg-red-100 text-red-600 border-red-600'; // Đỏ
            break;
        }
        return (
          <div className={` inline-block rounded-md border ${colorClass}`}>
            {statusText}
          </div>
        );
      },
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
      title: 'Ngày chiếu',
      dataIndex: 'showDate',
      key: 'showDate',
      width: 50,
      render: (text) => {
        return (
          <span className="bg-red-100 text-red-600 px-2 py-1 rounded-md border border-red-600">
            {text}
          </span>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'state',
      key: 'state',
      width: 50,
      render: (state) => {
        let statusText;
        let colorClass;

        switch (state) {
          case 0:
            statusText = 'Sắp chiếu';
            colorClass = 'bg-sky-100 text-sky-600 border-sky-600'; // Màu Sky
            break;
          case 1:
            statusText = 'Đang chiếu';
            colorClass = 'bg-green-100 text-green-600 border-green-600'; // Màu Green
            break;
          case 2:
            statusText = 'Đã chiếu';
            colorClass = 'bg-red-100 text-red-600 border-red-600'; // Màu Red
            break;
          default:
            statusText = '';
            colorClass = '';
            break;
        }
        return (
          <div className={`inline-block rounded-md border ${colorClass} px-2 py-1`}>
            {statusText}
          </div>
        );
      },
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
    getAllShowTime();
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
          form={formSearch}
          name="basic"
          layout="inline"
          onFinish={handleSerchShowTime}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          initialValues={{
            showDate: dayjs() // Đặt giá trị mặc định là ngày hiện tại
          }}
        >
          <Row gutter={16} align="middle" style={{ width: '100%' }}>
            <Col>
              <Form.Item
                label="Rạp chiếu"
                name="cinemaUuid"
              // rules={[{ required: true, message: 'Hãy chọn rạp phim!' }]}
              >
                <Select
                  showSearch
                  defaultValue=""
                  options={listCinemas}
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  allowClear
                  onChange={handleChangeSearchCinemas}
                  style={{ width: 200 }}
                />
              </Form.Item>
            </Col>
            <Col>
              <Form.Item
                label="Phòng chiếu"
                name="screenUuid"
              // rules={[{ required: true, message: 'Hãy chọn phòng chiếu phim!' }]}
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
                  disabled={!selectedCinemaUuid} // Vô hiệu hóa nếu chưa chọn rạp chiếu
                  className={!selectedCinemaUuid ? 'cursor-no-drop' : ''} // Thêm lớp cursor-no-drop nếu bị vô hiệu hóa
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
              disabled={!selectedCinemaUuid} // Vô hiệu hóa nếu chưa chọn rạp chiếu
              className={!selectedCinemaUuid ? 'cursor-no-drop' : ''} // Thêm lớp cursor-no-drop nếu bị vô hiệu hóa
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
            name="showDate"
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
          <Form.Item label="Hình thức dịch"
            name="languageType"
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
          <Form.Item label="Thời gian chiếu" required={true}>
            <Input.Group compact>
              <Form.Item
                name="startTime"
                noStyle
                rules={[
                  { required: true, message: 'Hãy nhập thời gian bắt đầu' },
                  {
                    pattern: /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/,
                    message: 'Định dạng thời gian bắt đầu không hợp lệ. Sử dụng HH:mm:ss'
                  }
                ]}
              >
                <Input style={{ width: '50%' }} placeholder="Bắt đầu (HH:mm:ss)" />
              </Form.Item>
              <Form.Item
                name="endTime"
                noStyle
                rules={[
                  { required: true, message: 'Hãy nhập thời gian kết thúc' },
                  {
                    pattern: /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/,
                    message: 'Định dạng thời gian kết thúc không hợp lệ. Sử dụng HH:mm:ss'
                  }
                ]}
              >
                <Input style={{ width: '50%' }} placeholder="Kết thúc (HH:mm:ss)" />
              </Form.Item>
            </Input.Group>
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
        onCancel={handleCancelUpdate}
        footer={
          <Button onClick={() => {
            handleCancelUpdate();
          }}>
            Đóng
          </Button>
        }
      >
        <Form
          form={formUpdate}
          name="basic"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          style={{ maxWidth: 600 }}
          initialValues={{ remember: true }}
          onFinish={onFinishUpdateShowTimeInfor}
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
              onChange={handleChangeScreen}
              options={listScreen}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              disabled={!selectedCinemaUuid} // Vô hiệu hóa nếu chưa chọn rạp chiếu
              className={!selectedCinemaUuid ? 'cursor-no-drop' : ''} // Thêm lớp cursor-no-drop nếu bị vô hiệu hóa
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
            name="showDate"
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
          <Form.Item label="Hình thức dịch"
            name="languageType"
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
          <Form.Item label="Thời gian chiếu" required={true}>
            <Input.Group compact>
              <Form.Item
                name="startTime"
                noStyle
                rules={[
                  { required: true, message: 'Hãy nhập thời gian bắt đầu' },
                  {
                    pattern: /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/,
                    message: 'Định dạng thời gian bắt đầu không hợp lệ. Sử dụng HH:mm:ss'
                  }
                ]}
              >
                <Input style={{ width: '50%' }} placeholder="Bắt đầu (HH:mm:ss)" />
              </Form.Item>
              <Form.Item
                name="endTime"
                noStyle
                rules={[
                  { required: true, message: 'Hãy nhập thời gian kết thúc' },
                  {
                    pattern: /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/,
                    message: 'Định dạng thời gian kết thúc không hợp lệ. Sử dụng HH:mm:ss'
                  }
                ]}
              >
                <Input style={{ width: '50%' }} placeholder="Kết thúc (HH:mm:ss)" />
              </Form.Item>
            </Input.Group>
          </Form.Item>
          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button
              type="primary"
              htmlType="submit"
              disabled={updateButtonDisabled}
            >
              Cập nhật
            </Button>
          </Form.Item>
          {updateButtonDisabled && (
            <div className="text-center mt-2 mr-10">
              <p className="text-red-500">
                {showtimeDetail.state === 1
                  ? "Không thể cập nhật suất chiếu đang chiếu."
                  : "Không thể cập nhật suất chiếu đã chiếu."}
              </p>
            </div>
          )}

        </Form>
      </Modal>
      <div className='mt-10'>
        {listShowTime.length > 0 && listShowTime[0].screens.length > 0 ? (
          getPagedData().map((cinema) => (
            <React.Fragment key={cinema.cinemaName}>
              <div className="text-white text-center text-6xl font-semibold bg-blue-700 p-4 rounded-lg mb-5">
                {`Rạp: ${cinema.cinemaName}`}
              </div>
              {cinema.screens.map((screen) => (
                <React.Fragment key={screen.screenName}>
                  <div className="text-yellow-500 text-3xl font-semibold mt-5 mb-5 text-left ml-10">
                    {screen.screenName}
                  </div>
                  <Table
                    columns={columns}
                    dataSource={screen.showtimes.map((showtime, index) => ({
                      key: index + 1,
                      ...showtime
                    }))}
                    scroll={{ x: 1000, y: 500 }}
                    pagination={false}
                  />
                </React.Fragment>
              ))}
            </React.Fragment>
          ))
        ) : (
          <div className="text-center text-2xl mt-10">
            Không tìm thấy suất chiếu phù hợp.
          </div>
        )}
      </div>
      <Pagination
        current={currentPage}
        pageSize={pageSize}
        total={listShowTime.length}
        onChange={handlePageChange}
        showSizeChanger
        showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
        className='mt-10'
      />
    </>
  );
};

export default AdminShowTime;