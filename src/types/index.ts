export type UserStatus = 'Active' | 'Inactive' | 'Suspended';
export type Role = 'Admin' | 'Editor' | 'Viewer';
export type TransactionType = 'Payment' | 'Refund' | 'Transfer';
export type TransactionStatus = 'Completed' | 'Pending' | 'Refunded' | 'Failed';
export type BookingStatus = 'Confirmed' | 'Completed' | 'Pending' | 'Cancelled';
export type ServiceType =
  | 'Business Consultation'
  | 'Technical Support'
  | 'Executive Coaching'
  | 'Strategy Session'
  | 'Personal Training';

/* ---------- DummyJSON response shapes (only the fields AdminHub reads) ---------- */

export interface DummyUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  image: string;
  birthDate: string;
  role: 'admin' | 'moderator' | 'user';
  address: { address: string; city: string; state: string };
}

export interface DummyProduct {
  id: number;
  title: string;
  category: string;
  price: number;
}

export interface UsersResponse {
  users: DummyUser[];
  total: number;
}

export interface ProductsResponse {
  products: DummyProduct[];
  total: number;
}

/* ---------- AdminHub domain models ---------- */

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  image: string;
  role: Role;
  status: UserStatus;
  /** ISO date (YYYY-MM-DD). */
  joined: string;
  lastActive: string;
  /** ISO date (YYYY-MM-DD). */
  dob: string;
  address: string;
  twoFA: 'Enabled' | 'Disabled';
  /** True for users created inside the app (they do not exist in DummyJSON). */
  local?: boolean;
}

export interface Transaction {
  /** Numeric id, used in the /transactions/[id] route. */
  id: number;
  /** Display id, e.g. #TXN-1082. */
  code: string;
  userId: number;
  customer: string;
  email: string;
  productTitle: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  /** ISO timestamp (UTC). */
  timestamp: string;
}

export interface Booking {
  /** Numeric id, used in the /bookings/[id] route. */
  id: number;
  /** Display id, e.g. #BKG-2341. */
  code: string;
  userId: number;
  customer: string;
  email: string;
  productTitle: string;
  productCategory: string;
  service: ServiceType;
  /** ISO date (YYYY-MM-DD). */
  date: string;
  /** HH:mm (24h). */
  time: string;
  durationHours: number;
  status: BookingStatus;
  amount: number;
  /** ISO timestamp (UTC). */
  createdAt: string;
}

export interface Trend {
  /** Absolute percentage, one decimal, without the % sign. */
  value: string;
  direction: 'up' | 'down' | 'neutral';
}

export interface RevenuePoint {
  month: string;
  /** Revenue in thousands of dollars. */
  value: number;
}

export interface DashboardData {
  totalUsers: number;
  revenue: number;
  activeBookings: number;
  pendingTransactions: number;
  trends: { users: Trend; revenue: Trend; bookings: Trend; pending: Trend };
  revenueSeries: RevenuePoint[];
  revenueRange: string;
  recentTransactions: Transaction[];
  totalTransactions: number;
}

/* ---------- Client (UI) state ---------- */

export type DateRange = 'all' | '7d' | '30d' | '90d';

export interface UsersFilters {
  search: string;
  role: Role | 'All';
  status: UserStatus | 'All';
  page: number;
}

export interface TransactionsFilters {
  search: string;
  type: TransactionType | 'All';
  dateRange: DateRange;
  page: number;
}

export interface BookingsFilters {
  search: string;
  status: BookingStatus | 'All';
  service: ServiceType | 'All';
  dateRange: DateRange;
  page: number;
}

export type ListRoute = 'users' | 'transactions' | 'bookings';

export type ModalState =
  | { kind: 'addUser' }
  | { kind: 'editUser'; userId: number }
  | { kind: 'deleteUser'; userId: number }
  | { kind: 'toggleUserStatus'; userId: number }
  | { kind: 'refundTransaction'; transactionId: number }
  | { kind: 'newBooking' }
  | { kind: 'rescheduleBooking'; bookingId: number }
  | { kind: 'cancelBooking'; bookingId: number };

export interface Toast {
  id: number;
  message: string;
  tone: 'success' | 'error' | 'info';
}

export type MenuName = 'notifications' | 'profile';
