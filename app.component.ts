import { OnInit, OnChanges, ViewChild, ElementRef } from '@angular/core';
import { Component } from '@angular/core';
import loader from '@monaco-editor/loader';
import { HttpClient } from '@angular/common/http';
import { io } from 'socket.io-client';
import { Terminal } from 'xterm';
import { WebLinksAddon } from 'xterm-addon-web-links';  

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnChanges{

  constructor(private http: HttpClient){}

  fontsize: number = 18;
  tabsize: number = 4;
  code: string= '//Type your code here.'; //Contains Code Inside the File.
  fileHandle : any = null;
  showResultBox = false;
  finalResult: any;
  isfileUploaded: boolean = false;
  uploadFileName: string;
  term:any = new Terminal();
  tabNameVisible: boolean = false;
  fileExtension: string = "";
  SelectedLanguage: string = "C++";
  showProcessingMsg: boolean = false;
  showProcessingAiMsg:boolean=false;
  processingMsg: any = "";
  processingAiMsg: any = "";
  runDisabled: boolean = true;
  socket = io("http://localhost:3000")


  ngOnInit(){
    try{
      this.code = localStorage.getItem('code');
    }
    catch{
      this.code = '//Type your code here.'; //Contains Code Inside the File.
    }
    loader.config({
      paths: {
        vs: './',
      }
    });

    this.socket.on('connect', ()=>{
      console.log(`Connected with: ${this.socket.id}`)
    })
  }

  ngOnChanges(){
    console.log(this.code)
    localStorage.setItem('code', this.code);
  }

  editorOptions = {theme: 'vs-dark', 
                  language: 'cpp', 
                  renderIndentGuides: true, 
                  fontSize: this.fontsize, 
                  tabSize: this.tabsize,
                  wordWrap: "on"};


  async uploadFileUsingFileSystemAPI(){
    [this.fileHandle] = await (window as any).showOpenFilePicker();
    const file: File = await this.fileHandle.getFile();
    const contents = await file.text();
    if(this.fileHandle != null){
      this.isfileUploaded = true;
      this.uploadFileName = this.fileHandle.name;
      this.tabNameVisible = true
      this.finalResult = "";
      this.showResultBox = false;
    }
    this.code = contents;
    localStorage.clear();
    localStorage.setItem('code', this.code);

  }

  async saveFileUsingFileSystemAPI(){
    const contents = this.code;
    const writable = await this.fileHandle.createWritable();
    await writable.write(contents);
    await writable.close();
  }

  compileCode(){
    this.term.open(document.getElementById('terminal'));
    this.finalResult = "";
    this.socket.emit('compile-code', this.code)

    this.socket.on("compile-code-msg", async res => {
      if(res == "Success!"){
        this.runDisabled = false;
        this.showProcessingMsg = true;
        this.processingMsg = "Compilation Successful.";
      }
      else{
        this.showProcessingMsg = true;
        this.processingMsg = res;
      }
    })
  }

  runCode(){
    this.term.reset()
    this.showProcessingMsg = false;
    this.processingMsg = "";
    
    this.socket.emit("run-code")

    this.socket.on("code-output", output => {
      this.term.write(output);
    })

    this.term.onKey((e) => {
      console.log(e)
      console.log(e.key)
      if(e == 'keydown')
        this.term.write(e.key);
      this.socket.emit('send-input-value', e.key)
    })
  }

  resetEditor(){
    this.fileHandle = null;
    this.finalResult = "";
    this.showResultBox = false;
    this.uploadFileName = "";
    this.fileExtension = "";
    window.location.href = window.location.href;
  }

  debug(){
    this.socket.emit('debug-code', this.code);
    this.socket.on('gpt-response', output => {
      console.log('debug',output);
    })

  }

  compileWithAi(){
    this.term.open(document.getElementById('terminal'));
    this.finalResult = "";
    this.socket.emit('compile-Ai', this.code)

    this.socket.on("compile-Ai-msg", async res => {
      if(res == "Success!"){
        this.runDisabled = false;
        this.showProcessingAiMsg = true;
        this.processingAiMsg = "Compilation Successful.";
      }
      else{
        this.showProcessingAiMsg = true;
        this.processingAiMsg = res;
      }
    })
  }
}