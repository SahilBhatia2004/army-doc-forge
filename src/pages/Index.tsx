import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, FileText, Search, Lock } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary mb-6">
            <Shield className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-5xl font-bold text-foreground mb-4">
            Indian Army
          </h1>
          <h2 className="text-3xl font-semibold text-primary mb-4">
            Document Management System
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Secure, efficient, and AI-powered document management for military operations
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16 max-w-5xl mx-auto">
          <div className="p-6 border border-border rounded-lg bg-card">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">Document Upload</h3>
            <p className="text-muted-foreground">
              Clerks can upload unlimited documents including PDFs, Word files, and images with secure storage
            </p>
          </div>

          <div className="p-6 border border-border rounded-lg bg-card">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">AI-Powered Search</h3>
            <p className="text-muted-foreground">
              Officers can search documents by name or keywords using advanced AI technology
            </p>
          </div>

          <div className="p-6 border border-border rounded-lg bg-card">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">Secure Access</h3>
            <p className="text-muted-foreground">
              Role-based authentication ensures data security and proper access control
            </p>
          </div>
        </div>

        <div className="text-center">
          <Button
            size="lg"
            onClick={() => navigate("/auth")}
            className="px-8 py-6 text-lg"
          >
            <Shield className="w-5 h-5 mr-2" />
            Access System
          </Button>
          <p className="mt-4 text-sm text-muted-foreground">
            Authorized personnel only
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
