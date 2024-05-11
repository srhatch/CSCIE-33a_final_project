(() => {
    document.addEventListener('DOMContentLoaded', () => {
        getArticle();
        loadComments();
    })

    const loadCommentsController = new AbortController();

    window.addEventListener('scroll', () => {
        try {
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1) {
                loadComments();
            }
        } catch (err) {
            console.error(err);
        }
    }, {signal: loadCommentsController.signal})

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
        } catch(err) {
            console.error(err);
        }
    }

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

    function renderReply(commentInnerDiv, replies, commentId) {
        const showReplies = newElement('button', {id: 'show-replies'}, commentInnerDiv, 'Load Replies');
        let replyCounter = 1;
        let replyQuantity = 3;

        showReplies.addEventListener('click', () => {
            const replyStart = replyCounter;
            const replyEnd = replyStart + replyQuantity - 1;
            replyCounter = replyEnd + 1;
            loadReplies(commentId, replyStart, replyEnd);
            if(replyEnd > replies.length - 1) {
                showReplies.style.display = 'none';
            }
        })
    }

    function renderComment(comments, articleId, logged_in) {
        const commentDiv = document.querySelector('#article_comment-div');
        comments.forEach(comment => {
            // Create a div for each comment to hold its
            // information and conditionally append a reply button
            const commentInnerDiv = newElement('div', {id: `comment-inner-${comment.id}`, class: 'article_comment-inner'}, commentDiv);
            newElement('p', {id: `comment-text${comment.id}`}, commentInnerDiv, comment.comment_text);
            // Only logged in users can reply to comments
            if(logged_in) {
                const replyButton = newElement('button', {id: `reply-button-${comment.id}`}, commentInnerDiv, 'Reply');
                replyButton.addEventListener('click', () => {
                    replyButton.style.display = 'none';
                    replyTo(articleId, comment.id, replyButton);
                })
            }

            // If a comment has replies, show the button to give the
            // option to display the replies
            const replies = JSON.parse(comment.replies);
            if(replies.length > 0) {
                renderReply(commentInnerDiv, replies, comment.id);
            }
        })
    }
    
    let counter = 1;
    let quantity = 10;
    function loadComments() {
        // Renders all the comments for an article
        try {
            const articleId = getArticleId();
            const start = counter;
            const end = start + quantity - 1;
            counter = end + 1;
    
            fetch(`/article/${articleId}/get_comments?start=${start}&end=${end}`)
            .then(response => response.json())
            .then(data => {
                if (data.comments.length === 0) loadCommentsController.abort();
                renderComment(data.comments, articleId, data.logged_in);
            })
        } catch (err) {
            console.error(err);
        }
    }

    function replyTo(articleId, commentId, replyButton) {
        // Displays the text input for composing a reply
        const commentInnerDiv = document.querySelector(`#comment-inner-${commentId}`);
        const newReplyContainer = newElement('div', {class: 'article_new-reply-container'}, commentInnerDiv);
        const replyText = newElement('textarea', {class: 'article_new-reply-input'}, newReplyContainer);
        const replyCancel = newElement('button', {}, newReplyContainer, 'Cancel Reply');
        const submitReply = newElement('button', {}, newReplyContainer, 'Post Reply');
        submitReply.style.display = 'inline';
    
        submitReply.addEventListener('click', () => {
            saveReply(articleId, replyText.value, commentId);
            commentInnerDiv.removeChild(commentInnerDiv.lastElementChild);
            submitReply.style.display = 'none';
            replyButton.style.display = 'block';
        })
    
        replyCancel.addEventListener('click', () => {
            // Hides the reply button.
            commentInnerDiv.removeChild(commentInnerDiv.lastElementChild);
            submitReply.style.display = 'none';
            replyButton.style.display = 'block';
        })
    }
    
    function loadReplies(commentId, replyStart, replyEnd) {
        // Retrieves and lrenders replies inside of the related comment
        try {
            fetch(`/load_replies/${commentId}?start=${replyStart}&end=${replyEnd}`)
            .then(response => response.json())
            .then(replies => {
                const commentDiv = document.querySelector(`#comment-inner-${commentId}`);
                replies.replies.forEach(reply => {
                    const replyDiv = newElement('div', {id: `reply-div-${reply.id}`, class: 'article_reply-div'}, commentDiv);
                    newElement('p', {id: `reply-${reply.id}`}, replyDiv, reply.reply);
                    newElement('div', {id: `reply-${reply.id}-time`}, replyDiv, new Date(reply.timestamp).toLocaleString());
                    const replyPosterDiv = newElement('div', {class: 'article_reply-poster-div'}, replyDiv, 'Posted by: ');
                    newElement('a', {id: `reply-${reply.id}-poster`, href: `/profile/${reply.poster_id}`}, replyPosterDiv, reply.poster);
                })
            })
        } catch (err) {
            console.error(err);
        }
    }
    
    async function saveReply(articleId, replyText, commentId) {
        // Saves a reply to the database.
        try {
            await fetch(`/save_reply/${articleId}/${commentId}`, {
                method: 'POST',
                headers: {'X-CSRFToken': csrftoken},
                mode: 'same-origin',
                body: JSON.stringify({
                    "reply": replyText
                })
            })
        } catch (err) {
            console.error(err);
        }
    }
    
    function getArticle() {
        //Retrieves information about a specified article for
        // rendering the like button.
        // The article ID is captured from the URL
        try {
            const articleId = getArticleId();
    
            fetch(`/get_article/${articleId}`)
            .then(response => response.json())
            .then(data => {
                const article = data.article;
                const userLikes = data.user_likes;
        
                if(document.querySelector('#like-button')) {
                    const likeButton = document.querySelector('#like-button');
                    // Initialize like button
                    if(userLikes && userLikes.includes(article.id)) {
                        likeButton.innerText = 'Unlike Article'
                    } else {
                        likeButton.innerText = 'Like Article'
                    }
                    // add a conditional event listener
                    likeButton.addEventListener('click', () => {
                        if(likeButton.innerText === 'Like Article') {
                            likeArticle(article)
                        } else if(likeButton.innerText === 'Unlike Article') {
                            unlikeArticle(article)
                        }
                    })
                }
                getLikes(data.article)
            })
        } catch (err) {
            console.error(err);
        }
    }
    
    async function likeArticle(article) {
        // Adds a user associated with the specified
        // article to the likes table
        try {
            await fetch(`/like_article/${article.id}`, {
                method: 'POST',
                headers: {'X-CSRFToken': csrftoken},
                mode: 'same-origin'
            })
            const likeButton = document.querySelector('#like-button');
            likeButton.innerText = 'Unlike Article';
            getLikes(article);
        } catch (err) {
            console.error(err);
        }
    }
    
    async function unlikeArticle(article) {
        // Removes a user associated with the specified
        // article from the likes table
        try {
            await fetch(`/unlike_article/${article.id}`, {
                method: 'POST',
                headers: {'X-CSRFToken': csrftoken},
                mode: 'same-origin'
            })
            if(document.querySelector('#like-button')) {
                const likeButton = document.querySelector('#like-button');
                likeButton.innerText = 'Like Article';
            }
            getLikes(article);   
        } catch (err) {
            console.error(err);
        }
    }
    
    function getLikes(article) {
        // Retrieves the number of likes an article has
        // and renders that to the page. This is done here to
        // allow for asynchronous updating when a user likes an article
        try {
            fetch(`/get_likes/${article.id}`)
            .then(response => response.json())
            .then(likes => {
                document.querySelector('#likes-div').innerText = `${likes} Likes`;
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
