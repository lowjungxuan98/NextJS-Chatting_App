const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  type: 'end_user' | 'merchant_staff';
  role?: 'admin' | 'manager' | 'staff';
  merchantId?: number;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    type: 'end_user' | 'merchant_staff';
    role: 'admin' | 'manager' | 'staff' | null;
    merchantId: number | null;
  };
}

export interface Merchant {
  id: number;
  name: string;
  description: string;
  logoUrl?: string;
}

export interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  senderName: string;
  text: string;
  sentAt: string;
  isMerchantStaff: boolean;
}

export interface Conversation {
  id: number;
  userId: number;
  merchantId: number;
  merchantName: string;
  assignedStaffId: number | null;
  assignedStaffName: string | null;
  startedAt: string;
  lastMessageAt: string;
  lastMessage: string;
  unreadCount: number;
}

export interface StaffMember {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'staff';
  merchantId: number;
}

export interface CreateStaffRequest {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'staff';
  merchantId: number;
}

class ApiService {
  private getHeaders(includeAuth = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth && typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify(data),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || 'Login failed');
    }

    return responseData;
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify(data),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || 'Registration failed');
    }

    return responseData;
  }

  // Merchant endpoints
  async getMerchants(): Promise<Merchant[]> {
    const response = await fetch(`${API_URL}/api/merchants`, {
      headers: this.getHeaders(),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || 'Failed to fetch merchants');
    }

    return responseData;
  }

  // Conversation endpoints
  async getConversations(): Promise<Conversation[]> {
    const response = await fetch(`${API_URL}/api/conversations`, {
      headers: this.getHeaders(),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || 'Failed to fetch conversations');
    }

    return responseData;
  }

  async getConversation(id: number): Promise<{ conversation: Conversation, messages: Message[] }> {
    const response = await fetch(`${API_URL}/api/conversations/${id}`, {
      headers: this.getHeaders(),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || 'Failed to fetch conversation');
    }

    return responseData;
  }

  async startConversation(merchantId: number): Promise<{ conversationId: number }> {
    const response = await fetch(`${API_URL}/api/conversations`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ merchantId }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || 'Failed to start conversation');
    }

    return responseData;
  }

  async sendMessage(conversationId: number, text: string): Promise<Message> {
    const response = await fetch(`${API_URL}/api/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ text }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || 'Failed to send message');
    }

    return responseData;
  }

  async assignConversation(conversationId: number, staffId: number): Promise<{ success: boolean }> {
    const response = await fetch(`${API_URL}/api/conversations/${conversationId}/assign`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ staffId }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || 'Failed to assign conversation');
    }

    return responseData;
  }

  // Staff management endpoints
  async getStaffMembers(): Promise<StaffMember[]> {
    const response = await fetch(`${API_URL}/api/staff`, {
      headers: this.getHeaders(),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || 'Failed to fetch staff members');
    }

    return responseData;
  }

  async createStaffMember(data: CreateStaffRequest): Promise<StaffMember> {
    const response = await fetch(`${API_URL}/api/staff`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || 'Failed to create staff member');
    }

    return responseData;
  }

  async updateStaffMember(id: number, data: Partial<CreateStaffRequest>): Promise<StaffMember> {
    const response = await fetch(`${API_URL}/api/staff/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || 'Failed to update staff member');
    }

    return responseData;
  }

  async deleteStaffMember(id: number): Promise<{ success: boolean }> {
    const response = await fetch(`${API_URL}/api/staff/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || 'Failed to delete staff member');
    }

    return responseData;
  }
}

export const apiService = new ApiService(); 