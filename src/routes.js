
// @material-ui/icons
import Person from "@material-ui/icons/Person";
import Home from "@material-ui/icons/Home";
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
import ScheduleIcon from '@material-ui/icons/Schedule';
import GavelIcon from '@material-ui/icons/Gavel';
import AssignmentIcon from '@material-ui/icons/Assignment';
import DescriptionIcon from '@material-ui/icons/Description';
import StorageIcon from '@material-ui/icons/Storage';
import FolderIcon from '@material-ui/icons/Folder';

// core components/views for Admin layout
import UserProfile from "views/UserProfile/UserProfile.js";
import HomePage from "views/Home/HomePage.js";
import CustomerPage from "views/Customer/CustomerPage.js";
import AttendancePage from "views/Attendance/AttendancePage.js";
import ContractPage from "views/Contract/ContractPage.js";
import ProcessPage from "views/Process/ProcessPage.js";
import SchedulePage from "views/Schedule/SchedulePage.js";
import PaymentPage from "views/Payment/PaymentPage.js";
import HelpPage from "views/Help/HelpPage";
import CrudPage from "views/crud/CrudPage";
import FolderPage from "views/Folder/FolderPage";


const dashboardRoutes = [
  {
    path: "/home",
    name: "Início",
    icon: Home,
    component: HomePage,
    layout: "/admin",
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
    icon: AssignmentIcon,
    component: AttendancePage,
    layout: "/admin"
  },
  {
    path: "/contracts",
    name: "Contratos",
    icon: DescriptionIcon,
    component: ContractPage,
    layout: "/admin"
  },
  {
    path: "/folders",
    name: "Pastas",
    icon: FolderIcon,
    component: FolderPage,
    layout: "/admin"
  },
  {
    path: "/processes",
    name: "Processos",
    icon: GavelIcon,
    component: ProcessPage,
    layout: "/admin",
    hidden: true
  },
  {
    path: "/schedules",
    name: "Agendamentos",
    icon: ScheduleIcon,
    component: SchedulePage,
    layout: "/admin",
    hidden: true
  },
  {
    path: "/payments",
    name: "Pagamentos",
    icon: AttachMoneyIcon,
    component: PaymentPage,
    layout: "/admin",
    hidden: true
  },
  {
    path: "/registrations",
    name: "Cadastros",
    icon: StorageIcon,
    component: CrudPage,
    layout: "/admin"
  },
  {
    path: "/help",
    name: "Ajuda",
    component: HelpPage,
    icon: "help",
    layout: "/admin"
  },


  {
    path: "/me",
    name: "Perfil",
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
