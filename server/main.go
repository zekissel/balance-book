package main
import "net/http"
import "log"


func main () {

	http.HandleFunc("/callback", func (w http.ResponseWriter, r *http.Request) {
		uri := "http://localhost:1421/callback?" + r.URL.RawQuery
		http.Redirect(w, r, uri, http.StatusSeeOther)
	})
	
	err := http.ListenAndServe(":8080", nil)
	if err != nil { log.Fatal(err) }
}