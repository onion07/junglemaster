/*
1
1、初始化棋子为一维随机数组
2、
 */
//双方棋子数，1：蓝色方，0：红色方 ，红色先下
var _GREEN = 1;
var _RED = 0;
var aNum = { 0: 8, 1: 8 }
//点击某个棋子是，标识其上下左右是否可走 1 可走 0 不可走
var dtop = dright = dbottom = dleft = 0;
var mySide;
var gameTimeLock = 1; // 1：锁住，0：解锁
var lock_Audio = false; // 关掉音频
var gameId;
var lock_Audio = false; // 关掉音频
var turn;
var timeInter1 = null; //开始游戏倒计时
var timeInter2 = null; //倒计时
var timeOut_show_1 = null; //你的回合，显示的倒计时
var timeOut_hide_1 = null; //你的回合，隐藏的倒计时
var timeOut_show_2 = null; //对方回合，显示的倒计时
var timeOut_hide_2 = null; //对方回合，隐藏的倒计时
var audio1; //背景音频
var audio2;//动物音频
var theAudios = [0];
var uid = 0;
var nickname = "";
var headpic = "";
var gameType = 2;
var csType = 204;
var abSide;
var gameType;
var is_local = false;
var user1_info;
var _roomId;
var game_is_over = false; //游戏是否结束
var lock_showCard = false;
var now_gameId;
// var roomId = $.cookie('_roomId') || "uuuu";

var soundMax = {
	0: 'choose',
	1: 'elephant',
	2: 'lion',
	3: 'tigger',
	4: 'leopard',
	5: 'wolf',
	6: 'dog',
	7: 'cat',
	8: 'mouser',
	9: 'move',
	'win': 'win',
	'lose': 'lose',
};
var GAME = {
	returnSide: function (msgJson) {
		if (msgJson.side == 'a') {
			return 0;
		}
		return 1;
	},
	//匹配成功-初始化
	init: function (msgJson) {
		logInApp('==== init');
		// randomAnimals_cache = msgJson.data;
		var randomAnimals = msgJson.data;
		var animalName = ['象', '狮', '虎', '豹', '狼', '狗', '猫', '鼠'],
			domAnimalName = [];
		var x;
		// gameType = msgJson.gameType; // 再来一局使用
		gameType = 2; // 再来一局使用
		// csType = msgJson.type; // 再来一局使用

		abSide = msgJson.side;

		if (abSide == 'a') {
			x = 'b';
		} else {
			x = 'a';
		}
		user1_info = {
			headPic: msgJson[abSide].headPic,
			nickname: msgJson[abSide].nickname,
			uid: msgJson[abSide].uid
		}
		user2_info = {
			headPic: msgJson[x].headPic,
			nickname: msgJson[x].nickname,
			uid: msgJson[x].uid
		}
		//麦克风
		$('.user1 .voice').attr('data-hdUid', msgJson[abSide].uid);
		$('.user2 .voice').attr('data-hdUid', msgJson[x].uid);
		// voiceSwitch(0,'376236')

		//0 先走， 1 后走
		mySide = GAME.returnSide(msgJson);
		// console.warn(mySide)
		// gameId = msgJson.gameId;
		turn = 0;
		$('.wrapper').addClass('has-ready');
		// 组合棋子数组
		// &&输出到dom
		$('.animals').html(''); //清空，再来一局使用
		for (var i = 0, l = randomAnimals.length; i < l; ++i) {
			domAnimalName[i] = { team: '', name: '' };
			domAnimalName[i].team = randomAnimals[i];
			// domAnimalName[i].team = randomAnimals[i];
			domAnimalName[i].name = animalName[Math.abs(randomAnimals[i]) - 1];
			$('.animals').append($('<div class="animal hide animal' + (i + 1) + ' obj-animal' + domAnimalName[i].team + '" data-class="animal' + (i + 1) + '" ani="' + domAnimalName[i].team + '"></div>').attr("team", domAnimalName[i].team).text(domAnimalName[i].name));
			$('.animals').append($('<span class="blank blank' + (i + 1) + '"></span>'));
			// piecesArray.push(new Pieces(animalName[Math.abs(randomAnimals[i]) -1], randomAnimals[i],i%4,Math.floor(i / 4)));
		}
		$('.animals').append('<div id="smog-layer"><span class="s-somg"></span></div>');
		//  添加坐标
		$('.animal').each(function (i) {
			$(this).data('coordinate', { x: i % 4, y: Math.floor(i / 4) });
			$(this).data('status', true);
			$(this).addClass("c" + i % 4 + Math.floor(i / 4));
			$(this).data('side', domAnimalName[i].team > 0 ? _RED : _GREEN);

		});

		receviced.isGiveUp();//认输按钮
		// receviced.getUser2(msgJson);

		//分配红蓝方
		GAME.allocate(msgJson);
		//游戏开始 提示
		// GAME.startTips();
		GAME.setCurrentSide(0);
		//初始化

		if (msgJson.status === true) {
			if (GAME.returnSide(msgJson) === 0) {
				GAME.turnMySide();

			}
			else if (GAME.returnSide(msgJson) === 1) {
				GAME.turnSideOthers();

			}

		}
		// for (var i = 1; i <= 8; i++) {

		// 	theAudios.push( document.querySelector("#audio"+i) );
		// 	// console.info(theAudios)
		// }
		// console.log('(init) gameId:', gameId)

		// if(navigator.userAgent.toLowerCase().match(/(iphone|ipod|ios|ipad)/i)) {
		//    	loadingDone();
		//          }
		//          else if(navigator.userAgent.indexOf('Android') > -1 || userAgent.indexOf('Adr') > -1) {

		//    	window.JsInterface.loadingDone();
		//          }

		logInApp('********* init');

	},
	//分配红蓝方
	allocate: function (msgJson) {
		logInApp('======= allocate');

		if (GAME.returnSide(msgJson) === 0) {
			$('.dialog-layer').addClass('dialog-side' + GAME.returnSide(msgJson));
			$('.side1').addClass('r-color').text('你是红方');
			// $('.user1 .litte-bar3').hide();
			$('.user1').removeClass('green-team').addClass('red-team');
			$('.user2').removeClass('red-team').addClass('green-team');

			$('.p1').removeClass('green-team').addClass('red-team');
			$('.p2').removeClass('red-team').addClass('green-team');
		}
		else {
			$('.side1').addClass('g-color').text('你是蓝方');
			$('.user1 .litte-bar3').hide();
			$('.dialog-layer').addClass('dialog-side' + GAME.returnSide(msgJson));
			$('.user1').removeClass('red-team').addClass('green-team');
			$('.user2').removeClass('green-team').addClass('red-team');

			$('.p1').removeClass('red-team').addClass('green-team');
			$('.p2').removeClass('green-team').addClass('red-team');
		}
		logInApp('******** allocate');

	},
	setProgress: function (g) {
		logInApp('======== setProgress');

		$('body').attr('data-progress', g); //记录当前游戏进程 7： 游戏中 ,15 ,结束游戏，再来一局

		logInApp('******** setProgress');

	},
	//游戏开始提示
	startTips: function (g) {
		logInApp('======= startTips');

		// clearInterval(timeInter1);
		// var i = 2;

		if (is_local) { //本地测试，非客户端测试环境
			GAME.goGame();
			return;
		}

		if (navigator.userAgent.toLowerCase().match(/(iphone|ipod|ios|ipad)/i)) {
			// if (typeof errorSend == 'function') {
			// 	var loadingD = typeof loadingDone;
			// 	errorSend('ios loadingDone:: '+loadingD)
			// }
			loadingDone();
		}
		else if (navigator.userAgent.indexOf('Android') > -1 || navigator.userAgent.indexOf('Adr') > -1) {
			// if (typeof errorSend == 'function') {
			// 	var loadingD = typeof loadingDone;
			// 	errorSend('andrid loadingDone:: '+loadingD)
			// }
			window.JsInterface.loadingDone();
		}

		logInApp('********* startTips');

	},
	goGame: function (i) {
		logInApp('======== goGame');

		/* reset */
		$('.no-ready').hide();
		$('.dialog-start-tips').hide();
		// $('.each-team').removeClass('scanl');
		$('.time-box').removeClass('show');

		$('.each-team').removeClass('scanl').addClass('scanl'); // 你是红or蓝方,文本动画

		//初始化 谁的回合（谁先下）
		if (mySide === 1) { //绿方

			clearInterval(timeInter2);
			$('.time-box').eq(1).addClass('show'); //显示倒计时，红色先下

			GAME.showTurn2();
		}
		else if (mySide === 0) { //红方

			clearInterval(timeInter2);
			$('.time-box').eq(0).addClass('show'); //显示倒计时，红色先下

			GAME.showTurn1();
		}

		GAME.setGameTime(60, true);
		gameTimeLock = 0;

		// timeInter1 = setInterval(function () {

		// 	if (i=== -1) { // 3秒倒计时结束
		// 		clearInterval(timeInter1);
		// 		$('.dialog-start-tips').hide();

		// 		$('.each-team').addClass('scanl'); // 你是红or蓝方,文本动画

		// 		//初始化 谁的回合（谁先下）
		// 		if (mySide === 1){ //绿方

		// 			clearInterval(timeInter2);
		// 			$('.time-box').eq(1).addClass('show'); //显示倒计时，红色先下

		// 			GAME.showTurn2();
		// 		}
		// 		else if (mySide === 0){ //红方

		// 			clearInterval(timeInter2);
		// 			$('.time-box').eq(0).addClass('show'); //显示倒计时，红色先下

		// 			GAME.showTurn1();
		// 		}

		// 		GAME.setGameTime(60,true);
		// 		gameTimeLock = 0;

		// 	}
		// 	else {

		// 		// GAME.playAudioAni('timeout'); //音效

		//       		$('.dialog-start-tips p').css({'background-image':'url(./images/go'+i+'.png)'});

		// 		if (i === 0) {

		// 			// GAME.playAudioAni('go'); //音效

		// 			$('.dialog-start-tips').removeClass('ready');
		// 			$('.dialog-start-tips p').css({'width':140,'height':90,'margin-left':-70,'background-image':'url(./images/go'+i+'.png)'});

		// 		}

		// 		i--;
		// 	}
		// },1000);
		logInApp('******** goGame');

	},
	//游戏倒计时
	setGameTime: function (s, isinit) {
		logInApp('======== setGameTime');

		$('.time-box.show .time').text(s);
		clearInterval(timeInter2);

		timeInter2 = setInterval(function () {
			// console.info(s)
			if (s === 0) {
				// var side = $('.time-box.show').attr('now-side');
				var side = GAME.getCurrentSide();
				var result = side == 1 ? 0 : 1; //蓝 发 0，红 发 1；

				clearInterval(timeInter2);
				// $('.time-box').removeClass('show'); //隐藏定时器
				$('.give-up-box').removeClass('show');

				GAME.gameOverSend(result); //相当于认输
				// $('#giveup-btn').trigger('click');

			}
			else {
				$('.time-box.show .time').text(--s); //显示秒数
			}
		}, 1000);

		logInApp('********* setGameTime');

	},
	showEach1: function () {
		$('.p1').show();
	},
	hideEach1: function () {
		$('.p1').hide();
	},
	showEach2: function () {
		$('.p2').show();
	},
	hideEach2: function () {
		$('.p2').hide();
	},
	//你的回合
	showTurn1: function () {
		clearTimeout(timeOut_show_1);
		clearTimeout(timeOut_hide_1);
		if (!game_is_over) {

			timeOut_show_1 = setTimeout(function () {
				GAME.showEach1();
				timeOut_hide_1 = setTimeout(function () {
					GAME.hideEach1();
					$('.time-box').removeClass('show').eq(0).addClass('show'); //显示倒计时				
					GAME.setGameTime(60);
				}, 2200);
			}, 1200);
		}
	},
	//对方的回合
	showTurn2: function () {
		clearTimeout(timeOut_show_2);
		clearTimeout(timeOut_hide_2);
		if (!game_is_over) {

			timeOut_show_2 = setTimeout(function () {
				GAME.showEach2();
				timeOut_hide_2 = setTimeout(function () {
					GAME.hideEach2();
					$('.time-box').removeClass('show').eq(1).addClass('show'); //显示倒计时				
					GAME.setGameTime(60);
				}, 2200);
			}, 1200);
		}
	},
	turnMySide: function () {
		// $('.time-box').removeClass('show').eq(0).addClass('show'); //显示倒计时
		$('.time-box').removeClass('show');
		clearInterval(timeInter2);

		clearTimeout(timeOut_show_1);
		clearTimeout(timeOut_hide_1);
		if (gameTimeLock === 0) { //解锁后

			// timeOut_show_1 = setTimeout(function () {
			// 	GAME.showEach1();
			// 	timeOut_hide_1 = setTimeout(function () {
			// 		GAME.hideEach1();
			// 	},1000);
			// },1200);
			GAME.showTurn1();


		}
	},
	turnSideOthers: function () {
		// $('.time-box').removeClass('show').eq(1).addClass('show'); //显示倒计时
		$('.time-box').removeClass('show');
		clearInterval(timeInter2);

		clearTimeout(timeOut_show_2);
		clearTimeout(timeOut_hide_2);
		if (gameTimeLock === 0) { //解锁后

			// timeOut_show_2 = setTimeout(function () {
			// 	GAME.showEach2();
			// 	timeOut_hide_2 = setTimeout(function () {
			// 		GAME.hideEach2();
			// 	},1000);
			// },1200);
			GAME.showTurn2();

		}

	},


	_activeCard: function (ths, is_recevier) {
		if (turn % 2 != mySide) { //不是自己的回合
			console.info('turn % 2 != mySide，不是你的回合')
			return;
		}
		$('.active').removeClass('active').addClass('normal');
		// if ( ths.hasClass('hide') ) {
		// 	console.log('你点击了未翻开的牌，不可active【GAME._activeCard】');
		// 	return;
		// }
		var coordinate = ths.data('coordinate');
		GAME.playAudioAni2(0); //choose 音效
		ths.addClass('active').removeClass('normal');

		// ths.addClass('active').removeClass('normal');
		/*var coordinate = ths.data('coordinate');

		if (!is_recevier) {
			var index = $('.animal').index( $('.active') )|| 0;

			$('.animal').removeClass('active').eq(index).addClass('normal');
			ths.addClass('active').removeClass('normal');

			GAME.playAudioAni2(0); //choose 音效
		}*/

		GAME.deriction(coordinate);
	},
	deriction: function (coordinate) {
		$('.deriction').remove();
		dtop = dright = dbottom = dleft = 0;
		if (coordinate.x === 0 && coordinate.y === 0) {
			//左上角
			dright = dbottom = 1;

			GAME.judge(dtop, dright, dbottom, dleft, coordinate);

		} else if (coordinate.x === 3 && coordinate.y === 3) {
			// 右下角
			dleft = dtop = 1;
			GAME.judge(dtop, dright, dbottom, dleft, coordinate);
		} else if (coordinate.x === 3 && coordinate.y === 0) {
			// 右上角
			dleft = dbottom = 1;
			GAME.judge(dtop, dright, dbottom, dleft, coordinate);
		} else if (coordinate.x === 0 && coordinate.y === 3) {
			// 左下角
			dright = dtop = 1;
			GAME.judge(dtop, dright, dbottom, dleft, coordinate);
		} else if (coordinate.y === 0) {
			// 顶部
			dright = dbottom = dleft = 1;
			GAME.judge(dtop, dright, dbottom, dleft, coordinate);
		} else if (coordinate.x === 3) {
			// 右侧
			dtop = dbottom = dleft = 1;
			GAME.judge(dtop, dright, dbottom, dleft, coordinate);
		} else if (coordinate.y === 3) {
			// 左侧
			dtop = dright = dleft = 1;
			GAME.judge(dtop, dright, dbottom, dleft, coordinate);
		} else if (coordinate.x === 0) {
			// 底部
			dtop = dright = dbottom = 1;
			GAME.judge(dtop, dright, dbottom, dleft, coordinate);
		} else {
			dtop = dright = dbottom = dleft = 1;
			GAME.judge(dtop, dright, dbottom, dleft, coordinate);
		}
		GAME.findNext(dtop, dright, dbottom, dleft, coordinate);
		$('.active').append('<div class="deriction"><div class="top ' + (dtop ? '' : 'none') + '"></div><div class="right ' + (dright ? '' : 'none') + '"></div><div class="bottom ' + (dbottom ? '' : 'none') + '"></div><div class="left ' + (dleft ? '' : 'none') + '"></div></div>');
	},
	compare: function (judgeThis, judgeObj, judgeDeriction) {
		if (judgeThis.length == 0) {
			// 没有棋子
			judgeDeriction == 't' ? dtop = 0 : judgeDeriction == 'r' ? dright = 0 : judgeDeriction == 'b' ? dbottom = 0 : dleft = 0;
		} else {
			if (judgeThis.hasClass('hide')) {
				//未翻牌
				judgeDeriction == 't' ? dtop = 0 : judgeDeriction == 'r' ? dright = 0 : judgeDeriction == 'b' ? dbottom = 0 : dleft = 0;
			} else {
				if (judgeThis.attr('team') * judgeObj.attr('team') > 0) {
					// 同一方的棋子
					if (judgeThis.data("status") === true) {
						judgeDeriction == 't' ? dtop = 0 : judgeDeriction == 'r' ? dright = 0 : judgeDeriction == 'b' ? dbottom = 0 : dleft = 0;
					} else {

					}
				} else {
					// 级别比自己大
					// var ths = Math.abs(judgeThis.attr('team'));
					// var obj =  Math.abs(judgeObj.attr('team'));
					// if(ths < obj) {
					//    if (ths != 1 || obj != 8) {
					//    	judgeDeriction == 't' ? dtop = 0 : judgeDeriction == 'r' ? dright = 0 : judgeDeriction == 'b' ? dbottom = 0 : dleft = 0;
					// }
					// }else{
					//    if (ths == 8  && obj == 1) {
					//        judgeDeriction == 't' ? dtop = 0 : judgeDeriction == 'r' ? dright = 0 : judgeDeriction == 'b' ? dbottom = 0 : dleft = 0;
					//    }
					// }
				}
			}
		}

	},
	judge: function (t, r, b, l, c) {
		// 找到对应方向的对象
		if (t) {//dtop
			var _this = $('.c' + c.x + (c.y - 1)),
				_obj = $('.c' + c.x + c.y);
			GAME.compare(_this, _obj, 't');

		}
		if (r) {//dright
			var _this = $('.c' + (c.x + 1) + c.y),
				_obj = $('.c' + c.x + c.y);
			GAME.compare(_this, _obj, 'r');
		}
		if (b) {//dbottom
			var _this = $('.c' + c.x + (c.y + 1)),
				_obj = $('.c' + c.x + c.y);
			GAME.compare(_this, _obj, 'b');
		}
		if (l) {//dleft
			var _this = $('.c' + (c.x - 1) + c.y),
				_obj = $('.c' + c.x + c.y);
			GAME.compare(_this, _obj, 'l');
		}
	},
	findNext: function (t, r, b, l, c) {
		$('.next').removeClass('next').addClass("normal");
		console.info('findNext ===========$(\.next\').length: ', $('.next').length + ' 执行： $(\'.next\').removeClass(\'next\').addClass(\"normal\")')

		if (t) {
			if ($('.c' + c.x + (c.y - 1)).data("status")) {
				$('.c' + c.x + (c.y - 1)).addClass('next').removeClass('normal');
			}
		}
		if (r) {
			if ($('.c' + (c.x + 1) + c.y).data("status")) {
				$('.c' + (c.x + 1) + c.y).addClass('next').removeClass('normal');
			}
		}
		if (b) {
			if ($('.c' + c.x + (c.y + 1)).data("status")) {
				$('.c' + c.x + (c.y + 1)).addClass('next').removeClass('normal');
			}
		}
		if (l) {
			if ($('.c' + (c.x - 1) + c.y).data("status")) {
				$('.c' + (c.x - 1) + c.y).addClass('next').removeClass('normal')
			}
		}
	},
	afterSend: function () {
		//如果是游戏结束，有定时器，需要清定时器
		// console.info('========')
		GAME.turnSideOthers();

		var cur = 1;
		if ($('#giveup-btn').attr('side') == 1) {
			cur = 0;
		}
		// console.info('cur',cur);
		GAME.setCurrentSide(cur);

	},
	move: function (active, next) {
		//_A 主动， _B 被动
		var _B = $(this);
		var _A = $(".active");

		if (turn % 2 != mySide) {
			return;
		}
		if (_A.length == 0) {
			return;
		}

		if (mySide != _A.data("side")) {
			return;
		}

		GAME._move(_A, _B);
		// var msg = {type:2,op:9,"gameId": gameId,from:{x:_A.data('coordinate').x,y:_A.data('coordinate').y},to:{x:_B.data('coordinate').x,y:_B.data('coordinate').y},"side": mySide, step:2};
		var msg = { type: 2, op: 9, "gameId": gameId, gameType: 2, from: { x: _A.data('coordinate').x, y: _A.data('coordinate').y }, to: { x: _B.data('coordinate').x, y: _B.data('coordinate').y }, "side": mySide, step: 2 };

		GAME.messgSend(msg);
		GAME.afterSend();//动作轮到对方



	},
	_move: function (_A, _B, is_recev) {
		var bCoo = _B.data('coordinate'),
			bCooX = bCoo.x,
			bCooY = bCoo.y,
			bPosT = _B.css('top'),
			bPosL = _B.css('left'),
			// $(this).detach();
			bTeam = _B.attr('team'),
			bStatus = _B.data('status'),
			bSide = _B.data('side');


		var aCooX = _A.data('coordinate').x,
			aCooY = _A.data('coordinate').y,
			aPosT = _A.css('top'),
			aPosL = _A.css('left'),
			aTeam = _A.attr('team'),
			ani = _A.attr('ani'),
			aStatus = _A.data('status'),
			aSide = _A.data('side');


		var dis = Math.sqrt(Math.pow((aCooY - bCooY), 2) + Math.pow((aCooX - bCooX), 2));
		//距离大于1 不让动
		if (dis > 1) {
			return;
		}

		//判断谁大，1： A 大， 0： 一样大， -1： B 大
		var isBigger = GAME.compareAnimal(aTeam, bTeam);
		console.info('_move===========$(\'.next\').length: ', $('.next').length + ' 执行： $(\'.next\').removeClass(\'next\').addClass("normal")')

		// $('.next').removeClass('next').addClass("normal");
		if ($('.next').length > 0) {
			$('.next').removeClass('next').addClass("normal");
		}
		_A.find('.deriction').detach();


		//播放音效
		// alert(Math.abs(ani))

		_A.animate({ top: bPosT, left: bPosL }, 400, "linear", function () {

			//播放音效
			GAME.playAudioAni2(9); // move 音效
			GAME.addSmog(bPosT, bPosL);
			if (bStatus) {


				// 对方还活着
				if (isBigger == 0) {
					//同归于尽

					_A.data('coordinate').x = bCoo.x;
					_A.data('coordinate').y = bCoo.y;
					_A.removeClass('c' + aCooX + aCooY).addClass('c' + bCoo.x + bCoo.y);
					_A.data('status', false);
					_A.removeClass("active").addClass("die");


					_B.data('coordinate').x = aCooX;
					_B.data('coordinate').y = aCooY;
					_B.removeClass('c' + bCooX + bCooY);
					_B.removeClass('normal');
					_B.addClass('c' + aCooX + aCooY);
					_B.data('status', false);
					_B.addClass("die");
					_B.css({ top: aPosT, left: aPosL });

					GAME.counter(0);
					GAME.counter(1);
				}
				else if (isBigger > 0) {
					//大于对方,吃掉对方


					_A.data('coordinate').x = bCoo.x;
					_A.data('coordinate').y = bCoo.y;
					_A.removeClass('c' + aCooX + aCooY).addClass('c' + bCoo.x + bCoo.y);
					_A.removeClass("active").addClass('normal');


					_B.data('coordinate').x = aCooX;
					_B.data('coordinate').y = aCooY;
					_B.removeClass('c' + bCooX + bCooY);
					_B.removeClass('normal');
					_B.addClass('c' + aCooX + aCooY);
					_B.addClass("die");

					_B.data('status', false);
					_B.css({ top: aPosT, left: aPosL });


					GAME.counter(bSide);

				}
				else if (isBigger < 0) {
					//小于对方，被对方吃掉
					_A.data('status', false);
					_A.removeClass("active").addClass("die");

					_A.data('status', false);
					_A.removeClass("active").addClass("die");
					_A.css({ top: aPosT, left: aPosL });

					GAME.counter(aSide);
				}
			} else {
				//对方已死，相当于位移
				_A.data('coordinate').x = bCoo.x;
				_A.data('coordinate').y = bCoo.y;
				_A.removeClass('c' + aCooX + aCooY).addClass('c' + bCoo.x + bCoo.y);
				_A.removeClass("active").addClass('normal');


				_B.data('coordinate').x = aCooX;
				_B.data('coordinate').y = aCooY;
				_B.removeClass('c' + bCooX + bCooY);
				_B.removeClass('normal');
				_B.addClass('c' + aCooX + aCooY);

				_B.css({ top: aPosT, left: aPosL });
			}



			if( GAME.haveHideCard() ) { //还有未翻开的牌,不要判断输赢
				return;
			}

			GAME.judgeResult(); //判断输赢,结束游戏

		});

		turn++;
	},
	//判断输赢
	judgeResult: function () {
		// 是否结束游戏
		var isOver = GAME._isOver();
		if (isOver != 0) { //有一方没有牌了

			GAME._gameOver();

		} else if (isOver == 0) { //双方都还有牌
			console.info('GAME.isTwoCard==', GAME.isTwoCard());
			console.info('GAME.isEqual==', GAME.isEqual());

			if (GAME.isTwoCard()) {//是否双方剩余两张牌

				if (GAME.isEqual()) { //牌大小相等
					GAME.gameOverSend(2); // 发送2: 平局
				} else {
					console.info('GAME.eachOneBigger==', GAME.eachOneBigger());

					if (mySide == 1 && GAME.eachOneBigger() > 0) { //蓝方小
						GAME.gameOverSend(0); // 蓝输了，蓝方发 0
					} else if (mySide == 0 && GAME.eachOneBigger() < 0) { //红方小
						GAME.gameOverSend(1); // 红输了，红方发 1
					}
				}
			}else{
				console.info('还有一方剩下的牌大于2');
			}
		}

	},
	//是否还有未翻开的牌
	haveHideCard: function () {
		var hide_length = $('.animals').find('.hide').length;
		console.info('hide_length::',hide_length)
		if (hide_length < 1) {
			return false;
		}
		return true;
	},
	//烟雾效果
	addSmog: function (bPosT, bPosL, ani) {
		var ss = null;
		var i = 1;
		var audio_src = '';
		$('#smog-layer').css({ 'display': 'block', 'top': bPosT, 'left': bPosL });



		ss = setInterval(function () {

			if (i > 4) {
				clearInterval(ss);
				$('#smog-layer').css({ 'display': 'none' });
				return;
			}
			$('#smog-layer .s-somg').css({ 'background-image': 'url(./images/animation_0' + i + '.png)' });

			i++;

		}, 70);

	},
	// 剩余的牌大小不相等
	eachOneBigger: function () {
		var $normal = $('.animals').find('.normal').filter(function (i) {
			return !$(this).hasClass("die"); //只有normal且没有die选择器
		});

		if ($normal.length === 2) {

			var $g_team = $normal.filter(function (j) {
				return $(this).attr("team") < 0;
			});
			var $r_team = $normal.filter(function (j) {
				return $(this).attr("team") > 0;
			});

			if (Math.abs($g_team.attr("team")) == 8 && Math.abs($r_team.attr("team")) == 1) { //蓝老鼠 大于 红大象
				return -1;
			} else if (Math.abs($g_team.attr("team")) == 1 && Math.abs($r_team.attr("team")) == 8){ //蓝大象 小于 红老鼠
				return 1;
			}
			if (Math.abs($g_team.attr("team")) < Math.abs($r_team.attr("team")) ) { // 蓝方棋子大于红方v,如：-2（蓝-狮）大于 3（红-虎）
				return -1; 
			} else { 
				return 1;// 蓝方棋子小于红方
			}
			
		}
		
	},
	// 剩余的牌大小都相等
	isEqual: function () { 
		var $normal = $('.animals').find('.normal').filter(function (i) {
			return !$(this).hasClass("die"); //只有normal且没有die选择器
		});
		console.info('$(\'.normal\').length==', $normal.length);
		if ($normal.length === 2) {
			if (Math.abs($normal.eq(0).attr("team")) == Math.abs($normal.eq(1).attr("team"))) {
				return true;
			}
		}
		return false;
	},
	//是否剩余两张牌
	isTwoCard: function () {
		console.info('aNum[_GREEN],aNum[_RED]: ', aNum[_GREEN], aNum[_RED]);
		return aNum[_GREEN] === 1 && aNum[_RED] === 1;
	},
	//翻牌，传入
	_showCard: function (ths) {

		//    ths.addClass('animated shake'); //加上动画 shake

		// GAME.playAudioAni2( Math.abs(ths.attr('ani')) ); // 音效
		// ths.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () { //检查是否做完动画
		// 	//做完动画后
		// 	if(ths.data('side') == _RED){
		// 		// ths.css({background:'red',textIndent:0}).removeClass('hide').addClass('normal');
		// 		ths.addClass('red-show').removeClass('hide').addClass('normal');
		// 	}else{
		// 		// ths.css({background:'green',textIndent:0}).removeClass('hide').addClass('normal');
		// 		ths.addClass('green-show').removeClass('hide').addClass('normal');
		// 	}
		//           turn ++;
		// 	$(".animal").removeClass("animated shake"); //删除动画
		// 	$(".animal.active").removeClass("active").addClass("normal");
		//           $(".animal.next").removeClass("next").addClass("normal");
		//       	$(".animal").find('.deriction').detach();
		// });


		

		GAME.playAudioAni2(Math.abs(ths.attr('ani'))); // 音效
		anime({
			targets: '.' + ths.data('class'),
			translateX: [10, -10, 10, -10, 0],
			delay: 0,
			easing: 'linear',
			duration: 700,
			complete: function () {
				console.info('$(".animal").length:' + $(".animal").length)
				console.info('$(".active").length:' + $(".active").length)


				console.warn('[anime] l_showCard: ' + lock_showCard);
				//做完动画后
				if (ths.data('side') == _RED) {
					console.info('ths.data(\'side\') ===_RED|===========', ths.data('side') + ' 执行：  ths.addClass(\'red-show\').removeClass(\'hide\').addClass(\'normal\')')

					ths.addClass('red-show').removeClass('hide').addClass('normal');
				} else {
					console.info('ths.data(\'side\') !==_RED|===========', ths.data('side') + ' 执行： ths.addClass(\'green-show\').removeClass(\'hide\').addClass(\'normal\')')

					ths.addClass('green-show').removeClass('hide').addClass('normal');
				}

				$(".animal").removeClass("animated shake"); //删除动画
				console.info('动画complete===========(".animal.active").length: ', $(".animal.active").length + ' 执行： $(".animal.active").removeClass("active").addClass("normal")')
				console.info('动画complete===========(".animal.next").length: ', $(".animal.next").length + ' 执行：  $(".animal.next").removeClass("next").addClass("normal")')

				$(".animal.active").removeClass("active").addClass("normal");
				$(".animal.next").removeClass("next").addClass("normal");
				$(".animal").find('.deriction').detach();

				turn++;

				lock_showCard = false;

				GAME.judgeResult(); //判断输赢,结束游戏
				
			}
		});

		return turn;


	},

	//判断是否结束，返回0：未结束，1：红色方赢，-1：蓝色方赢 =====【非认输情况】
	_isOver: function () {
		console.log(aNum);
		if (aNum[_GREEN] == 0) {
			return 1;
		}
		if (aNum[_RED] == 0) {
			return -1;
		}
		return 0;
	},

	//判断动物大小，传入数字，返回 0:一样大，1：animal1 大， -1 ：animal2 大
	compareAnimal: function (animal1, animal2) {
		animal1 = Math.abs(animal1);
		animal2 = Math.abs(animal2);
		if (animal1 == animal2) {
			return 0;
		}
		if (animal1 > animal2 && (animal1 != 8 || animal2 != 1)) {
			return -1;
		}
		else if (animal1 == 1 && animal2 == 8) {
			return -1;
		}
		else {
			return 1;
		}
	},

	//游戏结束，上报给服务端
	_gameOver: function () {
		//输方发给服务器
		// 以下任意一方没有牌了的情况
		var result = 2;
		if (aNum[_GREEN] === 0 && aNum[_RED] !== 0) {
			result = 0; //输了，蓝方发 0
		}
		if (aNum[_RED] === 0 && aNum[_GREEN] !== 0) {
			result = 1; //输了，红方发 1
		}
		if (aNum[_RED] === 0 && aNum[_GREEN] === 0) {
			result = 2; //输了，任意一方发2
		}
		// console.info('result:',result);
		GAME.gameOverSend(result);
	},
	gameOverSend: function (result) {
		$('.dialog-middle-box').removeClass('red-team green-team').hide(); // 隐藏x方的回合
		game_is_over = true;

		var msg = { type: 2, op: 13, "gameId": gameId, "side": mySide, "gameType": 2, "result": result, "data": { "a": 0, "b": 1 } };

		GAME.messgSend(msg);
		GAME.afterSend();
	},
	//处理服务端下发的游戏结束消息
	gameOver: function (msgJson) {
		//接收：结束处理
		var server = msgJson;
		var resultFlag;
		//animals层添加禁止层
		// $('.animals').addClass('stop-layout');
		//弹窗
		$('.dialog-layer .dialog-p').text(server.msg);
		$('.dialog-layer').addClass('show');
		// $('.dialog-middle-box').detach(); // 删除x方的回合
		$('.dialog-middle-box').removeClass('red-team green-team').hide(); // 删除x方的回合

		if (server.side === 'a') { // 红方
			if (server.result === 1) { // 红输
				$('.dialog-side0').addClass('lose');
				$('.dialog-side0').data('each-result', 'lose');
				$('.dialog-side0').find('.dialog-box').addClass('animated bounceInDown');
				// $('.dialog-side1').addClass('win');
				resultFlag = 'lose';
			}
			if (server.result === 0) { // 绿输
				$('.dialog-side0').addClass('win');
				$('.dialog-side0').data('each-result', 'win');
				$('.dialog-side0').find('.dialog-box').addClass('animated bounceInDown');
				resultFlag = 'win';
				// $('.dialog-side1').addClass('lose');
			}
			else if (server.result === 2) {// 平局

				$('.dialog-side0').addClass('tie');
				$('.dialog-side0').data('each-result', 'win'); // 用于播放win音效
				$('.dialog-side0').find('.dialog-box').addClass('animated bounceInDown');
				resultFlag = 'tie';
				// $('.dialog-side1').addClass('tie');
			}
		}
		else if (server.side === 'b') { //绿方
			if (server.result === 1) { // 红输
				// $('.dialog-side0').addClass('lose');
				$('.dialog-side1').addClass('win');
				$('.dialog-side1').data('each-result', 'win');
				$('.dialog-side1').find('.dialog-box').addClass('animated bounceInDown');
				resultFlag = 'win';

			}
			if (server.result === 0) { // 绿输
				// $('.dialog-side0').addClass('win');
				$('.dialog-side1').addClass('lose');
				$('.dialog-side1').data('each-result', 'lose');
				$('.dialog-side1').find('.dialog-box').addClass('animated bounceInDown');
				resultFlag = 'lose';

			}
			else if (server.result === 2) {// 平局

				// $('.dialog-side0').addClass('tie');
				$('.dialog-side1').addClass('tie');
				$('.dialog-side1').data('each-result', 'win');
				$('.dialog-side1').find('.dialog-box').addClass('animated bounceInDown');
				resultFlag = 'tie';

			}


		}



		GAME.playAudioAni2($('.dialog-layer').data('each-result')); //音效

		//清除定时器
		clearInterval(timeInter2);
		$('.time-box').removeClass('show');
		// $('.give-up-box').removeClass('show');
		//隐藏‘你的回合&对手回合’
		// $('.turn-tip').hide();

		setTimeout(function () {

			$(".dialog-layer").removeClass('show');
			//    myInfo: {uid:'1867680522242',nickName:'name1',headPic:''},
			// opponentInfo: {uid:'1867653029890',nickName:'name2',headPic:''},
			console.log('gamover:', user1_info, user2_info, resultFlag, JSON.stringify(msgJson, null, 4))
			// showGameLevel(user1_info,user2_info,resultFlag,msgJson);

			var ms = 600;
			var int = 8;
			var mms = 33;
			var j = 0;
			if (resultFlag == 'lose') {
				ms = 400;
				int = 6;
				mms = 120;
				j = 1;
			}
			showGameLevel(user1_info, user2_info, resultFlag, msgJson, function () {
				setTimeout(function () {
					var i = j;
					var stars_tm = setInterval(function () {

						if (i > int) {
							clearInterval(stars_tm);
							$('.extra-span').css({ 'background-image': 'none' });
							// $('.i-to-ii').addClass('gray-start');

							return;
						} else if (i == 4 && resultFlag == 'lose') {
							$('.i-to-ii').css({ 'background-image': 'url(../public/images/game_level/star_lose7.png)' });

						}
						if (resultFlag == 'lose') {
							$('.extra-span').css({ 'background-image': 'url(../public/images/game_level/star_lose' + i + '.png)' });
						} else if (resultFlag == 'win') {
							$('.extra-span').css({ 'background-image': 'url(../public/images/game_level/star_win' + i + '.png)' });
						}

						i++;

					}, mms);
				}, ms);
			});

			// $('.dialog-layer').hide();

			// var body = {type : 204,op:26,roomId:roomId,uid:uid,gameType:2};

		}, 4000); // 赢or输，做了2秒动画

	},
	//设置当前side
	setCurrentSide: function (curSide) {
		$('.time-box').attr('now-side', curSide);
		// console.info($('.time-box').attr('now-side'))
	},
	getCurrentSide: function () {
		return $('.time-box').attr('now-side');
	},
	//处理对方动作消息
	otherSideOp: function (msgJson) {
		logInApp('==== otherSideOp');

		var step = msgJson.step;
		if (typeof msgJson.from !== 'undefined') {

			GAME.turnMySide();
			GAME.setCurrentSide(GAME.returnSide(msgJson));
		}

		switch (step) {
			case 0:
				//翻牌
				var from = msgJson.from;
				var cls = ".c" + from.x + from.y;
				GAME._showCard($(cls));
				break;
			case 1:
				//激活已经去掉
				var from = msgJson.from;
				var cls = ".c" + from.x + from.y;
				// GAME._activeCard($(cls));
				break;
			case 2:
				//走步
				var from = msgJson.from;
				var fromCls = ".c" + from.x + from.y;

				var to = msgJson.to;
				var toCls = ".c" + to.x + to.y;

				GAME._activeCard($(fromCls), true);
				GAME._move($(fromCls), $(toCls), true); // true: 接收的GAME._move()
				break;

			default:
				break;

		}
		logInApp('******* otherSideOp');

	},

	//棋子减一计数
	counter: function (side) {
		aNum[side] = aNum[side] - 1;
	},
	//数组
	isArry: function (arg) {
		var toString = Object.prototype.toString;
		return toString.call(arg) == '[object Array]';
	},
	//预加载图片
	getPreloadImg: function (images, callback) {
		var arrImg = [];
		var preImg = this.getPreloadImg.arguments[0];

		if (!this.isArry(images)) { return; }

		for (var i = 0; i < preImg.length; i++) {
			arrImg[i] = new Image();
			arrImg[i].src = preImg[i];
		}
		typeof callback == 'function' && callback();

	},
	//预加载音频
	getPreloadAudio: function (audios) {
		var arrAudio = [];
		var preAudio = this.getPreloadAudio.arguments[0];

		if (!this.isArry(audios)) { return; }

		for (var i = 0; i < preAudio.length; i++) {
			// arrAudio[i].src = preImg[i];
			// arrAudio[i] = new Audio([]);
			arrAudio[i] = new Audio(preAudio[i]);
			arrAudio[i].id = 'audio' + (1 + i);

			$('body').append(arrAudio[i]);

			// console.warn(arrAudio[i]);
		}
	},
	//关注
	clickFocus: function () {
		COMM.focus();
	},
	//背景音乐
	playAudioBg: function (_src) {


		// Show loading animation.
		audio1 = document.getElementById("audio_bg");
		audio1.loop = true;
		audio1.src = './source/' + _src + '.mp3';

		var playPromise = audio1.play();


	},
	//音频
	playAudioAni: function (_src) {

		audio2 = document.getElementById("audio_ani");
		audio2.src = './source/' + _src + '.mp3';

		audio2.play();
	},
	//动物音频
	playAudioAni2: function (_ani) {

		if (is_local) {  //本地调试，不进入声音
			return;
		}
		if (navigator.userAgent.toLowerCase().match(/(iphone|ipod|ios|ipad)/i)) {
			playVoice(soundMax[_ani]);
		}
		else if (navigator.userAgent.indexOf('Android') > -1 || navigator.userAgent.indexOf('Adr') > -1) {
			// $('.ref').html('before 》进入安卓playVoice')
			window.JsInterface.playVoice(soundMax[_ani]);
		}

	},
	//接收服务器消息
	_receiveMsg: function (head, body) {

		// alert(JSON.stringify(body));

		var mstType = head.type;

		if (mstType === 0) {
			//登录成功
			NetSoket.loginSuccess();
			// receviced.getUser1(body);
			if (body.op > 3) { //网络重连
				// throw new Error('body or body.op is undefined ..');
				return;
			}
			console.info('body.op:', body.op)
			var argSearch = window.location.search.match(/gameid=\w{1,}/ig);
			// var argSearch2 = window.location.search.match(/roomId=\w{1,}/ig);
			if (argSearch === null) {
				return;
			}
			gameId = argSearch[0].split('=')[1] + '';
			_roomId = roomId + '';
			// uid 从cookie拿 

			GAME.messgSend({ type: 204, roomId: _roomId, uid: uid, gameId: gameId, op: 1, gameType: 2 });

		}
		else if (mstType === 204) {
			//游戏指令
			if (typeof body === 'undefined') {
				console.log('body === undefined ');
				alert('body === undefined ');
				return;
			}
			var op = body.op

			switch (op) {
				case 3:
					// if ( !GAME.checkGameId(body.gameId) ) {
					// now_gameId = body.gameId; //设置本局gameId
					if (g_flag != 0) {
						gameId = body.gameId;
						g_flag = 0;
					}
					if (GAME.checkGameId(body.gameId)) {
						$(".com-medal-mask").remove();
						GAME.setProgress(3); //设置当前进程
						GAME.setLocalVar(body.gameId);  // net.js用到
						GAME.ready(body, body.side);
						GAME.init(body);
					}
					// }
					break;
				case 7:
					//开始
					if (GAME.checkGameId(body.gameId)) {

						GAME.startTips(op);
					}
					break;
				case 11:
					//游戏动作

					if (GAME.checkGameId(body.gameId)) {

						GAME.otherSideOp(body);
					}
					break;
				case 15:

					//游戏结束
					if (GAME.checkGameId(body.gameId)) {
						game_is_over = true;

						GAME.setProgress(15); //设置当前进程
						GAME.gameOver(body);

						// $.removeCookie('name'); //删除cookie
					}


					break;
				case 27:

					// GAME.resetVariable(); // reset
					//发送 （再来一局，成功后）
					// $('.again-btn').text('同意再来一局...');
					if (body.isRoomOpened < 1) {
						// alert('此房间已经关闭');
						//							$(".again-btn").removeClass('twinkling').addClass("disabled2 no-agn").html("对方已离开房间");
						$(".again-btn").addClass("disabled2 no-agn").html("对方已离开房间");
						// if (!is_local) {
						// 	backGameRoom() //客户端方法
						// }
						return;
					}
					//						$('.again-btn').text('接受对方邀请').addClass("twinkling").attr("agn",27);
					$('.again-btn').text('对方提出再战一局').attr("agn", 27);
					showBtnAnime();


					break;
				default:
					break;
			}
		}
	},
	checkGameId: function (gid, callback) {
		logInApp('====== 判断gameid 是否一样的方法checkGameId');

		console.log('======== checkGameId =========');
		// console.log('现在接收的gameId:'+now_gameId+'\n本局进入游戏的gameId:'+gid);
		// if (now_gameId != gid) {
		if (gameId != gid) {
			return 0;
		}
		return 1;
		logInApp('******* 判断gameid 是否一样的方法checkGameId');

	},
	setLocalVar: function (gid) {
		logInApp('======== setLocalVar');

		console.log('======== setLocalVar ========= gameId: ', gid);
		$.cookie('_gameId', gid);

		logInApp('********* setLocalVar');

	},
	resetVariable: function () { //重置变量
		// _GREEN = 1;
		// _RED = 0;
		// aNum={ 0 : 8, 1 : 8}
		// //点击某个棋子是，标识其上下左右是否可走 1 可走 0 不可走
		// dtop = dright = dbottom = dleft = 0;
		// mySide;
		// gameTimeLock = 1; // 1：锁住，0：解锁
		// lock_Audio = false; // 关掉音频

		window.location.reload();
		// $('.give-up-box').addClass('show');

	},
	start: function () {

		//匹配
		/* 【H5】op=1 */
		// alert(gameId)
		// GAME.messgSend({type : 204,gameId: gameId,op:1,gameType:2});

		//本地chrome 环境、调试
		if (window.location.href.match(/src\/games/ig) !== null) {   //本地环境
			is_local = true;
		}
		else { // 线上环境
			is_local = false;
		}


		$('#match').click(function () {
			$(this).text('匹配中。。。');
			var body = { type: 204, op: 26, roomId: 10, uid: 200089244, gameType: 2, side: abSide };
			// test();
			GAME.messgSend(body);
		});

		//点击关掉声音
		// GAME.clickVioce();
		// renderVioce();
		//关注
		// GAME.clickFocus();
		function triggerDialog(params, callback) {
			if (params == 1) {
				typeof callback === 'function' && callback();
			} else {
				$('.dialog-alert').hide();
				$('.dialog-layer2').hide();
			}
		}
		function showAlert() {
			$('.dialog-alert').show();
			$('.dialog-layer2').show();
		}
		//点击认输
		$('body').on('click', '#giveup-btn', function () {
			var side = $(this).attr('side');
			var result = side == 1 ? 0 : 1; //蓝 发 0，红 发 1；
			if (typeof side === 'undefined') { return; }

			showAlert();
			// GAME.gameOverSend(result);

		});
		//确定认输
		$('body').on('click', '.handler_alert', function () {
			var pram = $(this).data('handler');
			var side = $('#giveup-btn').attr('side');
			var result = side == 1 ? 0 : 1; //蓝 发 0，红 发 1；

			triggerDialog(pram, function () {
				GAME.gameOverSend(result);
				$('.dialog-alert').hide();
				$('.dialog-layer2').hide();
			});
		});

		// dfdf
		//翻牌
		$('.animals').on('click', '.hide', function () {

			if (turn % 2 != mySide) { //不是自己的回合
				console.info('turn % 2 != mySide')
				return;
			}
			if (lock_showCard) { return false; }


			console.info('l_showCard', lock_showCard)

			lock_showCard = true; //防止快速点击

			var ths = $(this);
			var index = $('.animal').index($('.active'));

			if ($('.animal').hasClass('active')) {
				console.info("$('.animal').hasClass('active'): index ==", index)

				// $('.animal').removeClass('active').eq(index).addClass('normal');
				console.info('翻牌===========$(\'.animal\').hasClass(\'active\') ==true; index: ', index + ' 执行： $(\'.next\').addClass(\'normal\')')
				console.info('翻牌===========$(\'.animal\').hasClass(\'active\') ==true; index: ', index + ' 执行： $(\'.animal\').removeClass(\'active next\').eq(index).addClass(\'normal\')')
				// 
				$('.next').addClass('normal');
				$('.deriction').remove();
				$('.animal').removeClass('active next').eq(index).addClass('normal');
				console.info('index:', index)
				lock_showCard = false;
				return;
			}

			var animate_complte = GAME._showCard(ths);
			var msg = { type: 2, op: 9, gameType: 2, gameId: gameId, from: { x: ths.data('coordinate').x, y: ths.data('coordinate').y }, to: { x: ths.data('coordinate').x, y: ths.data('coordinate').y }, "side": mySide, step: 0 };

			GAME.messgSend(msg);
			GAME.afterSend();//动作轮到对方


		});


		//点击棋子
		$('.animals').on('click', '.normal', function () {
			var ths = $(this);
			// console.info(mySide,ths.data('side'),'<=data(side)')
			if (mySide != ths.data("side")) {
				console.log('出现：mySide != ths.data("side"), return 跳出去了；')
				return;
			}
			GAME._activeCard(ths);

		});

		//移动到有其在的地方
		$('.animals').on('click', '.next', GAME.move);

		//移动到无棋子的地方
		$('.animals').on('click', '.die', GAME.move);



	},
	// 接收
	ready: function (body, abSide) {
		// alert('ready[server]');
		// alert(gameId);
		logInApp('======= ready');

		gameId = body.gameId
		// receviced.getUser1(body);

		receviced.getUser2(body, abSide);
		receviced.getUser1(body, abSide); //自己的头像昵称


		head = { type: 204, op: 5 };
		body1 = { op: 5, gameId: gameId, gameType: 2, uid: uid };
		GAME.sendMsg(head, body1);

		logInApp('********* ready');

	},


	loginSuccess: function (_uid, _nickname, _headpic) {
		// uid = _uid;
		// nickname = _nickname;
		// headpic = _headpic;
		console.info("login success...")
	},

	login: function (_token, _uid, _nickname, _headpic) {
		uid = _uid;
		nickname = _nickname;
		headpic = _headpic;
		var head = { type: 0, op: 1 };
		var body = { ssid: _token, uid: uid, pv: 16, phone: "13428967565", version: "1.1.1", netmode: 1, imei: "112223213123123", brand: 25 };
		var data = {};


		NetSoket.sendMsg(head, body);
	},

	messgSend: function (message) { // 接收websoket对象socket，发送message
		head = { op: message.op };
		GAME.sendMsg(head, message);

	},
	sendMsg: function (head, body) {
		body.gameType = gameType;
		body.roomId = roomId;
		head.type = csType;
		NetSoket.sendMsg(head, body);
	}
};




$(function () {
	FastClick.attach(document.body);
	setTimeout(function () {

		GAME.getPreloadImg([
			'./images/bg.png',
			'./images/elephant_r.png',
			'./images/elephant_b.png',
			'./images/lion_r.png',
			'./images/lion_b.png',
			'./images/tigger_r.png',
			'./images/tigger_b.png',
			'./images/wolf_r.png',
			'./images/wolf_b.png',
			'./images/dog_r.png',
			'./images/dog_b.png',
			'./images/cat_r.png',
			'./images/cat_b.png',
			'./images/mouse_r.png',
			'./images/mouse_b.png',
			'./images/animation_01.png',
			'./images/animation_02.png',
			'./images/animation_03.png',
			'./images/animation_04.png',
			'./images/icon_v2.png',
			'./images/ready.png',
			'./images/go0.png',
			'./images/go1.png',
			'./images/go2.png',
			'./images/go3.png',
			'./images/win.png',
			'./images/tie.png',
			'./images/lose.png',
			'./images/shot.png',
			'../public/images/game_level/win_txt@2x.png',
			'../public/images/game_level/lost_txt@2x.png',
			'../public/images/game_level/tie_txt@2x.png',
			'../public/images/game_level/star_win0.png',
			'../public/images/game_level/star_win1.png',
			'../public/images/game_level/star_win2.png',
			'../public/images/game_level/star_win3.png',
			'../public/images/game_level/star_win4.png',
			'../public/images/game_level/star_win5.png',
			'../public/images/game_level/star_win6.png',
			'../public/images/game_level/star_win7.png',
			'../public/images/game_level/star_win8.png',
			'../public/images/game_level/star_lose1.png',
			'../public/images/game_level/star_lose2.png',
			'../public/images/game_level/star_lose3.png',
			'../public/images/game_level/star_lose4.png',
			'../public/images/game_level/star_lose5.png',
			'../public/images/game_level/star_lose6.png',
			'../public/images/game_level/star_lose7.png'
		], function () {
			console.log('===== images has onload【getPreloadImg】 ')
			GAME.start();
		});
	}, 10);
});

/*********** 客户端调用方法 ********/

//【ios】App 调用
function startGame() {
	// alert('startGame into...');
	GAME.goGame();
}
// 麦克风

function voiceSwitch(status, hd_uid) { //hd_uid :红豆uid
	var $tsVioce;
	if (hd_uid == user1_info.uid) {
		$tsVioce = $('.user1 .voice');
	}
	else {
		$tsVioce = $('.user2 .voice');
	}

	if (status == 1) {
		$tsVioce.removeClass('no-voice');
	}
	else {
		$tsVioce.addClass('no-voice');
	}

}

function cutAllVioce() {
	lock_Audio = true;
}
/*
 *  调用客户端方法，把H5日志打印到客户端
 *  @param str 要打印的日志，字符串类型
 */
function logInApp(str) {
	var na = navigator.userAgent.toLowerCase();
	if (na.match(/(iphone|ipod|ios|ipad|mac os x)/i)) {
		if (!is_local) {
			writelog(str);
		}
	} else {
		if (!is_local) {

			window.JsInterface.writelog(str);
		}
	}
	// function writelog(){}
}

function test() {
	var myInfo = { uid: '1867680522242', nickname: 'name1', headPic: 'https://img.hongrenshuo.com.cn/1932626808834.png?t=1509353774000' },
		opponentInfo = { uid: '1867653029890', nickname: 'name2', headPic: 'https://img.hongrenshuo.com.cn/2017015029762.png?t=1509100364000' },
		data = {
			"currentGrade": {
				"grade": 2,
				"gradeName": "倔强青铜II",
				"gradePic": "http://res.uxin.com/default/pic_selfpage_label_noble_Ia3x.png",
				"showStar": 4,
				"star": 4
			},
			"gameId": "90178",
			"gameType": 3,
			"isFollow": false,
			"lastGrade": {
				"grade": 2,
				"gradeName": "倔强青铜II",
				"gradePic": "http://res.uxin.com/default/pic_selfpage_label_noble_Ia3x.png",
				"showStar": 3,
				"star": 5
			},
			"op": 15,
			"result": [
				{
					"score": 0,
					"uid": 2
				},
				{
					"score": 82,
					"uid": 1
				}
			]
		};

	var resultFlag = 'win';
	var ms = 400;
	var int = 8;
	var mms = 33;
	var j = 0;
	if (resultFlag == 'lose') {
		ms = 300;
		int = 6;
		mms = 120;
		j = 1;
	}
	showGameLevel(myInfo, opponentInfo, resultFlag, data, function () {
		setTimeout(function () {
			var i = j;
			var stars_tm = setInterval(function () {

				if (i > int) {
					clearInterval(stars_tm);
					$('.extra-span').css({ 'background-image': 'none' });
					// $('.i-to-ii').addClass('gray-start');

					return;
				} else if (i == 4 && resultFlag == 'lose') {
					$('.i-to-ii').css({ 'background-image': 'url(../public/images/game_level/star_lose7.png)' });

				}

				if (resultFlag == 'lose') {
					$('.extra-span').css({ 'background-image': 'url(../public/images/game_level/star_lose' + i + '.png)' });

				} else if (resultFlag == 'win') {
					$('.extra-span').css({ 'background-image': 'url(../public/images/game_level/star_win' + i + '.png)' });

				}

				i++;

			}, mms);
		}, ms);
	});

}