
// @material-ui/icons
import Dashboard from "@material-ui/icons/Dashboard";
import Person from "@material-ui/icons/Person";
import AddIcon from '@material-ui/icons/Add';
import Home from "@material-ui/icons/Home";
import LibraryBooks from "@material-ui/icons/LibraryBooks";
import BubbleChart from "@material-ui/icons/BubbleChart";
import Notifications from "@material-ui/icons/Notifications";
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';


// core components/views for Admin layout
import DashboardPage from "views/Dashboard/Dashboard.js";
import UserProfile from "views/UserProfile/UserProfile.js";
import TableList from "views/TableList/TableList.js";
import Typography from "views/Typography/Typography.js";
import Icons from "views/Icons/Icons.js";
import NotificationsPage from "views/Notifications/Notifications.js";

import HomePage from "views/Home/HomePage.js";
import CustomerPage from "views/Customer/CustomerPage.js";
import AttendancePage from "views/Attendance/AttendancePage.js";
import PaymentPage from "views/Payment/PaymentPage.js";

const dashboardRoutes = [
  {
    path: "/home",
    name: "Início",
    icon: Home,
    component: HomePage,
    layout: "/admin"
  },
  {
    path: "/customers",
    name: "Clientes",
    label: "Clientes",
    icon: Person,
    component: CustomerPage,
    layout: "/admin"
  },
  {
    path: "/attendances",
    name: "Atendimentos",
    icon: "content_paste",
    component: AttendancePage,
    layout: "/admin"
  },
  {
    path: "/payments",
    name: "Pagamentos",
    icon: AttachMoneyIcon,
    component: PaymentPage,
    layout: "/admin"
  },
  {
    path: "/user",
    name: "Perfil",
    icon: Person,
    component: UserProfile,
    layout: "/admin",
    hidden: true
  }
  // {
  //   path: "/table",
  //   name: "Table List",
  //   icon: "content_paste",
  //   component: TableList,
  //   layout: "/admin"
  // },
  // {
  //   path: "/typography",
  //   name: "Typography",
  //   icon: LibraryBooks,
  //   component: Typography,
  //   layout: "/admin"
  // },
  // {
  //   path: "/icons",
  //   name: "Icons",
  //   icon: BubbleChart,
  //   component: Icons,
  //   layout: "/admin"
  // },
  // {
  //   path: "/notifications",
  //   name: "Notifications",
  //   icon: Notifications,
  //   component: NotificationsPage,
  //   layout: "/admin"
  // }
];

export default dashboardRoutes;
