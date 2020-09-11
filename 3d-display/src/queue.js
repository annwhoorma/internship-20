export class Queue {
    constructor() { 
        this.items = []; 
    } 
    enqueue(item) {
        this.items.push(item); 
    }
    dequeue() {
        if(this.isEmpty()) 
            return "Underflow"; 
        return this.items.shift();
    }
    front() {
        if(this.isEmpty()) 
            return "No elements in Queue"; 
        return this.items[0]; 
    } 
    isEmpty() {
        return this.items.length == 0; 
    }
} 