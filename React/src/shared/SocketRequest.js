import socketIOClient from "socket.io-client";

const mode = process.env.REACT_APP_MODE;
const socket = mode
  ? process.env["REACT_APP_SOCKET_" + mode.toUpperCase()] ||
    process.env.REACT_APP_SOCKET
  : process.env.REACT_APP_SOCKET;

class SocketRequester {
  instance = null;

  constructor() {
    this.instance = socketIOClient(socket, {
      reconnectionAttempts: 10,
    });
  }

  subscribe(url, method) {
    let instance = this.instance;
    instance.on(url, method);
    instance.emit("subscribe", url);
  }
  unSubscribe(url) {
    let instance = this.instance;
    instance.off(url);
    instance.emit("unsubscribe", url);
  }

  publish(url, data) {
    let instance = this.instance;
    return instance.emit(url, data);
  }
}

export default SocketRequester;
