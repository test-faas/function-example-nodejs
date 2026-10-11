const http = require('node:http');
const events=[];
http.createServer((req,res)=>{
 if(req.url==='/healthz'){res.end('ok');return;}
 if(req.url==='/audit-events'){res.setHeader('Content-Type','application/json');res.end(JSON.stringify(events));return;}
 let body='';req.on('data',chunk=>body+=chunk);req.on('end',()=>{
  const record={method:req.method,path:req.url,id:req.headers['ce-id'],type:req.headers['ce-type'],subject:req.headers['ce-subject'],body};
  events.push(record);if(events.length>100)events.shift();console.log(JSON.stringify(record));res.setHeader('Content-Type','application/json');res.end(JSON.stringify({ok:true}));
 });
}).listen(process.env.PORT||8080,'0.0.0.0');
