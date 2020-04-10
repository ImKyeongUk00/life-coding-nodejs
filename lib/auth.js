module.exports = {
    is_login: function(request){
        if(request.user){
            return true;
        }else{
            return false;
        }
    },
    statusUI: function(request){
        if(this.is_login(request)){
          return `${request.user.nicname} | <a href="/auth/logout_process">logout</a>`;
        }else{
          return `<a href="/auth/login">login</a>`;
        }
    }    
}