  const express= require('express');
  const app = express();
  app.use(express.json())
  const cors=require('cors');
  app.use(cors());
  const { exec, spawn } = require("child_process");
  const fs=require('fs');
  const bodyParser = require('body-parser');
  app.use(bodyParser.json());
  let userInput;
  let childProcess;
  
  app.post('/compile',(req,res)=>{
    let result;
    const lang=req.body.lang;
    
    // console.log(lang);
    
   
    if(lang=='java'){
      
    //   fs.writeFile("assets/test.java",code,(err)=>{
    //     if(err){
    //         console.log(err);
    //     }
    //     else{
    //         console.log("File written successfully\n");
    //         console.log("The written has the following contents:");
    //         console.log(fs.readFileSync("assets/test.java", "utf8"));
    //     }
    // })

    const javac = spawn('javac',['./assets/test.java']);
    javac.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });

    javac.on('close', (code) => {
      if (code== 0) {
        result=0;
        
        res.json("compiled successfully");
      }
      else{
        result=1;
        res.json("not compiled successfully");
      }
     
    
    });

    
    }
  
    else if(lang=='cpp'){
    // fs.writeFile("assets/test.cpp",'',function(){console.log('done')});
    // fs.writeFile("assets/test.cpp",code,(err)=>{
    //   if(err){
    //       console.log(err);
    //   }
    //   else{
    //       console.log("File written successfully\n");
    //       console.log("The written has the following contents:");
    //       console.log(fs.readFileSync("assets/test.cpp", "utf8"));
    //   }
  // })

    
      childProcess = spawn('g++', ['assets/test.cpp', '-o', 'test.exe']);
      
      childProcess.on('close', (code) => {
      if (code== 0) {
        console.error(`Compiled Successfully c`);
        return;
      }
      else{
        console.error(`Not Compiled Successfully`);
      }
     
    
    });
  }
  })
  
  app.post('/run',(req,res)=>{
    
   
      userInput=req.body.userInput || null;

    const lang=req.body.lang;
    if(lang=='java'){
      const java = spawn('java', ['-cp','assets','test']);
      java.stdin.write(`${userInput}\n`);
      java.stdout.on('data', (data) => {
        res.json(data.toString());
      });
  
      java.stderr.on('data', (data) => {
        res.json(`stderr: ${data}`);
      });
  
      java.on('close', (code) => {
        
        res.json(`java process exited with code ${code}`);
      });
    }

    else if(lang=='cpp'){
    
       
      
          const codeExecution = spawn('test.exe');
          process.stdin.on('data', (data) => {
            console.log();
            codeExecution.stdin.write(data);
          });
      
          codeExecution.stdout.on('data', (data) => {
            console.log(data.toString());
          });
      
          codeExecution.stderr.on('data', (data) => {
            console.error(data.toString());
          });
         
      
        
      
    }
 
  })
  app.listen(5000,()=>{
      console.log('listening');
  }
  )