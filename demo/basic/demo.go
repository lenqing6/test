package main

import (
	"fmt"
	"github.com/gin-gonic/gin"
)

func main() {
	// 创建一个默认的路由引擎
	q := ""
	fmt.Println(q)
	r := gin.Default()
	// 当客户端通过get方式请求/hello时,会执行后面的匿名函数
	r.GET("/hello", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "Hello Gin",
		})
	})
	// 启动http服务,默认在8080端口
	r.Run()
}
