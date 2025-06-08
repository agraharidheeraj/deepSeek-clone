import React from 'react'
import Conversations from '../Conversations';

export default  function Page ({params} : {params: {id:string}}) {
    const {id} =  params;
    return <Conversations id={id}/>
}