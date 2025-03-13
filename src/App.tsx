import { Atom } from 'react-loading-indicators';
import { ApiKeyInput } from './components/ApiKeyInput';
import { Chat } from './components/Chat';
import { useStore } from './store/useStore';

function App() {
  const { apiKey, userName, isValidatingApiKey } = useStore(state => ({
    apiKey: state.apiKey,
    userName: state.userName,
    isValidatingApiKey: state.isValidatingApiKey, // Use the new state
  }));

  return (
    <div className="min-h-screen bg-gray-100">
      {isValidatingApiKey ? ( // Show Atom loader only during API key validation
        <div className="fixed inset-0 flex items-center justify-center w-full h-full bg-black">
          <Atom color="#ffffff" size="large" text="Loading..." textColor="#ffffff" />
        </div>
      ) : !apiKey || !userName ? (
        <ApiKeyInput />
      ) : (
        <Chat />
      )}
    </div>
  );
}

export default App;