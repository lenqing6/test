package main

import (
	"fmt"
	"regexp"
)

func main() {
	ip := "However, only Andy knows he didn't commit the crimes. While there, he forms a friendship with Red (Morgan Freeman)"
	matched, err := regexp.MatchString("[a-zA-z]+://[^\\s]*", ip)
	if err != nil {
		fmt.Println("ip匹配出现错误")
		return
	}
	if matched { // 匹配上了
		fmt.Println(ip)
	}
}
