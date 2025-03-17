import { Atom } from 'react-loading-indicators';
import { ApiKeyInput } from './components/api/ApiKeyInput';
import { Chat } from './components/chat/Chat';
import { NetworkStatus } from './components/network/NetworkStatus'; 
import { useStore } from './store/useStore';

function App() {
  const { apiKey, userName, isValidatingApiKey, isDarkMode } = useStore(state => ({
    apiKey: state.apiKey,
    userName: state.userName,
    isValidatingApiKey: state.isValidatingApiKey,
    isDarkMode: state.isDarkMode,
  }));

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <NetworkStatus>
        {isValidatingApiKey ? (
          <div className="fixed inset-0 flex items-center justify-center w-full h-full bg-black">
            <Atom color="#ffffff" size="large" text="Loading..." textColor="#ffffff" />
          </div>
        ) : !apiKey || !userName ? (
          <ApiKeyInput />
        ) : (
          <Chat />
        )}
      </NetworkStatus>
    </div>
  );
}

export default App;