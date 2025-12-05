// Centralized API Configuration
// This file contains all API URLs to make it easy to switch between environments

// Base URLs - Read from environment variables
// export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://192.168.1.5/alpha/backend';
// In production (Railway), use /api which gets proxied to the backend
// In development, use the direct backend URL
export const API_BASE_URL = process.env.NEXT_PUBLIC_USE_PROXY === 'true'
  ? '/api'
  : (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://192.168.1.5/alpha/backend');
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://192.168.1.5:3000';

// API Routes
// export const API_ROUTES = {
//   // Auth
//   login: `${API_BASE_URL}/routes/login.php`,
//   register: `${API_BASE_URL}/routes/register.php`,
//   logout: `${API_BASE_URL}/routes/logout.php`,
//   session: `${API_BASE_URL}/routes/session.php`,

//   // Password
//   requestReset: `${API_BASE_URL}/routes/request-password-reset.php`,
//   verifyResetToken: `${API_BASE_URL}/routes/verify-reset-token.php`,
//   resetPassword: `${API_BASE_URL}/routes/reset-password.php`,

//   // Email
//   verifyEmail: `${API_BASE_URL}/routes/verify-email.php`,
//   resendVerification: `${API_BASE_URL}/routes/resend-verification.php`,

//   // Exams
//   getExams: `${API_BASE_URL}/routes/get_exams.php`,
//   getExam: `${API_BASE_URL}/routes/exam/get_exam.php`,
//   startExam: `${API_BASE_URL}/routes/exam/start_exam.php`,
//   saveProgress: `${API_BASE_URL}/routes/exam/save_progress.php`,
//   submitExam: `${API_BASE_URL}/routes/exam/submit_exam.php`,
//   analyzeExam: `${API_BASE_URL}/routes/exam/analyze_exam.php`,

//   // Exam Generator
//   generateExam: `${API_BASE_URL}/routes/exam_generator/generate_exam.php`,
//   generatePDF: `${API_BASE_URL}/routes/exam_generator/generate_pdf.php`,

//   // Chat
//   createConversation: `${API_BASE_URL}/routes/chat/create_conversation.php`,
//   getConversations: `${API_BASE_URL}/routes/chat/get_conversations.php`,
//   getMessages: `${API_BASE_URL}/routes/chat/get_messages.php`,
//   sendMessage: `${API_BASE_URL}/routes/chat/send_message.php`,
//   deleteConversation: `${API_BASE_URL}/routes/chat/delete_conversation.php`,
//   togglePin: `${API_BASE_URL}/routes/chat/toggle_pin.php`,
//   checkLimits: `${API_BASE_URL}/routes/chat/check_limits.php`,
//   uploadFile: `${API_BASE_URL}/routes/chat/upload_file.php`,

//   // Summarizer
//   summarizeFile: `${API_BASE_URL}/routes/summarizer/summarize_file.php`,
//   getHistory: `${API_BASE_URL}/routes/summarizer/get_history.php`,
//   generateSummaryPDF: `${API_BASE_URL}/routes/summarizer/generate_summary_pdf.php`,

//   // CSRF
//   getCsrf: `${API_BASE_URL}/routes/get_csrf.php`,

//   // Admin
//   admin: {
//     dashboard: `${API_BASE_URL}/routes/admin/dashboard.php`,

//     users: {
//       list: `${API_BASE_URL}/routes/admin/users/list.php`,
//       details: `${API_BASE_URL}/routes/admin/users/details.php`,
//       update: `${API_BASE_URL}/routes/admin/users/update.php`,
//       ban: `${API_BASE_URL}/routes/admin/users/ban.php`,
//       delete: `${API_BASE_URL}/routes/admin/users/delete.php`,
//     },

//     exams: {
//       list: `${API_BASE_URL}/routes/admin/exams/list.php`,
//       create: `${API_BASE_URL}/routes/admin/exams/create.php`,
//       update: `${API_BASE_URL}/routes/admin/exams/update.php`,
//       delete: `${API_BASE_URL}/routes/admin/exams/delete.php`,
//       statistics: `${API_BASE_URL}/routes/admin/exams/statistics.php`,
//     },

//     logs: {
//       activity: `${API_BASE_URL}/routes/admin/logs/activity.php`,
//     },

//     stats: {
//       chat: `${API_BASE_URL}/routes/admin/chat/statistics.php`,
//       generator: `${API_BASE_URL}/routes/admin/generator/statistics.php`,
//       summarizer: `${API_BASE_URL}/routes/admin/summarizer/statistics.php`,
//     },
//   },
// };

// Helper function to build query params
export function buildUrl(baseUrl: string, params?: Record<string, string | number>): string {
  if (!params) return baseUrl;

  const queryString = Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');

  return `${baseUrl}?${queryString}`;
}
