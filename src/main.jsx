import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { DataProvider } from './context/DataContext.jsx'
import { BudgetReportProvider } from './context/BudgetReportContext.jsx'
import { MasterDatasetProvider } from './context/MasterDatasetContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <BudgetReportProvider>
            <MasterDatasetProvider>
              <App />
            </MasterDatasetProvider>
          </BudgetReportProvider>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
