package main
import "net/http"
import "log"


func handleRedirect(w http.ResponseWriter, r *http.Request) {
	state := r.URL.Query().Get("oauth_state_id")
	uri := "https://localhost:1420/callback?oauth_state_id=" + state
	
	http.Redirect(w, r, uri, http.StatusSeeOther)
}

func main () {

	http.HandleFunc("/callback", handleRedirect)
	
	err := http.ListenAndServe(":8080", nil)
	if err != nil { log.Fatal(err) }
}