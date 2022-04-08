package main

import (
	"github.com/gin-gonic/gin"
	"github.com/kylelemons/go-gypsy/yaml"
	"log"
	"net/http"
)

func main() {
	config, err := yaml.ReadFile("conf.yaml")
	if err != nil {
		log.Fatalf(err.Error())
	}
	url, _ := config.Get("url")
	//创建一个默认的路由引擎
	r := gin.Default()
	r.GET("/test", func(c *gin.Context) {
		c.Redirect(http.StatusMovedPermanently, url)
	})
	r.Run(":9095")
}
