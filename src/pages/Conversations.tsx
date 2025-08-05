import AuthGuard from "@/components/AuthGuard";
import Navigation from "@/components/Navigation";
import CallsDashboard from "@/components/CallsDashboard";

const Conversations = () => {
  return (
    <AuthGuard>
      <div>
        <Navigation />
        <main className="ml-60 mt-16 p-6">
          <CallsDashboard />
        </main>
      </div>
    </AuthGuard>
  );
};

export default Conversations;