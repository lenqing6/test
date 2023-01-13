package main

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

type UserInfo struct {
	Username string
	Password string
}

func main() {
	//创建默认的路由引擎
	r := gin.Default()
	//绑定json参数的示例
	r.POST("/json", func(c *gin.Context) {
		var user UserInfo
		err := c.ShouldBind(&user)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"errorasddsa": err.Error(),
			})
		} else {
			c.JSON(http.StatusOK, user)
		}
	})
	//绑定form表单参数示例
	r.POST("/form", func(c *gin.Context) {
		var user UserInfo
		err := c.ShouldBind(&user)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
		} else {
			c.JSON(http.StatusOK, user)
		}
	})
	//绑定querystring参数示例
	r.GET("/querystring", func(c *gin.Context) {
		var user UserInfo
		err := c.ShouldBind(&user)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
		} else {
			c.JSON(http.StatusOK, user)
		}
	})
	r.Run(":9092")
}
