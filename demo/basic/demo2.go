package main

import (
	"fmt"
)

func main() {
	a := 1
	defer func() {
		fmt.Println(a)
	}()
	a = a + a
	fmt.Println("path")
	return
	fmt.Println("enabled")

}
