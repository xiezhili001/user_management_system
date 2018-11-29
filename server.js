var express = require('express');
var async = require('async');
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var url = 'mongodb://127.0.0.1:27017';
var app = express();

//post请求传数据
app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(bodyParser.json())

// 设置响应头来处理跨域问题
app.use(function (req, res, next) {
  res.set({
    'Access-Control-Allow-Origin': '*'
  })
  next();
})

// 登录的请求 localhost:3000/api/login
app.post('/api/login', function (req, res) {
  var username = req.body.username;
  var password = req.body.password;
  var results = {};

  MongoClient.connect(url, {
    useNewUrlParser: true
  }, function (err, client) {
    if (err) {
      results.code = -1;
      results.msg = '数据库连接失败';
      res.json(results);
      // 关闭数据库连接
      return;
    }

    var db = client.db('project');
    db.collection('user').find({
      username: username,
      password: password
    }).toArray(function (err, data) {
      if (err) {
        results.code = -1;
        results.msg = '查询失败';
      } else if (data.length <= 0) {
        results.code = -1;
        results.msg = '用户名或密码错误';
      } else {
        // 登录成功
        results.code = 0;
        results.msg = '登录成功';
        results.data = {
          nickname: data[0].nickname
        }
      }
      client.close();
      res.json(results);
    })
  })
});

// 注册的请求
app.post('/api/register', function (req, res) {
  // console.log(req.body);
  var name = req.body.name;
  var pwd = req.body.pwd;
  var nickname = req.body.nickname;
  var age = parseInt(req.body.age);
  var sex = req.body.sex;
  var isAdmin = req.body.isAdmin === '是' ? true : false;
  var results = {};

  MongoClient.connect(url, {
    useNewUrlParser: true
  }, function (err, client) {
    if (err) {
      results.code = -1;
      results.msg = '数据库连接失败';
      res.json(results);
      return;
    }

    var db = client.db('project');
    async.series([
      function (cb) {
        db.collection('user').find({
          username: name
        }).count(function (err, num) {
          if (err) {
            cb(err)
          } else if (num > 0) {
            // 这个人已经注册过了，
            cb(new Error('已经注册'));
          } else {
            // 可以注册了
            cb(null);
          }
        })
      },

      function (cb) {
        db.collection('user').insertOne({
          username: name,
          password: pwd,
          nickname: nickname,
          age: age,
          sex: sex,
          isAdmin: isAdmin
        }, function (err) {
          if (err) {
            cb(err);
          } else {
            cb(null);
          }
        })
      }
    ], function (err, result) {
      if (err) {
        results.code = -1;
        results.msg = '用户已注册';
      } else {
        results.code = 0;
        results.msg = '登录成功';
      }
      console.log(results);
      res.json(results);
      // 不管成功or失败，
      client.close();
    })
  })
});

// 用户列表的接口
app.get('/api/user/list', function (req, res) {
  var page = parseInt(req.query.page);
  var pageSize = parseInt(req.query.pageSize);
  var totalSize = 0;
  var totalPage = 0;

  var results = {};

  MongoClient.connect(url, {
    useNewUrlParser: true
  }, function (err, client) {
    if (err) {
      results.code = -1;
      results.msg = '数据库连接失败';
      res.json(results);
      // 关闭数据库连接
      return;
    }

    var db = client.db('project');

    async.series([
      function (cb) {
        db.collection('user').find().count(function (err, num) {
          if (err) {
            cb(err);
          } else {
            totalSize = num;
            cb(null);
          }
        })
      },
      function (cb) {
        db.collection('user').find().limit(pageSize).skip(page * pageSize - pageSize).toArray(function (err, data) {
          if (err) {
            cb(err);
          } else {
            cb(null, data);
          }
        })
      }
    ], function (err, result) {
      if (err) {
        results.code = -1;
        results.msg = err.message;
      } else {
        totalPage = Math.ceil(totalSize / pageSize);

        results.code = 0;
        results.msg = '查询成功';
        results.data = {
          list: result[1],
          totalPage: totalPage,
          pageSize: pageSize,
          currentPage: page
        }
      }

      client.close();
      res.json(results);
    })
  })
});

//删除的借口
app.get('/api/delete', function (req, res) {
  var id = req.query.id;
  console.log(id);
  var results = {};
  MongoClient.connect(url, {
    useNewUrlParser: true
  }, function (err, client) {
    if (err) {
      results.code = -1;
      results.msg = '数据库连接失败';
      res.json(results);

      return;
    }

    var db = client.db('project');
    db.collection('user').deleteOne({
      _id: ObjectId(id)
    }, function (err, data) {
      if (err) {
        results.code = -1;
        results.msg = '数据库连接失败';
        res.json(results);
      } else {
        // 删除成功，页面刷新一下
        results.code = 0;
        results.msg = '查询成功';
        client.close();
        res.json(results);
      }

      client.close();
    })
  })
})

app.get('/api/user/search', function (req, res) {
  var name = req.query.name;
  console.log(name);
  var filter = new RegExp(name);

  MongoClient.connect(url, {
    useNewUrlParser: true
  }, function (err, client) {
    if (err) {
      res.json({
        code: -1,
        msg: '链接失败'
      })
      return;
    }

    var db = client.db('project');
    db.collection('user').find({
      nickname: filter
    }).toArray(function (err, data) {
      if (err) {
        res.json({
          code: -1,
          msg: '查询失败'
        })
      } else {
        res.json({
          code: 0,
          msg: '查询成功',
          data: {
            list:data
          }
        })
        console.log(data);
      }
    })

  })
})

app.listen(3000);