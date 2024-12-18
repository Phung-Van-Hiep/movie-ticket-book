import React, { useEffect, useState } from 'react';
import {
  DollarOutlined,
  EnvironmentOutlined,
  FileSearchOutlined,
  GlobalOutlined,
  HomeOutlined,
  IdcardOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PercentageOutlined,
  PieChartOutlined,
  PlaySquareOutlined,
  ShoppingCartOutlined,
  TableOutlined,
  UnorderedListOutlined,
  UserOutlined,
  UserSwitchOutlined,
  VideoCameraAddOutlined,
  VideoCameraOutlined
} from '@ant-design/icons';
import { Breadcrumb, Button, Layout, Menu, theme } from 'antd';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { APILogOut } from '../services/service.api';

const { Header, Content, Footer, Sider } = Layout;

const items = [
  {
    key: '1',
    icon: <PieChartOutlined />,
    label: 'Thống kê doanh số',
    link: '/admin/dashboard'
  },
  {
    key: '2',
    icon: <UserOutlined />,
    label: 'Quản lý người dùng',
    link: '/admin/user'
  },
  {
    key: '3',
    icon: <VideoCameraOutlined />,
    label: 'Quản lý phim',
    link: '/admin/movie'
  },
  {
    key: '4',
    icon: <EnvironmentOutlined />,
    label: 'Quản lý rạp phim',
    link: '/admin/cinemas'
  },
  {
    key: '5',
    icon: <PlaySquareOutlined />,
    label: 'Quản lý phòng chiếu phim',
    link: '/admin/screen'
  },
  {
    key: '6',
    icon: <UnorderedListOutlined />,
    label: 'Quản lý suất chiếu phim',
    link: '/admin/showtime'
  },
  {
    key: '7',
    icon: <ShoppingCartOutlined />,
    label: 'Quản lý đơn hàng',
    link: '/admin/order'
  },
  {
    key: '8',
    icon: <DollarOutlined />,
    label: 'Quản lý giá vé',
    link: '/admin/ticketprice'
  },
  {
    key: '9',
    icon: <PercentageOutlined />,
    label: 'Quản lý khuyến mãi',
    link: '/admin/coupon'
  },
  {
    key: '10',
    icon: <FileSearchOutlined />,
    label: 'Quản lý tin tức',
    link: '/admin/news'
  },
  {
    key: '11',
    icon: <VideoCameraAddOutlined />,
    label: 'Quản lý thể loại',
    link: '/admin/genre'
  },
  {
    key: '12',
    icon: <GlobalOutlined />,
    label: 'Quản lý quốc gia',
    link: '/admin/region'
  },
  {
    key: '13',
    icon: <IdcardOutlined />,
    label: 'Quản lý đạo diễn',
    link: '/admin/director'
  },
  {
    key: '14',
    icon: <UserSwitchOutlined />,
    label: 'Quản lý diễn viên',
    link: '/admin/cast'
  },
  {
    key: '15',
    icon: <TableOutlined />,
    label: 'Quản lý combo-nước',
    link: '/admin/combo'
  }
].map((item) => ({
  key: item.key,
  icon: <Link to={item.link}>{item.icon}</Link>,
  label: item.label,
  link: item.link
}));

const LayoutAdmin = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState('');
  const [selectedKeys, setSelectedKeys] = useState(['1']);
  const {
    token: { colorBgContainer, borderRadiusLG }
  } = theme.useToken();
  useEffect(() => {
    const currentPath = location.pathname;
    const currentItem = items.find(item => item.link === currentPath);
    if (currentItem) {
      setSelectedKeys([currentItem.key]);
      setSelectedMenuItem(currentItem.label);
      document.title = `Admin - ${currentItem.label}`;
    }
  }, [location.pathname]);

  const handleMenuClick = (info) => {
    setSelectedKeys([info.key]);
    const selectedItem = items.find(item => item.key === info.key);
    if (selectedItem) {
      setSelectedMenuItem(selectedItem.label);
    }
  };
  const handleLogout = async () => {
    try {
      const res = (await APILogOut()) ;
      if (res && res?.data?.data !== null) {
        localStorage.clear();
        document.title = 'Trang đăng nhập Admin';
        navigate('/login/admin');
      } else {
        message.error(res?.data.error.errorMessage);
      }
    } catch (error) {
      console.error("Failed:", error);
    }
  };
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        theme="light"
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        width={250}
      >
        <div className="demo-logo-vertical flex justify-center items-center py-8 text-4xl font-bold	text-white bg-sky-400">ADMIN</div>
        <Menu
          theme="light"
          className="h-full"
          mode="inline"
          selectedKeys={selectedKeys}
          items={items}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: '0 16px',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div className="flex items-center">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: '16px',
                width: 30,
                height: 64,
              }}
            />
            <Breadcrumb
              items={[
                {
                  title: selectedMenuItem,
                },
              ]}
              style={{
                fontSize: '20px',
                paddingBottom: '5px',
                cursor: 'pointer',
              }}
            />
          </div>
          <Button
            type="text"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            className="text-2xl"
          >
            Đăng xuất
          </Button>
        </Header>

        <Content style={{ margin: '16px' }}>
          <Breadcrumb
            style={{ margin: '8px' }}
            items={[
              {
                title: (
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setSelectedKeys('1')}
                  >
                    <HomeOutlined /> Admin
                  </Link>
                ),
              },
              {
                title: selectedMenuItem,
              },
            ]}
          />
          <div
            style={{
              padding: 24,
              minHeight: '75vh',
              background: colorBgContainer,
              borderRadius: borderRadiusLG
            }}
          >
            <Outlet />
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          Ant Design ©{new Date().getFullYear()} Created by Ant UED
        </Footer>
      </Layout>
    </Layout>
  );
};

export default LayoutAdmin;
