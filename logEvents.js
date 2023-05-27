const {format}=require('date-fns')
const {v4:uuid}=require('uuid')

const fs=require('fs')
const fsPromise=require('fs').promises
const path = require('path')
// gg
const logEvent = async (msg,filetype) =>{
    const dateTime=`${format(new Date(),'yyyy:MM:dd\tHH:mm:ss')}`
    const logItem=`${dateTime}\t${uuid()}\t${msg}\n`
    console.log(logItem)
    //test 
    try{
        if(!fs.existsSync(path.join(__dirname,'logs'))){
            await fsPromise.mkdir(path.join(__dirname,'logs'))
        }
        await fsPromise.appendFile(path.join(__dirname,'logs',filetype),logItem)

    }catch(err){
        console.log(err)
    }
}

module.exports = logEvent