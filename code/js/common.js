
    try {
    var nickname = localStorage.getItem("nickname").split(',')[0];
    var isAdmin = localStorage.getItem("nickname").split(',')[1];
    $('#mingzi').html('欢迎您  '+ nickname+'&nbsp;');
    if(isAdmin=='false'){
        // $('#user').css({
        //     display:"none"
        // })
        $('.lv-menu').html('<li><a id="brand" style="cursor:pointer" href="/brand.html">品牌管理</a></li><li><a id="phone" style="cursor:pointer" href="/phone.html">手机管理</a></li>')
    }else{
        $('#user').css({
            display:"block"
        })
    }

} catch (error) {
    location.href='http://127.0.0.1:8080/login.html';
}

$("#mingzi").next().click(function(){
    location.href='login.html'
})
