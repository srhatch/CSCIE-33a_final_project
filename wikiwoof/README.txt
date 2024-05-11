From the original README used when handing in the assignment:
wikiwoof/settings.py
To add image functionality I used the technique described in https://www.youtube.com/watch?v=O5YkEFLXcRg.
I imported os and configured the media root and media url as described. 

wikiwoof/urls.py
urlpatterns was also configured as described in the above Codemy video in order to add image functionality

wiki/models.py
The image class is configured to store the url of an uploaded image.
Replies and Comments are two separate models because replies are associated
with a comment and a user as opposed to an article and a user as is the case with comments. 

wiki/views.py
A nav bar across the top of every page is defined in layout.html
and includes a link to the home/index page, create a new article,
view a list of articles written by users who an active user is following, and to logout. 

The main index page has a list of all articles written and is viewable by anyone.
Individual articles are also viewable by anyone. A user must have an account and be
logged in in order to comment on articles, write articles, like/unlike articles, follow/unfollow other users. 

Comments are displayed in groups of ten with an event listener to load successive
groups as the user scrolls to the bottom of the page. Replies to comments are displayed under each comment.
A button is presented to the user (only if a comment has replies) to display a set of three replies with each click.
There are no replies initially displayed in order to save space and keep the display clean. 

A user’s profile displays their username, the number of articles they have written, how many followers they have,
how many users they follow, and a full list of all articles they’ve written. Articles are grouped into ten
and displayed with infinite scroll. Two functions are used for this page: one to display the basic information
directly to the html page and another to render the list of articles through javascript. The javascript is used
to implement infinite scroll and the follow functionality. Following a user is done asynchronously.

The new article page gives the user the options when creating a how-to. A user can add and remove steps
and can optionally upload an image with each step. There is a limit of ten steps and the “add step” button
is set to display: “none” once that limit is reached. Likewise, the “remove step” button appears on the page
only after the first step is added. A user can do the same with required materials, with the limit being set at five.
The add/remove functionality is done through javascript event handlers. Arrays are used to keep track of the number
of steps or materials a user has added. This data is retrieved with request.POST.getlist or request.FILES.getlist
for steps and images respectfully. Retrieving the data as a list allows flexibility in the number of steps submitted.
The text or each step is then bundles into a dictionary in views.py with “Step-x” as the key. This is done primarily
to identify each step since they’re all being saved in one json string in the database.

An individual article is rendered with views.py to display the data and javascript to render comments,
replies, and likes. These are done through javascript to keep their functionality asynchronous,
allowing comments and replies to be posted without reloading the page. Functionality for liking an
article is the same and the number of likes displayed is updated asynchronously as the user likes/unlikes a post.
A logged in user has the option to delete their own articles. A list is passed to article.html containing all
the steps associated with an article, each of which is put into a separate list within. Each sub-list contains
a string indication of each step (e.g. “step-1”), the text content of that step and an image if one was uploaded.
This structure is to make rendering in the html cohesive. 

The following page renders all articles written by users a current users follows. Nothing is rendered directly
to following.html from views.py because articles are rendered with infinite scroll. These are structured to
load in groups of ten. 

templates/new-article.html
I used an html form for creating the article to provide flexibility given the use of javascript to
dynamically add and remove steps and materials. Inputs are added and removed as the user clicks the
“add/remove” button. Tue same name is defined in new-article.js for each step and is accessed in views.py
with request.POST.getlist(). Steps and materials are further divided in the form with separate div containers.
The number of steps and materials on the page are kept track of with two arrays. I kept the four event listeners
associated with adding and removing inside the body of the create article function in order for them to be able
to update those arrays on demand and have access to the current length. The length is ultimately used to determine
whether to display or hide the add/remove materials/steps buttons.

static/article.js
Two sets of variables are used for creating an infinite scroll on both comments and replies.
The variables used for replies are scoped to the loadComments function because each comment needs
its own set. From this scope the loadReplies function can access them when called through the event
listener added to the show replies button. 

forms
I used placeholders instead of labels to make formatting with css easier, especially with the mobile responsiveness. 