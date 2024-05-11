(() => {
    document.addEventListener('DOMContentLoaded', () => {
        loadArticles();
    })

    const loadArticlesController = new AbortController();
    window.addEventListener('scroll', () => {
        try {
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
                loadArticles();
            }
        } catch(err) {
            console.error(err);
        }
    }, {signal: loadArticlesController.signal})

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
        // Retrieves information about a specified
        // article (id obtained from the url) and renders that to the page.
        try {
            const start = counter;
            const end = start + quantity - 1;
            counter = end + 1;
    
            fetch(`/get_following?start=${start}&end=${end}`)
            .then(response => response.json())
            .then(articles => {
                if (articles.articles.length === 0) loadArticlesController.abort();
                const articleDiv = document.querySelector('#following_article-div');
                articles.articles.forEach(article => {
                    const innerDiv = newElement('div', {class: 'following_inner-id'}, articleDiv);
                    newElement('div', {class: 'following_poster-div'}, innerDiv, `Posted by: ${article.poster}`);
                    const articleLink = newElement('a', {class: 'following_article-link', href: `/article/${article.id}`}, innerDiv, article.title);
                    innerDiv.appendChild(articleLink);
                })
            })
        } catch (err) {
            console.error(err);
        }
    }
})();
