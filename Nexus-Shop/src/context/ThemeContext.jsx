import { createContext } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setTheme } from '../store/slices/uiSlice'

const ThemeContext = createContext(null)

export default function ThemeProvider({ children }) {
  const theme = useSelector((state) => state.ui.theme)
  const dispatch = useDispatch()
  const toggleTheme = () => dispatch(setTheme(theme === 'dark' ? 'light' : 'dark'))
  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}