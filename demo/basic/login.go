package main

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
	"os"
)

func main() {
	//创建一个默认的路由引擎
	r := gin.Default()
	dir, _ := os.Getwd()
	fmt.Println(dir)
	//模板解析
	r.LoadHTMLFiles("./template/login/login.html", "./template/login/home.html")
	//处理/login的get请求
	r.GET("/login", func(c *gin.Context) {
		c.HTML(http.StatusOK, "login.html", nil)

	})
	//处理/home的post请求
	/*r.POST("/home", func(c *gin.Context) {
		username := c.PostForm("username")
		password := c.PostForm("password")
		c.HTML(http.StatusOK, "home.html", gin.H{
			"username": username,
			"password": password,
		})
		log.Printf("  username=  " + username +
			"  password=   " + password)
		//log.Fatalf("failed to send username %s  with password %d", username, password)
	})*/
	r.Run(":9091")
}
