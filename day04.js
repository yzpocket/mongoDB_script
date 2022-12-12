/*------------------------------------------------------------------
[실습]
use boardDB
1. boardDB에서 작업한다
2. 자유게시판에 아무 글이나 2~3개 작성한다. 특히 그 중에 글 하나에는 
    댓글 하나가 달린 상태로 생성해본다. 댓글은 comment필드에 배열로 넣는다. comment[{},{}]
3. 비밀게시판을 생성한다.
4. 비밀게시판에 작성자가 'noname'값을 가지는 글을 하나 작성한다.
5. 모든 글에 추천수 필드(upvote)를 추가하고 값을 0으로 설정한다
6. 비밀게시판 글에 추천수를 1 증가시킨다
7. 이미 댓글이 달린 자유게시판 글에 upvote 필드 없이 댓글을 추가한다.
8. 이미 댓글이 달린 글에 방금 달은 댓글에(특징을 기억해서 수정하자) 
    upvote 필드 값을 0으로 추가한다
==>배열요소값 수정 arraysFilters 파라미터 사용해보기.
------------------------------------------------------------------*/
use boardDB

db.board.find()
freeboard_id=db.board.find({name:'자유게시판'}).toArray()[0]._id
freeboard_id
db.article.find()

db.article.insertOne(
{bid:freeboard_id,title:'오늘은 즐거운 불금입니다',content:'좋은 시간 되세요',writer:'김해피'}
)

db.article.insertOne(
{bid:freeboard_id,title:'내일은 즐거운 주말입니다',content:'역시 좋은 시간 되세요',writer:'박해피',
    comment:[
        {writer:'김대댓',cotent:'님도 해피하세요~'},
        {writer:'최철수',content:'좋은 시간 되세요'}
      ]}
)

db.article.find()

/*
3. 비밀게시판을 생성한다.
4. 비밀게시판에 작성자가 'noname'값을 가지는 글을 하나 작성한다.
5. 모든 글에 추천수 필드(upvote)를 추가하고 값을 0으로 설정한다
*/
secretboard_id=db.board.insertOne({name:'비밀게시판'}).insertedId
secretboard_id

db.article.insertOne({bid:secretboard_id,title:'1급 비밀입니다!!', content:'Top Secret',writer:'noname'})
//비밀게시판만 가져오기
db.article.find({bid:secretboard_id})

//자유게시판만 가져오기
db.article.find({bid:freeboard_id})
//5.
db.article.updateMany({},{$set:{upvote:0}})
db.article.find()
/*
6. 비밀게시판 글에 추천수를 1 증가시킨다 ==> {$inc:{필드명:1}}
7. 이미 댓글이 달린 자유게시판 글에 upvote 필드 없이 댓글을 추가한다.
8. 이미 댓글이 달린 글에 방금 달은 댓글에(특징을 기억해서 수정하자) 
    upvote 필드 값을 0으로 추가한다
==>배열요소값 수정 arraysFilters 파라미터 사용해보기.
*/
secretboard_id
//6. 비밀게시판 글에 추천수를 1 증가시킨다 ==> {$inc:{필드명:1}}
db.article.updateMany({bid:secretboard_id},{$inc:{upvote:1}})

db.article.find({bid:secretboard_id})
db.article.find()

//7. 이미 댓글이 달린 자유게시판 글에 upvote 필드 없이 댓글을 추가한다.
freeboard_id=db.board.find({name:'자유게시판'}).toArray()[0]._id
freeboard_id
db.article.updateOne({comment:{$size:2}},{$push:{comment:{writer:'김추가',content:'감기 조심 하세요'}}})

db.article.find({})
db.article.find({writer:'박해피'})
//8. 이미 댓글이 달린 글에 방금 달은 댓글에(특징을 기억해서 수정하자) 
//    upvote 필드 값을 0으로 추가한다
find_id=db.article.find({bid:freeboard_id,writer:'박해피'}).toArray()[0]._id
find_id
db.article.updateOne({_id:find_id},{$set:{'comment.$[myele].upvote':0}},
 {arrayFilters:[{'myele.writer':'김추가'}]})
db.article.find()
//----------------------------------------------------------------
db.article.deleteMany()
db.article.drop()
db.boardDB.drop()
db.dropDatabase()
//----------------------------------------------------------------
/*
# 도큐먼트를 집계하는 방법은 3가지가 있다
[1] db의 모든 정보를 가져와 애플리케이션 단계에서 집계하는 방법
[2] 몽고디비의 맵리듀스 기능을 이용하는 방법
[3] 몽고디비의 집계 파이프라인 기능을 이용하는 방법
- 이 중에 파이프라인기능을 이용하는 방법이 처리 속도도 빠르고 램메모리 소요도 적게쓴다. 
   다만 자유도는 나쁜 편(주어진 연산자로만 가져오는데 때로 원하는 결과를 얻지 못할 수 있음)
- 집계 명령은 수많은 데이터를 처리해서 작은 양의 정보를 애플리케이션에 전달하는 특징이 있다.
  정보를 최대한 작게 만든후 앱으로 작아진 정보를 전송하는 것이 더 효율적임
- 많은양의 정보를 몽고디비 내부에서 처리한다면 많은 양의 램메모리가 필요하지 않게된다.
- 집계 파이프라인 명령어는 도큐먼트를 순차적으로 받아서 집계 처리를 몽고디비 내부에서 한다.
  맵리듀스 방식은 자바스크립트 엔진과 정보교환을 위해 램을 사용하는데 이때 대량의 메모리가 필요하게 된다.
  집계 파이프라인을 사용하는 것이 가장 합리적으로 보이지만,
  하지만 상황에 따라 맵리듀스로 처리해야 한다던지 애플리케이션에서 집계처리해야 할때도 있다.
*/
//#  집계 파이프라인 명령어
/*
$project : select절
$match: where절
$group: group by 절  => $group을 사용하기 위해서는 _id값에 그룹화의 기준이 되는 값을 지정해야 한다.
$sort: order by 절
$limit
$unwind
*/
db
use mydb

db.articles.insertMany([
    { "author" : "john", "score" : 80, "views" : 100 },
    { "author" : "john", "score" : 85, "views" : 521 },
    { "author" : "ahn", "score" : 60, "views" : 1000 },
    { "author" : "li", "score" : 55, "views" : 5000 },
    { "author" : "annT", "score" : 60, "views" : 50 },
    { "author" : "li", "score" : 94, "views" : 999 },
    { "author" : "ty", "score" : 95, "views" : 1000 }
])
db.articles.find()
//select author, score from articles
// {$project:{필드명1:1, 필드명2:1,_id:0}}
db.articles.aggregate([{$project:{_id:0,author:1,score:1}}])

//$match : 조건을 걸어서 가져올때
//select * from articles where score>80
db.articles.aggregate([{$match:{score:{$gt:80}}}])

//select * from articles where author='li' and score >=60
db.articles.aggregate([{$match:{author:'li',score:{$gte:60}}}])

//select author, sum(score) as total from articles group by author
db.articles.aggregate([{
    $group:{_id:'$author',total:{$sum:'$score'}}
}])
db.articles.find()

//select author, sum(score) as total from articles group by author having sum(score)>100
db.articles.aggregate([{group},{조건match}])
db.articles.aggregate([{$group:{_id:'$author', total:{$sum:'$score'}}},{$match:{total:{$gt:100}}}])
//$sum
//$avg
//$min
//$max












