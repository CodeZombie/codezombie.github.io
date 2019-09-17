
var badnoise = new Vue({
    el: '#vue_app',

    components: {'list-item': {
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
                console.log("????")
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
      }
    },
    
    router: new VueRouter({ 
        routes: [   
            {path: '/', name: "index", beforeEnter(to, from, next) {
                window.location.href = "../"; 
            }},
            {path: '/posts', name: "posts"},
            {path: '/posts/tag/:tag', name: "post-search"},
            {path: '/posts/:id', name: "post"},

            {path: '/projects', name: "projects"},
            {path: '/projects/tag/:tag', name: "project-search"},

            {path: '*', name: "404"}
        ],
    }),
    data: {
        posts: [
            {id: 0, title: "faded", tags: ["music", "javascript", "go", "css", "ajax", "api"], date: "2017", image: "../res/faded_demo.png", link: "http://badnoise.net/faded"},
            {id: 1, title: "typerip", tags: ["web", "vue.js", "html", "css", "javascript", "AJAX", "APIs"], image: "../res/typerip_demo.png", date: "2016", link: "http://badnoise.net/TypeRip/"},
            {id: 2, title: "taskcrawler", tags: ["android", "sqlite", "java", "MVC"], image: "../res/taskcrawler_demo.png", date: "2018", link: "https://github.com/CodeZombie/TaskCrawler"},
            {id: 3, title: "hella", tags: ["css", "layout"], image: "../res/hella_demo.png", date: "2018", link: "http://badnoise.net/hella/"},

        ],
    },
    computed: {
        //activeRoute returns renderable data about the current path, broken up into:
        //  base:           the user-readable path of the higher-level directory the current page exists in
        //  page:           the current page we're on.
        //  previousPath:   the route-able path to the higher-level directory.
        activeRoute: function() {
            var route = {base: "badnoise", page: "", previousPath: "/"};
            switch(this.$route.name) {
                case 'post':
                    route.base += "/posts";
                    route.page = "/" + this.posts[this.$route.params.id].title;
                    route.previousPath = "/posts";
                    break;
                case 'posts':
                    route.page = "/posts";
                    route.previousPath = "/";
                    break;
                case 'post-search':
                    route.base += "/posts";
                    route.page = "/tag/" + this.$route.params.tag;
                    route.previousPath = "/posts";
                    break;
                case 'projects':
                    route.page = "/projects";
                    route.previousPath = "/";
                    break;
                default:
                    route.page = "/???";
                    route.previousPath = "/";
                    break;
            }
            return route;
        }
    },
    methods: {
        atRoute: function(pageName) {
            return this.$route.name == pageName;
        },
        navigate: function(path) {
            if(path == '') {
                return;
            }
            this.$router.push({path});
        },
        goBack: function() {
            this.navigate(this.activeRoute.previousPath);
        },
        onPostClick: function(projectObject) {
            this.navigate('/posts/' + projectObject.id);
        },
        onTagClick: function(tag) {
            this.navigate('/posts/tag/' + tag);
        },
        onProjectClick: function(projectObject) {
            window.location.href = projectObject.link;
        }
    }
});


