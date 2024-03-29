import React,{useState} from 'react';
import {Form,Button,label,Message} from 'semantic-ui-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

function InputInfo(props) {
  const {setUserInfo,userInfo}= props;
  //these ...isFinished states are used to conditionally render each part of the sign up page
  //1. Users have to input accounts details (firstIsFinsihed gets set to true)
  //2. Users have to connect wallet to metamask(secondIsFinished gets set to true)
  //3. Users have to choose their tole(thirdIsfinished gets set to true)
  //after each of these steps the preceeding components disappear, and in the last step data is sent to firestore to cache data about the user 
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState('');
  const {signUp} = useAuth();
  const handleSignUp = async()=> {
      setLoading(true);
      const {first,last,email,password} = userInfo;
      const {setFirstIsFinished,setSecondIsFinished,setUserInfo} = props;
      try {
          setFirstIsFinished(true)
          setSecondIsFinished(true)
          setUserInfo(prev=>{
            return{...prev,first:first,last:last,email:email}
          })
          await signUp(email,password);
      } catch (error) {
          setError(error.message);
      }
      setLoading(false);
  }

  //logic explained above is written here 
  return (
    <div>
      {<Form onSubmit={handleSignUp} style={{top:'10px'}} error={error ? true : false}>
          <Form.Input  label='First Name' placeholder='First Name' onChange={e=>setUserInfo((prev)=>{return {...prev,first:e.target.value} })} />
          <Form.Input  label='Last Name' placeholder='Last Name' onChange={e=>setUserInfo((prev)=>{return {...prev,last:e.target.value} })} />
          <Form.Input  label='Email' placeholder='Email' onChange={e=>setUserInfo((prev)=>{return {...prev,email:e.target.value} })} />
          <Form.Input  label='Password' placeholder='Password' onChange={e=>setUserInfo((prev)=>{return {...prev,password:e.target.value} })} />
          <Button loading={loading} primary >Next Step!</Button>
          <label corner='right'>Already have an account? Login <Link href='/'>Here</Link></label>
          <Message error header ='Oops!' content = {error}/>
      </Form>}
    </div>
  )
}

export default InputInfo;