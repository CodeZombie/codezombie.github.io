function getDateString(unixTime){
    var date = new Date(parseInt(unixTime) * 1000);
    return ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][date.getMonth()] + ", " + date.getFullYear();
}

var badnoise = new Vue({
    el: '#vue_app',

    components: {
        'project-item': {
            props: ['id', 'title', 'tags', 'date', 'image', 'link'],
            data: function(){
                return {
                    hovered: false
                }
            },
            methods: {
                tagClick: function(tag) {
                    this.$emit('tag-click', tag);
                },
                titleClick: function(id, link) {
                    this.$emit('title-click', {id: id, link: link});
                },
                onMouseOver: function() {
                    this.hovered = true;
                },
                onMouseLeave: function() {
                    this.hovered = false;
                }
            },
            template: `
            <div class="column">
                <div class="column five">
                    <img v-on:mouseover="onMouseOver" v-on:mouseleave="onMouseLeave" v-on:click="titleClick(id, link)" v-bind:class="{hovered: hovered}" v-bind:src="image" style="width:100%;">
                </div>
                <div class="column seven">
                    <div v-bind:class="{hovered: hovered}" v-on:click="titleClick(id, link)" v-on:mouseover="onMouseOver" v-on:mouseleave="onMouseLeave" class="title">{{ title }}</div>
                    <div class="date"> {{date}} </div>
                    <span class="tags" v-for="(tag, index) in tags">
                        <span v-on:click="tagClick(tag)" class="tag">{{ tag }}</span><span v-if="index < tags.length-1">,&nbsp</span>
                    </span>
                </div>
            </div>`
        },


        'post-item': {
            props: ['id', 'title', 'tags', 'date', 'content-path'],
            data: function(){
                return {
                    hovered: false
                }
            },
            methods: {
                tagClick: function(tag) {
                    this.$emit('tag-click', tag);
                },
                titleClick: function(id) {
                    this.$emit('title-click', id);
                },
                onMouseOver: function() {
                    this.hovered = true;
                },
                onMouseLeave: function() {
                    this.hovered = false;
                },
                getDateString: getDateString,
            },
            template: `
            <div class="column">
                <div class="column">
                    <div v-bind:class="{hovered: hovered}" v-on:click="titleClick(id)" v-on:mouseover="onMouseOver" v-on:mouseleave="onMouseLeave" class="title">{{ title }}</div>
                    <div class="date"> {{getDateString(date)}} </div>
                    <span class="tags" v-for="(tag, index) in tags">
                        <span v-on:click="tagClick(tag)" class="tag">{{ tag }}</span><span v-if="index < tags.length-1">,&nbsp</span>
                    </span>
                </div>
            </div>`
        }
    },
    
    router: new VueRouter({ 
        //  base:           the user-readable path of the higher-level directory the current page exists in
        //  page:           the current page we're on.
        //  previousPath:   the route-able path to the higher-level directory.
        routes: [   
            {
                path: '/',
                name: "index", 
                beforeEnter(to, from, next) {
                    window.location.href = "../"; 
                }, 
                meta: {
                    previousPath: "/",
                }
            },
            {
                path: '/posts', 
                name: "posts", 
                meta: {
                    title: "badnoise - posts",
                    base: "badnoise",
                    page: "/posts",
                    previousPath: "/",
                }
            },
            {
                path: '/posts/tag/:tag', 
                name: "post-search", 
                meta: {
                    title: "badnoise - search results",
                    base: "badnoise/posts",
                    /*page: "/tag/" + this.$route.params.tag,*/
                    previousPath: "/posts",
                }
            },
            {
                path: '/posts/:id', 
                name: "post", 
                meta: {
                    title: "badnoise - post",
                    base: "badnoise/posts",
                    page: "/post",
                    previousPath: "/posts",
                }
            },
            {
                path: '/projects', 
                name: "projects", 
                meta: {
                    title: "badnoise - projects",
                    base: "badnoise",
                    page: "/projects",
                    previousPath: "/",
                }
            },
            {
                path: '/projects/tag/:tag', 
                name: "project-search", 
                meta: {
                    title: "badnoise - search results",
                    base: "badnoise/posts",
                    /*page: "/tag/" + this.$route.params.tag,*/
                    previousPath: "/posts",
                }
            },
            {
                path: '/contact', 
                name: 'contact', 
                meta: {
                    title: "badnoise - contact",
                    base: "badnoise",
                    page: "/contact",
                    previousPath: '/',
                }
            },
            {
                path: '*', 
                name: "404", 
                meta: {
                    title: "badnoise - 404 not found",
                    base: "badnoise",
                    page: "/???",
                    previousPath: "/",
                }
            }
        ]
    }),
    data: {
        projects: [
            {id: 0, title: "faded", tags: ["music", "javascript", "go", "css", "ajax", "api"], date: "2017", image: "../res/faded_demo.png", link: "http://badnoise.net/faded"},
            {id: 1, title: "typerip", tags: ["web", "vue.js", "html", "css", "javascript", "AJAX", "APIs"], image: "../res/typerip_demo.png", date: "2016", link: "http://badnoise.net/TypeRip/"},
            {id: 2, title: "taskcrawler", tags: ["android", "sqlite", "java", "MVC"], image: "../res/taskcrawler_demo.png", date: "2018", link: "https://github.com/CodeZombie/TaskCrawler"},
            {id: 3, title: "hella", tags: ["css", "layout"], image: "../res/hella_demo.png", date: "2018", link: "http://badnoise.net/hella/"},
        ],
        posts: [
            {id: 0, title: "Getting Started with Photogrammetry", tags: ["3D", "Graphics", "Art", "Photogrammetry"], date: 1580523551, contentPath: "photogrammetry.htm"},
            {id: 1, title: "Why Free Software Matters ", tags: ["Ethics", "Licenses", "Software", "Libre"], date: 1580501551, contentPath: "free_software.htm"},
        ],
        activePost: {
            id: -1,
            title: "",
            content: ""
        }
    },
    computed: {
    },
    methods: {
        atRoute: function(pageName) {
            return this.$route.name == pageName;
        },
        getRoutePage: function() {
            if(this.atRoute('post')){
                return "/" + this.activePost.title.toLowerCase();
            }
            return this.$route.meta.page;
        },
        navigate: function(path) {
            if(path == '') {
                return;
            }
            this.$router.push({path});
        },
        goBack: function() {
            this.navigate(this.$route.meta.previousPath);
        },
        onPostClick: function(id) {
            this.navigate('/posts/' + id);
        },
        onPostTagClick: function(tag) {
            this.navigate('/posts/tag/' + tag);
        },
        onProjectTagClick: function(tag) {
            this.navigate('/projects/tag/' + tag);
        },
        onProjectClick: function(projectObject) {
            window.location.href = projectObject.link;
        },
        onRouteChange: function(to) {
            if(to.name == 'post') {
                if(this.posts[to.params.id] != null){
                    this.loadPostContent(to.params.id);
                }else{
                    this.navigate("/404");
                }
            }
            document.title = "badnoise" + this.getRoutePage();//this.$route.meta.title;
        },
        getDateString: getDateString,
        //loads a post and its content into this.data from an Id.
        loadPostContent: function(postId) {
            
            this.activePost.content = "";
            if(this.posts[postId] != null){
                this.activePost.id = postId;
                this.activePost.title = this.posts[postId].title
                this.activePost.date = this.posts[postId].date;
                axios.get("/posts/" + this.posts[postId].contentPath).then( (result) => {
                    this.activePost.content = result.data
                }).catch((error) => {
                    this.activePost.content = "Failed to fetch post content. " + error;
                })
                
            }else{
                this.activePost.id = -1;
                this.activePost.title = "Err"
                this.activePost.content = "Err"
            }
        }
    },
    
    watch: {
        //called when the router tries to change routes.
        '$route' (to, from) {
            this.onRouteChange(to);
        }
    },
    //called when the browser tries to load a page from a fresh request.
    mounted: function() {
        this.onRouteChange(this.$route);
    }
});