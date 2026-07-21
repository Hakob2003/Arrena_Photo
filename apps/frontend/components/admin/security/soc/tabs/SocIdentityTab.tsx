import { BentoCard } from "@/components/admin/BentoCard";
import AuthSecurity from "../AuthSecurity";
import ApiSecurity from "../ApiSecurity";
import SessionSecurity from "../SessionSecurity";
import AiSecurity from "../AiSecurity";

interface SocIdentityTabProps {
  data: any;
}

export default function SocIdentityTab({ data }: SocIdentityTabProps) {
  return (
    <div className="flex flex-col gap-4 lg:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Row: Auth & Sessions */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        <div className="w-full lg:w-1/2">
          <AuthSecurity data={data.authSecurity} />
        </div>
        <div className="w-full lg:w-1/2">
          <SessionSecurity data={data.sessionSecurity} />
        </div>
      </div>

      {/* Bottom Row: API & AI */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        <div className="w-full lg:w-1/2">
          <ApiSecurity data={data.apiSecurity} />
        </div>
        <div className="w-full lg:w-1/2">
          <AiSecurity data={data.aiSecurity} />
        </div>
      </div>
    </div>
  );
}
