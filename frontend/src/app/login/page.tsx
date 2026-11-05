"use client";

import { useState } from "react";
import { useGlobalState, Role } from "@/context/GlobalState";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  TreePine, 
  Building2, 
  ArrowRight,
  Lock,
  Mail,
  User,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { account } from "@/lib/appwrite";
import { ID } from "appwrite";

export default function Login() {
  const { setUserRole, setUser } = useGlobalState();
  const [selectedRole, setSelectedRole] = useState<Role>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) {
        setError("Please select a role first.");
        return;
    }
    
    setIsLoggingIn(true);
    setError("");

    try {
      if (isSignup) {
        // Signup
        await account.create(ID.unique(), formData.email, formData.password, formData.name);
        // Automatically login after signup
        await account.createEmailPasswordSession(formData.email, formData.password);
      } else {
        // Login
        await account.createEmailPasswordSession(formData.email, formData.password);
      }

      // Get user details
      const session = await account.get();
      setUser({
        id: session.$id,
        name: session.name,
        email: session.email,
        role: selectedRole
      });
      setUserRole(selectedRole);

      const paths = {
        NGO: "/submit",
        Company: "/marketplace",
        Admin: "/admin"
      };
      router.push(paths[selectedRole as keyof typeof paths]);

    } catch (err: any) {
      setError(err.message || "Authentication failed. Please check your credentials.");
      console.error(err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const roles: { id: Role; title: string; desc: string; icon: any; color: string }[] = [
    {
      id: "NGO",
      title: "Supplier",
      desc: "NGOs or project developers registering restoration projects.",
      icon: TreePine,
      color: "forest"
    },
    {
      id: "Company",
      title: "Company",
      desc: "Corporates looking to purchase and track carbon credits.",
      icon: Building2,
      color: "blue-600"
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center p-6">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100">
        
        {/* Left Side: Role Selection */}
        <div className="p-12 bg-mint/30 border-r border-gray-100">
          <div className="mb-12">
            <h1 className="text-3xl font-bold text-dark mb-4">Welcome to BlueCred</h1>
            <p className="text-gray-500">Access your dashboard by selecting your platform role.</p>
          </div>

          <div className="space-y-4">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`w-full p-6 rounded-[2rem] text-left transition-all border-2 flex items-center space-x-6 group ${
                  selectedRole === role.id 
                    ? "bg-white border-forest shadow-lg" 
                    : "bg-white/50 border-transparent hover:border-mint hover:bg-white"
                }`}
              >
                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                  selectedRole === role.id ? "bg-forest text-white" : "bg-mint text-forest"
                }`}>
                  <role.icon className="h-7 w-7" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-dark">{role.title}</h3>
                  <p className="text-xs text-gray-500 leading-tight pr-4">{role.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Credentials */}
        <div className="p-12 flex flex-col justify-center relative">
          <AnimatePresence mode="wait">
            {!selectedRole ? (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <User className="h-10 w-10 text-gray-300" />
                </div>
                <h2 className="text-xl font-bold text-gray-400">Select a Role</h2>
                <p className="text-gray-400 text-sm">Pick a role on the left to sign in.</p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleAction}
                className="space-y-6"
              >
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-dark mb-2">{isSignup ? "Sign Up" : "Sign In"}</h2>
                  <p className="text-gray-500">Accessing as <span className="text-forest font-bold">{selectedRole}</span></p>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center space-x-3 text-red-600 text-sm animate-shake">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                <div className="space-y-4">
                  {isSignup && (
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full pl-12 pr-6 py-4 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-forest/20 outline-none font-semibold text-sm"
                        placeholder="Full Name"
                      />
                    </div>
                  )}
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full pl-12 pr-6 py-4 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-forest/20 outline-none font-semibold text-sm"
                      placeholder="Email Address"
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="w-full pl-12 pr-6 py-4 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-forest/20 outline-none font-semibold text-sm"
                      placeholder="Password"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-bold px-2">
                  <button 
                    type="button"
                    onClick={() => setIsSignup(!isSignup)}
                    className="text-forest hover:underline"
                  >
                    {isSignup ? "Already have an account? Sign In" : "Need an account? Sign Up"}
                  </button>
                  {!isSignup && <a href="#" className="text-gray-400 hover:text-dark">Forgot password?</a>}
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-5 bg-forest text-white rounded-full font-bold text-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isLoggingIn ? (
                    <>
                      <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{isSignup ? "Creating account..." : "Signing in..."}</span>
                    </>
                  ) : (
                    <>
                      <span>{isSignup ? "Sign Up" : "Sign In"}</span>
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
          
          <div className="absolute bottom-12 left-12 right-12 text-center">
            <p className="text-xs text-gray-400">
              By continued use, you agree to the <a href="#" className="underline">Terms</a> and <a href="#" className="underline">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
