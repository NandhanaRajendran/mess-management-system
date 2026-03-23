import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./styles/global.css";

import LoginPage from "./auth/LoginPage";
import ForgotPasswordPage from "./auth/ForgotPasswordPage";

import Dashboard from "./roles/messManager/Dashboard";
import Attendance from "./roles/messManager/Attendance";
import Expenses from "./roles/messManager/Expenses";
import MessBill from "./roles/messManager/MessBill";


import AdminDashboard from "./roles/admin/AdminDashboard";
import AdminLayout from "./roles/admin/AdminLayout";
import Students from "./roles/admin/Students";
import Departments from "./roles/admin/Departments";
import BulkEnrollment from "./roles/admin/BulkEnrollment";
import FeeSections from "./roles/admin/FeeSections";
import StaffAndFaculty from "./roles/admin/StaffAndFaculty";
import Settings from "./roles/admin/Settings";

import LibraryRoot from "./roles/library/LibraryRoot";
import StudentList from "./roles/library/StudentList";
import DueSheet from "./roles/library/DueSheet";

import PrincipalDashboard from "./roles/principle/PrincipleDashboard";

import HostelDashboard from "./roles/hostel/hostelDashboard";
import ViewHdf from "./roles/hostel/ViewHdf";
import ViewRent from "./roles/hostel/ViewRent";

import Hod from "./roles/hod/HodDashboard";
import Student from "./roles/student/StudentDashboard";
import Pta from "./roles/pta/PTADashboard";
import Staffadvisor from "./roles/staffAdvisor/StaffAdvisorDashboard";
import FeeSectionDashboard from "./roles/feeSection/feeSectionDashboard"



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        <Route path="/mess/dashboard" element={<Dashboard />} />
        <Route path="/mess/attendance" element={<Attendance />} />
        <Route path="/mess/expenses" element={<Expenses />} />
        <Route path="/mess/messbill" element={<MessBill />} />
       

        <Route path="/principal-dashboard" element = {<PrincipalDashboard/>} />
        <Route path="/hostel/dashboard" element = {<HostelDashboard/>}/>
        
        <Route path="/hostel/viewrent" element = {<ViewRent/>}/>
        <Route path="/hostel/viewhdf" element = {<ViewHdf/>}/>
        <Route path="/hod/dashboard" element = {<Hod/>}/>
        <Route path="/student/dashboard" element = {<Student/>}/>

        <Route path="/pta/dashboard" element = {<Pta/>} />
        <Route path="staffadvisor/dashboard" element = {<Staffadvisor/>}/>
        <Route path="/fee/dashboard" element={<FeeSectionDashboard />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="students" element={<Students />} />
          <Route path="departments" element={<Departments />} />
          <Route path="bulk-enrollment" element={<BulkEnrollment />} />
          <Route path="fee-sections" element={<FeeSections />} />
          <Route path="staff" element={<StaffAndFaculty />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="/library" element={<LibraryRoot />}>
          <Route path="students" element={<StudentList />} />
          <Route path="duesheet" element={<DueSheet />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;