/**
 * Created by 佳锐 on 2017/3/10.
 */
//使用express快速搭建web服务器
var express = require('express');
var path = require('path');
var app = express();
var server = require('http').createServer(app);
//使用socket.io监听事件
var io = require('socket.io').listen(server);

//对express配置时，从express3迁移到4的一些改变
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var multer = require('multer');
var methodOverride = require('method-override');
var errorHandler = require('errorhandler');

//设置日志级别
io.set('log level',1);
//在线人数
var onlineCount = 0;
//历史信息容器
var historyContent = [];

//socket监听连接事件
io.on('connection',function(socket){
    socket.emit('onlinepeople',onlineCount);
    socket.emit('historyContentDisplay',historyContent);
    onlineCount++;
    socket.emit('open');//通知客户端已连接
    //打印握手信息
    //console.log(socket.handshake);

    //构造客户端对象
    var client = {
        socket:socket,
        name:false,
        color:getColor()
    }

    //对message事件的监听
    socket.on('message',function(msg){
        //console.log("111");
        var obj = {
            time:getTime(),
            color:client.color
        };
        //判断是不是第一次连接，以第一条信息作为用户名
        if(!client.name){
            client.name = msg;
            obj['text']=client.name;
            obj['author']='System';
            obj['type']='welcome';
            console.log(client.name+'login');

            //返回欢迎语
            //触发事件，返回给客户端
            socket.emit('system',obj);
            //广播新用户登录
            socket.broadcast.emit('system',obj);
            //触发客户端的onlinepeople事件
            socket.emit('onlinepeople',onlineCount);
        }else{
            //如果不是第一次的连接，正常的聊天消息
            obj['text']=msg;
            obj['author']=client.name;
            obj['type']='message';
            console.log(client.name+'say:'+msg);
            //返回消息
            //触发事件
            socket.emit('message',obj);
            //广播向其他用户发消息
            socket.broadcast.emit('message',obj);
        }
        //console.log(client.name);
        console.log("在线人数:"+onlineCount);
        historyContent.push({
           'author':obj['author'],
            'time':obj['time'],
            'msg':msg,
            'type':obj['type']
        });
        console.log(historyContent);
    });
    //监听退出事件
    socket.on('disconnect',function(){
        onlineCount--;
       var obj = {
         time:getTime(),
           color:client.color,
           author:'System',
           text:client.name,
           type:'disconnect'
       };
        historyContent.push({
            'author':obj['author'],
            'time':obj['time'],
            'msg':obj['text'],
            'type':obj['type']
        });

       //广播用户已退出
        socket.broadcast.emit('system',obj);
        console.log(client.name+'Disconnect');
    });
});
//express基本配置
app.set('port',process.env.PORT || 3000);
app.set('views',__dirname+'/views');
// app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser());
app.use(methodOverride());
//使用express发送css js等静态资源
app.use(express.static(path.join(__dirname, 'public')));

if ('development' == app.get('env')) {
    app.use(errorHandler());
}

//指定websocket的客户端的html文件
//express获得get请求时将chat.html文件返回给浏览器
app.get('/',function(req,res){
    res.sendfile('views/chat.html');
});
//服务器监听端口
server.listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});

var getTime=function() {
    var date = new Date();
    return date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
};

var getColor=function(){
    var colors = ['aliceblue','antiquewhite','aqua','aquamarine','pink','red','green',
        'orange','blue','blueviolet','brown','burlywood','cadetblue'];
    return colors[Math.round(Math.random() * 10000 % colors.length)];
};