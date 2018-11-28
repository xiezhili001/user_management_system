$(function() {
  getList();
})
// 获取用户列表
function getList(page, pageSize) {
  page = page || 1;
  pageSize = pageSize || 5;

  $.get('http://127.0.0.1:3000/api/user/list', {
    page: page,
    pageSize: pageSize
  }, function(res) {
    if (res.code === 0) {
      var list = res.data.list;
      var html = template('tpl-user', {
        list: list
      });
      $('#tbody').append(html);

    } else {
      alert(res.msg);
    }
  })
}
