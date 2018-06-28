
var url = "ws://101.201.209.224:7333/ws"
socket = new WebSocket(url);
socket.onmessage = function(event) {
    var ta = document.getElementById('responseText');
    ta.value = ta.value + '\n' + event.data
};
socket.onopen = function(event) {
    var ta = document.getElementById('responseText');
    ta.value = "连接开启!";
};
socket.onclose = function(event) {
    var ta = document.getElementById('responseText');
    ta.value = ta.value + "连接被关闭";
};