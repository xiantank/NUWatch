/*chrome.app.runtime.onLaunched.addListener(function() {
 console.log("runtime.onLaunched");
 });*/
var host = "140.123.101.185:3009";
var web_host="http://"+host;
var ws_host="ws://"+host;
var id_host = 'http://140.123.101.185:9527';
var keyword_service = 'http://www.cs.ccu.edu.tw/~cht99u/key.php';

/*chrome.browserAction.setPopup({
        popup: "popup.html"
    });*/
chrome.browserAction.onClicked.addListener(function (){//TODO show list to select what to do;
	var searchUrl = chrome.extension.getURL('search.html');
	
		chrome.tabs.create({url: searchUrl});
});
/*debug*/
var webs={};
webs = new Wsclient(ws_host, "notify" , {intervalTime:3000});
chrome.runtime.onInstalled.addListener(function(details) {
//chrome.runtime.onStartup.addListener(function(details) {
	/*chrome.tabs.query({}, function(tabs) {
		for(var i in tabs){
			chrome.tabs.reload(tabs[i].id,{bypassCache: true});
		}
	});*/
	/*if(details.reason == "install"){
        console.log("This is a first install!");
    }else if(details.reason == "update"){
        var thisVersion = chrome.runtime.getManifest().version;
        console.log("Updated from " + details.previousVersion + " to " + thisVersion + "!");
        chrome.tabs.query({}, function(tabs) {
		for(var i=0;i<tabs.length&&i<10;i++){
			if(tabs[i].url == "chrome://extensions/"){
				continue;
			}
			chrome.tabs.reload(tabs[i].id);
			//console.log(tabs[0].id);
		}
		});
    }*/
    //chrome.storage.local.remove('content',function(){console.log("remove content @ extension inital");});
    chrome.storage.local.clear(function(){console.log("clear all @ extension inital");});
    localStorage.clear();
    chrome.history.search({
			text : '',
			startTime : 0,
			endTime : Date.now(),
			maxResults : 1e9
		}, function(data) {
			var tmp = [];
			for (var i in data) {
				tmp[i] = {};
				tmp[i].url = data[i].url;
				tmp[i].title = data[i].title;
				localStorage.setItem(tmp[i].url,JSON.stringify(tmp[i]));
				//tmp[i].visitCount = data[i].visitCount;
			}
			// console.log(JSON.stringify(tmp));
			console.log(tmp);
			//$("#tabList").html(JSON.stringify(tmp));
			/*
			 * sendObj = {};
			 * sendObj.urls=tmp;
			 * sendObj.type="history"
			 * sendObj.version=1;
			 * sendObj.uid=identifyId;
			 */
			
			/* get bookmarks */
			
			
		

		function traversalBookmark(bookmarks) {
			//bookmarks.forEach(function(bookmark) {
			for (var i in bookmarks) {
				if (bookmarks[i].children) {
					//console.log(">>>"+bookmarks[i].title);
					//str += ">>>" + bookmarks[i].title + "<br/>\n";
					traversalBookmark(bookmarks[i].children);
				} else {
					var obj = {};
					//console.log( bookmarks[i].title + "[" +bookmarks[i].url + "]");
					obj.url = bookmarks[i].url;
					obj.title = bookmarks[i].title;
					var result = arrayObjectIndexOf(tmp, "url", obj.url);
					if(result === -1){
						tmp.push(obj);
						localStorage.setItem(obj.url,JSON.stringify(obj));
					}
					//str += bookmarks[i].title + "[" + bookmarks[i].url + "]<br/>\n";
				}

			}
		}


		(function(tmp){
			chrome.bookmarks.getTree(function(bookmarks) {
				traversalBookmark(bookmarks);
				
				}); 
	}(tmp) );

		});
	//console.log("should be all reload");

}); 

chrome.runtime.onStartup.addListener(function() {
}); 


 /*debug*/
chrome.extension.onMessage.addListener(function(request, sender) {
	if (request.action == "getSource") {
		chrome.tabs.query({}, function(tabs) {
		for(var i in tabs){
			chrome.tabs.sendMessage(tabs[i].id, {// send to each tab's content_script
							action : "getSource"
						},function(){
							//console.log(tabUpdate.id+" sendGetSourceMessage done");
							if(chrome.runtime.lastError){
								console.log("error: "+chrome.runtime.lastError.message);
							}
						});

		}
	});
		console.log("send to get  source");
		//console.log(request.source);
	}
	else if(request.action == "isSource"){
		
		console.log(request.url);
		//console.log(request.source);
		var obj={url:request.url,content:request.source,title:request.title};
		//obj[request.url]=request.url;
		(function(obj){
			
			var saveFunc = function(webDataObj) {
				return function(data) {
					if (data) {//TODO check data
						/* check data*/
					}
					var obj2 = {};
					
					webDataObj.keyword = data || "";
					
					///* just test line*/ webDataObj.content='';
					
					
					
					
					//TODO this has terrible performance
					matchTag = /(<script(.*?)>(.|[\r\n])*?<\/script>)|(<style(.*?)>(.|[\r\n])*?<\/style>)/g; 
					webDataObj.content = webDataObj.content.replace(matchTag,"");
					matchTag =/<(?:.|s)*?>|nbsp;/g ;
					webDataObj.content = webDataObj.content.replace(matchTag,"");
					


					obj2[webDataObj.url] = webDataObj;
					var item = localStorage.getItem('keyword');
					if(!item){
						item = JSON.stringify([]);						
					}
					item = JSON.parse(item);
					var result = arrayObjectIndexOf(item, "keyword", webDataObj.keyword);
					if(result === -1){
						keywordCnt = 0;
						item.push({keyword:webDataObj.keyword,cnt:++keywordCnt} );						
					}
					else{
						item[result].cnt++;
					}
					
					//TODO sort keyword: arr.sort(function(a,b){return a.cnt - b.cnt}) // TODO move to show keyword page
					/*if(localStorage.getItem("") === null){
						console.log('first set webs');
						localStorage.setItem(webs,JSON.stringify(webDataObj) );
					}*/
					console.log(webDataObj.url);
					//console.log(JSON.stringify(webDataObj));
					localStorage.setItem('keywords',JSON.stringify(item));
					localStorage.setItem(webDataObj.url,JSON.stringify(webDataObj) );
					
					/*chrome.storage.local.set(obj2, function() {
					});*/
				};
			}; 

			
			//contentSave = {url:url,content:content};
			var tmpObj = {};
			tmpObj = localStorage.getItem(obj.url);
			tmpObj && (tmpObj = JSON.parse(tmpObj ) );
			if(tmpObj && tmpObj.keyword)  return;
			
			$.ajax({
					type : 'GET',
					//url : host + "/tabs/save/",
					url : keyword_service,
					//data : JSON.stringify(saveInfo),
					contentType : "text/plain",
					// contentType: "application/json",
					//dateType:'text',
					success : saveFunc(obj),
					error : function(data) {
						console.log("fail" + JSON.stringify(data));
					}
			});
		})(obj);
	}
	else if(request.msg){
		console.log("msg: "+request.msg);
	}
	else if(request.openUrls){}
	else  {
		console.log(request);
		//console.log(request.source);
	}
	
});
function getmesage(opt) {//should be websocket.onmessage
	chrome.notifications.create("id" + Math.random(), opt, function(id) {
		console.log("createID:" + id);
	});
	//this wii put to get message from notifications
	chrome.browserAction.setBadgeBackgroundColor({
		color : [255, 0, 0, 0]
	});
};
chrome.notifications.onClicked.addListener(replyBtnClick);
function replyBtnClick(notificationId) {
	console.log("id:" + notificationId);
	chrome.browserAction.setBadgeText({
		text : ""
	});
	chrome.tabs.create({//TODO should go to our website
		url : "http://www.cs.ccu.edu.tw/"
	});
	chrome.notifications.clear(notificationId, function(wasCleared) {
	});

};

// chrome.tabs.onCreated.addListener(function(tab){
	// //test
	// chrome.storage.local.get(null, function(items) {
			// if(!items.yo){
				// items.yo=[];
			// }
			// items.yo.push('a');
			// chrome.storage.local.set(items,function(){});
			// console.log('a'+JSON.stringify(items));
		// });
// 	
	// //test
// });
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	

	if (changeInfo.status == 'complete') {//TODO sent restful request to server
		console.log("tabs.onUpdated:[" + tab.url + "] id: " + tabId + "  status: " + changeInfo.status);
	}
});

// chrome.tabs.onCreated.addListener(function(tab) {
	// console.log("tabs.onCreated: " + tab.url);
// });

function Wsclient(wsURL, wsProtocol, option, callback) {
	if(!option) option={};
	console.log("create ws");
	var ws;
	var intervalTime = option.intervalTime || 10000;
	var connect = function() {
		ws = new WebSocket(wsURL, wsProtocol);
		webs.ws = ws;
		
		ws.onmessage = function(e) {
			console.log(e.data);
			try {
				receiveJson = JSON.parse(e.data);
			} catch(e) {
				console.log("JSON parse error at Wsclient.onmessage()");
				return false;
			}

			if (receiveJson.title) {
				var message = receiveJson.message || "";
				var opt = {
					type : "basic",
					title : receiveJson.title,
					message : message,
					iconUrl : "icon.png" //TODO change good icon

				};
				getmesage(opt);
			}
			var notiNum = receiveJson.notificationNum;
			if(notiNum>999)notiNum = '999+';
			if(notiNum == 0)notiNum = '';
			chrome.browserAction.setBadgeText({
				text : "" + notiNum
			});

			
		};
		ws.onclose = function(e) {
			console.log("ws close");
			ws = null;
			setTimeout(connect,intervalTime);						
		};
		ws.onopen = function(e) {//TODO auth!
			/* testing by not really uid*/
		
			$.get(id_host + "/id/get/", function(data) {
				//console.log('DATA',data);
				//chrome.tabs.sendMessage(targetTab.id, {type: 'id', data: data});
				if (data != null) {
					//ws.send(JSON.stringify(auth_data));
					ws.send(JSON.stringify({type:"verify",uid:data}));
					//console.log(data);
				} else {
					//turn login page by chrome.tabs.create();
				}
			}); 

			/* just testing ,use mine uid*/
			//ws.send(JSON.stringify({type:"verify",uid:5567}));
			/* testing end */
			console.log("ws open");
		};
		ws.onerror = function(e) {
			console.log("something wrong in ws");
		};
	}; 
	connect();

	//TODO auth method
	/*
	 $.get(WWW_HOST+"/ws/users/me", function(data) {
	 //console.log('DATA',data);
	 //chrome.tabs.sendMessage(targetTab.id, {type: 'id', data: data});
	 if(!=null){
	 ws.send(JSON.stringify(auth_data));
	 }
	 else{
	 turn login page by chrome.tabs.create();
	 }
	 });*/
	
	
	
	return {ws:ws};
}
function arrayObjectIndexOf(myArray, property , searchTerm) {
    for(var i = 0, len = myArray.length; i < len; i++) {
        if (myArray[i][property] === searchTerm) return i;
    }
    return -1;
}

