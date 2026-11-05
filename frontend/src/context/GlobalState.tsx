"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Project } from "@/lib/mockData";
import { account } from "@/lib/appwrite";
import { Models } from "appwrite";

export type Role = "NGO" | "Company" | "Admin" | null;

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface GlobalState {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  userRole: Role;
  setUserRole: (role: Role) => void;
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProjectStatus: (id: string, status: Project["status"]) => void;
  ownedCredits: any[];
  setOwnedCredits: (credits: any[]) => void;
  addOwnedCredits: (credit: any) => void;
  logout: () => void;
  isLoading: boolean;
}

const GlobalStateContext = createContext<GlobalState | undefined>(undefined);

export const GlobalStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [userRole, setUserRoleState] = useState<Role>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [ownedCredits, setOwnedCredits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load user session on mount
  useEffect(() => {
    const initUser = async () => {
      try {
        const session = await account.get();
        if (session) {
          // In a real app, role would come from account preferences or a user collection
          // For this demo, we can still use localStorage for the role or assume from email/metadata
          const savedRole = localStorage.getItem("bluecred_role") as Role;
          setUser({
            id: session.$id,
            name: session.name,
            email: session.email,
            role: savedRole
          });
          if (savedRole) setUserRoleState(savedRole);
        }
      } catch (error) {
        console.log("No active session found");
      } finally {
        setIsLoading(false);
      }
    };

    initUser();
  }, []);

  const setUserRole = (role: Role) => {
    setUserRoleState(role);
    if (role) localStorage.setItem("bluecred_role", role);
    else localStorage.removeItem("bluecred_role");
    
    if (user) {
      setUser({ ...user, role });
    }
  };

  const addProject = (project: Project) => {
    setProjects((prev) => [...prev, project]);
  };

  const updateProjectStatus = (id: string, status: Project["status"]) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status } : p))
    );
  };

  const addOwnedCredits = (credit: any) => {
    setOwnedCredits((prev) => [...prev, credit]);
  };

  const logout = async () => {
    try {
      await account.deleteSession('current');
      setUser(null);
      setUserRoleState(null);
      localStorage.removeItem("bluecred_role");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <GlobalStateContext.Provider
      value={{
        user,
        setUser,
        userRole,
        setUserRole,
        projects,
        setProjects,
        addProject,
        updateProjectStatus,
        ownedCredits,
        setOwnedCredits,
        addOwnedCredits,
        logout,
        isLoading
      }}
    >
      {children}
    </GlobalStateContext.Provider>
  );
};

export const useGlobalState = () => {
  const context = useContext(GlobalStateContext);
  if (context === undefined) {
    throw new Error("useGlobalState must be used within a GlobalStateProvider");
  }
  return context;
};
