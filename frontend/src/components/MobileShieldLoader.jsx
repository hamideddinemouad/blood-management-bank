import { Shield } from "lucide-react";

const MobileShieldLoader = ({
  title = "Loading",
  message = "Please wait while we prepare your data...",
}) => (
  <div className="sm:hidden min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center p-6">
    <div className="text-center">
      <div className="animate-pulse mb-4">
        <Shield className="w-12 h-12 text-red-500 mx-auto" />
      </div>
      <h2 className="text-xl font-semibold text-gray-700 mb-2">{title}</h2>
      <p className="text-gray-500">{message}</p>
    </div>
  </div>
);

export default MobileShieldLoader;
