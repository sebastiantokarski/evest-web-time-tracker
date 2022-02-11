import React from 'react';
import { SettingsProvider } from 'popup/contexts/SettingsContext';
import { Header, MiniInfo, Footer } from 'popup/components';
import MainTabs from './components/MainTabs.jsx';
import 'bootstrap/dist/css/bootstrap.css';
import '../scss/popup.scss';

const App = () => {
  return (
    <SettingsProvider>
      <Header />
      <MiniInfo />
      <MainTabs />
      <Footer />
    </SettingsProvider>
  );
};

export default App;
