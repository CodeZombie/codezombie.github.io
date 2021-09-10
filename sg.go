package main
import (
	"fmt"
	"io/ioutil"
	"math"
	"os"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"time"
	"github.com/alecthomas/chroma/formatters/html"
	"github.com/alecthomas/chroma/formatters"
	"github.com/alecthomas/chroma/quick"
)

//todo:
//	add more comments.
//	stress test with edge-case entries

const MAX_URL_LENGTH = 32							//The maximum character length of directories within a URL. If a post title is too long, it wil be truncated.
const POSTS_PER_LIST = 5							//The maximum number of posts that will appear per-page in the paginated blog list.
const INPUT_POST_DIRECTORY = "_posts" 				//The folder containing the .post files which will be used to generate the blog.
const INPUT_STATIC_CONTENT_DIRECTORY = "_static" 	//The directory containing the static content the website requires.
const INPUT_TEMPLATE_DIRECTORY = "_templates" 		//The directory containing the .template content used to piece the website together.
const OUTPUT_DIRECTORY = "_output" 					//The directory the generated website will be placed in.
const BLOG_SUBDIRECTORY = "posts"					//The subdirectory within the website folder structure containing the blog.

type Post struct {
	title    string
	unixtime int64
	date     string
	year     int
	month    int
	content  string
	path     string
}

func checkError(error_ error) {
	/* Prints an error if the error is not nil */
	if error_ != nil {
		fmt.Printf("Error: %s", error_.Error())
		os.Exit(-1)
	}
}

func intInSlice(haystack_ []int, needle_ int) bool {
	/* searches for a specific int in a slice of ints. Returns true if it is found, false if not found. */
	for _, h := range haystack_ {
		if h == needle_ {
			return true
		}
	}
	return false
}

func getPosts(folder_ string) ([]Post, error) {
	var posts []Post //data structure for each post

	rgx := regexp.MustCompile("[^a-zA-Z-0-9]")

	files, err := ioutil.ReadDir(folder_) //get list of every file in INPUT_POST_DIRECTORY directory
	checkError(err)

	for _, f := range files { //for each file in the INPUT_POST_DIRECTORY/ directory...
		if f.Name()[len(f.Name())-5:] == ".post" { //if the file extension is a .post...
			content, err := readFile(INPUT_POST_DIRECTORY + "/" + f.Name()) //load the content of the file
			checkError(err)

			for {
				codeBlockIndex := strings.Index(content, "<sg_codeblock")
				if(codeBlockIndex == -1) {
					break
				}
				//extract language
				codeBlockLanguageIndex := strings.Index(content[codeBlockIndex : len(content)], "language=\"")
				if(codeBlockLanguageIndex == -1) {
					fmt.Printf("Error: malformed language property within sg_codeblock tag")
					break
				}
				codeBlockLanguageIndex += codeBlockIndex + 10

				codeBlockLanguageEndIndex := strings.Index( content[codeBlockLanguageIndex+1 : len(content)], "\"")
				if(codeBlockLanguageIndex == -1) {
					fmt.Printf("Error: malformed language property within sg_codeblock tag")
					break
				}
				codeBlockLanguageEndIndex += codeBlockLanguageIndex + 1
				
				codeBlockLanguage := content[codeBlockLanguageIndex : codeBlockLanguageEndIndex]
				fmt.Printf("DETECTED LANGUAGE: %s", codeBlockLanguage)

				//grab the code content

				codeContentIndex := strings.Index( content[codeBlockLanguageEndIndex : len(content)], ">")
				if(codeContentIndex == -1) {
					fmt.Printf("Error: sg_codeblock does not have a closing angle bracket '>'")
					break
				}

				codeContentIndex += codeBlockLanguageEndIndex + 1

				codeContentEndIndex := strings.Index( content[codeContentIndex : len(content)], "</sg_codeblock>")
				if(codeContentEndIndex == -1) {
					fmt.Printf("Error: Could not find closing sg_codeblock tag")
					break
				}
				codeContentEndIndex += codeContentIndex

				codeBlockContent := content[ codeContentIndex : codeContentEndIndex]

				//PROCESS CODE BLOCK CONTENT HERE!!!!
				var formattedStringBuilder strings.Builder
				formatters.Register("badnoise_style", html.New(html.Standalone(false), html.WithClasses(true)))
				err := quick.Highlight(&formattedStringBuilder, codeBlockContent, codeBlockLanguage, "badnoise_style", "abap")
				checkError(err)

				

				content = content[:codeBlockIndex] + formattedStringBuilder.String() + content[codeContentEndIndex + 15:len(content)]

			}

			t, err := time.Parse("2006-01-02", f.Name()[:10]) //generate a time object from the first 10 chars of the post filename
			checkError(err)

			date := t.Format("Jan 02, 2006") //make the time pretty

			unixtime := t.Unix() //make the time functional
			year := t.Year()
			month := int(t.Month())

			title := f.Name()[10 : len(f.Name())-5] //cut off the date data and ".post", leaving just the title

			foldername := strings.Replace(title, " ", "-", -1) //replace spaces with dashes because %20 sucks

			foldername = string(rgx.ReplaceAll([]byte(foldername), []byte(""))) //make it URL safe

			if len(foldername) > MAX_URL_LENGTH { //truncate foldername, if necessary
				foldername = foldername[:MAX_URL_LENGTH]
			}

			path := BLOG_SUBDIRECTORY + "/" + foldername

			posts = append(posts, Post{path: path, year: year, month: month, title: title, unixtime: unixtime, date: date, content: content})
		}
	}

	return posts, nil
}

func savePosts(posts_ []Post) error {
	postTemplate, err := readFile(INPUT_TEMPLATE_DIRECTORY + "/post.template")
	if err != nil {
		return err
	}

	for _, p := range posts_ {
		postData := postTemplate
		postData = strings.Replace(postData, "{{title}}", p.title, -1)
		postData = strings.Replace(postData, "{{date}}", p.date, -1)
		postData = strings.Replace(postData, "{{content}}", p.content, -1)
		err = createFile(OUTPUT_DIRECTORY + "/" + p.path + "/", "index.html", postData)
		if err != nil {
			return err
		}
	}
	return nil
}

func saveList(postList_ [][]Post) error {
	listTemplate, err := readFile(INPUT_TEMPLATE_DIRECTORY + "/list.template")
	checkError(err)

	linkTemplate, err := readFile(INPUT_TEMPLATE_DIRECTORY + "/link.template")
	checkError(err)

	for i, page := range postList_ { //for each list
		listpageData := listTemplate                                                           //grab the list template
		listpageData = strings.Replace(listpageData, "{{title}}", "Page " + strconv.Itoa(i), -1) //insert the title of the list into this template
		linkData := ""
		for _, post := range page { //for each post linked in this list...
			link := linkTemplate
			link = strings.Replace(link, "{{link}}", "../" + post.path, -1)
			link = strings.Replace(link, "{{title}}", post.title, -1)
			link = strings.Replace(link, "{{date}}", post.date, -1)
			linkData = linkData + link
		}
		listpageData = strings.Replace(listpageData, "{{content}}", linkData, -1) //insert these links into the list data

		fname := strconv.Itoa(i)
		if fname == "0" {
			fname = "index"
		}

		err = createFile(OUTPUT_DIRECTORY + "/" + BLOG_SUBDIRECTORY + "/", fname + ".html", listpageData) //and write.
		checkError(err)
	}
	return nil
}

func createLists(posts_ []Post) error {
	var rootList [][]Post

	//first, sort everything
	sort.Slice(posts_, func(i, j int) bool { return posts_[i].unixtime < posts_[j].unixtime })

	//genearte rootList
	for i, p := range posts_ { //for every post in the blog
		if i%POSTS_PER_LIST == 0 { //if this is the first post of what should be a new listpage...
			rootList = append(rootList, []Post{}) //create a new page
		}
		pid := int(math.Floor(float64(i / POSTS_PER_LIST))) //which page the post will be on...
		rootList[pid] = append(rootList[pid], p)            //insert the post data into this listpage
	}

	//save rootlist
	saveList(rootList)
	return nil
}

func main() {
	//load every post file into a data structure
	posts, err := getPosts(INPUT_POST_DIRECTORY + "/")
	checkError(err)

	//delete everything from the OUTPUT_DIRECTORY directory
	err = os.RemoveAll(OUTPUT_DIRECTORY + "/")
	checkError(err)

	//copy all static files to the output folder
	err = CopyDir(INPUT_STATIC_CONTENT_DIRECTORY + "/", OUTPUT_DIRECTORY + "/")
	checkError(err)

	//create a file for every post
	err = savePosts(posts)
	checkError(err)

	//generate and save post lists
	err = createLists(posts)
	checkError(err)
}
