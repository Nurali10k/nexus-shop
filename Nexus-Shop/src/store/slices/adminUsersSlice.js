import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { auth } from '../../firebase';

async function apiRequest(method, body, cursor) {
  const user = auth.currentUser;
  if (!user) throw new Error('Sign in as an administrator.');
  const token = await user.getIdToken();
  const url = cursor ? `/api/admin/users?cursor=${encodeURIComponent(cursor)}` : '/api/admin/users';
  const response = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || 'Admin request failed.');
  return payload;
}

export const fetchAdminUsers = createAsyncThunk('adminUsers/fetch', async (cursor = null) => apiRequest('GET', null, cursor));
export const updateAdminUser = createAsyncThunk('adminUsers/update', async ({ uid, patch }) => apiRequest('PATCH', { uid, patch }));
export const sendAdminUserNotification = createAsyncThunk('adminUsers/notify', async ({ uid, title, message }) => apiRequest('POST', { uid, title, message }));

const initialState = { users: [], nextCursor: null, loading: false, initialized: false, saving: false, error: null, search: '', role: 'all', status: 'all', page: 1, pendingOriginals: {} };
const adminUsersSlice = createSlice({
  name: 'adminUsers', initialState,
  reducers: {
    setUserSearch(state, action) { state.search = action.payload; state.page = 1; },
    setUserRoleFilter(state, action) { state.role = action.payload; state.page = 1; },
    setUserStatusFilter(state, action) { state.status = action.payload; state.page = 1; },
    setUserPage(state, action) { state.page = action.payload; },
    resetAdminUsers(state) { Object.assign(state, initialState); },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchAdminUsers.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.initialized = true;
        const byId = new Map(state.users.map((user) => [user.uid, user]));
        action.payload.users.forEach((user) => byId.set(user.uid, { ...byId.get(user.uid), ...user }));
        state.users = [...byId.values()];
        state.nextCursor = action.payload.nextCursor;
      })
      .addCase(fetchAdminUsers.rejected, (state, action) => { state.loading = false; state.initialized = true; state.error = action.error.message; })
      .addCase(updateAdminUser.pending, (state, action) => {
        state.saving = true;
        const { uid, patch } = action.meta.arg;
        const user = state.users.find((item) => item.uid === uid);
        if (user) {
          state.pendingOriginals[uid] = { role: user.role, isActive: user.isActive };
          Object.assign(user, patch);
        }
      })
      .addCase(updateAdminUser.fulfilled, (state, action) => {
        state.saving = false;
        const index = state.users.findIndex((user) => user.uid === action.payload.uid);
        if (index >= 0) state.users[index] = { ...state.users[index], ...action.payload };
        delete state.pendingOriginals[action.payload.uid];
      })
      .addCase(updateAdminUser.rejected, (state, action) => {
        state.saving = false;
        const { uid } = action.meta.arg;
        const user = state.users.find((item) => item.uid === uid);
        if (user && state.pendingOriginals[uid]) Object.assign(user, state.pendingOriginals[uid]);
        delete state.pendingOriginals[uid];
        state.error = action.error.message;
      });
  },
});

export const { setUserSearch, setUserRoleFilter, setUserStatusFilter, setUserPage, resetAdminUsers } = adminUsersSlice.actions;
export default adminUsersSlice.reducer;
