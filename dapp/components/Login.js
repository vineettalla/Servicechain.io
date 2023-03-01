import React,{useEffect, useState} from 'react'
import { Form,Button,Container } from 'semantic-ui-react';
import Link from 'next/link';
import {auth} from '../config/firebase';
import { signInWithEmailAndPassword,browserSessionPersistence,setPersistence } from 'firebase/auth';
import { useRouter } from 'next/router';
import checkUser from '@/helper/checkUser';
import { db } from '../config/firebase';
import { doc,collection,getDoc,query,where } from 'firebase/firestore';
import connectWallet from '@/helper/connectWallet';
import { useAppContext } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
function Login() {
    const {user,login,logout,signup} = useAuth();
    const [currEmail, setCurrEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();
    
    useEffect(() => {
      const enterHub = async()=>{
        if (user){
            router.push(`${user.uid}/hub`);
        } else {
            null
        }
      }
    enterHub()
    } , [user])
    
    const handleLogin = async()=>{
        try{
            console.log(currEmail,password)
            await login(currEmail, password);
          
        } catch (error){
            console.error(error);

        }
      }
  return (
   
        <Form onSubmit={handleLogin} style={{top:'10px'}}>
            <Form.Input  label='Email' placeholder='Email' onChange={e=>setCurrEmail(e.target.value)}/>
            <Form.Input  label='Password' placeholder='Password' onChange={e=>setPassword(e.target.value)}/>
            <Button>Login!</Button>
            <label corner='right'>Don't have an account? Register <Link href='/signup'>Here</Link></label>
        </Form>

)
}

export default Login;