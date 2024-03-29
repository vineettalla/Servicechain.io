import React,{useState,useEffect} from 'react'
import service from '@/ethereum/service';
import web3 from '@/ethereum/web3';
import { db } from '@/config/firebase';
import { where,collection,query,getDocs,getDoc,doc  } from 'firebase/firestore';
import { Statistic,Container,Segment,Dropdown,Grid,Table,Icon,Rating,Message} from 'semantic-ui-react';
import { weiToUsd } from '@/helper/conversions';
import { options } from '@/helper/conversions';
import axios from 'axios';
import Deposit from '@/components/Deposit';
import average from '@/helper/average';
import toDate from '@/helper/toDate';
function myProfileManager(props) {
    //Balance of org
    //Number of approvlas made
    //Number of Employees 
    //Customers served 
    //Amount Spent 
  const [selectedEmp,setSelectedEmp] = useState('');
  const [pastRatingsHistory,setPastRatingsHistory] = useState([]);
  const [pastTipsHistory,setPastTipsHistory] = useState([]);
  const {balance,numApprovalsMade,numEmployees,numCustomers,items,address,marketPrice} = props;
  console.log(selectedEmp)
  useEffect(()=>{
        const fetchData = async()=>{
                if (selectedEmp){
                        //point to the data in the backend
                        const usersRef= doc(db,"Users",selectedEmp);
                        const snapShot = await getDoc(usersRef);
                        const userData = snapShot.data()
                        console.log(userData)
                        const fetchRatings = await service(address).getPastEvents('submitRating',{filter: {recipient:selectedEmp}, fromBlock:0});
                        const fetchTips = await service(address).getPastEvents('submitTip',{filter: {recipient:selectedEmp}, fromBlock:0});
                        console.log(fetchRatings,fetchTips)
                        //Used for mapping names 
                        const ratingCustomerAddrs = fetchRatings.map(data=>{
                                return data.returnValues.sender;
                        })
                        const tipCustomerAddrs = fetchTips.map(data=>{
                                return data.returnValues.sender;
                        })
                        const ref = collection(db,"Users")
                        var i = 0;
                        if (ratingCustomerAddrs.length!=0) {
                                const pastRatingsHistory = []
                                for (const cusAddr of ratingCustomerAddrs) {
                                const q = query(ref,where("publicAddress","==",cusAddr),where("role","==","customer"));
                                const querySnapshot = await getDocs(q);  
                                
                                querySnapshot.forEach((doc)=>{
                                        const rating = fetchRatings[i].returnValues.rating
                                        const date = fetchRatings[i].returnValues.date
                                        const data = doc.data()
                                        pastRatingsHistory.push(
                                        {first:data.first,last:data.last,value:rating,date:toDate(date)}
                                        )
                                        
                                })
                                i++;
                                }
                                setPastRatingsHistory(pastRatingsHistory);
                        } else {
                                setPastRatingsHistory([]);
                        }
                        i = 0;
                        if (tipCustomerAddrs.length!=0) {
                                //finds all customers that have tipped (Problem is now that we are using one public address to test everything so this query)
                                //actually finds everything so one person could just have a public address and not have tipped but it would stil be used causing errors 
                                //we should probably use different accounts for demo purposes
                                const pastTipsHistory = []
                                for (const cusAddr of tipCustomerAddrs){
                                const q = query(ref,where("publicAddress","==",cusAddr),where("role","==","customer"));
                                const querySnapshot = await getDocs(q);
                               
                               
                                querySnapshot.forEach((doc)=>{
                                        console.log('tips', fetchTips[i].returnValues );
                                        const tips = weiToUsd(parseInt(fetchTips[i].returnValues.tipAmount),marketPrice);
                                        const date = fetchTips[i].returnValues.date
                                        const data = doc.data();
                                        pastTipsHistory.push(
                                        {first:data.first,last:data.last,value:tips,date:toDate(date)}
                                        )
                                       
                                })
                                i ++;
                        }  
                                setPastTipsHistory(pastTipsHistory);
                        } else {
                                setPastTipsHistory([]);
                        }  
                }
        }
        fetchData();
  },[selectedEmp])
  return (
    <Container textAlign='center'>
        Show me how data on {' '} 
        <Dropdown placeholder ='Employees' inline options={items} onChange ={(e,d)=>{setSelectedEmp(d.value)}}/>
        {!selectedEmp ? <Message color='teal' header='Uh Oh.' content='Pick An Employee to show data on them.'/> : 
        <Segment>
        <Grid celled>
              <Grid.Row centered>
              { pastRatingsHistory.length==0 ? <Message warning style={{width:'100%'}} header ='Uh Oh' content='No Rating Data on this Employee'/> : 
                <>
                <Grid.Column width = {11}>
                        <Container>  
                        <Table basic='very' celled collapsing>
                        <Table.Header>
                        <Table.Row>
                        <Table.HeaderCell>Date</Table.HeaderCell>
                        <Table.HeaderCell>Customer</Table.HeaderCell>
                        <Table.HeaderCell>Your Rating</Table.HeaderCell>
                        </Table.Row>
                        {pastRatingsHistory.map((data)=>(
                                <Table.Row>
                                <Table.Cell>
                                        {data.date}
                                </Table.Cell>
                                <Table.Cell>
                                        {data.first} {data.last}
                                </Table.Cell>
                                <Table.Cell>
                                <Rating icon='star' defaultRating={data.value} maxRating = {5}disabled/>
                                </Table.Cell>
                        </Table.Row>
                        ))}
                        </Table.Header>
                        </Table>
                        </Container>
                </Grid.Column>
                <Grid.Column width ={5}>
                        <Statistic>
                        <Statistic.Value><Icon name='star' color='yellow' size='small' />{average(pastRatingsHistory)}</Statistic.Value>
                        <Statistic.Label>Average Rating</Statistic.Label>
                        </Statistic>
                        
                </Grid.Column></>}
                </Grid.Row> 
                <Grid.Row centered>
                {pastTipsHistory.length==0 ? <Message warning style={{width:'100%'}} header ='Uh Oh' content='No Tip Data on this Employee'/> : 
                <>
                <Grid.Column width = {11}>
                <Container>  
                        <Table basic='very' celled collapsing>
                        <Table.Header>
                        <Table.Row>
                        <Table.HeaderCell>Date</Table.HeaderCell>
                        <Table.HeaderCell>Customer</Table.HeaderCell>
                        <Table.HeaderCell>Your Tips</Table.HeaderCell>
                        </Table.Row>
                {pastTipsHistory.map((data)=>(
                                <Table.Row>
                                <Table.Cell>
                                        {data.date}
                                </Table.Cell>
                                <Table.Cell>
                                        {data.first} {data.last}
                                </Table.Cell>
                                <Table.Cell>
                                        ${data.value}
                                </Table.Cell>
                        </Table.Row>
                        ))}
                        </Table.Header>
                        </Table>
                        </Container>
                </Grid.Column>
                <Grid.Column width = {5}>
                <Statistic>
                        <Statistic.Value>${average(pastTipsHistory)}</Statistic.Value>
                        <Statistic.Label>Average Tips</Statistic.Label>
                </Statistic>
                </Grid.Column>
                </> }
                </Grid.Row>
        </Grid>
        </Segment>
        }
        <Segment textAlign='center'>
                <h1>Business Statistics</h1>
                <Statistic >
                        <Statistic.Value>${balance}</Statistic.Value>
                        <Statistic.Label>Balance of Organization</Statistic.Label>
                </Statistic>
                <Statistic >
                        <Statistic.Value>{numApprovalsMade}</Statistic.Value>
                        <Statistic.Label>Number of Approvals Made</Statistic.Label>
                </Statistic>
                <Statistic >
                        <Statistic.Value>{numEmployees}</Statistic.Value>
                        <Statistic.Label>Number of Employees</Statistic.Label>
                </Statistic>
                <Statistic>
                        <Statistic.Value>{numCustomers}</Statistic.Value>
                        <Statistic.Label>Number of Customers</Statistic.Label>
                </Statistic>
        </Segment>
        <Deposit orgAddress={address}/>  
    </Container>  
  )
}

myProfileManager.getInitialProps = async (props)=>{
        // const response = await axios.request(options);
        // const marketPrice = response.data.ethereum.usd
        const marketPrice = 1600;
        const {address,uid} = props.query;
        let balance = await web3.eth.getBalance(address);
        balance = weiToUsd(balance,marketPrice);
        const fetchApprovedRequests = await service(address).getPastEvents('submitApproval',{filter: {isApproved:true}, fromBlock:0});
        const numApprovalsMade = fetchApprovedRequests.length
        const ref = collection(db,"Users")
        let q = query(ref,where("orgAddress","==",address),where("role","==","employee"));
        let querySnapshot = await getDocs(q);
        let i = 0;
        const items = []
        querySnapshot.forEach((doc)=>{
        const {first,last,publicAddress} = doc.data()
        items.push({key:i, value: publicAddress , text: `${first} ${last}`})
        i = i+1
        });
        console.log(items)
        let customerServed = 0;
        q = query(ref,where("orgAddress","==",address),where("role","==","customer"));
        querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc)=>{
        customerServed++;
        });
        return {address,uid,balance,numApprovalsMade,numEmployees:i,numCustomers:customerServed,balance,items,marketPrice}
}
export default myProfileManager