import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import AuthLayout from '@/layouts/AuthLayout';
import StudentLayout from '@/layouts/StudentLayout';
import AdminLayout from '@/layouts/AdminLayout';
import ExamLayout from '@/layouts/ExamLayout';

// Route Guards
import PublicOnlyRoute from '@/routes/PublicOnlyRoute';
import RoleRoute from '@/routes/RoleRoute';

// Auth Pages
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import Unauthorized from '@/pages/auth/Unauthorized';

// Student Pages
import Overview from '@/pages/student/Overview';
import ExploreQuizzes from '@/pages/student/ExploreQuizzes';
import QuizDetail from '@/pages/student/QuizDetail';
import MyAttempts from '@/pages/student/MyAttempts';
import ResultDashboard from '@/pages/student/ResultDashboard';
import Performance from '@/pages/student/Performance';
import Profile from '@/pages/student/Profile';
import ExamScreen from '@/pages/student/ExamScreen';

// Admin Pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminStudents from '@/pages/admin/AdminStudents';
import AdminCategories from '@/pages/admin/AdminCategories';
import AdminQuizzes from '@/pages/admin/AdminQuizzes';
import AdminQuestions from '@/pages/admin/AdminQuestions';
import AdminResults from '@/pages/admin/AdminResults';
import AdminSettings from '@/pages/admin/AdminSettings';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Unauthorized access page */}
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Public Auth routes (redirects if already authenticated) */}
      <Route element={<PublicOnlyRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
      </Route>

      {/* Student protected routes */}
      <Route element={<RoleRoute allowedRoles={['ROLE_STUDENT']} />}>
        <Route path="/app" element={<StudentLayout />}>
          <Route index element={<Navigate to="/app/overview" replace />} />
          <Route path="overview" element={<Overview />} />
          <Route path="quizzes" element={<ExploreQuizzes />} />
          <Route path="quizzes/:id" element={<QuizDetail />} />
          <Route path="attempts" element={<MyAttempts />} />
          <Route path="attempts/:id/result" element={<ResultDashboard />} />
          <Route path="performance" element={<Performance />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Exam focused shell */}
        <Route path="/exam" element={<ExamLayout />}>
          <Route path=":attemptId" element={<ExamScreen />} />
        </Route>
      </Route>

      {/* Admin protected routes */}
      <Route element={<RoleRoute allowedRoles={['ROLE_ADMIN']} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="students" element={<AdminStudents />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="quizzes" element={<AdminQuizzes />} />
          <Route path="questions" element={<AdminQuestions />} />
          <Route path="results" element={<AdminResults />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
