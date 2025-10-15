import ChatWindow from './components/ChatWindow';
import ErrorBoundary from './components/ErrorBoundary';

export default function Home() {
  return (
    <main className="h-[100dvh] sm:h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <ErrorBoundary>
        <ChatWindow />
      </ErrorBoundary>
    </main>
  );
}
