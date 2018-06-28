/*
 *  @author: chen jinsheng 
 *  @date: 2017-11-15
 */

// setTimeout(function () {

// },0);
var ta = document.getElementById('responseText');
var dialog = $('.dialog-box');
var h6 = $('.box-right h6');
var notouch  = $('.no-touch');
//结果弹窗变量
var stime = null;
var number = 0;
var ss = 5; //5秒后开始游戏


var token = $.cookie('_ac') || "oEnuixFRDqQkcRvI4V5V\/N0cxih1z+VRdSau2hVrr5Q=";
var nickname = $.cookie('_nickname') || "测试nickname";
var uid = $.cookie('_uid') || 200089244;
// var uid = $.cookie('_uid') || 140006652;
var headpic = $.cookie('_headpic') || "测试headpic";
var roomId = $.cookie('_roomId') || "10";

var URL;
// var po_arr = [7333,7334,7335];  // 测试环境端口
var port  = 7333; // 本地和线上端口


// if ( window.location.href.match(/test\.hongdoulive/ig) !== null ){   //测试环境
// 	port = po_arr[Math.floor(Math.random()*(3 - 0))];
// }

URL = 'wss://wss.booksn.com/ws'; //线上
if (window.location.href.match(/test\.hongdoulive/ig) !== null) {   //测试环境
	URL = 'wss://t-wss.booksn.com/ws'
}



// var user1_info = {};
// var user2_info = {};
var receviced = {
	getUser1: function (data,mySide) {
		var hPic = data[mySide].headPic;
		var suffix = '';
		if( (/\?/).test(hPic) ){
			suffix = '&x-oss-process=image/resize,m_fixed,h_100,w_100';
		}
		else {
			suffix = '?x-oss-process=image/resize,m_fixed,h_100,w_100';
		}

		$('.user1 .user-img').attr('src',hPic+suffix);
		data[mySide].nickname && $('.user1 .nick-inner').text(data[mySide].nickname);
		// user1_info = {
		// 	headPic: data.headPic,
		// 	nickName: data.nickName,
		// 	uid: data.uid
		// }
	},
	getUser2: function (data,mySide) {
		if (mySide == 'a') {
			x = 'b';
		}
		else {
			x = 'a';
		}
		var hPic2 = data[x].headPic;
		var suffix = '';

		if( (/\?/).test(hPic2) ){
			suffix = '&x-oss-process=image/resize,m_fixed,h_100,w_100';
		}
		else {
			suffix = '?x-oss-process=image/resize,m_fixed,h_100,w_100';
		}

		$('.user2 .user-img').attr('src',hPic2+suffix);
		data[x].nickname && $('.user2 .nick-inner').text(data[x].nickname);
		$('.dialog-match').addClass('hidden');
		// user2_info = {
		// 	headPic: data[x].headPic,
		// 	nickName: data[x].nickname,
		// 	uid: data[x].uid
		// }

	},
	// 认输按钮
	isGiveUp: function () {
		$('.give-up-box').addClass('show');
		$('#giveup-btn').attr('side',mySide);
	},
	deal1: function (data){
		var _ts = this;
		$('#match').text('匹配成功。。。');
		// ta.innerHTML = '游戏中!!';
	}


};

/*处理接收服务器message*/
NetSoket.netWebSoket(URL,function (head, body) {
	GAME._receiveMsg(head, body);


},function (event) {
	//连接建立成功
	console.info("connect success!")
    console.info("login start...")
	GAME.login(token, parseInt(uid), nickname, headpic);
    console.info("login success.........");

    // receviced.getUser1({headPic:headpic,nickName:nickname,uid:uid});

},function (event) {
	//连接被关闭
    console.warn("connect closed!");
},function (event) {
	//连接错误
	console.error("connect error!");
});






