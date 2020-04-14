module.exports = {
    is_login: function(request){
        if(request.user){
            return true;
        }else{
            return false;
        }
    },
    is_owner: function(request, user_id){
        if(request.user.id !== user_id){
            return false;
        }else{
            return true;
        }
    },
    statusUI: function(request){
        if(this.is_login(request)){
          return `${request.user.nicname} | <a href="/auth/logout_process">logout</a>`;
        }else{
          return `<a href="/auth/login">login</a> | <a href="/auth/register">register</a>`;
        }
    }    
}