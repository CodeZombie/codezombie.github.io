
var badnoise = new Vue({
    el: '#vue_app',

    components: {'list-item': {
        props: ['id', 'title', 'tags', 'date', 'image', 'link'],
        methods: {
            tagClick: function(tag) {
                this.$emit('tag-click', tag);
            },
            postClick: function(tag) {
                this.$emit('post-click', tag);
            }
        },
        template: `
        <div class="column">
            <div class="column five">
                <img v-bind:src="image" v-on:click="postClick(id)" style="width:100%;" v-on:click="goToRoute(link)">
            </div>
            <div class="column seven">
                <div v-on:click="postClick(id)" class="title">{{ title }}</div>
                <div> {{date}} </div>
                <span class="tag" v-for="(tag, index) in tags">
                    <span v-on:click="tagClick(tag)">{{ tag }}</span><span v-if="index < tags.length-1">,&nbsp</span>
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
            {path: '*', name: "404"}
        ],
    }),
    data: {
        posts: [
            {id: 0, title: "faded", tags: ["music", "javascript", "go", "css", "ajax", "api"], date: "2017", image: "../res/paper_demo.png", link: "https://badnoise.net/faded"},
            {id: 1, title: "how to steal fonts from adobe", tags: ["web", "vue.js", "html", "css", "javascript", "AJAX", "API"], image: "../res/typerip_demo.png", date: 29942392, link: "vue-router.json"},
            {id: 2, title: "midiseqs", tags: ["arduino", "hardware", "c++", "MIDI"], image: "../res/shit.jpg", date: "May 2016", link: "esp8266-windows.json"},
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
        onPostClick: function(post_id) {
            this.navigate('/posts/' + post_id);
        },
        onTagClick: function(tag) {
            this.navigate('/posts/tag/' + tag);
        }
    }
});


