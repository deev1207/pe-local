const { spawn } = require('child_process');
const fs = require('fs');


async function main(){
    const rubric_result = JSON.parse(fs.readFileSync('rubric.json', 'utf8'));
    preparePayload(rubric_result);
    for(const test of rubric_result.criteria.blackboxtests){
        const input = test.rule.input;
        const output = await run(input, "test");
        if (output.message.trim() === test.rule.output) {
            test.result.PASS = true;
            test.score = (rubric_result.weightage.blackboxtests / rubric_result.criteria.blackboxtests.length);
            
        }

        else {
            test.result.ERROR = true;
            test.result.violations.push(`expected:<${test.rule.output.trim()}> but was:<${output.message.trim()}>`);
            test.score=0;
        }

        if(output.status === "error"){
            test.result.ERROR = true;
            test.result.violations.push("runtime error");
        }
        
    }

    for(const test of rubric_result.criteria.evalblackboxtests){
        const input = test.rule.input;
        const output = await run(input, "test");
        if (output.message.trim() === test.rule.output) {
            console.log(test.result);
            test.result.PASS = true;
            test.score = (rubric_result.weightage.blackboxtests / rubric_result.criteria.blackboxtests.length);
        }
        
        else {
            test.result.ERROR = true;
            test.result.violations.push(`expected:<${test.rule.output.trim()}> but was:<${output.message.trim()}>`);
            test.score=0;
        }
        
        if(output.status === "error"){
            test.result.violations.push("runtime error");
        }
        
    }

    fs.writeFileSync("rubric_results.json", JSON.stringify(rubric_result), "utf8", function (err) {
                
        if (err) {
          console.log(err);
          return;
        }
        console.log("File successfully updated.");
      });
}

function run(input, fileName){
    return new Promise((resolve)=>{
        const java = spawn('java', ['-cp', 'assets', fileName]);
      
        // Pass the input defined in the test case to the Java code via stdin
        java.stdin.write(`${input}\n`);
    
        // Capture the output of the Java code from stdout
        let output = '';
        let error = "";
    
        java.stdout.on('data', (data) => {
          output += data.toString();
        });
    
    
        java.stderr.on("data", (data)=>{
            error = error +data;
        });
    
        java.on('close', (code) => {
            if(code === 0){
                resolve({
                    status:"success",
                    message: output
            });
            }
    
            resolve(
                {   
                status:"error",
                message: error
                }
            );
        });
    })
    
}


function preparePayload(rubric_result){
    rubric_result.criteria.blackboxtests.forEach((test)=>{
       test.result= {
            "PASS": false,
            "ERROR": false,
            "violations": []
        }
    });

    rubric_result.criteria.evalblackboxtests.forEach((test)=>{
        test.result= {
             "PASS": false,
             "ERROR": false,
             "violations": []
         }
     });
}

main();