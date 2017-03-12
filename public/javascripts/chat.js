/**
 * Created by 佳锐 on 2017/3/10.
 */
$(function(){
    var content = $('#content');
    var status = $('#status');
    var input = $('#input');
    var online = $('.onlinepeople');
    var myName = false;

    //建立websocket连接
    socket = io.connect('http://localhost:3000');
    //收到server的连接确认
    socket.on('open',function(){
        status.text('Choose a name:');
    });

    //监听system事件，判断welcome或者disconnect,打印系统消息信息
    socket.on('system',function(json){
        var p = '';
        if (json.type === 'welcome'){
            if(myName == json.text) status.text(myName + ': ').css('color', json.color);
            p = '<p style="background:'+json.color+'">system @ '+ json.time+ ' : Welcome ' + json.text +'</p>';
        }else if(json.type == 'disconnect'){
            p = '<p style="background:'+json.color+'">system @ '+ json.time+ ' : Bye ' + json.text +'</p>';
        }
        content.prepend(p);
    });

    socket.on('onlinepeople',function(onlineCount){
           online.text('');
            var  p = '<h2 style="margin-left:50px;">在线人数：'+onlineCount+'</h2>';
            online.prepend(p);
    });

    socket.on('historyContentDisplay',function(historyConten){
        if(historyConten.length != 0) {
            for (var i = 0; i < historyConten.length; i++) {
                if(historyConten[i].type == 'welcome'){
                    var p = '<p><span style="color:'+historyConten[i].color+';">' + historyConten[i].author+'</span> @ '+ historyConten[i].time+ ' : Welcome '+historyConten[i].msg+'</p>';
                    content.prepend(p);
                } else if(historyConten[i].type == 'disconnect'){
                    var p = '<p><span style="color:'+historyConten[i].color+';">' + historyConten[i].author+'</span> @ '+ historyConten[i].time+ ' : Bye'+historyConten[i].msg+'</p>';
                    content.prepend(p);
                } else{
                    var p = '<p><span style="color:'+historyConten[i].color+';">' + historyConten[i].author+'</span> @ '+ historyConten[i].time+ ' : '+historyConten[i].msg+'</p>';
                    content.prepend(p);
                }
            }
            return;
        } else{
            return;
        }
    });
    //发送事件到服务端
    //监听message事件，打印消息信息
    socket.on('message',function(json){
        var p = '<p><span style="color:'+json.color+';">' + json.author+'</span> @ '+ json.time+ ' : '+json.text+'</p>';
        content.prepend(p);
    });

    //通过“回车”提交聊天信息
    input.keydown(function(e){
        if(e.keyCode == 13){
            var msg = $(this).val();
            if(!msg){
                return;
            }
            socket.send(msg);//将msg发送到服务器端
            $(this).val('');
            if(myName === false){
                myName = msg;
            }
        }
    });
});