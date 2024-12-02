import React, { useEffect, useRef, useState } from 'react';
import {
  FileTextOutlined,
  InfoOutlined,
  SearchOutlined,
} from '@ant-design/icons';

import {
  Button,
  Col,
  Form,
  Input,
  message,
  Modal,
  Row,
  Space,
  Table
} from 'antd';
import Highlighter from 'react-highlight-words';
import '../../../css/AdminGenre.css';
import {
  APIGetALLBill,
  APIGetBillDetail,
} from '../../../services/service.api';
import dayjs from 'dayjs';


const AdminOrder = () => {
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);
  const [listBill, setListBill] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [formUpdate] = Form.useForm();
  const [billDetail, setBillDetail] = useState(null);
  const [isModalUpdateOpen, setIsModalUpdateOpen] = useState(false);


  const showModalUpdate = async (uuid) => {
    try {
      const res = await APIGetBillDetail({ uuid });
      // console.log('update', res);
      if (res && res.status === 200) {
        const billDetail = res.data.data;
        setBillDetail(billDetail);
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

  const onFinishUpdateDirectorInfor = async (values) => {
    const { birthday, ...restValues } = values;
    const birthdayObj = new Date(birthday);
    const birthdayFormat = formatToDateString(birthdayObj);
    try {
      const res = await APICreateDirector({
        uuid: billDetail.uuid,
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
      width: 25
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
      render: (status) => {
        let statusText;
        let colorClass;
        switch (status) {
          case 1:
            statusText = 'Đã thanh toán';
            colorClass = 'bg-green-100 text-green-600 border-green-600';
            break;
          case 2:
            statusText = 'Thanh toán thất bại';
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
      width: 40
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
            className="bg-orange-500 text-white"
            onClick={() => showModalUpdate(record.uuid)}
          >
            <FileTextOutlined />
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
        title="Thông tin đơn hàng"
        open={isModalUpdateOpen}
        onCancel={() => setIsModalUpdateOpen(false)}
        footer={
          <div className="flex justify-center">
            <Button onClick={() => setIsModalUpdateOpen(false)}>Đóng</Button>
          </div>
        }
        width={1000}
      >
        <Row gutter={16}>
          {/* Cột 1: Các thông tin khác (dòng đơn giản) */}
          <Col span={10}>
            <div className="flex flex-col gap-4">
              <div><strong>Mã đơn hàng: </strong> {billDetail?.code || 'N/A'}</div>
              <div><strong>Tên phim: </strong> <span className="text-blue-500">{billDetail?.movieName || 'N/A'}</span></div>
              <div><strong>Rạp chiếu phim: </strong> <span className="text-blue-700"> {billDetail?.cinemaName || 'N/A'}</span></div>
              <div><strong>Phòng chiếu phim: </strong> {billDetail?.screenName || 'N/A'}</div>
              <div>
                <strong>Giờ chiếu: </strong>
                <span className='bg-pink-100 text-pink-600 px-2 py-1 rounded-md border border-pink-600 inline-block'>
                  {billDetail?.startTime?.slice(0, 5) || 'N/A'} - {billDetail?.endTime?.slice(0, 5) || 'N/A'}
                </span>
              </div>
              <div><strong>Ngày chiếu: </strong> {billDetail?.showDate || 'N/A'}</div>
              <div><strong>Trạng thái: </strong> {
                billDetail?.state === 1
                  ? <span className="bg-green-100 text-green-600 px-2 py-1 rounded-md border border-green-600 inline-block">Đã thanh toán</span>
                  : billDetail?.state === 0
                    ? 'Chưa thanh toán'
                    : billDetail?.state === 2
                      ? 'Thanh toán thất bại'
                      : 'N/A'
              }</div>
              <div><strong>Ngày tạo đơn hàng: </strong> {billDetail?.timeCreated ? new Date(billDetail?.timeCreated).toLocaleDateString('vi-VN') : 'N/A'}</div>
            </div>
          </Col>

          {/* Cột 2: Thông tin khách hàng */}
          <Col span={14}>
            <div className="flex flex-col gap-4">
              <div><strong>Khách hàng: </strong> <span className="text-blue-500">  {billDetail?.user?.fullname || 'N/A'}</span> </div>
              <div><strong>Số điện thoại: </strong> {billDetail?.user?.phoneNumber || 'N/A'}</div>
              <div><strong>Email:</strong> {billDetail?.user?.email || 'N/A'}</div>
              <div>
                <strong>Trạng thái: </strong>
                {billDetail?.user?.status === 1
                  ? 'Hoạt động'
                  : billDetail?.user?.status === 2
                    ? 'Đang khoá'
                    : 'N/A'}
              </div>
              <div>
                <strong>Ghế ngồi:</strong> {billDetail?.seat?.map(seat => seat.seatCode).join(', ') || null}
                {billDetail?.totalSeatPrice && ` - Tổng tiền: ${billDetail?.totalSeatPrice}`}
              </div>
              <div>
                <strong>Combo:</strong>
                {billDetail?.combo && billDetail.combo.length > 0
                  ? billDetail.combo
                    .map(combo => `${combo.comboName} x ${combo.quantity}`)
                    .join(', ')
                  : 'Không có combo'}
                {billDetail?.totalComboPrice && ` - Tổng tiền: ${billDetail?.totalComboPrice}` || null}
              </div>
              <div>
                <strong>Tổng tiền ghế + combo: </strong>
                {((billDetail?.totalSeatPrice || 0) + (billDetail?.totalComboPrice || 0)) || 0}
              </div>
              <div>
                <strong>Khuyến mãi: </strong>
                <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-md border border-blue-600 inline-block">
                  {billDetail?.discountPrice}
                </span>
                {billDetail?.couponCode && (
                  <span className="ml-2 bg-yellow-100 text-yellow-600 px-2 py-1 rounded-md border border-yellow-600 inline-block">
                    {billDetail.couponCode}
                  </span>
                )}
              </div>
              <div className='mt-2'><strong>Thành tiền: </strong><span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-md border border-blue-600 inline-block"> {billDetail?.payPrice || 0} </span></div>
            </div>
          </Col>
        </Row>
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
