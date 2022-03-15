declare namespace NodeJS {
  declare interface Global {
    socket: import("socket.io-client").Socket;
  }
}
declare const socket: import("socket.io-client").Socket;
