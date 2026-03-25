import Starfield from "./Starfield";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function PageShell({ children, title, backTo = "/" }) {
  return (
    <div className="min-h-screen relative font-body">
      <Starfield />
      <div className="relative z-10 max-w-lg mx-auto px-4 py-6 pb-20">
        <div className="flex items-center gap-3 mb-6">
          <Link
            to={backTo}
            className="p-2 rounded-xl bg-secondary/60 hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </Link>
          <h1 className="text-xl font-heading font-bold text-foreground">{title}</h1>
        </div>
        {children}
      </div>
    </div>
  );
}
