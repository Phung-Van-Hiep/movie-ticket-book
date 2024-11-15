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
  APICreateShowTime,
  APIGetAllShowTime,
  APIGetShowTimeDetail,
  APIDeleteShowTime,
  APIGetAllCinemas,
  APIGetAllScreen,
  APIGetAllMovies
} from '../../../services/service.api';
import { PlusOutlined } from '@ant-design/icons';
import { Image, Upload } from 'antd';
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
  const handleSerchShowTime = async (values) => {
    // console.log("Trog values ày có gì ", values);
    const { cinemaUuid, screenUuid, showDate } = values;
    setSelectedCinemaLabel(cinemaLabel);
    setSelectedScreenLabel(screenLabel);
    try {
      const findDate = dayjs(showDate).format('YYYY-MM-DD');
      console.log("Selected date", findDate);
      getAllShowTime(cinemaUuid,screenUuid,findDate)
      // const res = await APIGetAllShowTime({
      //   pageSize: 1000,
      //   page: 1,
      //   cinemaUuid,
      //   screenUuid,
      //   findDate
      // });
      // if (res && res.data && res.data.data) {
      //   console.log("sdfsdfssfs chay vào chưa",res.data.data)
      //   const filteredShowTimes = res.data.data.items.flatMap(item =>
      //     item.screens?.flatMap(screen =>
      //       screen.showtimes?.filter(showtime => showtime.status === 1  && item.cinemaName === cinemaLabel && // Kiểm tra trùng tên rạp
      //         screen.screenName === screenLabel) || [] // Lọc các showtime có status = 1
      //     ) || [] // Nếu không có screens thì trả về mảng rỗng
      //   );
      //   console.log("Xem độ dài nào", filteredShowTimes)
      //   // Chỉ set danh sách suất chiếu nếu có kết quả
      //   if (filteredShowTimes.length > 0) {
      //     setListShowTime(filteredShowTimes);
      //     setShowText(true);
      //   } else {
      //     setShowText(false);
      //     setListShowTime([]);
      //     getAllShowTime();
      //   }
      // }
    } catch (error) {
      console.error("Lỗi khi tìm kiếm suất chiếu:", error);
      message.error('Đã xảy ra lỗi khi tìm kiếm suất chiếu.');
    }
  };
  const handleChangeSearchCinemas = (value, option) => {
    setSelectedCinemaUuid(value);
    setCinemaLabel(option?.label || '');
    setSelectedCinemaLabel('');
    setSelectedScreenLabel('');
    getAllScreen(value);
    setCinemaSelected(!!value);
    formSearch.setFieldsValue({
      screenUuid: undefined,
    });
  };
  const handleChangeStatus = (value) => {
    console.log(`selected ${value}`);
  }

  const handleChangeCinemas = (value) => {
    setSelectedCinemaUuid(value);
    getAllScreen(value);
    setCinemaSelected(!!value);
    formUpdate.setFieldsValue({
      screenUuid: undefined,
    });
  };
  const handleChangeScreen = (value, option) => {
    setScreenLabel(option?.label || '');
  };
  const showModalUpdate = async (uuid) => {
    try {
      const res = await APIGetShowTimeDetail({ uuid });
      if (res && res.status === 200) {
        const showtimeDetail = res.data.data;
        setShowTimeDetail(showtimeDetail);
        // console.log("Checkdata ",showtimeDetail);
        const showTimeRange = [
          dayjs(showtimeDetail.startTime, 'HH:mm:ss'),
          dayjs(showtimeDetail.endTime, 'HH:mm:ss')
        ];
        formUpdate.setFieldsValue({
          cinemaUuid: showtimeDetail.cinemaUuid,
          showDate: dayjs(showtimeDetail.showDate, 'YYYY-MM-DD'),
          screenUuid: showtimeDetail.screenUuid,
          moviesUuid: showtimeDetail.moviesUuid,
          languageType: showtimeDetail.languageType,
          showTime: showTimeRange,
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

  const formatToDateString = (dateObj) => dayjs(dateObj).format('YYYY-MM-DD');
  const onFinishUpdateShowTimeInfor = async (values) => {
    const { showDate, showTime, ...restValues } = values;
    // Định dạng lại ngày chiếu
    const showDateFormat = dayjs(showDate).format('YYYY-MM-DD');
    // console.log("Check cái res", restValues)
    // Định dạng lại khoảng thời gian chiếu
    const [startTime, endTime] = showTime;
    const formattedStartTime = dayjs(startTime).format('HH:mm:ss');
    const formattedEndTime = dayjs(endTime).format('HH:mm:ss');

    try {
      const res = await APICreateShowTime({
        uuid: showtimeDetail.uuid,
        // cinemaUuid: restValues.cinemaUuid,
        screenUuid: restValues.screenUuid,
        moviesUuid: restValues.moviesUuid,
        showDate: showDateFormat,
        startTime: formattedStartTime,
        endTime: formattedEndTime,
        languageType: restValues.languageType,
      });

      if (res && res.status === 200) {
        message.success('Cập nhật suất chiếu thành công');
        formUpdate.resetFields();
        getAllShowTime(); // Tải lại danh sách suất chiếu
        handleCancelUpdate();
        setShowText(false);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.error?.errorMessage || 'Đã xảy ra lỗi khi cập nhật suất chiếu';
      message.error(errorMessage);
    }
  };

  const getAllShowTime = async (cinemaUuid = null, screenUuid = null, finddate = new Date()) => {
    const findDate = dayjs(finddate).format('YYYY-MM-DD');
    try {
      const res = await APIGetAllShowTime({ pageSize: 1000, page: 1, cinemaUuid, screenUuid, findDate });
      // console.log("Chay vào", res)
      if (res && res.data && res.data.data) {
        // console.log(res.data.data.items)
        const filteredShowTimes = res.data.data.items.flatMap(cinema =>
          cinema.screens.flatMap(screen =>
            screen.showtimes.filter(showtime => showtime.status === 1)
          )
        );
        setListShowTime(filteredShowTimes);
        setShowText(true);
        form.resetFields();
        handleCancel();
      }
    } catch (error) {
      message.error('Đã xảy ra lỗi khi lấy danh sách suất chiếu.');
    }
  };
  const onFinish = async (values) => {
    const { showDate, showTime, cinemaUuid, ...restValues } = values;
    const startTime = showTime ? dayjs(showTime[0]).format("HH:mm:ss") : null;
    const endTime = showTime ? dayjs(showTime[1]).format("HH:mm:ss") : null;
    const showDateFormat = formatToDateString(new Date(showDate));
    const dataShowTime = {
      ...restValues,
      showDate: showDateFormat,
      startTime: startTime,
      endTime: endTime,
    };
    try {
      const res = await APICreateShowTime(dataShowTime);
      if (res && res.status === 200) {
        message.success(res.data.error.errorMessage);
        form.resetFields();
        getAllShowTime();
        setShowText(false);
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
      const res = await APIDeleteShowTime({ uuid, status: 0 });
      if (res && res.status === 200) {
        message.success('Đã xoá thành công.');
        getAllShowTime(); // Cập nhật lại danh sách showtime sau khi xoá
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
      (movie) => ({ value: movie.uuid, label: movie.title, screenType: movie.screenType }),
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
      width: 50
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
      render: (languageType) => (languageType === 1 ? 'Phụ đề' : 'Lồng tiếng'),
    },
    {
      title: 'Hình thức chiếu',
      dataIndex: 'screenType',
      key: 'screenType',
      width: 50,
      render: (screenType) => {
        switch (screenType) {
          case 1: return '2D';
          case 2: return '3D';
          case 3: return 'IMAX 2D';
          case 4: return 'IMAX 3D';
          default: return '';
        }
      },
    },
    {
      title: 'Thời gian chiếu',
      key: 'timeRange',
      width: 100,
      render: (text, record) => `${record.startTime} - ${record.endTime}`,
    },
    {
      title: 'Ngày chiếu',
      dataIndex: 'showDate',
      key: 'showDate',
      width: 100,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'state',
      key: 'state',
      width: 50,
      render: (state) => {
        switch (state) {
          case 0: return 'Sắp chiếu';
          case 1: return 'Đang chiếu';
          case 2: return 'Đã chiếu';
          default: return '';
        }
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
            {selectedCinemaLabel ? `Rạp: ${selectedCinemaLabel}` : `Rạp`}
            </div>
            <div className="text-yellow-500 text-3xl font-semibold mt-10 text-left ml-10">
              {selectedScreenLabel ? `${selectedScreenLabel}` : `Phòng chiếu` }
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
          <Form.Item label="Thời gian chiếu"
            name="showTime"
            rules={[{ required: true, message: 'Hãy nhập thời gian chiếu' }]}>
            <TimePicker.RangePicker />
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
          dataSource={listShowTimeMap}
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
