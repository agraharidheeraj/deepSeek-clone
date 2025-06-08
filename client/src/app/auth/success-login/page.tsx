'use client'
import { Loader } from "@/components/Loader";
import { userAuthStore } from "@/store/authStore";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";




export default function SuccessLogin () {
    const router = useRouter() ;
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const {userProfile} = userAuthStore();

    useEffect(() => {
        if(token){
            userProfile().then(() => {
                router.push('/')
            })
        }else{
            router.push('/sign-in')
        }
    },[token,userProfile,router])


    return(
        <div className="flex h-screen items-center justify-center">
            <Loader type="default" position="center"/>
        </div>
    )

}