import * as Rx from 'rxjs';
import { addSyntheticTrailingComment } from 'typescript';
import { of,asyncScheduler,Subject,ReplaySubject,AsyncSubject,BehaviorSubject } from 'rxjs';
import { map, reduce, filter,count,observeOn } from 'rxjs/operators';
import { ajax } from 'rxjs/ajax';


//producer
var observable = Rx.Observable.create((observer:any)=>{
    try{
        observer.next("Hello ReacTX")
        observer.next("This is super fun")
        setInterval(()=>{
            observer.next("Love it!")
        },1000);//emits every 2 seconds
    } catch(err){
        observer.error(err)
    }
    
});

var observer1 = observable.subscribe( 
    (x:any) => addItem(x),
    (error:any) => addItem(error),
    () => addItem('Completed')
);

var observer2 = observable.subscribe( 
    (x:any) => addItem('Subscriber 2 ' + x)
);

//this will add observer 2 as child of observer 1, so when 1 is unsubscribed, 2 will also get unsubscribed
observer1.add(observer2);

setTimeout(() => {
    observer1.unsubscribe();
},1000);

//Operators
let nums = of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
let pipedemo = nums.pipe(
   filter(x => x % 2 === 0),
   reduce((acc, one) => acc + one, 0)
)
pipedemo.subscribe(
    (x:any) => addItem('Operator pipe, filter, reduce '+x)
);

let countdemo = nums.pipe(count());
countdemo.subscribe(
    (x:any) => addItem('Count Demo '+ x)
)

//Subject use-case to demo how it multi-casts and shares the results between multiple subscribers.
const subject_test = new Subject();

let final_val = ajax('https://jsonplaceholder.typicode.com/users').pipe(map(e => e.response));
let subscriber = final_val.subscribe(subject_test);

let sub1 = subject_test.subscribe({
   next: (v) => console.log(v)
});
let sub2 = subject_test.subscribe({
   next: (v) => console.log(v)
});

//Behaviour Subject - it gives the latest value when called
const behavior_subject = new BehaviorSubject("Testing Behaviour Subject"); 
behavior_subject.subscribe({
   next: (v) => addItem(`observerA: ${v}`)
});
behavior_subject.next("Hello");
behavior_subject.subscribe({
   next: (v) => addItem(`observerB: ${v}`)
});
behavior_subject.next("Last call to Behaviour Subject");

//replay subject - can buffer values and replay X values
const replay_subject = new ReplaySubject(2); 
// buffer 2 values 
replay_subject.subscribe({
   next: (v) => addItem(`Testing Replay Subject A: ${v}`)
});

replay_subject.next(1);
replay_subject.next(2);
replay_subject.next(3);
replay_subject.subscribe({
   next: (v) => addItem(`Testing Replay Subject B: ${v}`)
});

replay_subject.next(5);

//Last value is passed to the subscriber and it will be done after complete method is called
const async_subject = new AsyncSubject();
async_subject.subscribe({
   next: (v) => addItem(`Testing Async Subject A: ${v}`)
});
async_subject.next(1);
async_subject.next(2);
async_subject.complete();
async_subject.subscribe({
   next: (v) => addItem(`Testing Async Subject B: ${v}`)
});

//async scheduler - a scheduler controls the execution of when the subscription has to start and notified
var observable = Rx.Observable.create(function subscribe(subscriber:any) {
    subscriber.next("My First Observable");
    subscriber.next("Testing Observable");
    subscriber.complete();
 }).pipe(
    observeOn(asyncScheduler)
 );
 addItem("Observable Created");
 observable.subscribe(
    (x:any) => addItem(x),
    (e:any)=>addItem(e),
    ()=>addItem("Observable is complete")
 );
 addItem('Observable Subscribed');


function addItem(val:any){
    var node = document.createElement('li');
    var textnode = document.createTextNode(val);
    node.appendChild(textnode);
    document.getElementById("output").appendChild(node);
}