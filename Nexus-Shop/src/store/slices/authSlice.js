import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { readStorage, writeStorage } from '../storage'

const getUsers = () => {
  const users = readStorage('nexusUsers', [])
  return Array.isArray(users) ? users : []
}

const hashPassword = async (password, salt) => {
  if (!globalThis.crypto?.subtle) throw new Error('Для входа требуется защищённый контекст браузера (HTTPS или localhost).')
  const keyMaterial = await globalThis.crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const digest = await globalThis.crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: new TextEncoder().encode(salt), iterations: 310000, hash: 'SHA-256' },
    keyMaterial,
    256,
  )
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

const getCurrentUser = () => {
  const user = readStorage('nexusCurrentUser', null)
  if (!user || typeof user.id !== 'number' || typeof user.email !== 'string' || typeof user.name !== 'string') return null
  return { id: user.id, email: user.email, name: user.name, role: user.role === 'admin' ? 'admin' : 'user' }
}

export const registerUser = createAsyncThunk('auth/register', async ({ name, email, password }, { rejectWithValue }) => {
  const normalizedEmail = email.trim().toLowerCase()
  const users = getUsers()
  if (users.some((user) => user.email === normalizedEmail)) return rejectWithValue('Пользователь с таким email уже зарегистрирован.')

  try {
    const salt = globalThis.crypto.randomUUID()
    const user = {
      id: Date.now(),
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: await hashPassword(password, salt),
      salt,
      role: 'user',
      createdAt: new Date().toISOString(),
    }
    if (!writeStorage('nexusUsers', [...users, user])) throw new Error('Не удалось сохранить аккаунт в браузере.')
    const currentUser = { id: user.id, name: user.name, email: user.email, role: user.role }
    return currentUser
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Не удалось создать аккаунт.')
  }
})

export const loginUser = createAsyncThunk('auth/login', async ({ email, password }, { rejectWithValue }) => {
  const normalizedEmail = email.trim().toLowerCase()
  const user = getUsers().find((entry) => entry.email === normalizedEmail)
  if (!user) return rejectWithValue('Аккаунт с таким email не найден. Сначала зарегистрируйтесь.')

  try {
    if (user.passwordHash !== await hashPassword(password, user.salt)) {
      return rejectWithValue('Неверный email или пароль.')
    }
    const currentUser = { id: user.id, name: user.name, email: user.email, role: user.role === 'admin' ? 'admin' : 'user' }
    return currentUser
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Не удалось выполнить вход.')
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: getCurrentUser(), isAuthenticated: Boolean(getCurrentUser()), error: null, loading: false },
  reducers: {
    logout: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.error = null
    },
    clearError: (state) => { state.error = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => { state.loading = true; state.error = null })
      .addCase(registerUser.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; state.isAuthenticated = true })
      .addCase(registerUser.rejected, (state, action) => { state.loading = false; state.error = action.payload ?? 'Не удалось создать аккаунт.' })
      .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null })
      .addCase(loginUser.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; state.isAuthenticated = true })
      .addCase(loginUser.rejected, (state, action) => { state.loading = false; state.error = action.payload ?? 'Не удалось выполнить вход.' })
  },
})

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer
