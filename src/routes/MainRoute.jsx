import { createBrowserRouter,Navigate } from "react-router-dom";

import HomePage from "../pages/User/HomePage";
import AdminUser from "../pages/Admin/User/AdminUser";
import LayoutAdmin from "../layout/LayoutAdmin";
import AdminMovie from "../pages/Admin/Movie/AdminMovie";
import AdminGenre from "../pages/Admin/Genre/AdminGenre";
import AdminRegion from "../pages/Admin/Region/AdminRegion";
import AdminDirector from "../pages/Admin/Director/AdminDirector";
import AdminCast from "../pages/Admin/Cast/AdminCast";
import ProtectRoute from "./ProtectRoute";
import LoginAdminPage from "../pages/Admin/LoginAdminPage";
import AdminCinemas from "../pages/Admin/Cinema/AdminCinema";
import AdminScreen from "../pages/Admin/Screen/AdminScreen";
import SeatLayout from "../pages/Admin/Screen/SeatLayOut";
import AdminShowTime from "../pages/Admin/ShowTime/AdminShowTime";
import AdminOrder from "../pages/Admin/Order/AdminOrder";
import AdminTicketPrice from "../pages/Admin/TicketPrice/AdminTicketPrice";
import AdminCoupon from "../pages/Admin/Coupon/AdminCoupon";
import AdminNew from "../pages/Admin/News/AdminNew";
import AdminCombo from "../pages/Admin/Combo/AdminCombo";
import AdminDashboard from "../pages/Admin/DashBoard/AdminDashboard";


const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login/admin" replace />,
  },
  // {
  //   path: "/informationMovie",
  //   element: <SeatLayout />,
  // },
  {
    path: "/login/admin",
    element: <LoginAdminPage />,
    title: 'Trang đăng nhập Admin', // Trang đăng nhập admin
  },
  // {
  //   path: "/testing",
  //   element: <Testting />,
  // },
  {
    path: "/admin",
    element: (
      <ProtectRoute>
        <LayoutAdmin />
      </ProtectRoute>
    ),
    children: [
      {
        path: "dashboard",
        index: true,
        element: <AdminDashboard />,
      },
      {
        path: "user",
        element: <AdminUser />,
      },
      {
        path: "movie",
        element: <AdminMovie />,
      },
      {
        path: "cinemas",
        element: <AdminCinemas />,
      },
      {
        path: "screen",
        element: <AdminScreen />,
      },
      {
        path: "showtime",
        element: <AdminShowTime />,
      },
      {
        path: "order",
        element: <AdminOrder />,
      },
      {
        path: "ticketprice",
        element: <AdminTicketPrice />,
      },
      {
        path: "coupon",
        element: <AdminCoupon />,
      },
      {
        path: "news",
        element: <AdminNew />,
      },
      {
        path: "genre",
        element: <AdminGenre />,
      },
      {
        path: "region",
        element: <AdminRegion />,
      },
      {
        path: "director",
        element: <AdminDirector />,
      },
      {
        path: "cast",
        element: <AdminCast />,
      },
      {
        path: "combo",
        element: <AdminCombo />,
      },
    ],
  },
]);
export default router;
