db
//mydb 데이터베이스 생성
use mydb
db

show dbs

//mydb 에 collection( ==TABLE) 을 생성해보자
db.createCollection("employees",{capped:true,size:10000})
//capped:true ==> 저장공간이 차면 기존 공간을 재사용하겠다는 설정
//삭제
db.employees.drop()

db
show collections
show dbs
//조회
db.employees.find()

db.employees.isCapped()

db.employees.stats();

db.employees.renameCollection("emp")

show collections

//컬렉션 삭제 db.컬렉션이름.drop()
db.emp.drop()
show collections

//capped 옵션 살펴보기
//컬렉션 생성
db.createCollection("cappedCollection", {capped:true,size:10000})
//capped:true => 최초 제한된 크기로 생성된 공간에서만 데이터를 저장하는 설정
//size:10000 ==> 10000보다는 크고 가장가까운 256배수로 maxsize가 설정 된다
show collections
db.cappedCollection.find()
db.cappedCollection.stats()

//도큐먼트(==row)를 size 초과하도록 반복문 이용해서 넣어보자.
for(i=0;i<1000;i++){
     db.cappedCollection.insertOne({x:i})   
}

db.cappedCollection.find()
db.cappedCollection.find().count()
//처음 넣었던 데이터들이 사라진 것을 확인 할 수 있다.
db.cappedCollection.isCapped()
//==============================================

//CRUD
/*[1] Create :
        - insertOne({}) : 한 개의 document 생성
        - insertMany([{}, {}, {}, ...]) : 여러 개의 document 생성
           db.emp.insertOne({ <----- collection (table)
                  id: 'a001', <----- field ----+ (column) +
                  name:'James',<---- field ----+ (column) +--------- document (record)
                  dept:'Sales' <---- field ----+ (column) +
           })
*/
use mydb
db.createCollection('member')
show collections

db.member.find()
db.getCollection('member').find()
db.member.insertOne({
    name:'김민준',
    userid:'min',
    tel:'010-2920-2020',
    age:20
})
db.member.find()

/*
_id 필드가 자동으로 생성된다. document의 유일성을 보장하는 키
    전체 : 12 byte
        ____ 4byte : 현재 timestamp => 문서 생성 시점
        ___  3byte : machine id
        __   2byte : mongoDB 프로세스 id
        ___  3byte : 일련번호
*/

db.member.insertOne({
    _id:1,
    name:'홍길동',
    userid:'hong',
    tel:'011-2020-3131',
    age:22
})
db.member.find()

//document를 bson으로 반환하여 mongoDB에 저장
//_id : primary key같은 기능으로 자동으로 index가 생성된다. ==> 검색을 빠르게 할 수 있다.


//다중 도큐먼트 레코드를 저장해보자
db.member.insertMany([
    {name:'이민수', userid:'Lee', age:23},
    {name:'홍길동', userid:'Hong', tel:'010-2020-0313', age:24},
    {name:'최민자', userid:'Choi', tel:'011-5510-5313', age:25},
])
db.member.find()

db.member.insertOne({name:'표진우', userid:'Pyo', passwd:'123', grade:'A'})

db.user.insertMany([
    {_id:3, name:'김철', userid:'kim1', passwd:'1111'},
    {_id:2, name:'최철', userid:'choi1', passwd:'1111'},
    {_id:5, name:'김철', userid:'kim1', passwd:'1111'}   
], {ordered:false})
//ordered 옵션 : 기본값 true, 순서대로 insert 할지 여부 지정.
//false를 주면 순서대로 입력하지 않음.
db.user.find()

/*
[실습1]---------------------------------------------------------------------
1. boardDB생성
2. board 컬렉션 생성
3. board 컬렉션에 name 필드값으로 "자유게시판"을 넣어본다
4. article 컬렉션을 만들어 document들을 삽입하되,
   bid필드에 3에서 만든 board컬렉션 자유게시판의 _id값이 참조되도록 처리해보자.

5. 똑 같은 방법으로 "공지사항게시판"을 만들고 그 안에 공지사항 글을 작성하자.
--------------------------------------------------------------------------
*/

use boardDB
db
db.board.drop()
db.article.drop()

freeboard_res=db.board.insertOne({name:'자유게시판'})
//freeboard_res에는 자유게시판의 도큐먼트의 _id값이 담긴다. 
freeboard_id=freeboard_res.insertedId

db.article.insertMany([
    {bid:freeboard_id, title:'자유게시판 첫번째 글', content:'안녕하세요', writer:'kim'},
    {bid:freeboard_id, title:'자유게시판 2번째 글', content:'반가워요', writer:'hong'},
    {bid:freeboard_id, title:'자유게시판 3번째 글', content:'mongoDB', writer:'choi'}
])

db.article.find()

notice_res=db.board.insertOne({name:'공지사항'})
notice_id=notice_res.insertedId

db.notice.insertMany([
    {bid:notice_id, title:'공지 첫번째 글', content:'[공지]안녕하세요', writer:'kim'},
    {bid:notice_id, title:'공지 2번째 글', content:'[공지]반가워요', writer:'hong'},
    {bid:notice_id, title:'공지 3번째 글', content:'[공지]mongoDB', writer:'choi'}
])

db.article.find()
db.notice.find()


/*
R : read 조회
    - findOne() : 매칭되는 1개의 document를 조회
    - find() : 매칭되는 여러개의 document list를 조회
    find({조건들==where절같은..},{필드들==select할것들..})

*/
use mydb
db.member.find({})
//select * from member
arr=db.member.find().toArray()
arr[0]
arr[1]

db.member.find()
//member 에서 name, tel 만 조회하고 싶다면
db.member.find({},{name:true, tel:true, _id:false})
//select name, tel from member
db.member.find({}, {name:1, tel:1, _id:0})
//위 문장과 동일함, true=1, false=0 으로 변경가능

//oracle과 양식이 반대라 생각하면 됨.

//조건절
//select * from member where age=23
db.member.find({age:23},{})

//select name, userid, age from member where age=22
db.member.find({age:22},{name:1, userid:1, age:1})

//userid 가 'hong'이고 age:22인 회원 정보
db.member.find({userid:'hong',age:22},{})

//age가 22이거나 userid가 'hong'인 회원정보
db.member.find({$or:[{age:22},{userid:'hong'}]},{})
//select * from member where age=22 or userid='hong'
//논리연산
//$or : 배열 안 두개 이상의 조건 중 하나라도 참인 경우를 반환
//$and: 배열 안 두개 이상의 조건이 모두 참인 경우를 반환 
//$nor: $or의 반대 

db.member.find()
//<1> userid가 'Choi'인 회원의 name, userid, tel만 가져오기
db.member.find({userid:'Choi'},{name:1, userid:1, tel:1, _idx:0})
//<2> age가 24세이거나 userid가 Lee인 회원 정보 가져오기
db.member.find({$or:[{age:24},{userid:'Lee'}]})

//<3> name이 이민수이면서 나이가 23인 회원 정보 
db.member.find({$and:[{name:'이민수'},{age:23}]})


/*
[실습2]
1. emp Collection 생성 {capped:true, size:100000} Capped Collection, size는 100000 으로 생성
2. scott계정의 emp레코드를 mydb의 emp Document 데이터로 넣기 
  => insertOne()으로 3개 문서 삽입, 
     insertMany로 나머지 문서 삽입해보기
*/