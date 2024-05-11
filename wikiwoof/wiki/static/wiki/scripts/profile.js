(() => {
    document.addEventListener('DOMContentLoaded', () => {
        followButtonInit();
        loadArticles();
    })

    const profileArticleController = new AbortController();
    window.addEventListener('scroll', () => {
        try {
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
                loadArticles();
            }
        } catch (err) {
            console.error(err);
        }
    }, {signal: profileArticleController.signal})

    function getArticleId() {
        try {
            const string = window.location.href;
            const url = new URL(string);
            const articleId = url.pathname.substring(url.pathname.lastIndexOf('/') + 1);
            return articleId;
        } catch (err) {
            console.error(err);
        }
    }
    
    function newElement(type, attrs, parent, text) {
        try {
            const newEl = document.createElement(type);
            for (let attr in attrs) {
                newEl.setAttribute(attr, attrs[attr]);
            }
            if (text) {
                newEl.textContent = text;
            }
            parent.appendChild(newEl);
            return newEl;
        } catch (err) {
            console.error(err);
        }
    }
    
    let counter = 1;
    let quantity = 10;
    function loadArticles() {
        // Retrieves information
        // about a specified article (id obtained from the url)
        // and renders that to the page.
        try {
            const articleId = getArticleId();
    
            const start = counter;
            const end = start + quantity - 1;
            counter = end + 1;
        
            fetch(`/profile/${articleId}/get_articles?start=${start}&end=${end}`)
            .then(response => response.json())
            .then(data => {
                if (data.articles.length === 0) profileArticleController.abort();
                const articleDiv = document.querySelector('#article-div');
                for (let article of data.articles) {
                    const innerDiv = newElement('div', {class: 'profile_inner-div'}, articleDiv);
                    newElement('a', {class: 'profile_inner-link', href: `/article/${article.id}`}, innerDiv, article.title);
                }
            })
        } catch (err) {
            console.error(err);
        }
    }
    
    function followButtonInit() {
        // Initialize follow button and add a conditional event listener
        try {
            const articleId = getArticleId();
    
            fetch(`/get_profile/${articleId}`)
            .then(response => response.json())
            .then(data => {
                const followers = data.follow_ids;
                const currentUser = data.current_user_id;
                const currentProfile = data.current_profile;
        
                if(document.querySelector('#follow-button')) {
                    const followButton = document.querySelector('#follow-button');
                
                    if(followers.includes(currentUser)) {
                        followButton.innerText = 'Unfollow';
                    } else {
                        followButton.innerText = 'Follow';
                    }
            
                    followButton.addEventListener('click', () => {
                        if(followButton.innerText === 'Follow') {
                            follow();
                        } else if(followButton.innerText === 'Unfollow') {
                            unfollow();
                        }
                    })
                }
                getFollows(currentProfile.id);
            })
        } catch (err) {
            console.error(err);
        }
    }
    
    async function follow() {
        // Saves a follow to the database
        try {
            const articleId = getArticleId();
            const followButton = document.querySelector('#follow-button');
            
            await fetch(`/follow/${articleId}`, {
                method: 'POST',
                headers: {'X-CSRFToken': csrftoken},
                mode: 'same-origin'
            })
            followButton.innerText = 'Unfollow';
            getFollows(articleId);
        } catch (err) {
            console.error(err);
        }
    }
    
    async function unfollow() {
        // Removes a follow from the database
        try {
            const articleId = getArticleId();
            const followButton = document.querySelector('#follow-button');
            
            await fetch(`/unfollow/${articleId}`, {
                method: 'POST',
                headers: {'X-CSRFToken': csrftoken},
                mode: 'same-origin'
            })
            followButton.innerText = 'Follow';
            getFollows(articleId);
        } catch (err) {
            console.error(err);
        }
    }
    
    function getFollows(articleId) {
        // Retrieves the number of follows a user has
        // and renders that to the page.
        try {
            fetch(`get_follows/${articleId}`)
            .then(response => response.json())
            .then(followers => {
                document.querySelector('#profile_followers').innerText = ` Followers: ${followers}`;
            })
        } catch (err) {
            console.error(err);
        }
    }
    
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    const csrftoken = getCookie('csrftoken');
})();
