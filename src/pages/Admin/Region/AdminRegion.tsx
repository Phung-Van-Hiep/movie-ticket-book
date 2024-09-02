import React, { useEffect, useRef, useState } from "react";
import { SearchOutlined } from "@ant-design/icons";
import type {
  FormProps,
  InputRef,
  PopconfirmProps,
  TableColumnsType,
  TableColumnType,
} from "antd";
import {
  Button,
  Drawer,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Space,
  Table,
} from "antd";
import type { FilterDropdownProps } from "antd/es/table/interface";
import Highlighter from "react-highlight-words";
import "../../../css/AdminGenre.css";
import {
    APICreateRegion,
    APIGetAllRegion,
    APIGetRegionDetail,
    APIDeleteRegion
} from "../../../services/service.api";
interface DataType {
  id: string;
  uuid: string;
  regionName: string;
  status: number;
}

type DataIndex = keyof DataType;

type FieldType = {
  regionName: string;
};

const AdminRegion: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef<InputRef>(null);
  const [listRegion, setListRegion] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [formUpdate] = Form.useForm();
  const [regionDetail, setRegionDetail] = useState<DataType | null>(null);
  const [isModalUpdateOpen, setIsModalUpdateOpen] = useState(false);

  const showModalUpdate = async (uuid: string) => {
    try {
      const res = await APIGetRegionDetail({ uuid });
      if (res && res.status === 200) {
        const regionDetail = res.data.data;
        setRegionDetail(regionDetail);
        formUpdate.setFieldsValue({
          regionName: regionDetail.regionName,
        });
        setIsModalUpdateOpen(true);
      } else {
        message.error("Không tìm thấy thông tin chi tiết.");
      }
    } catch (error: any) {
      if (error.response) {
        const errorMessage =
          error.response.data?.error?.errorMessage ||
          "Đã xảy ra lỗi khi lấy thông tin chi tiết.";
        message.error(errorMessage);
      } else {
        message.error("Đã xảy ra lỗi khi lấy thông tin chi tiết.");
      }
    }
  };
  const onFinishUpdateRegionName: FormProps<FieldType>["onFinish"] = async (
    values
  ) => {
    try {
      const res = await APICreateRegion({
        uuid: regionDetail.uuid,
        regionName: values.regionName,
      });
      if (res && res.status === 200) {
        message.success(res.data.error.errorMessage);
        getAllRegion();
        formUpdate.resetFields();
        handleCancelUpdate();
      }
      // console.log("Success:", values);
    } catch (error: any) {
      if (error.response) {
        const errorMessage =
          error.response.data?.error?.errorMessage ||
          "Đã xảy ra lỗi khi update.";
        message.error(errorMessage);
      } else if (error.request) {
        message.error(
          "Không nhận được phản hồi từ máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại."
        );
      } else {
        message.error("Đã xảy ra lỗi. Vui lòng thử lại sau.");
      }
    }
  };

  const getAllRegion = async (): Promise<void> => {
    try {
      const res = await APIGetAllRegion({ pageSize: 10, page: 1 });
      if (res && res.data && res.data.data) {
        // Lọc các region có status khác "0"
        const filteredRegions = res.data?.data?.items.filter(
          (region: DataType) => region.status !== 0
        );
        setListRegion(filteredRegions); // Cập nhật danh sách region đã lọc
        form.resetFields();
        handleCancel();
      }
    } catch (error) {
      message.error("Đã xảy ra lỗi khi lấy danh sách thể loại.");
    }
  };
  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    try{
    const res = await APICreateRegion(values);
    // console.log(res);
    if (res && res.status === 200) {
      message.success(res.data.error.errorMessage);
      getAllRegion();
    }
    // console.log("Success:", values);
    }catch(error:any){
      if (error.response) {
        const errorMessage =
          error.response.data?.error?.errorMessage ||
          "Đã xảy ra lỗi khi thêm mới.";
        message.error(errorMessage);
      } else if (error.request) {
        message.error(
          "Không nhận được phản hồi từ máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại."
        );
      } else {
        message.error("Đã xảy ra lỗi. Vui lòng thử lại sau.");
      }
    }
      
  };

  const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (
    errorInfo
  ) => {
    console.log("Failed:", errorInfo);
  };
  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleCancelUpdate = () => {
    setIsModalUpdateOpen(false);
  };

  const showDrawer = async (uuid: string) => {
    try {
      const res = await APIGetRegionDetail({ uuid });
      // console.log('API Response:', res); // Kiểm tra dữ liệu trả về
      if (res && res.status === 200) {
        setRegionDetail(res.data.data);
        setOpen(true);
      } else {
        message.error("Không tìm thấy thông tin chi tiết.");
      }
    } catch (error: any) {
      if (error.response) {
        console.error(error.response.data);
        const errorMessage =
          error.response.data?.error?.errorMessage ||
          "Đã xảy ra lỗi khi lấy thông tin chi tiết.";
        message.error(errorMessage);
      } else {
        message.error("Đã xảy ra lỗi khi lấy thông tin chi tiết.");
      }
    }
  };
  

  const onClose = () => {
    setOpen(false);
    setIsModalUpdateOpen(false)
  };
  const handleSearch = (
    selectedKeys: string[],
    confirm: FilterDropdownProps["confirm"],
    dataIndex: DataIndex
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText("");
  };
  const confirm: PopconfirmProps["onConfirm"] = async (uuid: string): Promise<void> => {
    try {
      const res = await APIDeleteRegion({ uuid, status:0});
      if (res && res.status === 200) {
        message.success("Đã xoá thành công.");
        getAllRegion(); // Cập nhật lại danh sách region sau khi xoá
      } else {
        message.error("Xoá thất bại.");
      }
    } catch (error: any) {
      if (error.response) {
        const errorMessage =
          error.response.data?.error?.errorMessage ||
          "Đã xảy ra lỗi khi cập nhật status.";
        message.error(errorMessage);
      } else if (error.request) {
        message.error(
          "Không nhận được phản hồi từ máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại."
        );
      } else {
        message.error("Đã xảy ra lỗi. Vui lòng thử lại sau.");
      }
    }
  };

  const getColumnSearchProps = (
    dataIndex: DataIndex
  ): TableColumnType<DataType> => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() =>
            handleSearch(selectedKeys as string[], confirm, dataIndex)
          }
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() =>
              handleSearch(selectedKeys as string[], confirm, dataIndex)
            }
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText((selectedKeys as string[])[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        .toString()
        .toLowerCase()
        .includes((value as string).toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });
  const listRegionMap = listRegion.map((region, index) => ({
    key: index + 1,
    ...region,
  }));
  const columns: TableColumnsType<DataType> = [
    {
      title: "Id",
      dataIndex: "key",
      width:50,
    },
    // {
    //   title: "UUID",
    //   width: 200,
    //    ...getColumnSearchProps("uuid"),
    //   render: (record) => {
    //     return (
    //       <div
    //         className="hover:text-[#4096ff] cursor-pointer"
    //         onClick={() => showDrawer(record.uuid)} // Gọi showDrawer với uuid
    //       >
    //         {record.uuid}
    //       </div>
    //     );
    //   },
    // },
    {
      title: "Region Name",
      dataIndex: "regionName",
      key: "regionName",
      ...getColumnSearchProps("regionName"),
      width: 100,
      sorter: (a, b) => a.regionName.length - b.regionName.length,
      sortDirections: ["descend", "ascend"],
      render: (region: string, record: DataType) => {
        return (
          <div
            className="hover:text-[#4096ff] cursor-pointer"
            onClick={() => showDrawer(record.uuid)} // Gọi hàm showDrawer với uuid
          >
            {region} {/* Hiển thị tên quốc gia */}
          </div>
        );
      }
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width:50,
    },
    {
      title: "Action",
      width:150,
      render: (record) => (
        <div className="flex gap-4">
          <Popconfirm
            title="Delete the region"
            description="Are you sure to delete this region?"
            onConfirm={() => confirm(record.uuid)}
            okText={<>Yes</>}
            cancelText="No"
          >
            <Button danger>Delete</Button>
          </Popconfirm>
          <Button type="text" onClick={() => showModalUpdate(record.uuid)}>
            Update
          </Button>
        </div>
      ),
    },
  ];
  useEffect(() => {
    getAllRegion();
  }, []);
  return (
    <>
      <Button className="float-end mb-4" type="primary" onClick={showModal}>
        Create Region
      </Button>
      <Drawer
        title="Chi tiết quốc gia"
        placement="right"
        onClose={onClose}
        open={open}
        width={400}
      >
        {regionDetail ? (
          <div>
            {/* <p><strong>UUID:</strong> {regionDetail.uuid}</p> */}
            <p><strong>Tên Thể Loại:</strong> {regionDetail.regionName}</p>
            <p><strong>Trạng Thái:</strong> {regionDetail.status}</p>
            {/* Thêm các thông tin khác nếu cần */}
          </div>
        ) : (
          <p>Không có thông tin chi tiết để hiển thị.</p>
        )}
      </Drawer>
      <Modal
        title="Create Region Modal"
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
          <Form.Item<FieldType>
            label="Region Name"
            name="regionName"
            rules={[
              { required: true, message: "Please input your region name!" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit">
              Create Region
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Update Region Name Modal"
        open={isModalUpdateOpen}
        onCancel={() => setIsModalUpdateOpen(false)}
        footer ={
          <Button onClick={() => setIsModalUpdateOpen(false)}>
             Cancel
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
          onFinish={onFinishUpdateRegionName}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          
        >
          <Form.Item
            label="Region Name"
            name="regionName"
            rules={[{ required: true, message: "Please input your regionName!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit">
              Update Region
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Table

        columns={columns}
        dataSource={listRegionMap}
        scroll={{ x: 1000, y: 500 }}
        pagination={{
          showTotal: (total, range) => {
            return `${range[0]}-${range[1]} of ${total} items`;
          },
          defaultPageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ["5", "10", "20"],
        }}
      />
    </>
  );
};

export default AdminRegion;
