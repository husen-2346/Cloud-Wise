
const API_BASE_URL = '/api/auth';

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  id: number;
  name: string;
  email: string;
  message: string;
}

export interface LoginResponse {
  id: number;
  name: string;
  email: string;
  token: string;
  tokenType: string;
}

async function readResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
  data?.message ||
  data?.error ||
  (response.status === 401
    ? 'Invalid email or password.'
    : response.status === 400
      ? 'Please check the information you entered.'
      : response.status >= 500
        ? 'Server error. Please try again later.'
        : `Request failed with status ${response.status}`);

    throw new Error(message);
  }

  return data as T;
}

export async function registerUser(
  request: RegisterRequest,
): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  return readResponse<AuthResponse>(response);
}

export async function loginUser(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  return readResponse<LoginResponse>(response);
}

export async function getCurrentUser(
  token: string,
): Promise<{ email: string }> {
  const response = await fetch(`${API_BASE_URL}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return readResponse<{ email: string }>(response);
}


export async function authenticatedFetch(
  path: string,
  token: string,
): Promise<Response> {
  const response = await fetch(path, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    sessionStorage.removeItem('cloudwise_token');
    sessionStorage.removeItem('cloudwise_user_name');
    window.location.reload();
    throw new Error('Your session has expired. Please log in again.');
  }

  return response;
}
