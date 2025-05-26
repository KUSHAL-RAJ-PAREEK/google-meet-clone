import {io} from "socket.io-client";
import {createContext, useContext, useEffect, useState} from "react";


const SocketContext = createContext(null);

export const useSocket = () => {
    const socket = useContext(SocketContext)
    return socket
}
export const SocketProvider = (props) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const {children} = props
    const [socket, setSocket] = useState(null);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        const connection = io()
        setSocket(connection)
    }, []);

    socket?.on('connect_error', async (err) =>{
        console.log("Error establishing socket with server", err)
        await fetch('/api/socket')
    })

    return (<SocketContext.Provider value={socket}>
        {children}
    </SocketContext.Provider>)
}