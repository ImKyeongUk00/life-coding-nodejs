module.exports = {
    throw:function throwError(error, next){ //에러가 발생하면 log로 보내주는 함수
        if(error){
            next(error);
        }
    }
}