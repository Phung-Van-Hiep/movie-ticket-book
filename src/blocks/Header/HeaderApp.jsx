import { useState } from 'react';
import LoginPage from '../../pages/User/LoginPage';
import RegisterPage from '../../pages/User/RegisterPage';
import { DownOutlined } from '@ant-design/icons';
import { Dropdown } from 'antd';

const HeaderApp = () => {
  const [isModalLoginOpen, setIsModalLoginOpen] = useState(false);
  const [isModalRegisterOpen, setIsModalRegisterOpen] = useState(false);
  const items = [
    {
      key: '1',
      label: <div className="text-center font-semibold">Phim Đang Chiếu</div>
    },
    {
      key: '2',
      label: <div className="text-center font-semibold">Phim Sắp Chiếu</div>
    }
  ];
  const showModalLogin = () => {
    setIsModalLoginOpen(true);
    setIsModalRegisterOpen(false);
  };
  const handleModalLoginCancel = () => {
    setIsModalLoginOpen(false);
  };
  const handleModalRegisterCancel = () => {
    setIsModalRegisterOpen(false);
    setIsModalLoginOpen(false);
  };

  const showModalRegister = () => {
    setIsModalRegisterOpen(true);
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 shadow-md bg-white max-h-[6.4rem]">
        <div className="max-w-[100rem] mx-auto h-[6.4rem] flex items-center justify-between px-5">
          <div className="w-[10rem] h-[6.4rem]">
            <img
              className="h-[6.4rem]"
              src="/images/logo-movie.png"
              alt="Logo-movie"
            />
          </div>
          <div className="grid grid-cols-6 min-w-[65rem] text-center items-center font-semibold text-[1.5rem] h-[4rem] gap-5">
            <div className="item-header">Trang Chủ</div>
            <Dropdown menu={{ items }}>
              <div className="item-header cursor-pointer">
                Phim <DownOutlined />
              </div>
            </Dropdown>
            <div className="item-header">Review Phim</div>
            <div className="item-header">Tin Tức</div>
            <div
              className="item-header cursor-pointer border rounded-2xl p-3"
              onClick={showModalRegister}
            >
              Đăng ký
            </div>
            <div
              className="item-header cursor-pointer border rounded-2xl p-3 bg-red-500 text-white"
              onClick={showModalLogin}
            >
              Đăng Nhập
            </div>
          </div>
        </div>
      </div>
      {isModalRegisterOpen !== true && (
        <LoginPage
          isModalLoginOpen={isModalLoginOpen}
          handleModalLoginCancel={handleModalLoginCancel}
          showModalRegister={showModalRegister}
        />
      )}
      <RegisterPage
        isModalRegisterOpen={isModalRegisterOpen}
        showModalLogin={showModalLogin}
        handleModalRegisterCancel={handleModalRegisterCancel}
      />
    </>
  );
};

export default HeaderApp;
