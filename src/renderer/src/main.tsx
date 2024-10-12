import * as React from 'react'
import { ConfigProvider } from 'antd'
import * as ReactDOM from 'react-dom/client'
import App from './App'

const rootElement = document.getElementById('root')
ReactDOM.createRoot(rootElement!).render(
  <React.StrictMode>
    <ConfigProvider>
      <App />
    </ConfigProvider>
  </React.StrictMode>
)
