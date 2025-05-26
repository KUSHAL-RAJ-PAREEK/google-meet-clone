import {useSocket} from "@/context/socket";
import usePeer from "@/hooks/usePeer"
import { Inter } from 'next/font/google'

import {useEffect} from "react";

const Room = () =>{
    const socket = useSocket();
const { peer,myId} = usePeer()
}

export default Room;