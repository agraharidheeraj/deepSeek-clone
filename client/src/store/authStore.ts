import api from "@/lib/api";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  name: string;
  email: string;
  profilePicture: string;
  provider: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  userProfile: () => Promise<void>;
  setUser: (user: User) => void;
    setError: (error:any) => void;
}



export const userAuthStore = create<AuthState>() (
    persist(
        (set,get) => ({
            user:null,
            isAuthenticated:false,
            error:null,
            isLoading:false,

            login:async(email, password) =>{
                try {
                    set({error:null,isLoading:true});
                    const {data}= await api.post("/auth/login", {email,password})
                    set({user:data.user, isAuthenticated:true, isLoading:false})
                } catch (error:any) {
                    const message= error.response?.data?.error;
                    set({error:message,isLoading:false})
                }
            },


            register:async(name,email, password) =>{
                try {
                    set({error:null,isLoading:true});
                    const {data}= await api.post("/auth/register", {name,email,password})
                    set({user:data.user, isAuthenticated:true, isLoading:false})
                } catch (error:any) {
                    const message= error.response?.data?.error;
                    set({error:message,isLoading:false})
                }
            },


                        logout:async() =>{
                try {
                    set({error:null,isLoading:true});
                    const {data}= await api.post("/auth/logout", {})
                    set({ user:null,isAuthenticated:false, isLoading:false})
                } catch (error:any) {
                    const message= error.response?.data?.error;
                    set({error:message,isLoading:false})
                }
            },

            userProfile: async() => {
                  try {
                    set({error:null,isLoading:true});
                    const {data}= await api.get("/auth/me")
                    set({ user:data.user,isAuthenticated:true, isLoading:false})
                } catch (error:any) {
                    const message= error.response?.data?.error;
                    set({error:message,isLoading:false})
                }
            },

            setUser:(user) => set({user, isAuthenticated:true}),
            setError:(error) => set({error}),

        }),
        {
            name:"user-storage",
            partialize: (state) => ({
                user:state.user,
                isAuthenticated:state.isAuthenticated
            })
        }
    )
)