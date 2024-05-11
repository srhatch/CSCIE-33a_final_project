(() => {
    document.addEventListener('DOMContentLoaded', () => {
        loadArticles();
    })

    const indexAbortController = new AbortController();
    window.addEventListener('scroll', () => {
        try {
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1) {
                loadArticles();
            }
        } catch (err) {
            console.error(err);
        }
    }, {signal: indexAbortController.signal})

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
    let quantity = 16;
    function loadArticles() {
        const start = counter;
        const end = start + quantity - 1;
        counter = end + 1;

        fetch(`/get_all_articles?start=${start}&end=${end}`)
        .then(response => response.json())
        .then(data => {
            if (data.articles.length === 0) indexAbortController.abort();
            const articleGrid = document.querySelector('#index_article-grid');
            for (let article of data.articles) {
                const innerDiv = newElement('li', {id: 'index_article-li', class: 'index_article-li'}, articleGrid);
                const articleLink = newElement('a', {id: 'index_inner-link', class: 'index_inner-link', href: `/article/${article.id}`}, innerDiv);
                newElement('div', {class: 'index_title-div'}, articleLink, `${article.title}`);
                if(article.thumbnail) {
                    newElement('img', {id: 'index_thumbnail-id', src: `media/${article.thumbnail}`, height: '150', width: '175'}, articleLink);
                } else {
                    newElement('div', {class: 'thumbnail-standin'}, articleLink);
                }
            }
        })
        .catch(err => console.error(err))
    }
})();
