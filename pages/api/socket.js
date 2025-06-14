import {Server} from 'socket.io';


const SocketHandler = (req,res) =>{
    if(res.socket.server.io){
        console.log("socket already running")
    }else{
        const io = new Server(res.socket.server);
        res.socket.server.io = io;

        io.on('connection',(socket)=>{
            console.log('server is connected')
            socket?.on('join-room',(roomId,id) =>{
                console.log(`a new User ${id} joined room ${roomId}`)
                socket.join(roomId)
                socket.broadcast.to(roomId).emit(`user-connected`,id)
            })

            socket.on(`user-toggle-audio`,(userId,roomId)=>{
                socket.join(roomId)
                socket.broadcast.to(roomId).emit(`user-toggle-audio`,userId)
            })

            socket.on(`user-toggle-video`,(userId,roomId)=>{
                socket.join(roomId)
                socket.broadcast.to(roomId).emit(`user-toggle-video`,userId)
            })

            socket.on(`user-leave`,(userId,roomId)=>{
                socket.join(roomId)
                socket.broadcast.to(roomId).emit(`user-leave`,userId)
            })
        })
    }
    res.end();
}

export default SocketHandler;