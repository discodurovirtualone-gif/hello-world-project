import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FormLayoutProps {
  title: string;
  children: React.ReactNode;
  variant?: "input" | "result";
}

const FormLayout = ({ title, children, variant = "input" }: FormLayoutProps) => {
  const isResult = variant === "result";

  return (
    <div className={`min-h-screen p-4 md:p-8 ${isResult ? "bg-[hsl(var(--result-bg))]" : "bg-background"}`}>
      <div className={`mx-auto ${isResult ? "max-w-2xl" : "max-w-5xl"}`}>
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="ghost" size="icon" className="rounded-full h-12 w-12">
              <ArrowLeft className="h-8 w-8" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        </div>
        {children}
      </div>
    </div>
  );
};

export default FormLayout;
