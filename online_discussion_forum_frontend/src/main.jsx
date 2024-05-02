import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './styles/commentStyle.css'

import { AuthProvider } from './context/AuthProvider'
import { disableReactDevTools } from '@fvilers/disable-react-devtools'

if (process.env.NODE_ENV === 'production') {
  disableReactDevTools();
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <App />
  </AuthProvider>
)
