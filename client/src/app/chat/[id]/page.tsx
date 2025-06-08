import React from 'react'
import Conversations from '../Conversations';

export default async function Page ({params} : {params: {id:string}}) {
    const {id} = await params;
    return <Conversations id={id}/>
}