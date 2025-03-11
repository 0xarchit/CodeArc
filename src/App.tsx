import { ApiKeyInput } from './components/ApiKeyInput';
import { Chat } from './components/Chat';
import { useStore } from './store/useStore';

function App() {
  const { apiKey, userName } = useStore(state => ({
    apiKey: state.apiKey,
    userName: state.userName,
  }));

  return (
    <div className="min-h-screen bg-gray-100">
      {!apiKey || !userName ? <ApiKeyInput /> : <Chat />}
    </div>
  );
}

export default App;