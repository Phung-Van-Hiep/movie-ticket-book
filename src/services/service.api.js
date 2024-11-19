import instance from '../customs/customizes.api';
export const APILogin = (data) => {
  return instance.post('/api/v1/Auth/login', data, {
    headers: {
      'Content-Type': 'application/json' // Đảm bảo Content-Type đúng
    }
  });
};

//User
export const APIRegister = (data) => {
  return instance.post('/api/v1/User/register', data);
};
export const APIGetAllUser = (data) => {
  return instance.post('/api/v1/User/page_list_user', data);
};
export const APIUpdateUser = (data) => {
  return instance.post('/api/v1/User/update_user', data);
};
export const APIGetUserDetail = (data) => {
  return instance.post('/api/v1/User/detail_user', data);
};
export const APIDeleteUser = (data) => {
  return instance.post('/api/v1/User/update_user_status', data);
};

//Genre
export const APICreateGenre = (data) => {
  return instance.post('/api/v1/Genre/upsert_genre', data);
};
export const APIGetAllGenre = (data) => {
  return instance.post('/api/v1/Genre/page_list_genre', data);
};
export const APIGetGenreDetail = (data) => {
  return instance.post('/api/v1/Genre/genre_detail', data);
};

export const APIDeleteGenre = (data) => {
  return instance.post('/api/v1/Genre/update_genre_status', data);
};

//Region
export const APICreateRegion = (data) => {
  return instance.post('/api/v1/Region/upsert_region', data);
};
export const APIGetAllRegion = (data) => {
  return instance.post('/api/v1/Region/page_list_region', data);
};
export const APIGetRegionDetail = (data) => {
  return instance.post('/api/v1/Region/region_detail', data);
};

export const APIDeleteRegion = (data) => {
  return instance.post('/api/v1/Region/update_region_status', data);
};

//Director
export const APICreateDirector = (data) => {
  return instance.post('/api/v1/Director/upsert_director', data);
};
export const APIGetAllDirector = (data) => {
  return instance.post('/api/v1/Director/page_list_director', data);
};
export const APIGetDirectorDetail = (data) => {
  return instance.post('/api/v1/Director/director_detail', data);
};

export const APIDeleteDirector = (data) => {
  return instance.post('/api/v1/Director/update_director_status', data);
};

//Cast
export const APICreateCast = (data) => {
  return instance.post('/api/v1/Cast/upsert_cast', data);
};
export const APIGetAllCast = (data) => {
  return instance.post('/api/v1/Cast/page_list_cast', data);
};
export const APIGetCastDetail = (data) => {
  return instance.post('/api/v1/Cast/cast_detail', data);
};

export const APIDeleteCast = (data) => {
  return instance.post('/api/v1/Cast/update_cast_status', data);
};

//Movie
export const APICreateMovies = (data) => {
  return instance.post('/api/v1/Movies/upsert_movies', data);
};
export const APIGetAllMovies = (data) => {
  return instance.post('/api/v1/Movies/page_list_movies', data);
};
export const APIGetMoviesDetail = (data) => {
  return instance.post('/api/v1/Movies/movies_detail', data);
};
export const APIDeleteMovie = (data) => {
  return instance.post('/api/v1/Movies/update_movies_status', data);
};

//Cinema
export const APICreateCinemas = (data) => {
  return instance.post('/api/v1/Cinemas/upsert_cinema', data);
};
export const APIGetAllCinemas = (data) => {
  return instance.post('/api/v1/Cinemas/page_list_cinema', data);
};
export const APIGetCinemasDetail = (data) => {
  return instance.post('/api/v1/Cinemas/cinema_detail', data);
};

export const APIDeleteCinemas = (data) => {
  return instance.post('/api/v1/Cinemas/update_cinema_status', data);
};

//Screen
export const APICreateScreen = (data) => {
  return instance.post('/api/v1/Screen/create_screen', data);
};
export const APIUpdateScreen = (data) => {
  return instance.post('/api/v1/Screen/update_screen', data);
};
export const APIGetAllScreen = (data) => {
  return instance.post('/api/v1/Screen/page_list_screen', data);
};
export const APIGetScreenDetail = (data) => {
  return instance.post('/api/v1/Screen/screen_detail', data);
};

export const APIDeleteScreen = (data) => {
  return instance.post('/api/v1/Screen/update_screen_status', data);
};
export const APIGetALLSeat = (data) => {
  return instance.post('/api/v1/Screen/get_list_seat', data);
};
export const APIGetALLSeatType = (data) => {
  return instance.post('/api/v1/Screen/category-seat-type', data);
};
export const APIGetALLScreenType = (data) => {
  return instance.post('/api/v1/Screen/category-screen-type', data);
};

//News
export const APICreateNews = (data) => {
  return instance.post('/api/v1/News/upsert_news', data);
};
export const APIGetAllNews = (data) => {
  return instance.post('/api/v1/News/page_list_news', data);
};
export const APIGetNewsDetail = (data) => {
  return instance.post('/api/v1/News/news_detail', data);
};

export const APIDeleteNews = (data) => {
  return instance.post('/api/v1/News/update_news_status', data);
};

//Combo-nước
export const APICreateCombo = (data) => {
  return instance.post('/api/v1/Combo/upsert_combo', data);
};
export const APIGetAllCombo = (data) => {
  return instance.post('/api/v1/Combo/page_list_combo', data);
};
export const APIGetComboDetail = (data) => {
  return instance.post('/api/v1/Combo/combo_detail', data);
};

export const APIDeleteCombo = (data) => {
  return instance.post('/api/v1/Combo/update_combo_status', data);
};

//Showtime
export const APICreateShowTime = (data) => {
  return instance.post('/api/v1/Showtimes/upsert_showtime', data);
};
export const APIGetAllShowTime = (data) => {
  return instance.post('/api/v1/Showtimes/page_list_showtime', data);
};
export const APIGetShowTimeDetail = (data) => {
  return instance.post('/api/v1/Showtimes/showtime_detail', data);
};

export const APIDeleteShowTime = (data) => {
  return instance.post('/api/v1/Showtimes/update_showtime_status', data);
};

//Ticket 
export const APICreateTicket = (data) => {
  return instance.post('/api/v1/Ticket/upsert_ticket_price', data);
};
export const APIGetAllTicket = (data) => {
  return instance.post('/api/v1/Ticket/page_list_ticket_price', data);
};
export const APIGetTicketDetail = (data) => {
  return instance.post('/api/v1/Ticket/ticket_detail', data);
};

export const APIDeleteTicket = (data) => {
  return instance.post('/api/v1/Ticket/update_ticket_status', data);
};

//Coupon
export const APICreateCoupon = (data) => {
  return instance.post('/api/v1/Coupon/upsert_coupon', data);
};
export const APIGetAllCoupon = (data) => {
  return instance.post('/api/v1/Coupon/page_list_coupon', data);
};
export const APIGetCouponDetail = (data) => {
  return instance.post('/api/v1/Coupon/coupon_detail', data);
};

export const APIDeleteCoupon = (data) => {
  return instance.post('/api/v1/Coupon/update_coupon_status', data);
};

//Upload Image
export const APIUploadImage = (FileData, Type) => {
  const formData = new FormData();

  if (FileData) formData.append('FileData', FileData);
  if (Type) formData.append('Type', Type);
  const config = {
    headers: { 'Content-Type': 'multipart/form-data' }
    // Authorization: `Bearer ${localStorage.getItem('access_token')}`
  };
  return instance.put(`/api/v1/Upload/upload-image`, formData, config);
};
