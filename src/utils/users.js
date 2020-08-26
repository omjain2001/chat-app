const users = [];

const addUser = ({id,username,room}) => {

    if(!username || !room){
        return {error: "Invalid username or room"}
    }
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // check for existing user
    const existingUser = users.find((user) => {
        return user.username === username && user.room === room;
    })

    // validate user
    if(existingUser){
        return {error: "User already exist"};
    }

    const user = {id,username,room};
    users.push(user);
    return {user};
    
}

const removeUser = (id) => {

    const index = users.findIndex((user) => user.id===id);

    if(index !== -1){
        return {user: users.splice(index,1)[0]};
    }

    return {error : "User not found"};
    
}

const getUser = (id) => {

    const index = users.findIndex((user) => {
        return user.id===id;
    })

    if(index === -1){
        return {error: "User not found !!"}
    }

    return {user:users[index]};
}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase();
    const getAllUsers = users.filter((user) => {
        return user.room === room;
    })

    return getAllUsers;
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}