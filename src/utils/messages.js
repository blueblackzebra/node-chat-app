const generateMessage = function(username, message) {
    return {
        username: username,
        text: message,
        createdAt: new Date().getTime()
    }
}

const generateLocationMessage = function(username, location) {
    return {
        username: username,
        text: "https://google.com/maps?q="+location.lat+","+location.long,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}