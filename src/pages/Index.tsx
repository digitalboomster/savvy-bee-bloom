
import ChatInterface from '@/components/ChatInterface';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-lg h-[600px] md:h-[700px] shadow-xl rounded-xl overflow-hidden bg-white border border-amber-100">
        <ChatInterface />
      </div>
    </div>
  );
};

export default Index;
