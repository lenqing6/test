package main

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

func main() {
	//创建默认的路由引擎
	r := gin.Default()

	//模板解析
	r.LoadHTMLFiles("./template/user/index.html", "./template/post/index.html")
	//r.LoadHTMLGlob("./template/**/*")

	//以get方式发/post/index请求
	r.GET("/post/index", func(c *gin.Context) {
		//模板渲染
		c.HTML(http.StatusOK, "post/index.html", gin.H{"title": "this is post/index.html"})
	})

	//以get方式发/user/index请求
	r.GET("user/index", func(c *gin.Context) {
		//模板渲染
		c.HTML(http.StatusOK, "user/index.html", gin.H{"title": "this is user/index.html"})
	})

	//启动http服务在9090端口
	r.Run(":9090")
}
