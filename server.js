const logEvent=require('./logEvents')
const http = require('http')
const fs =require('fs')
const fsPromise =require('fs').promises

const EventEmitter =require('events')
const path = require('path')
class Emitter extends EventEmitter{};

const myEmitter=new Emitter()
myEmitter.on('log',(msg,filetype)=>logEvent(msg,filetype))

const PORT =process.env.PORT || 3500;

const servFile =async (filepath,contentType,response)=>{
    try{
        const rawdata=await fsPromise.readFile(
            filepath,
            !contentType.includes('image') ? 'utf8':''
            );
        const data = contentType ==='application/json'
            ? JSON.parse(rawdata):rawdata;
        response.writeHead(
            filepath.includes('404.html')?404:200,{'Content-Type':contentType})
        response.end(
            contentType ==='application/json' ? JSON.stringify(data):data
        )
    }catch(err){
        console.log(err)
        response.statusCode=500
        response.end()
        myEmitter.emit('log',`${err.name}\t${err.message}`,'errLog.txt')
    }
}

const server=http.createServer((req,res)=>{
    console.log(req.url,req.method)
    myEmitter.emit('log',`${req.url}\t${req.method}`,'reqLog.txt')
    const extention=path.extname(req.url)
    let contentType
    console.log(extention)
    switch(extention){
        case '.css':
            contentType='text/css';
            console.log('file type css')
            break;
        case '.js':
            contentType='text/javascript';
            console.log('file type js')
            break;
        case '.json':
            contentType='application/json';
            console.log('file type json')
            break;
        case '.jpeg':
            contentType='image/jpeg';
            console.log('file type jpg')
            break;
        case '.png':
            contentType='image/png';
            console.log('file type png')
            break;
        case '.txt':
            contentType='text/plain';
            console.log('file type text')
            break;
        default:
            contentType='text/html'
    }

   
 

    let filepath=
        contentType==='text/html' && req.url==='/'
        ? path.join(__dirname,'views','index.html')
        : contentType==='text/html' && req.url.slice(-1) ==='/'
            ? path.join(__dirname,'views',req.url,'index.html')
            : contentType === 'text/html'
                ? path.join(__dirname,'views',req.url) 
                : path.join(__dirname,req.url); 
    
    if(!extention && req.url.slice(-1) !== '/') filepath += '.html' 

    const isFileExist  = fs.existsSync(filepath)

    if(isFileExist){
        servFile(filepath,contentType,res)
    }else{
        switch(path.parse(filepath).base){
            case 'old-page.html':
                res.writeHead(301,{'Location' : '/new-page.html'})
                res.end()
                break;
            case 'www-page.html':
                res.writeHead(301,{'Location' :'/'})
                res.end()
                break;
            default:
                servFile(path.join(__dirname,'views','404.html'),'text/html',res)
        }
    }


    // switch(req.url){
    //     case '/'||'index.html':
    //         res.statusCode=200
    //         res.setHeader('Content-Type','text/html')
    //         fs.readFile(path.join(__dirname,'views','index.html'),(err,data)=>{
    //             if(err) res.statusCode=404
    //             res.end(data)
    //         })
    //         break; 
    // }


    // if(req.url === '/' || req.url === 'index.html'){
    //     res.statusCode =200;
    //     res.setHeader('Content-Type','text/html')
    //     filepath=path.join(__dirname,'views','index.html')
    //     fs.readFile(filepath,'utf8',(err,data)=>{
    //         if(err) {
    //             res.statusCode = 404
    //         } 
    //         res.end(data)
    //     })
    // }
})


server.listen(PORT,()=>console.log(`Server Runing on Port ${PORT}`))


// 
// 
