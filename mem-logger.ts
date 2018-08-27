
export default class MemLogger {
  constructor(){
    this.logHeap();
  }

  private logHeap(){
    let used;
    used = process.memoryUsage().heapUsed / 1024 / 1024;
    console.log(`Used Memory: ${used.toFixed(2)} MB`);
    setTimeout(()=>{
      this.logHeap();
    }, 2000);
  }
}