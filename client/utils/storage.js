
export const storeUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
  if (user?.token) localStorage.setItem('token', user.token);
}

export const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
}

export const clearStoredUser = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
}

export const storage = {
  getToken: () => localStorage.getItem('token'),
  storeUser,
  getStoredUser,
  clearStoredUser
}
