import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';

// Screens
import DashboardScreen from './screens/DashboardScreen';
import AgendaScreen from './screens/AgendaScreen';
import ServiceOrderScreen from './screens/ServiceOrderScreen';
import InvoicePreviewScreen from './screens/InvoicePreviewScreen';
import ScannerScreen from './screens/ScannerScreen';
import InventoryScreen from './screens/InventoryScreen';
import FinanceScreen from './screens/FinanceScreen';
import ClientProfileScreen from './screens/ClientProfileScreen';
import BusinessProfileScreen from './screens/BusinessProfileScreen'; // New Import
import ClientsScreen from './screens/ClientsScreen';
import UsersScreen from './screens/UsersScreen';
import NewServiceScreen from './screens/NewServiceScreen';
import ServiceAssignmentScreen from './screens/ServiceAssignmentScreen';
import RepairGuideLibraryScreen from './screens/RepairGuideLibraryScreen';
import AIAssistantScreen from './screens/AIAssistantScreen';
import RepairExpertScreen from './screens/RepairExpertScreen';
import SettingsScreen from './screens/SettingsScreen';


import LandingPage from './components/LandingPage';


const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<DashboardScreen />} />
        <Route path="/agenda" element={<AgendaScreen />} />
        <Route path="/service-order" element={<ServiceOrderScreen />} />
        <Route path="/invoice-preview" element={<InvoicePreviewScreen />} />
        <Route path="/scanner" element={<ScannerScreen />} />
        <Route path="/inventory" element={<InventoryScreen />} />
        <Route path="/finance" element={<FinanceScreen />} />

        {/* Profile Routes Update */}
        <Route path="/profile" element={<BusinessProfileScreen />} /> {/* Business Profile */}
        <Route path="/client-profile/:id" element={<ClientProfileScreen />} /> {/* Client Profile */}

        <Route path="/clients" element={<ClientsScreen />} />
        <Route path="/users" element={<UsersScreen />} />
        <Route path="/new-service" element={<NewServiceScreen />} />
        <Route path="/service-assignment" element={<ServiceAssignmentScreen />} />
        <Route path="/library" element={<RepairGuideLibraryScreen />} />
        <Route path="/repair-expert" element={<RepairExpertScreen />} />
        <Route path="/ai-assistant" element={<AIAssistantScreen />} />

        <Route path="/settings" element={<SettingsScreen />} />
      </Routes>
    </HashRouter>
  );
};

export default App;